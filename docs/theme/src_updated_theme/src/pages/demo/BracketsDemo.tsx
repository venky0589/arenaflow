/**
 * Brackets Demo
 *
 * Showcases tournament bracket visualization with:
 * - Single-elimination bracket tree
 * - Team labels in match nodes
 * - Hover states and interactivity
 * - Responsive layout
 * - Winner progression highlighting
 */

import { Box, Typography, Paper, Chip, Tooltip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface Match {
  id: number;
  round: number;
  position: number;
  team1: string | null;
  team2: string | null;
  score1: number | null;
  score2: number | null;
  winner: 1 | 2 | null;
  category: 'MD' | 'WD' | 'XD';
}

// Mock bracket data (8-team single elimination)
const mockMatches: Match[] = [
  // Round 1 (Quarterfinals)
  {
    id: 1,
    round: 1,
    position: 1,
    team1: 'Rankireddy / Shetty',
    team2: 'Ahsan / Setiawan',
    score1: 21,
    score2: 18,
    winner: 1,
    category: 'MD',
  },
  {
    id: 2,
    round: 1,
    position: 2,
    team1: 'Gideon / Sukamuljo',
    team2: 'Li / Liu',
    score1: 19,
    score2: 21,
    winner: 2,
    category: 'MD',
  },
  {
    id: 3,
    round: 1,
    position: 3,
    team1: 'Astrup / Rasmussen',
    team2: 'Lane / Vendy',
    score1: 21,
    score2: 15,
    winner: 1,
    category: 'MD',
  },
  {
    id: 4,
    round: 1,
    position: 4,
    team1: 'Chia / Soh',
    team2: 'Endo / Watanabe',
    score1: 18,
    score2: 21,
    winner: 2,
    category: 'MD',
  },
  // Round 2 (Semifinals)
  {
    id: 5,
    round: 2,
    position: 1,
    team1: 'Rankireddy / Shetty',
    team2: 'Li / Liu',
    score1: 21,
    score2: 19,
    winner: 1,
    category: 'MD',
  },
  {
    id: 6,
    round: 2,
    position: 2,
    team1: 'Astrup / Rasmussen',
    team2: 'Endo / Watanabe',
    score1: 17,
    score2: 21,
    winner: 2,
    category: 'MD',
  },
  // Round 3 (Final)
  {
    id: 7,
    round: 3,
    position: 1,
    team1: 'Rankireddy / Shetty',
    team2: 'Endo / Watanabe',
    score1: null,
    score2: null,
    winner: null,
    category: 'MD',
  },
];

// Match Node Component
const MatchNode = ({ match }: { match: Match }) => {
  const isCompleted = match.winner !== null;
  const isFinal = match.round === 3;

  return (
    <Paper
      elevation={2}
      sx={{
        width: 240,
        p: 1.5,
        bgcolor: isFinal ? 'warning.light' : 'background.paper',
        border: isFinal ? '2px solid' : '1px solid',
        borderColor: isFinal ? 'warning.main' : 'divider',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 4,
          transform: 'scale(1.02)',
        },
      }}
    >
      {/* Match Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Chip
          label={match.round === 1 ? 'QF' : match.round === 2 ? 'SF' : 'FINAL'}
          size="small"
          color={match.round === 3 ? 'warning' : 'default'}
          sx={{ fontWeight: 600, fontSize: 10 }}
        />
        {isFinal && (
          <Tooltip title="Championship Match" arrow>
            <EmojiEventsIcon sx={{ color: 'warning.main', fontSize: 20 }} />
          </Tooltip>
        )}
      </Box>

      {/* Team 1 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={1}
        py={0.5}
        bgcolor={match.winner === 1 ? 'success.light' : 'grey.50'}
        borderRadius={1}
        mb={0.5}
        sx={{
          fontWeight: match.winner === 1 ? 600 : 400,
          transition: 'background-color 0.2s',
        }}
      >
        <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
          {match.team1 || 'TBD'}
        </Typography>
        {isCompleted && (
          <Typography
            variant="body2"
            fontWeight="600"
            color={match.winner === 1 ? 'success.dark' : 'text.secondary'}
          >
            {match.score1}
          </Typography>
        )}
      </Box>

      {/* Team 2 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={1}
        py={0.5}
        bgcolor={match.winner === 2 ? 'success.light' : 'grey.50'}
        borderRadius={1}
        sx={{
          fontWeight: match.winner === 2 ? 600 : 400,
          transition: 'background-color 0.2s',
        }}
      >
        <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
          {match.team2 || 'TBD'}
        </Typography>
        {isCompleted && (
          <Typography
            variant="body2"
            fontWeight="600"
            color={match.winner === 2 ? 'success.dark' : 'text.secondary'}
          >
            {match.score2}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

// Connector Lines Component (SVG)
const ConnectorLines = () => (
  <svg
    width="60"
    height="100"
    viewBox="0 0 60 100"
    style={{ position: 'absolute', left: '240px', top: '50%', transform: 'translateY(-50%)' }}
  >
    {/* Horizontal line from match to midpoint */}
    <line x1="0" y1="50" x2="30" y2="50" stroke="#bdbdbd" strokeWidth="2" />
    {/* Vertical line connecting two matches */}
    <line x1="30" y1="0" x2="30" y2="100" stroke="#bdbdbd" strokeWidth="2" />
    {/* Horizontal line to next round */}
    <line x1="30" y1="50" x2="60" y2="50" stroke="#bdbdbd" strokeWidth="2" />
  </svg>
);

export default function BracketsDemo() {
  const round1Matches = mockMatches.filter((m) => m.round === 1);
  const round2Matches = mockMatches.filter((m) => m.round === 2);
  const finalMatch = mockMatches.find((m) => m.round === 3);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Brackets Visualization Demo
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Single-elimination tournament bracket with team labels and winner highlighting
      </Typography>

      {/* Bracket Display */}
      <Paper sx={{ p: 4, bgcolor: 'grey.50', overflow: 'auto' }}>
        <Box display="flex" gap={8} minWidth={900}>
          {/* Round 1: Quarterfinals */}
          <Box>
            <Typography variant="subtitle2" fontWeight="600" mb={2} textAlign="center">
              Quarterfinals
            </Typography>
            <Box display="flex" flexDirection="column" gap={4}>
              {round1Matches.map((match) => (
                <MatchNode key={match.id} match={match} />
              ))}
            </Box>
          </Box>

          {/* Round 2: Semifinals */}
          <Box>
            <Typography variant="subtitle2" fontWeight="600" mb={2} textAlign="center">
              Semifinals
            </Typography>
            <Box display="flex" flexDirection="column" gap={16} sx={{ mt: 7 }}>
              {round2Matches.map((match) => (
                <MatchNode key={match.id} match={match} />
              ))}
            </Box>
          </Box>

          {/* Round 3: Final */}
          <Box>
            <Typography variant="subtitle2" fontWeight="600" mb={2} textAlign="center">
              Final
            </Typography>
            <Box sx={{ mt: 20 }}>{finalMatch && <MatchNode match={finalMatch} />}</Box>
          </Box>
        </Box>
      </Paper>

      {/* Implementation Notes */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Bracket Features
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              1. Team Label Display
            </Typography>
            <Typography variant="body2">
              Uses standard "LastName1 / LastName2" format with automatic truncation for long names.
              Hover over match cards to see subtle scaling effect.
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              2. Winner Highlighting
            </Typography>
            <Typography variant="body2">
              Winning team is highlighted with green background (<code>success.light</code>) and bold
              text. Losing team uses neutral gray background.
            </Typography>
            <Box display="flex" gap={2} mt={1} alignItems="center">
              <Box bgcolor="success.light" px={2} py={0.5} borderRadius={1}>
                <Typography variant="body2" fontWeight="600">
                  Winner (21 points)
                </Typography>
              </Box>
              <Box bgcolor="grey.50" px={2} py={0.5} borderRadius={1}>
                <Typography variant="body2">Loser (18 points)</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              3. Round Indicators
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip label="QF" size="small" sx={{ fontWeight: 600 }} />
              <Typography variant="body2">Quarterfinals</Typography>
            </Box>
            <Box display="flex" gap={1} mt={1}>
              <Chip label="SF" size="small" sx={{ fontWeight: 600 }} />
              <Typography variant="body2">Semifinals</Typography>
            </Box>
            <Box display="flex" gap={1} mt={1}>
              <Chip label="FINAL" size="small" color="warning" sx={{ fontWeight: 600 }} />
              <EmojiEventsIcon sx={{ color: 'warning.main', fontSize: 18 }} />
              <Typography variant="body2">Championship Match (gold highlight)</Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              4. Pending Matches (TBD)
            </Typography>
            <Typography variant="body2" paragraph>
              Matches without completed prerequisites show "TBD" until winner progresses from previous
              round. Final match in this demo is pending (no scores yet).
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, width: 240, bgcolor: 'warning.light' }}>
              <Chip label="FINAL" size="small" color="warning" sx={{ fontWeight: 600, mb: 1 }} />
              <Box bgcolor="grey.50" px={1} py={0.5} borderRadius={1} mb={0.5}>
                <Typography variant="body2">Rankireddy / Shetty</Typography>
              </Box>
              <Box bgcolor="grey.50" px={1} py={0.5} borderRadius={1}>
                <Typography variant="body2">Endo / Watanabe</Typography>
              </Box>
            </Paper>
          </Paper>

          <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom color="info.dark">
              Implementation Details
            </Typography>
            <Typography variant="body2" color="info.dark">
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Match cards: 240px width for consistent sizing</li>
                <li>Vertical spacing scales with round depth (gap: 4 → 16 → 20)</li>
                <li>Hover effect: 2% scale + elevated shadow (Material-UI elevation 4)</li>
                <li>Responsive: Horizontal scroll enabled for narrow viewports</li>
                <li>Connector lines: Optional enhancement with SVG paths (not implemented here)</li>
                <li>Backend data structure: Uses <code>nextMatchId</code> and <code>winnerAdvancesAs</code> fields</li>
              </ul>
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
