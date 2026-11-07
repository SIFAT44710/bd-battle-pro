/**
 * FF SQUAD ARENA — OFFICIAL FFWS POINTS ENGINE
 * Handles:
 *  - Official FFWS Placement Point allocation (#1=12, #2=9, #3=8 ... + 1 pt/kill)
 *  - Dynamic match tallying (1 to 6 matches)
 *  - Professional Esports Tie-Breaking algorithm
 *  - 1-Click WhatsApp / Facebook Messenger standings text generator
 */

const FFWS_PLACEMENT_POINTS = {
  1: 12, // Booyah!
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 1,
  11: 0,
  12: 0
};

const KILL_POINT_MULTIPLIER = 1;

/**
 * Calculate points for a single match result
 * @param {number} rank - Placement (1 to 12)
 * @param {number} kills - Total team kills in that match
 * @returns {object} { placePoints, killPoints, totalPoints, isBooyah }
 */
function calculateMatchPoints(rank, kills) {
  const safeRank = parseInt(rank, 10) || 12;
  const safeKills = Math.max(0, parseInt(kills, 10) || 0);
  
  const placePoints = FFWS_PLACEMENT_POINTS[safeRank] ?? 0;
  const killPoints = safeKills * KILL_POINT_MULTIPLIER;
  const totalPoints = placePoints + killPoints;
  const isBooyah = safeRank === 1;

  return {
    rank: safeRank,
    kills: safeKills,
    placePoints,
    killPoints,
    totalPoints,
    isBooyah
  };
}

/**
 * Calculate overall standings across all matches for all 12 teams
 * @param {Array} teams - List of 12 teams [{ id, slot, teamName, ... }]
 * @param {Array} matches - List of matches [{ id, matchNumber, map, results: { teamId: { rank, kills } } }]
 * @returns {Array} Sorted standings array
 */
function calculateOverallStandings(teams, matches) {
  const standingsMap = {};

  // Initialize for all 12 teams
  teams.forEach(team => {
    standingsMap[team.id] = {
      teamId: team.id,
      slot: team.slot,
      teamName: team.teamName || `Team Slot #${team.slot}`,
      captainName: team.captainName || 'Leader',
      matchesPlayed: 0,
      booyahs: 0,
      totalKillPoints: 0,
      totalPlacePoints: 0,
      totalPoints: 0,
      matchBreakdown: {} // matchId -> { rank, kills, totalPoints }
    };
  });

  // Tally each match
  matches.forEach(match => {
    if (!match.results) return;

    Object.entries(match.results).forEach(([teamId, res]) => {
      if (!standingsMap[teamId]) return;

      const pts = calculateMatchPoints(res.rank, res.kills);
      standingsMap[teamId].matchesPlayed += 1;
      if (pts.isBooyah) standingsMap[teamId].booyahs += 1;
      standingsMap[teamId].totalKillPoints += pts.killPoints;
      standingsMap[teamId].totalPlacePoints += pts.placePoints;
      standingsMap[teamId].totalPoints += pts.totalPoints;
      standingsMap[teamId].matchBreakdown[match.id] = pts;
    });
  });

  // Convert to array and apply official Esports Tie-Breaker:
  // 1. Total Points (Highest)
  // 2. Booyahs count (Highest)
  // 3. Placement Points (Highest)
  // 4. Kill Points (Highest)
  const standingsArray = Object.values(standingsMap);

  standingsArray.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    if (b.booyahs !== a.booyahs) {
      return b.booyahs - a.booyahs;
    }
    if (b.totalPlacePoints !== a.totalPlacePoints) {
      return b.totalPlacePoints - a.totalPlacePoints;
    }
    if (b.totalKillPoints !== a.totalKillPoints) {
      return b.totalKillPoints - a.totalKillPoints;
    }
    return a.slot - b.slot;
  });

  // Assign overall rank (1 to 12)
  return standingsArray.map((entry, index) => ({
    ...entry,
    overallRank: index + 1
  }));
}

/**
 * Format Standings as clean text for Facebook & WhatsApp groups
 * @param {string} tournamentTitle
 * @param {Array} standings
 * @param {number} completedMatches
 * @param {number} totalMatches
 * @returns {string}
 */
function generateWhatsAppReport(tournamentTitle, standings, completedMatches, totalMatches) {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  
  let report = `🏆 *${tournamentTitle.toUpperCase()}* 🏆\n`;
  report += `📊 *OVERALL POINTS TABLE (Match ${completedMatches}/${totalMatches})*\n`;
  report += `📅 Date: ${dateStr} | System: Official FFWS\n`;
  report += `══════════════════════════════\n`;

  standings.forEach(item => {
    const medal = item.overallRank === 1 ? '🥇' : item.overallRank === 2 ? '🥈' : item.overallRank === 3 ? '🥉' : `#${item.overallRank}`;
    const booyahStr = item.booyahs > 0 ? ` [${item.booyahs} Booyah 👑]` : '';
    report += `${medal} *${item.teamName}* — *${item.totalPoints} PTS*\n`;
    report += `   └ Kills: ${item.totalKillPoints} pts | Place: ${item.totalPlacePoints} pts${booyahStr}\n`;
  });

  report += `══════════════════════════════\n`;
  report += `⚡ Points: #1=12, #2=9, #3=8... + 1 pt/kill\n`;
  report += `🎮 FF Squad Arena • Powered by Sifat Bin Shahjahan\n`;

  return report;
}

// Export to window for vanilla browser usage
window.PointsEngine = {
  FFWS_PLACEMENT_POINTS,
  calculateMatchPoints,
  calculateOverallStandings,
  generateWhatsAppReport
};
