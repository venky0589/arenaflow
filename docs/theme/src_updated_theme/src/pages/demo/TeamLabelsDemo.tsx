/**
 * Team Labels Demo
 *
 * Showcases team display name formatting variants:
 * - Short format (LastName1 / LastName2)
 * - Full format (FirstName1 LastName1 / FirstName2 LastName2)
 * - Truncation examples
 * - Badge combinations
 * - Accessibility considerations
 */

import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';

interface Team {
  player1: { firstName: string; lastName: string };
  player2: { firstName: string; lastName: string };
}

// Mock team data with various name lengths
const mockTeams: (Team & { category: string })[] = [
  {
    player1: { firstName: 'Satwiksairaj', lastName: 'Rankireddy' },
    player2: { firstName: 'Chirag', lastName: 'Shetty' },
    category: 'MD',
  },
  {
    player1: { firstName: 'Saina', lastName: 'Nehwal' },
    player2: { firstName: 'Ashwini', lastName: 'Ponnappa' },
    category: 'WD',
  },
  {
    player1: { firstName: 'Chris', lastName: 'Adcock' },
    player2: { firstName: 'Gabrielle', lastName: 'Adcock' },
    category: 'XD',
  },
  {
    player1: { firstName: 'Mohammad', lastName: 'Ahsan' },
    player2: { firstName: 'Hendra', lastName: 'Setiawan' },
    category: 'MD',
  },
];

// Team name formatter utility (matches backend Team.getDisplayName())
const formatTeamDisplayName = (team: Team, fullName = false): string => {
  const { player1, player2 } = team;

  if (fullName) {
    const name1 = `${player1.firstName} ${player1.lastName}`.trim();
    const name2 = `${player2.firstName} ${player2.lastName}`.trim();
    return `${name1} / ${name2}`;
  }

  return `${player1.lastName} / ${player2.lastName}`;
};

// Truncation utility (UX Refinement #7)
const truncateTeamName = (displayName: string, maxLength = 30): string => {
  if (displayName.length <= maxLength) return displayName;
  return displayName.substring(0, maxLength - 3) + '...';
};

export default function TeamLabelsDemo() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Team Labels Demo
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Showcase of team display name formatting variants and best practices
      </Typography>

      {/* Section 1: Display Name Variants */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          1. Display Name Format Variants
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Standard format: <strong>LastName1 / LastName2</strong> (short) or full names for detailed views
        </Typography>

        <Grid container spacing={2}>
          {mockTeams.map((team, idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Chip
                    label={team.category}
                    size="small"
                    color={team.category === 'MD' ? 'info' : team.category === 'WD' ? 'secondary' : 'success'}
                  />
                  <Typography variant="caption" color="text.disabled">
                    {team.category === 'MD'
                      ? "Men's Doubles"
                      : team.category === 'WD'
                      ? "Women's Doubles"
                      : 'Mixed Doubles'}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11 }}>
                  Short Format:
                </Typography>
                <Typography variant="body1" fontWeight="600" gutterBottom>
                  {formatTeamDisplayName(team, false)}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11 }}>
                  Full Format:
                </Typography>
                <Typography variant="body2">{formatTeamDisplayName(team, true)}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Section 2: Truncation Examples */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          2. Truncation with Tooltips (Mobile/Narrow Views)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Long team names are truncated with ellipsis. Hover to see full name in tooltip.
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Original Name</TableCell>
                <TableCell>Max Length</TableCell>
                <TableCell>Truncated Display</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: 'Satwiksairaj Rankireddy / Chirag Shetty', maxLength: 30 },
                { name: 'Satwiksairaj Rankireddy / Chirag Shetty', maxLength: 20 },
                { name: 'Rankireddy / Shetty', maxLength: 30 },
                { name: 'Mohammad Ahsan / Hendra Setiawan', maxLength: 25 },
              ].map((example, idx) => {
                const truncated = truncateTeamName(example.name, example.maxLength);
                const isTruncated = truncated !== example.name;

                return (
                  <TableRow key={idx}>
                    <TableCell>{example.name}</TableCell>
                    <TableCell>{example.maxLength}</TableCell>
                    <TableCell>
                      {isTruncated ? (
                        <Tooltip title={example.name} arrow>
                          <Typography
                            variant="body2"
                            sx={{
                              cursor: 'pointer',
                              display: 'inline-block',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {truncated}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2">{truncated}</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Section 3: Badge Combinations */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          3. Badge + Team Name Combinations
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Common UI patterns for displaying team labels with category indicators
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          {/* Pattern 1: Inline Badge */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Pattern 1: Inline Badge
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip label="D" size="small" color="success" />
              <Typography variant="body1" fontWeight="500">
                Rankireddy / Shetty
              </Typography>
            </Box>
          </Paper>

          {/* Pattern 2: Badge Above */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Pattern 2: Badge Above
            </Typography>
            <Box>
              <Chip label="MD" size="small" color="info" sx={{ mb: 0.5 }} />
              <Typography variant="body1" fontWeight="500">
                Rankireddy / Shetty
              </Typography>
            </Box>
          </Paper>

          {/* Pattern 3: Full Category Label */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Pattern 3: Full Category Label
            </Typography>
            <Box>
              <Typography variant="caption" color="text.disabled">
                Men's Doubles U19
              </Typography>
              <Typography variant="body1" fontWeight="500">
                Rankireddy / Shetty
              </Typography>
            </Box>
          </Paper>

          {/* Pattern 4: Match Card Style */}
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Pattern 4: Match Card Style
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Chip label="D" size="small" color="success" />
                  <Typography variant="body1" fontWeight="600">
                    Rankireddy / Shetty
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.disabled">
                  vs
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Chip label="D" size="small" color="success" />
                  <Typography variant="body1" fontWeight="600">
                    Ahsan / Setiawan
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h6" color="text.disabled">
                21-19, 18-21, 21-17
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Paper>

      {/* Section 4: Implementation Guidelines */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          4. Implementation Guidelines
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              Backend (Java)
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace', fontSize: 12 }}>
              <pre style={{ margin: 0, overflow: 'auto' }}>
                {`// Team.java
public String getDisplayName() {
  if (player1 == null || player2 == null) {
    return "TBD";
  }
  return player1.getLastName() + " / "
    + player2.getLastName();
}

public String getFullDisplayName() {
  if (player1 == null || player2 == null) {
    return "TBD";
  }
  return player1.getFullName() + " / "
    + player2.getFullName();
}`}
              </pre>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              Frontend (TypeScript)
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace', fontSize: 12 }}>
              <pre style={{ margin: 0, overflow: 'auto' }}>
                {`// teamDisplayNameFormatter.ts
export function formatTeamDisplayName(
  team: Team,
  fullName = false
): string {
  if (!team?.player1 || !team?.player2) {
    return 'TBD';
  }

  if (fullName) {
    const name1 = \`\${team.player1.firstName} \${team.player1.lastName}\`;
    const name2 = \`\${team.player2.firstName} \${team.player2.lastName}\`;
    return \`\${name1} / \${name2}\`;
  }

  return \`\${team.player1.lastName} / \${team.player2.lastName}\`;
}`}
              </pre>
            </Paper>
          </Grid>
        </Grid>

        <Box mt={3} p={2} bgcolor="info.light" borderRadius={1}>
          <Typography variant="body2" color="info.dark">
            <strong>Best Practice:</strong> Use shared utility function across all UIs (Admin, User, Mobile)
            to ensure consistent formatting. See <code>docs/shared-utils/teamDisplayNameFormatter.js</code>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
