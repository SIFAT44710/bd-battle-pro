import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

let genAI = null;
let modelCallCounter = 0;
// Two primary high-limit shifting models (split 50/50 quota) + failover pool
const ROTATING_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash',
  'gemini-flash-latest'
];

/**
 * Bengali numeral converter (০-৯ -> 0-9)
 */
export function normalizeBengaliNumerals(str) {
  if (!str) return '';
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return str.toString().replace(/[০-৯]/g, d => bn.indexOf(d));
}

/**
 * Resilient Offline Heuristic & RegEx Parser (Zero API Dependency Fallback)
 * Works when Gemini API is rate-limited, quota exhausted, or network is down.
 */
export function parseBookingWithRegex(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      match_query: null,
      slot_number: null,
      squad_name: null,
      leader_name: null,
      player_names: [],
      trx_id: null,
      amount: null,
      payment_method: null,
      is_valid_booking: false
    };
  }

  const norm = normalizeBengaliNumerals(rawText).trim();
  const lower = norm.toLowerCase();

  // 1. Payment Method
  let payment_method = null;
  if (/bkash|বিকাশ/i.test(lower)) payment_method = 'bkash';
  else if (/nagad|নগদ/i.test(lower)) payment_method = 'nagad';
  else if (/rocket|রকেট/i.test(lower)) payment_method = 'rocket';
  else if (/upay|উপায়|উপায়/i.test(lower)) payment_method = 'upay';

  // 2. Trx ID (Uppercase clean)
  let trx_id = null;
  const trxMatch = norm.match(/(?:trx\s*id|trx|trnx|txid|trans(?:action)?\s*id)[\s:=#\-]+([a-zA-Z0-9]{6,14})/i) ||
                   norm.match(/\b([A-Z0-9]{8,12})\b/);
  if (trxMatch) {
    const candidate = trxMatch[1].toUpperCase();
    const blacklist = ['BERMUDA', 'PURGATORY', 'TOURNAMENT', 'CHAMPIONSHIP', 'WHATSAPP', 'SQUAD', 'LEADER', 'PAYMENT'];
    if (!blacklist.includes(candidate)) {
      trx_id = candidate;
    }
  }

  // 3. Amount (BDT)
  let amount = null;
  const explicitAmt = norm.match(/(?:amount|taka|টাকা|ফি|fee|paid|পাঠাইছি|দিছি|দিসি)[\s:=#\-]*([0-9]{2,5})/i) ||
                      norm.match(/([0-9]{2,5})\s*(?:tk|taka|টাকা|৳)/i) ||
                      norm.match(/(?:৳)\s*([0-9]{2,5})/i);
  if (explicitAmt) {
    amount = parseInt(explicitAmt[1], 10);
  }

  // 4. Slot Number (1 to 12)
  let slot_number = null;
  const slotMatch = norm.match(/(?:slot|স্লট)\s*[:#\-]?\s*([0-9]{1,2})/i) ||
                    norm.match(/([0-9]{1,2})\s*(?:no|number|নম্বর)?\s*(?:slot|স্লট)/i);
  if (slotMatch) {
    const sn = parseInt(slotMatch[1], 10);
    if (sn >= 1 && sn <= 12) slot_number = sn;
  }

  // 5. Squad Name
  let squad_name = null;
  const squadMatch = norm.match(/(?:squad|স্কোয়াড|স্কয়াড|team|টিম|দল)\s*[:=\-]?\s*([A-Za-z0-9_\-\u0980-\u09FF\s]{2,25})/i);
  if (squadMatch) {
    squad_name = squadMatch[1].replace(/\s+(er\s+jonno|slot|lead|trx|leader|bkash|nagad|taka|টাকা).*/i, '').trim();
  }

  // 6. Leader Name
  let leader_name = null;
  const leadMatch = norm.match(/(?:leader|লিডার|lead|অধিনায়ক)\s*[:=\-]?\s*([A-Za-z0-9_\-\u0980-\u09FF\s]{2,20})/i);
  if (leadMatch) {
    leader_name = leadMatch[1].replace(/\s+(book|koren|koro|bhai|vai|squad|slot|trx|fee|paid|er\s+jonno|team).*/i, '').trim();
  }

  // 7. Match Query (Match 1, Bermuda, 8:30 PM, etc.)
  let match_query = null;
  const matchNum = norm.match(/(?:match|ম্যাচ)\s*[:#\-]?\s*([0-9]+)/i) || norm.match(/([0-9]+)\s*(?:no|number|নম্বর)?\s*(?:match|ম্যাচ)/i);
  const timeMatch = norm.match(/([0-9]{1,2}:[0-9]{2}\s*(?:am|pm)?|[0-9]{1,2}\s*(?:am|pm))/i);

  if (matchNum) {
    match_query = 'Match ' + matchNum[1];
  } else if (timeMatch) {
    match_query = timeMatch[1].trim();
  } else if (/bermuda|বারমুডা/i.test(lower)) {
    match_query = 'Bermuda';
  } else if (/purgatory|পার্গেটরি/i.test(lower)) {
    match_query = 'Purgatory';
  }

  const is_valid_booking = !!(trx_id || squad_name || slot_number || match_query);

  return {
    match_query,
    slot_number,
    squad_name,
    leader_name,
    player_names: [],
    trx_id,
    amount,
    payment_method,
    is_valid_booking
  };
}

function getGenAI() {
  if (!genAI) {
    if (!config.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables or .env file!');
    }
    genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  }
  return genAI;
}

/**
 * Generate Content with automatic multi-model rotation & quota load-balancing
 */
async function generateWithFailover(promptOrParts) {
  const ai = getGenAI();
  let lastError = null;

  // Alternate starting model every call to distribute quota evenly across 2+ models
  const startIndex = modelCallCounter++ % ROTATING_MODELS.length;
  const prioritizedModels = [
    ...ROTATING_MODELS.slice(startIndex),
    ...ROTATING_MODELS.slice(0, startIndex)
  ];

  for (const modelName of prioritizedModels) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      });
      const result = await model.generateContent(promptOrParts);
      return result.response.text();
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Failover]: Model ${modelName} encountered error: ${err.message}. Trying next candidate...`);
    }
  }

  throw lastError || new Error('All candidate Gemini models failed.');
}

/**
 * 1. Parse Raw Text Booking Request (Banglish / Bengali / English)
 */
export async function parseBookingText(rawText) {
  const prompt = `
You are an intelligent booking parser for a Bangladeshi Free Fire esports tournament platform (ARENA X).
Players write messages in Bengali, Banglish (phonetic Bengali written in Latin letters), or English.

Input message from player:
"${rawText}"

Extract tournament registration details into strict JSON matching this schema:
{
  "match_query": string or null (e.g., "Match 1", "08:30 PM", "9:15 PM", "Bermuda", "Purgatory"),
  "slot_number": integer (1 to 12) or null if unspecified,
  "squad_name": string or null (the team name),
  "leader_name": string or null (the player or leader name),
  "player_names": array of strings (individual player IGNs if provided, or empty array),
  "trx_id": string or null (Transaction ID, convert to uppercase, clean spaces),
  "amount": number or null (amount in BDT Taka, e.g., 100, 75),
  "payment_method": "bkash" | "nagad" | "rocket" | "upay" or null,
  "is_valid_booking": boolean (true if it has squad name or trx_id or slot request, false if casual unrelated greeting)
}

Notes for Banglish understanding:
- "vai slot 3 te book koren" -> slot_number: 3
- "squad vortex / amader team vortex" -> squad_name: "Vortex"
- "lead tanvir / leader boss" -> leader_name: "Tanvir"
- "trxid BL9204918 / trx BL9204918" -> trx_id: "BL9204918"
- "100 taka pathaisi / bkash korsi" -> amount: 100, payment_method: "bkash"
Return ONLY valid JSON.
`;

  try {
    const text = await generateWithFailover(prompt);
    return JSON.parse(text);
  } catch (err) {
    console.warn('[Gemini Text Parse]: AI unavailable (' + err.message + '). Activating offline RegEx parser fallback...');
    return parseBookingWithRegex(rawText);
  }
}

/**
 * 2. Parse Payment Screenshot (bKash / Nagad / Rocket / Upay) via Gemini Multimodal Vision
 */
export async function parsePaymentScreenshot(imageBuffer, mimeType = 'image/jpeg', captionText = '') {
  const prompt = `
You are an expert OCR and financial fraud detection system for Bangladeshi Mobile Financial Services (MFS): bKash, Nagad, Rocket, and Upay.
Analyze this payment receipt screenshot.

Optional caption provided with the image:
"${captionText}"

Extract all payment and booking data into strict JSON:
{
  "trx_id": string or null (Clean uppercase Transaction ID without spaces, e.g. "BL9204918", "9K827419"),
  "amount": number or null (numerical amount in BDT, e.g. 100, 75, 135),
  "payment_method": "bkash" | "nagad" | "rocket" | "upay" | "unknown",
  "sender_number": string or null (sender mobile number if visible),
  "receiver_number": string or null (receiver / agent / personal number),
  "timestamp": string or null (date and time visible on screenshot),
  "status": "SUCCESS" | "PENDING" | "FAILED",
  "is_valid_payment": boolean (true if screenshot clearly shows a completed Send Money / Payment transaction),
  "caption_booking_info": {
    "slot_number": integer or null,
    "squad_name": string or null,
    "leader_name": string or null,
    "match_query": string or null
  }
}

Important Guidelines:
1. Normalize Bengali numerals (০-৯) to standard Western digits (0-9).
2. bKash TrxID is usually 10 alphanumeric characters (e.g., "BH72K9M12P").
3. Nagad TrxID is usually 8 alphanumeric characters (e.g., "71K829XA").
4. If the caption has squad details (e.g. "slot 4 squad venom"), extract them into caption_booking_info.
Return ONLY valid JSON.
`;

  try {
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType
      }
    };

    const text = await generateWithFailover([prompt, imagePart]);
    return JSON.parse(text);
  } catch (err) {
    console.warn('[Gemini Vision Parse]: Vision unavailable (' + err.message + '). Falling back to caption analysis...');
    const parsedCaption = parseBookingWithRegex(captionText || '');
    return {
      trx_id: parsedCaption.trx_id || null,
      amount: parsedCaption.amount || null,
      payment_method: parsedCaption.payment_method || 'unknown',
      status: parsedCaption.trx_id ? 'SUCCESS' : 'FAILED',
      is_valid_payment: !!parsedCaption.trx_id,
      caption_booking_info: {
        slot_number: parsedCaption.slot_number,
        squad_name: parsedCaption.squad_name,
        leader_name: parsedCaption.leader_name,
        match_query: parsedCaption.match_query
      }
    };
  }
}
