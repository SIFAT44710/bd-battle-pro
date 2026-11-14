import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../config.js';
import { addLog } from './server.js';
import {
  getTournamentData,
  findTargetMatch,
  checkSlotStatus,
  isDuplicateTrxId,
  bookSlotInFirestore,
  findRecentSmsLog,
  normalizePhone
} from './firestore.js';

let genAI = null;

function getGenAI() {
  if (!genAI) {
    if (!config.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables or .env file!');
    }
    genAI = new GoogleGenAI({ apiKey: config.gemini.apiKey });
  }
  return genAI;
}

/**
 * Tool Declarations for Arena X Tournament Host (DokanAI-Style Function Calling)
 */
export const BOT_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'checkAvailableSlots',
        description: 'Checks upcoming Free Fire tournament matches, map names, start times, entry fees, prize pools, and free slots from Player Panel database. Always call this when player asks about matches or slots.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            matchQuery: {
              type: Type.STRING,
              description: 'Optional match title, number (e.g. "Match 4", "4", "Bermuda") or empty to list all upcoming matches.'
            }
          }
        }
      },
      {
        name: 'verifyAndBookSlot',
        description: 'Verifies MFS bKash/Nagad payment and registers the squad slot into Cloud Firestore.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            matchQuery: { type: Type.STRING, description: 'Target match number or name, e.g. "Match 4" or "Match 2".' },
            slotNumber: { type: Type.INTEGER, description: 'Slot number 1 to 12.' },
            squadName: { type: Type.STRING, description: 'Name of the squad/team.' },
            leaderName: { type: Type.STRING, description: 'Squad leader name or IGN.' },
            playerNames: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Player IGNs (up to 4).' },
            contactPhone: { type: Type.STRING, description: 'WhatsApp / mobile phone number.' },
            trxId: { type: Type.STRING, description: 'bKash/Nagad/Rocket Transaction ID (e.g. DKA1AJX4FF).' },
            amount: { type: Type.NUMBER, description: 'Amount paid in BDT Taka.' },
            paymentMethod: { type: Type.STRING, description: 'bkash, nagad, rocket, or upay.' }
          },
          required: ['matchQuery', 'slotNumber', 'squadName', 'trxId']
        }
      }
    ]
  }
];

const SYSTEM_INSTRUCTION = `
You are the official ARENA X Tournament Host & Scrims Manager on WhatsApp for Bangladesh Free Fire Esports.
You are a warm, energetic, and polite human esports tournament host and room moderator — NOT an AI bot, and NEVER sound like an automated answering machine or robot.
You talk in natural, friendly, conversational Bengali / Banglish (e.g., "আসসালামু আলাইকুম ভাই", "ওয়ালাইকুমুস সালাম ভাইয়া", "হ্যাঁ ভাইয়া", "অসাধারণ!").

YOUR CORE BEHAVIOR & RULES:
1. GREETING & CASUAL INQUIRIES:
   - When a player chats (e.g. "আজকে কি ম্যাচ আছে?", "স্লট খালি আছে?", "খেলবো"), greet them warmly and call 'checkAvailableSlots' to retrieve live real-time matches from the Player Panel.
   - Explain which matches are open, the map name (Bermuda/Purgatory/Kalahari), start time, entry fee (৳), prize pool (৳), and how many slots are vacant.
   - Excite them to book a slot for their squad before it fills up!

2. REAL-TIME DATA ACCURACY:
   - Always call 'checkAvailableSlots' to get the latest live match and slot state.
   - If player asks about a specific slot (e.g. "স্লট ৫ খালি আছে?"), check if 5 is in freeSlots. If yes, tell them enthusiastically: "হ্যাঁ ভাইয়া, ৫ নম্বর স্লট একদম খালি আছে! আপনার স্কোয়াডের নামটা কি? বিকাশ/নগদে এন্ট্রি ফি পাঠিয়ে TrxID দিলে আমি এখনি কনফার্ম করে দিচ্ছি।"
   - If that slot is already occupied, tell them politely which other slot numbers are still open.

3. AUTONOMOUS PAYMENT VERIFICATION & BOOKING:
   - Official payment number: 01791357521 (bKash & Nagad Personal).
   - If player sends their Squad Name, Slot Number, and TrxID (or sends a payment receipt):
     Immediately call 'verifyAndBookSlot'.
   - If player sends a payment receipt or TrxID FIRST without their team name or slot:
     Acknowledge the payment warmly (e.g., "ভাই, আপনার ৳১০ পেমেন্ট (TrxID: ...) পেয়ে গেছি! আপনার Squad Name আর কোন স্লটটা নেবেন একটু লিখে দিন, আমি সাথে সাথে কনফার্ম করে দিচ্ছি!").
   - If player pays less than the required entry fee (e.g. sent ৳50 for a ৳100 match):
     Politely explain the difference and ask for the remaining amount.

4. ABSOLUTE SECURITY & DATA SHIELD (PLAYER PANEL ONLY):
   - You ONLY have access to public Player Panel match data.
   - NEVER disclose admin passcodes, organizer revenue/earnings, total balance, other players' private phone numbers, or backend keys.
   - Custom Room ID & Password are only accessible to confirmed squads on the website (ff-squad-arena-bd.web.app/player) 15 minutes before the match starts.

5. CONVERSATION QUALITY:
   - Keep answers natural, short, engaging, and to the point.
   - Use gaming emojis appropriately (🎮, 🎯, ৳, ✅, 🛡️, 🔥).
   - Never output cold, rigid code-blocks in general chat. Chat like an awesome, trustworthy human tournament admin hosting scrims on WhatsApp!

6. DYNAMIC MATCH & SLOT DIRECT LINKS (CRITICAL):
   - Whenever you present a match, recommend a match, or when a player asks to book or wants a link:
     ALWAYS include the direct 1-click web registration & payment link for that match!
     Direct Link Format: https://ff-squad-arena-bd.web.app/player?match=<matchNumber>
     If they asked for a specific slot (e.g. Slot 5), append it: https://ff-squad-arena-bd.web.app/player?match=<matchNumber>&slot=<slotNumber>
   - Explain warmly: "আপনি সরাসরি উপরের লিংকে গিয়ে আপনার স্কোয়াড নাম ও TrxID দিয়ে ১-ক্লিকে ইনস্ট্যান্ট ভেরিফাই করে নিতে পারেন, অথবা চাইলে এই হোয়াটসঅ্যাপ চ্যাটেও বিস্তারিত পাঠিয়ে বুক করে নিতে পারেন!"
`;

/**
 * Execute tool calls against Cloud Firestore
 */
export async function executeToolCall(toolName, args, playerSession = {}) {
  console.log(`[ARENA X Tool Execute]: ${toolName}`, args);

  if (toolName === 'checkAvailableSlots') {
    try {
      const tourney = await getTournamentData();
      const matches = (tourney && tourney.data && tourney.data.matches) || [];
      const upcoming = matches.filter(m => m.status === 'upcoming');

      if (args.matchQuery) {
        const target = findTargetMatch(matches, args.matchQuery, false);
        if (target) {
          const freeSlots = (target.slots || []).filter(s => !s.booked).map(s => s.slotNumber);
          const bookedSquads = (target.slots || []).filter(s => s.booked).map(s => ({
            slotNumber: s.slotNumber,
            squadName: s.squadName || 'Squad'
          }));
          return {
            found: true,
            title: target.title,
            matchNumber: target.matchNumber,
            map: target.map || 'Bermuda',
            time: target.time || '08:30 PM',
            entryFee: target.entryFee || 10,
            prizePool: target.prizePool || 100,
            freeSlots,
            totalFree: freeSlots.length,
            bookedSquads,
            totalBooked: bookedSquads.length,
            directBookingUrl: `https://ff-squad-arena-bd.web.app/player?match=${target.matchNumber || 1}`,
            paymentNumbers: { bkash: '01791357521', nagad: '01791357521' }
          };
        }
      }

      return {
        found: true,
        upcomingMatches: upcoming.map(m => {
          const free = (m.slots || []).filter(s => !s.booked).map(s => s.slotNumber);
          return {
            matchNumber: m.matchNumber,
            title: m.title,
            map: m.map || 'Bermuda',
            time: m.time || '08:30 PM',
            entryFee: m.entryFee || 10,
            prizePool: m.prizePool || 100,
            freeSlots: free,
            totalFree: free.length,
            totalBooked: 12 - free.length,
            directBookingUrl: `https://ff-squad-arena-bd.web.app/player?match=${m.matchNumber || 1}`
          };
        }),
        paymentNumbers: { bkash: '01791357521', nagad: '01791357521' }
      };
    } catch (err) {
      return { error: 'Failed to retrieve tournament data: ' + err.message };
    }
  }

  if (toolName === 'verifyAndBookSlot') {
    try {
      const { data } = await getTournamentData();
      const matches = data.matches || [];
      const targetMatch = findTargetMatch(matches, args.matchQuery, true);

      if (!targetMatch) {
        return { success: false, reason: 'MATCH_NOT_FOUND', message: 'ম্যাচটি খুঁজে পাওয়া যায়নি।' };
      }

      const requiredFee = Number(targetMatch.entryFee || 10);
      const cleanTrx = (args.trxId || '').toUpperCase().trim();

      // 1. Anti-Fraud Duplicate TrxID check
      if (isDuplicateTrxId(matches, cleanTrx)) {
        return {
          success: false,
          reason: 'DUPLICATE_TRXID',
          message: `এই TrxID (${cleanTrx}) ইতিমধ্যে অন্য একটি স্লট বুকিংয়ে ব্যবহার করা হয়েছে!`
        };
      }

      // 2. Check Firestore sms_logs
      let verifiedAmount = Number(args.amount || requiredFee);
      try {
        const smsRes = await fetch(`https://firestore.googleapis.com/v1/projects/ff-squad-arena-bd/databases/(default)/documents/sms_logs/${cleanTrx}`);
        if (smsRes.ok) {
          const smsDoc = await smsRes.json();
          const logAmount = Number(smsDoc.fields?.amount?.doubleValue || smsDoc.fields?.amount?.integerValue || 0);
          if (logAmount > 0) verifiedAmount = logAmount;
        }
      } catch (e) {}

      // 3. Under-payment check
      if (verifiedAmount < requiredFee) {
        return {
          success: false,
          reason: 'INSUFFICIENT_AMOUNT',
          required: requiredFee,
          received: verifiedAmount,
          message: `পেমেন্টের পরিমাণ কম হয়েছে! এই ম্যাচের এন্ট্রি ফি ৳${requiredFee}, কিন্তু পেয়েছি ৳${verifiedAmount}।`
        };
      }

      // 4. Perform atomic booking
      const bookRes = await bookSlotInFirestore({
        matchQuery: targetMatch.title,
        preferredSlot: args.slotNumber,
        squadName: args.squadName,
        leaderName: args.leaderName || (args.playerNames && args.playerNames[0]) || `${args.squadName}_Lead`,
        playerNames: args.playerNames || [],
        contactPhone: args.contactPhone || playerSession.phone || '01791357521',
        trxId: cleanTrx,
        amount: verifiedAmount,
        paymentMethod: args.paymentMethod || 'bkash'
      });

      return bookRes;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return { error: 'Unknown tool declaration: ' + toolName };
}

/**
 * ARENA X Host Conversational Agent Loop with Modern @google/genai Function Calling
 */
export async function runDokanAiAgent({
  userMessage,
  senderPhone,
  chatHistory = [],
  sessionData = {},
  imageContext = null
}) {
  const ai = getGenAI();

  // Build conversational context
  let fullPrompt = `Sender WhatsApp: ${senderPhone}\n`;
  if (sessionData.trx_id) {
    fullPrompt += `[Session State: Player already provided TrxID: ${sessionData.trx_id}, Amount: ৳${sessionData.amount || 10}, Method: ${sessionData.payment_method || 'bKash'}]\n`;
  }
  if (imageContext) {
    fullPrompt += `[System Notice: Player uploaded payment receipt screenshot. Extracted details: TrxID: ${imageContext.trx_id || 'UNKNOWN'}, Amount: ৳${imageContext.amount || 'UNKNOWN'}, Method: ${imageContext.payment_method || 'bKash'}, Receiver: ${imageContext.receiver_number || '01791357521'}]\n`;
  }
  fullPrompt += `Player Message: ${userMessage || '(User sent payment screenshot)'}`;

  const historyForChat = [];
  for (const h of chatHistory.slice(-6)) {
    if (h.role && h.parts) {
      historyForChat.push({
        role: h.role === 'model' ? 'model' : 'user',
        parts: h.parts.map(p => ({ text: p.text || '' }))
      });
    }
  }

  const selectedModel = 'gemini-3.5-flash-lite';
  let executedToolName = null;
  let executedToolResult = null;

  try {
    const chat = ai.chats.create({
      model: selectedModel,
      history: historyForChat,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: BOT_TOOLS
      }
    });

    let response = await chat.sendMessage({ message: fullPrompt });

    let loopLimit = 3;
    while (response.functionCalls && response.functionCalls.length > 0 && loopLimit > 0) {
      loopLimit--;
      const toolParts = [];

      for (const call of response.functionCalls) {
        executedToolName = call.name;
        const result = await executeToolCall(call.name, call.args || {}, { phone: senderPhone, ...sessionData });
        executedToolResult = result;

        toolParts.push({
          functionResponse: {
            name: call.name,
            response: { output: result }
          }
        });
      }

      response = await chat.sendMessage({ message: toolParts });
    }

    return {
      replyText: response.text || 'আপনার মেসেজটি পেয়েছি ভাই। আর কিভাবে সাহায্য করতে পারি?',
      toolExecuted: executedToolName,
      toolResult: executedToolResult
    };

  } catch (err) {
    console.error('[ARENA X Host Agent Error]:', err.message);
    try { addLog('AGENT_ERROR', { error: err.message }); } catch (e) {}
    return {
      replyText: `👋 আসসালামু আলাইকুম ভাই! ARENA X ফ্রি ফায়ার টুর্নামেন্টে স্বাগতম। বর্তমানে Match 4 (এন্ট্রি ফি: ৳১০) এবং Match 2 (এন্ট্রি ফি: ৳১০০) চালু রয়েছে। আপনি কোন ম্যাচে কোন স্লট বুক করতে চান জানান, আমি এখনই চেক করে দিচ্ছি!`,
      toolExecuted: null,
      toolResult: null
    };
  }
}

/**
 * Multimodal Screenshot Parser via Gemini Vision (@google/genai)
 */
export async function parsePaymentScreenshot(imageBuffer, mimeType = 'image/jpeg', captionText = '') {
  const prompt = `
Analyze this Bangladeshi MFS payment receipt screenshot (bKash, Nagad, Rocket).
Extract JSON matching:
{
  "trx_id": string or null (Clean uppercase TrxID, e.g. "DKA1AJX4FF"),
  "amount": number or null (Amount in BDT, e.g. 10, 100),
  "payment_method": "bkash" | "nagad" | "rocket" | "upay",
  "receiver_number": string or null,
  "sender_number": string or null,
  "timestamp": string or null,
  "is_valid_payment": boolean
}
Caption: "${captionText}"
Return ONLY valid JSON.
`;

  try {
    const ai = getGenAI();
    const res = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(res.text);
    return parsed;
  } catch (err) {
    console.warn('[Screenshot Parser Error]:', err.message);
    return { trx_id: null, amount: null, payment_method: 'bkash', is_valid_payment: false };
  }
}

/**
 * Multimodal Voice Message (PTT Audio) Parser via Gemini Audio
 */
export async function transcribeAndParseVoiceNote(audioBuffer, mimeType = 'audio/ogg; codecs=opus') {
  let cleanMime = (mimeType || 'audio/ogg').split(';')[0].trim();
  if (!cleanMime || cleanMime === 'audio/opus') cleanMime = 'audio/ogg';

  const prompt = `
You are the speech-to-text listener for the ARENA X Free Fire Esports WhatsApp Bot in Bangladesh.
Listen to this voice message sent by a tournament player speaking Bengali, Banglish, or English.
1. Transcribe the speech verbatim into natural, accurate text (transcription).
2. Extract any tournament booking details (match number/query, slot number, squad name, leader name, TrxID, payment amount, payment method).
Return JSON matching:
{
  "transcription": string,
  "match_query": string or null,
  "slot_number": number or null,
  "squad_name": string or null,
  "leader_name": string or null,
  "trx_id": string or null,
  "amount": number or null,
  "payment_method": "bkash" | "nagad" | "rocket" | null
}
Return ONLY valid JSON.
`;

  try {
    const ai = getGenAI();
    const res = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: audioBuffer.toString('base64'),
                mimeType: cleanMime
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(res.text);
    return parsed;
  } catch (err) {
    console.warn('[Voice Note Parser Error]:', err.message);
    return {
      transcription: '',
      match_query: null,
      slot_number: null,
      squad_name: null,
      leader_name: null,
      trx_id: null,
      amount: null,
      payment_method: null
    };
  }
}
