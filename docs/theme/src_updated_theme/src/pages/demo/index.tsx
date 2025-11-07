/**
 * Demo Components Navigation
 *
 * This page showcases Team/Doubles UX refinements as working React components.
 * Use these as reference implementations for production features.
 */

import { Box, Card, CardContent, CardActionArea, Typography, Grid, Chip, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GroupsIcon from '@mui/icons-material/Groups';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LabelIcon from '@mui/icons-material/Label';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PaletteIcon from '@mui/icons-material/Palette';

interface DemoCard {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  linesOfCode: number;
}

const demoCards: DemoCard[] = [
  {
    title: 'Team Registration',
    description: 'Create Team dialog with partner selection, validation states, and real-time name formatting',
    path: '/demo/team-registration',
    icon: <GroupsIcon fontSize="large" />,
    badge: 'Interactive Form',
    linesOfCode: 250,
  },
  {
    title: 'Registrations Grid',
    description: 'Enhanced DataGrid with category badges, filters, and tooltips for team names',
    path: '/demo/registrations-grid',
    icon: <ListAltIcon fontSize="large" />,
    badge: 'Data Display',
    linesOfCode: 300,
  },
  {
    title: 'Team Labels',
    description: 'Display name variants, truncation examples, and badge style showcase',
    path: '/demo/team-labels',
    icon: <LabelIcon fontSize="large" />,
    badge: 'Typography',
    linesOfCode: 200,
  },
  {
    title: 'Brackets View',
    description: 'Tournament bracket visualization with team labels and hover states',
    path: '/demo/brackets',
    icon: <AccountTreeIcon fontSize="large" />,
    badge: 'Visualization',
    linesOfCode: 350,
  },
  {
    title: 'Design Tokens',
    description: 'Color palette, typography scale, spacing system, and component state reference',
    path: '/demo/design-tokens',
    icon: <PaletteIcon fontSize="large" />,
    badge: 'Design System',
    linesOfCode: 200,
  },
];

export default function DemoHome() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Team/Doubles UX Demo Components
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Interactive showcase of Team/Doubles feature refinements. These are fully functional React
          components that can be copied into production code.
        </Typography>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="React 18" size="small" />
          <Chip label="Material-UI v5" size="small" />
          <Chip label="TypeScript" size="small" />
          <Chip label="Copy-Paste Ready" color="primary" size="small" />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {demoCards.map((demo) => (
          <Grid item xs={12} sm={6} md={4} key={demo.path}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(demo.path)}
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box
                      sx={{
                        color: 'primary.main',
                        backgroundColor: 'primary.light',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                      }}
                    >
                      {demo.icon}
                    </Box>
                    {demo.badge && (
                      <Chip label={demo.badge} size="small" color="secondary" variant="outlined" />
                    )}
                  </Box>

                  <Typography variant="h6" component="h2" gutterBottom fontWeight="600">
                    {demo.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {demo.description}
                  </Typography>

                  <Typography variant="caption" color="text.disabled">
                    ~{demo.linesOfCode} lines of code
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={6} p={3} bgcolor="grey.50" borderRadius={2}>
        <Typography variant="h6" gutterBottom>
          📋 Usage Notes
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>All components use mock data (no API calls)</li>
            <li>Design specifications included as code comments</li>
            <li>Components are self-contained and copy-paste ready</li>
            <li>MUI theme tokens used throughout for consistency</li>
            <li>Accessibility features included (ARIA labels, keyboard nav)</li>
          </ul>
        </Typography>
      </Box>

      <Box mt={3} p={2} bgcolor="info.light" borderRadius={2}>
        <Typography variant="body2" color="info.dark">
          <strong>Purpose:</strong> These demos serve as a working prototype and reference implementation.
          They showcase UX refinements for the Team/Doubles feature and can be integrated into production
          Admin UI pages.
        </Typography>
      </Box>
    </Container>
  );
}
