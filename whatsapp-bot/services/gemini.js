import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { getTournamentData, findTargetMatch, checkSlotStatus, isDuplicateTrxId, bookSlotInFirestore, findRecentSmsLog, normalizePhone } from './firestore.js';

let genAI = null;
let modelCallCounter = 0;

// High-limit rotating model pool for zero-downtime execution
const ROTATING_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest'
];

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
 * Tool Declarations for DokanAI-Style Function Calling
 */
const BOT_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'checkAvailableSlots',
        description: 'Checks upcoming Free Fire tournament matches, map names, start times, entry fees, and free slots.',
        parameters: {
          type: 'OBJECT',
          properties: {
            matchQuery: {
              type: 'STRING',
              description: 'Optional match title, number (e.g. "Match 4", "4", "Bermuda") or empty to list all upcoming matches.'
            }
          }
        }
      },
      {
        name: 'verifyAndBookSlot',
        description: 'Verifies MFS bKash/Nagad payment and registers the squad slot into Cloud Firestore.',
        parameters: {
          type: 'OBJECT',
          properties: {
            matchQuery: { type: 'STRING', description: 'Target match number or name, e.g. "Match 4" or "Match 2".' },
            slotNumber: { type: 'INTEGER', description: 'Slot number 1 to 12.' },
            squadName: { type: 'STRING', description: 'Name of the squad/team.' },
            leaderName: { type: 'STRING', description: 'Squad leader name or IGN.' },
            playerNames: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Player IGNs (up to 4).' },
            contactPhone: { type: 'STRING', description: 'WhatsApp / mobile phone number.' },
            trxId: { type: 'STRING', description: 'bKash/Nagad/Rocket Transaction ID (e.g. DKA1AJX4FF).' },
            amount: { type: 'NUMBER', description: 'Amount paid in BDT Taka.' },
            paymentMethod: { type: 'STRING', description: 'bkash, nagad, rocket, or upay.' }
          },
          required: ['matchQuery', 'slotNumber', 'squadName', 'trxId']
        }
      }
    ]
  }
];

const SYSTEM_INSTRUCTION = `
You are the ARENA X Autonomous Tournament AI Manager for Bangladesh Free Fire Esports.
You chat naturally and politely in conversational Bengali / Banglish (casual, friendly, professional).

Rules for your behavior:
1. You represent ARENA X Free Fire tournament platform.
2. If player asks which matches or slots are free, or if they send a booking inquiry, call the 'checkAvailableSlots' tool to get live real-time match data. Then explain clearly which matches are open, their entry fees, and that they should Send Money to 01791357521 (bKash/Nagad Personal).
3. If player sends their squad name and slot number along with a TrxID or after sending a payment receipt, call 'verifyAndBookSlot'.
4. If player sends a payment receipt or TrxID but HAS NOT given their Squad Name or Slot number, acknowledge the payment warmly and explain: "ভাই, আপনার পেমেন্ট পেয়েছি! নিচের বুকিং ফরম্যাটটি পূরণ করে পাঠিয়ে দিন, আমি এক্ষুনি স্লট কনফার্ম করে দিচ্ছি।"
5. When guiding a player on how to book or if they ask for format/rules, answer conversationally in Bengali. Do NOT output large raw template code blocks inside your text, as our messaging system will automatically send the clean, 1-tap copyable booking template as a separate WhatsApp message right after your reply.
6. If player sends less money than the match entry fee (e.g. fee is ৳100, but player sent ৳50), tell them politely: "ভাই, এই ম্যাচের এন্ট্রি ফি ৳১০০, কিন্তু পেয়েছি ৳৫০। অনুগ্রহ করে বাকি ৳৫০ পরিশোধ করে TrxID দিন, আমি স্লট কনফার্ম করে দিচ্ছি।"
7. Keep your answers concise, human, and direct. Use appropriate emojis (🎮, 🎯, ৳, ✅, 🛡️).
`;

/**
 * Execute tool calls against Cloud Firestore
 */
export async function executeToolCall(toolName, args, playerSession = {}) {
  console.log(`[DokanAI Tool Execute]: ${toolName}`, args);

  if (toolName === 'checkAvailableSlots') {
    try {
      const tourney = await getTournamentData();
      const matches = (tourney && tourney.data && tourney.data.matches) || [];
      const upcoming = matches.filter(m => m.status === 'upcoming');

      if (args.matchQuery) {
        const target = findTargetMatch(matches, args.matchQuery, false);
        if (target) {
          const freeSlots = (target.slots || []).filter(s => !s.booked).map(s => s.slotNumber);
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
            paymentNumbers: { bkash: '01791357521', nagad: '01791357521' }
          };
        }
      }

      return {
        found: true,
        upcomingMatches: upcoming.map(m => ({
          matchNumber: m.matchNumber,
          title: m.title,
          map: m.map || 'Bermuda',
          time: m.time || '08:30 PM',
          entryFee: m.entryFee || 10,
          prizePool: m.prizePool || 100,
          freeSlots: (m.slots || []).filter(s => !s.booked).map(s => s.slotNumber)
        })),
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
 * DokanAI-Style Conversational Agent Loop with Function Calling
 */
export async function runDokanAiAgent({
  userMessage,
  senderPhone,
  chatHistory = [],
  sessionData = {},
  imageContext = null
}) {
  const ai = getGenAI();
  let modelInstance = null;

  // Rotation with failover
  for (let i = 0; i < ROTATING_MODELS.length; i++) {
    const idx = (modelCallCounter + i) % ROTATING_MODELS.length;
    const modelName = ROTATING_MODELS[idx];
    try {
      modelInstance = ai.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: BOT_TOOLS
      });
      break;
    } catch (e) {
      console.warn(`Model ${modelName} init failed, trying next...`);
    }
  }

  modelCallCounter++;

  // Build conversational context
  let fullPrompt = `Sender WhatsApp: ${senderPhone}\n`;
  if (sessionData.trx_id) {
    fullPrompt += `[Session State: Player already provided TrxID: ${sessionData.trx_id}, Amount: ৳${sessionData.amount || 10}, Method: ${sessionData.payment_method || 'bKash'}]\n`;
  }
  if (imageContext) {
    fullPrompt += `[System Notice: Player uploaded payment receipt screenshot. Extracted details: TrxID: ${imageContext.trx_id || 'UNKNOWN'}, Amount: ৳${imageContext.amount || 'UNKNOWN'}, Method: ${imageContext.payment_method || 'bKash'}, Receiver: ${imageContext.receiver_number || '01791357521'}]\n`;
  }
  fullPrompt += `Player Message: ${userMessage || '(User sent payment screenshot)'}`;

  try {
    const chat = modelInstance.startChat({
      history: chatHistory.slice(-6)
    });

    let response = await chat.sendMessage(fullPrompt);
    let functionCalls = response.response.functionCalls();

    // If Gemini wants to call a tool (Function Calling)
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      const toolResult = await executeToolCall(call.name, call.args, { phone: senderPhone, ...sessionData });

      // Feed tool result back to Gemini so it speaks to the user
      const secondResponse = await chat.sendMessage([
        {
          functionResponse: {
            name: call.name,
            response: toolResult
          }
        }
      ]);

      return {
        replyText: secondResponse.response.text(),
        toolExecuted: call.name,
        toolResult
      };
    }

    return {
      replyText: response.response.text(),
      toolExecuted: null,
      toolResult: null
    };

  } catch (err) {
    console.error('[DokanAI Agent Error]:', err.message);
    // Graceful offline fallback
    return {
      replyText: `👋 আসসালামু আলাইকুম! ARENA X টুর্নামেন্টে স্বাগতম। বর্তমানে Match 4 (এন্ট্রি ফি: ৳১০) এবং Match 2 (এন্ট্রি ফি: ৳১০০) চালু রয়েছে। আপনি কোন ম্যাচে কোন স্লট বুক করতে চান এবং বিকাশ TrxID টা একটু লিখে দিন, আমি কনফার্ম করে দিচ্ছি!`,
      toolExecuted: null,
      toolResult: null
    };
  }
}

/**
 * Multimodal Screenshot Parser via Gemini Vision
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

  const ai = getGenAI();
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType
    }
  };

  for (const m of ROTATING_MODELS) {
    try {
      const model = ai.getGenerativeModel({ model: m, generationConfig: { responseMimeType: 'application/json' } });
      const res = await model.generateContent([prompt, imagePart]);
      return JSON.parse(res.response.text());
    } catch (err) {
      console.warn(`Vision model ${m} failed (${err.message}), trying next candidate...`);
    }
  }

  return { trx_id: null, amount: null, payment_method: 'bkash', is_valid_payment: false };
}
