import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

let genAI = null;
const CANDIDATE_MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];

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
 * Generate Content with automatic multi-model failover
 */
async function generateWithFailover(promptOrParts) {
  const ai = getGenAI();
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
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
    console.error('[Gemini Text Parse Error]:', err.message);
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
    console.error('[Gemini Vision Parse Error]:', err.message);
    return {
      trx_id: null,
      amount: null,
      payment_method: 'unknown',
      status: 'FAILED',
      is_valid_payment: false,
      caption_booking_info: {}
    };
  }
}
