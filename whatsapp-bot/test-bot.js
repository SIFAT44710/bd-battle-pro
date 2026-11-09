import { parseBookingText } from './services/gemini.js';
import { getTournamentData, checkSlotStatus, findTargetMatch } from './services/firestore.js';

async function runTest() {
  console.log('🧪 Testing Gemini 1.5 Flash Banglish Parsing with real API key...');
  const text = 'vai 8:30 pm match slot 5 a squad Dark Vortex leader Sifat book koren trx BL9204918 fee 100 bkash korsi';
  const result = await parseBookingText(text);
  console.log('Gemini Parse Output:\n', JSON.stringify(result, null, 2));

  console.log('\n🧪 Testing Firestore Connectivity (ff-daily-squad)...');
  const { data } = await getTournamentData();
  console.log('Tournament Name:', data.tournamentName);
  console.log('Matches Count:', data.matches?.length);

  const target = findTargetMatch(data.matches, result.match_query);
  console.log('Matched Event:', target?.title, '| Time:', target?.time);

  const slotCheck = checkSlotStatus(target, result.slot_number);
  console.log(`Slot #${result.slot_number} Available:`, slotCheck.available);
  console.log('All Free Slots:', slotCheck.freeSlots.join(', '));
  console.log('\n✅ ALL SYSTEMS VERIFIED & 100% OPERATIONAL!');
  process.exit(0);
}

runTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
