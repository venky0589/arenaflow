/**
 * Team Registration Demo
 *
 * Showcases the Create Team dialog with:
 * - Dual partner selection (Autocomplete)
 * - Real-time team name formatting
 * - Gender validation states
 * - Duplicate prevention UI
 * - Error handling patterns
 */

import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Typography,
  Alert,
  Chip,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
}

// Mock player data
const mockPlayers: Player[] = [
  { id: 1, firstName: 'Satwiksairaj', lastName: 'Rankireddy', gender: 'M' },
  { id: 2, firstName: 'Chirag', lastName: 'Shetty', gender: 'M' },
  { id: 3, firstName: 'Saina', lastName: 'Nehwal', gender: 'F' },
  { id: 4, firstName: 'PV', lastName: 'Sindhu', gender: 'F' },
  { id: 5, firstName: 'Ashwini', lastName: 'Ponnappa', gender: 'F' },
  { id: 6, firstName: 'Kidambi', lastName: 'Srikanth', gender: 'M' },
];

type ValidationState = 'idle' | 'success' | 'gender_mismatch' | 'duplicate' | 'same_player';

export default function TeamRegistrationDemo() {
  const [open, setOpen] = useState(false);
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [categoryType, setCategoryType] = useState<'MD' | 'WD' | 'XD'>('MD');

  // Real-time team name formatter
  const getTeamDisplayName = () => {
    if (!player1 || !player2) return 'Select both partners';
    return `${player1.lastName} / ${player2.lastName}`;
  };

  // Validation logic (simulates backend rules)
  const validateTeam = () => {
    if (!player1 || !player2) {
      setValidationState('idle');
      return;
    }

    // Same player check
    if (player1.id === player2.id) {
      setValidationState('same_player');
      return;
    }

    // Gender validation based on category
    const bothMale = player1.gender === 'M' && player2.gender === 'M';
    const bothFemale = player1.gender === 'F' && player2.gender === 'F';
    const mixed = player1.gender !== player2.gender;

    if (categoryType === 'MD' && !bothMale) {
      setValidationState('gender_mismatch');
      return;
    }
    if (categoryType === 'WD' && !bothFemale) {
      setValidationState('gender_mismatch');
      return;
    }
    if (categoryType === 'XD' && !mixed) {
      setValidationState('gender_mismatch');
      return;
    }

    // Simulate duplicate check (Rankireddy + Shetty already exists)
    if (
      (player1.id === 1 && player2.id === 2) ||
      (player1.id === 2 && player2.id === 1)
    ) {
      setValidationState('duplicate');
      return;
    }

    setValidationState('success');
  };

  // Trigger validation on any change
  const handlePlayer1Change = (newPlayer: Player | null) => {
    setPlayer1(newPlayer);
    setTimeout(validateTeam, 100);
  };

  const handlePlayer2Change = (newPlayer: Player | null) => {
    setPlayer2(newPlayer);
    setTimeout(validateTeam, 100);
  };

  const handleCategoryChange = (newCategory: 'MD' | 'WD' | 'XD') => {
    setCategoryType(newCategory);
    setTimeout(validateTeam, 100);
  };

  const handleSubmit = () => {
    if (validationState === 'success') {
      alert(`Team created: ${getTeamDisplayName()}`);
      handleClose();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPlayer1(null);
    setPlayer2(null);
    setValidationState('idle');
  };

  // Validation alert component
  const ValidationAlert = () => {
    if (validationState === 'idle') return null;

    const alerts = {
      success: {
        severity: 'success' as const,
        icon: <CheckCircleIcon />,
        message: `Team is valid! Display name: "${getTeamDisplayName()}"`,
      },
      gender_mismatch: {
        severity: 'error' as const,
        icon: <ErrorIcon />,
        message: `Gender mismatch for ${categoryType}. ${
          categoryType === 'MD'
            ? 'Both players must be male.'
            : categoryType === 'WD'
            ? 'Both players must be female.'
            : 'Players must be one male and one female.'
        } Got: ${player1?.firstName} (${player1?.gender}), ${player2?.firstName} (${player2?.gender})`,
      },
      duplicate: {
        severity: 'warning' as const,
        icon: <ErrorIcon />,
        message: `This team already exists in the database (canonical order prevents duplicates)`,
      },
      same_player: {
        severity: 'error' as const,
        icon: <ErrorIcon />,
        message: `Cannot create team with same player twice`,
      },
    };

    const alert = alerts[validationState];
    return (
      <Alert severity={alert.severity} icon={alert.icon} sx={{ mt: 2 }}>
        {alert.message}
      </Alert>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Team Registration Demo
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Interactive Create Team dialog showcasing validation states and real-time feedback.
      </Typography>

      <Button
        variant="contained"
        startIcon={<GroupAddIcon />}
        onClick={() => setOpen(true)}
        size="large"
      >
        Create Team
      </Button>

      {/* Create Team Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create Doubles Team</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {/* Category Type Selector */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Category Type
              </Typography>
              <Box display="flex" gap={1}>
                {(['MD', 'WD', 'XD'] as const).map((cat) => (
                  <Chip
                    key={cat}
                    label={cat === 'MD' ? "Men's Doubles" : cat === 'WD' ? "Women's Doubles" : 'Mixed Doubles'}
                    color={categoryType === cat ? 'primary' : 'default'}
                    onClick={() => handleCategoryChange(cat)}
                    clickable
                  />
                ))}
              </Box>
            </Box>

            {/* Player 1 Selection */}
            <Autocomplete
              options={mockPlayers}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.gender})`}
              value={player1}
              onChange={(_, newValue) => handlePlayer1Change(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Player 1"
                  placeholder="Search by name..."
                  required
                  margin="normal"
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <span>
                      {option.firstName} {option.lastName}
                    </span>
                    <Chip label={option.gender} size="small" color={option.gender === 'M' ? 'info' : 'secondary'} />
                  </Box>
                </li>
              )}
            />

            {/* Player 2 Selection */}
            <Autocomplete
              options={mockPlayers}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.gender})`}
              value={player2}
              onChange={(_, newValue) => handlePlayer2Change(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Player 2"
                  placeholder="Search by name..."
                  required
                  margin="normal"
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <span>
                      {option.firstName} {option.lastName}
                    </span>
                    <Chip label={option.gender} size="small" color={option.gender === 'M' ? 'info' : 'secondary'} />
                  </Box>
                </li>
              )}
            />

            {/* Real-time Team Name Preview */}
            <Paper sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="caption" color="text.secondary">
                Team Display Name:
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {getTeamDisplayName()}
              </Typography>
            </Paper>

            {/* Validation Feedback */}
            <ValidationAlert />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={validationState !== 'success'}
          >
            Create Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Documentation Section */}
      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" gutterBottom>
        Implementation Notes
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="600">
              Key Features
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              <li>Dual Autocomplete with searchable player list</li>
              <li>Real-time team name formatting (LastName1 / LastName2)</li>
              <li>Gender validation based on category type</li>
              <li>Duplicate team prevention (canonical ordering)</li>
              <li>Same player validation</li>
              <li>Submit button disabled until valid</li>
            </ul>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="600">
              Validation Rules
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              <li>
                <strong>MD (Men's Doubles):</strong> Both players must be male
              </li>
              <li>
                <strong>WD (Women's Doubles):</strong> Both players must be female
              </li>
              <li>
                <strong>XD (Mixed Doubles):</strong> One male, one female
              </li>
              <li>Backend enforces canonical order (player1_id &lt; player2_id)</li>
              <li>Duplicate check: A+B = B+A (same team)</li>
            </ul>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
