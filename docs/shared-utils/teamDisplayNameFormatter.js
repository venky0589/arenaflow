/**
 * Shared Team Display Name Formatter
 *
 * USE THIS FUNCTION across Admin UI, User UI, and Mobile App to ensure
 * consistent team label formatting. This prevents string drift.
 *
 * @module teamDisplayNameFormatter
 */

/**
 * Formats team display name in standard "LastName1 / LastName2" format
 *
 * @param {Object} team - Team object with player1 and player2
 * @param {Object} team.player1 - First player
 * @param {string} team.player1.lastName - First player's last name
 * @param {Object} team.player2 - Second player
 * @param {string} team.player2.lastName - Second player's last name
 * @param {boolean} [fullName=false] - If true, includes first names
 * @returns {string} Formatted team display name
 *
 * @example
 * // Short format (default)
 * formatTeamDisplayName({
 *   player1: { firstName: "Satwiksairaj", lastName: "Rankireddy" },
 *   player2: { firstName: "Chirag", lastName: "Shetty" }
 * })
 * // Returns: "Rankireddy / Shetty"
 *
 * @example
 * // Full format
 * formatTeamDisplayName({
 *   player1: { firstName: "Satwiksairaj", lastName: "Rankireddy" },
 *   player2: { firstName: "Chirag", lastName: "Shetty" }
 * }, true)
 * // Returns: "Satwiksairaj Rankireddy / Chirag Shetty"
 */
export function formatTeamDisplayName(team, fullName = false) {
  if (!team || !team.player1 || !team.player2) {
    return 'TBD';
  }

  const { player1, player2 } = team;

  if (fullName) {
    // Full format: "FirstName1 LastName1 / FirstName2 LastName2"
    const name1 = `${player1.firstName || ''} ${player1.lastName || ''}`.trim();
    const name2 = `${player2.firstName || ''} ${player2.lastName || ''}`.trim();
    return `${name1} / ${name2}`;
  } else {
    // Short format: "LastName1 / LastName2"
    return `${player1.lastName || ''} / ${player2.lastName || ''}`;
  }
}

/**
 * Formats participant name (handles both singles and doubles)
 *
 * @param {Object} registration - Registration object
 * @param {Object} [registration.player] - Player object (for singles)
 * @param {Object} [registration.team] - Team object (for doubles)
 * @param {boolean} [fullName=false] - If true, includes first names for teams
 * @returns {string} Formatted participant name
 *
 * @example
 * // Singles
 * formatParticipantName({
 *   player: { firstName: "Saina", lastName: "Nehwal" }
 * })
 * // Returns: "Saina Nehwal"
 *
 * @example
 * // Doubles (short)
 * formatParticipantName({
 *   team: {
 *     player1: { lastName: "Rankireddy" },
 *     player2: { lastName: "Shetty" }
 *   }
 * })
 * // Returns: "Rankireddy / Shetty"
 */
export function formatParticipantName(registration, fullName = false) {
  if (!registration) {
    return 'TBD';
  }

  // Singles: Use player's full name
  if (registration.player) {
    const { firstName, lastName } = registration.player;
    return `${firstName || ''} ${lastName || ''}`.trim();
  }

  // Doubles: Use team formatter
  if (registration.team) {
    return formatTeamDisplayName(registration.team, fullName);
  }

  return 'TBD';
}

/**
 * Validates team display name format
 *
 * @param {string} displayName - Display name to validate
 * @returns {boolean} True if format is valid
 *
 * @example
 * isValidTeamDisplayName("Rankireddy / Shetty")  // true
 * isValidTeamDisplayName("InvalidFormat")         // false
 */
export function isValidTeamDisplayName(displayName) {
  // Pattern: Word / Word (allows hyphenated names, accents, etc.)
  const pattern = /^[\w\-']+\s*\/\s*[\w\-']+$/;
  return pattern.test(displayName);
}

/**
 * Truncates team name with ellipsis if too long
 *
 * @param {string} displayName - Team display name
 * @param {number} [maxLength=30] - Maximum length before truncation
 * @returns {string} Truncated name
 *
 * @example
 * truncateTeamName("VeryLongLastName / AnotherVeryLongLastName", 20)
 * // Returns: "VeryLongLastName..."
 */
export function truncateTeamName(displayName, maxLength = 30) {
  if (!displayName || displayName.length <= maxLength) {
    return displayName;
  }

  return displayName.substring(0, maxLength - 3) + '...';
}

// Backend equivalent (Java)
// Copy this to Team.java if not already present:
/*
public String getDisplayName() {
    if (player1 == null || player2 == null) {
        return "TBD";
    }
    return player1.getLastName() + " / " + player2.getLastName();
}

public String getFullDisplayName() {
    if (player1 == null || player2 == null) {
        return "TBD";
    }
    return player1.getFullName() + " / " + player2.getFullName();
}
*/

/**
 * React component example usage:
 *
 * import { formatTeamDisplayName } from '@/utils/teamDisplayNameFormatter';
 *
 * function TeamCard({ team }) {
 *   return (
 *     <Card>
 *       <Typography variant="h6">
 *         {formatTeamDisplayName(team)}
 *       </Typography>
 *       <Typography variant="caption">
 *         {formatTeamDisplayName(team, true)}
 *       </Typography>
 *     </Card>
 *   );
 * }
 */

/**
 * React Native example usage:
 *
 * import { formatTeamDisplayName } from './utils/teamDisplayNameFormatter';
 *
 * function MatchCard({ match }) {
 *   const teamName = formatParticipantName(match.registration1);
 *   return <Text>{teamName}</Text>;
 * }
 */
