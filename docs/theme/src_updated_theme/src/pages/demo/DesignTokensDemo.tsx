/**
 * Design Tokens Demo
 *
 * Reference guide for design system tokens used in Team/Doubles UX:
 * - Color palette (category badges, states, feedback)
 * - Typography scale
 * - Spacing system
 * - Component state variants
 * - MUI theme tokens
 */

import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  TextField,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function DesignTokensDemo() {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Design Tokens Reference
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Design system tokens used throughout Team/Doubles UX implementation
      </Typography>

      {/* Section 1: Color Palette */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          1. Color Palette
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Category badges, state indicators, and feedback colors
        </Typography>

        <Grid container spacing={2}>
          {/* Primary (Singles) */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Primary (Singles Badge)
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Box bgcolor="primary.main" width={40} height={40} borderRadius={1} />
                <Box>
                  <Typography variant="caption" display="block">
                    primary.main
                  </Typography>
                  <Typography variant="caption" color="text.disabled" fontFamily="monospace">
                    {theme.palette.primary.main}
                  </Typography>
                </Box>
              </Box>
              <Chip label="S" size="small" color="primary" />
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Used for: Singles category badge, primary actions
              </Typography>
            </Paper>
          </Grid>

          {/* Success (Doubles) */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Success (Doubles Badge)
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Box bgcolor="success.main" width={40} height={40} borderRadius={1} />
                <Box>
                  <Typography variant="caption" display="block">
                    success.main
                  </Typography>
                  <Typography variant="caption" color="text.disabled" fontFamily="monospace">
                    {theme.palette.success.main}
                  </Typography>
                </Box>
              </Box>
              <Chip label="D" size="small" color="success" />
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Used for: Doubles category badge, winner highlighting, check-in status
              </Typography>
            </Paper>
          </Grid>

          {/* Error (Validation) */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Error (Validation Feedback)
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Box bgcolor="error.main" width={40} height={40} borderRadius={1} />
                <Box>
                  <Typography variant="caption" display="block">
                    error.main
                  </Typography>
                  <Typography variant="caption" color="text.disabled" fontFamily="monospace">
                    {theme.palette.error.main}
                  </Typography>
                </Box>
              </Box>
              <Chip label="Error" size="small" color="error" />
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Used for: Validation errors, gender mismatch alerts
              </Typography>
            </Paper>
          </Grid>

          {/* Info (Men's Doubles) */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Info (Men's Doubles)
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Box bgcolor="info.main" width={40} height={40} borderRadius={1} />
                <Box>
                  <Typography variant="caption" display="block">
                    info.main
                  </Typography>
                  <Typography variant="caption" color="text.disabled" fontFamily="monospace">
                    {theme.palette.info.main}
                  </Typography>
                </Box>
              </Box>
              <Chip label="MD" size="small" color="info" />
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Used for: Men's Doubles category chip
              </Typography>
            </Paper>
          </Grid>

          {/* Secondary (Women's Doubles) */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Secondary (Women's Doubles)
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Box bgcolor="secondary.main" width={40} height={40} borderRadius={1} />
                <Box>
                  <Typography variant="caption" display="block">
                    secondary.main
                  </Typography>
                  <Typography variant="caption" color="text.disabled" fontFamily="monospace">
                    {theme.palette.secondary.main}
                  </Typography>
                </Box>
              </Box>
              <Chip label="WD" size="small" color="secondary" />
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Used for: Women's Doubles category chip
              </Typography>
            </Paper>
          </Grid>

          {/* Warning (Final Match) */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Warning (Championship)
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Box bgcolor="warning.main" width={40} height={40} borderRadius={1} />
                <Box>
                  <Typography variant="caption" display="block">
                    warning.main
                  </Typography>
                  <Typography variant="caption" color="text.disabled" fontFamily="monospace">
                    {theme.palette.warning.main}
                  </Typography>
                </Box>
              </Box>
              <Chip label="FINAL" size="small" color="warning" />
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Used for: Final/championship match highlighting
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Section 2: Typography Scale */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          2. Typography Scale
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Text hierarchy used in team labels, match cards, and forms
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Heading 4 - Page Title
            </Typography>
            <Typography variant="caption" color="text.disabled" fontFamily="monospace">
              variant="h4" | 2.125rem (34px) | Used for: Page headers
            </Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="h5" gutterBottom>
              Heading 5 - Section Title
            </Typography>
            <Typography variant="caption" color="text.disabled" fontFamily="monospace">
              variant="h5" | 1.5rem (24px) | Used for: Section headers, demo titles
            </Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="h6" gutterBottom>
              Heading 6 - Subsection
            </Typography>
            <Typography variant="caption" color="text.disabled" fontFamily="monospace">
              variant="h6" | 1.25rem (20px) | Used for: Match cards, team display names
            </Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="body1" gutterBottom>
              Body 1 - Primary Text
            </Typography>
            <Typography variant="caption" color="text.disabled" fontFamily="monospace">
              variant="body1" | 1rem (16px) | Used for: Participant names, descriptions
            </Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="body2" gutterBottom>
              Body 2 - Secondary Text
            </Typography>
            <Typography variant="caption" color="text.disabled" fontFamily="monospace">
              variant="body2" | 0.875rem (14px) | Used for: Table cells, helper text
            </Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="caption" gutterBottom display="block">
              Caption - Meta Information
            </Typography>
            <Typography variant="caption" color="text.disabled" fontFamily="monospace">
              variant="caption" | 0.75rem (12px) | Used for: Timestamps, labels
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Section 3: Spacing System */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          3. Spacing System
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          MUI theme spacing scale (base unit: 8px)
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Token</TableCell>
                <TableCell>Value (px)</TableCell>
                <TableCell>Usage Example</TableCell>
                <TableCell>Visual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { token: 'spacing(1)', px: 8, usage: 'Tight spacing (chip gaps)' },
                { token: 'spacing(2)', px: 16, usage: 'Default spacing (form fields)' },
                { token: 'spacing(3)', px: 24, usage: 'Section spacing' },
                { token: 'spacing(4)', px: 32, usage: 'Large gaps (page sections)' },
                { token: 'spacing(6)', px: 48, usage: 'Extra-large (demo cards)' },
              ].map((row) => (
                <TableRow key={row.token}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {row.token}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.px}px</TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.usage}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box bgcolor="primary.main" width={row.px} height={16} borderRadius={0.5} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Section 4: Component States */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          4. Component State Variants
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Visual feedback for interactive elements
        </Typography>

        <Grid container spacing={2}>
          {/* Button States */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Button States
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Button variant="contained">Default</Button>
                <Button variant="contained" disabled>
                  Disabled
                </Button>
                <Button variant="outlined">Outlined</Button>
                <Button variant="text">Text</Button>
              </Box>
            </Paper>
          </Grid>

          {/* Chip States */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Chip States
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box display="flex" gap={1}>
                  <Chip label="Default" />
                  <Chip label="Primary" color="primary" />
                  <Chip label="Success" color="success" />
                </Box>
                <Box display="flex" gap={1}>
                  <Chip label="Outlined" variant="outlined" />
                  <Chip label="Clickable" clickable />
                  <Chip label="Disabled" disabled />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Text Field States */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Text Field States
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <TextField label="Default" size="small" />
                <TextField label="Filled" size="small" value="Rankireddy / Shetty" />
                <TextField label="Error" size="small" error helperText="Gender mismatch" />
                <TextField label="Disabled" size="small" disabled />
              </Box>
            </Paper>
          </Grid>

          {/* Background Colors */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Background Colors
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box bgcolor="grey.50" p={1.5} borderRadius={1}>
                  <Typography variant="body2">grey.50 - Neutral background</Typography>
                </Box>
                <Box bgcolor="success.light" p={1.5} borderRadius={1}>
                  <Typography variant="body2">success.light - Winner highlight</Typography>
                </Box>
                <Box bgcolor="error.light" p={1.5} borderRadius={1}>
                  <Typography variant="body2">error.light - Error state</Typography>
                </Box>
                <Box bgcolor="warning.light" p={1.5} borderRadius={1}>
                  <Typography variant="body2">warning.light - Final match</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Section 5: Usage Guidelines */}
      <Paper sx={{ p: 3, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom fontWeight="600" color="info.dark">
          Usage Guidelines
        </Typography>
        <Typography variant="body2" color="info.dark" component="div">
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>
              <strong>Category Badges:</strong> Use <code>primary</code> for Singles (S), <code>success</code> for
              Doubles (D)
            </li>
            <li>
              <strong>Gender Chips:</strong> Use <code>info</code> for MD, <code>secondary</code> for WD,{' '}
              <code>success</code> for XD
            </li>
            <li>
              <strong>Team Names:</strong> Use <code>variant="body1"</code> or <code>"h6"</code> with{' '}
              <code>fontWeight=600</code>
            </li>
            <li>
              <strong>Winner Highlighting:</strong> Use <code>bgcolor="success.light"</code> with{' '}
              <code>fontWeight=600</code>
            </li>
            <li>
              <strong>Spacing:</strong> Default gap of <code>spacing(2)</code> (16px) between form elements
            </li>
            <li>
              <strong>Hover States:</strong> Use <code>transform: scale(1.02)</code> with <code>boxShadow: 4</code>
            </li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
}
