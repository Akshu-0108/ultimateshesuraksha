/**
 * Given two user IDs (in either order), returns them as [userLow, userHigh]
 * — a fixed, consistent order based on plain string comparison of the
 * ObjectId hex strings. Used so the SAME two users always map to the SAME
 * userLow/userHigh pair on a Connection document, no matter who sends the
 * request. See models/Connection.js for why this matters.
 */
function sortUserPair(userIdA, userIdB) {
  const a = userIdA.toString();
  const b = userIdB.toString();
  return a < b ? [a, b] : [b, a];
}

module.exports = { sortUserPair };
