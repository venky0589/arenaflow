/**
 * Registrations Grid Demo
 *
 * Showcases enhanced DataGrid with:
 * - Category badges (S/D with color coding)
 * - Team name truncation with tooltips
 * - Category filters
 * - Empty states
 * - Responsive design
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Paper,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

type CategoryType = 'SINGLES' | 'DOUBLES';

interface Registration {
  id: number;
  participantName: string;
  categoryType: CategoryType;
  categoryName: string;
  checkedIn: boolean;
  scheduledTime: string;
}

// Mock registration data
const mockRegistrations: Registration[] = [
  {
    id: 1,
    participantName: 'Saina Nehwal',
    categoryType: 'SINGLES',
    categoryName: "Women's Singles U19",
    checkedIn: true,
    scheduledTime: '2025-11-06T10:00:00',
  },
  {
    id: 2,
    participantName: 'Rankireddy / Shetty',
    categoryType: 'DOUBLES',
    categoryName: "Men's Doubles Open",
    checkedIn: false,
    scheduledTime: '2025-11-06T11:30:00',
  },
  {
    id: 3,
    participantName: 'PV Sindhu',
    categoryType: 'SINGLES',
    categoryName: "Women's Singles Open",
    checkedIn: true,
    scheduledTime: '2025-11-06T09:00:00',
  },
  {
    id: 4,
    participantName: 'Nehwal / Ponnappa',
    categoryType: 'DOUBLES',
    categoryName: "Women's Doubles U19",
    checkedIn: false,
    scheduledTime: '2025-11-06T14:00:00',
  },
  {
    id: 5,
    participantName: 'Kidambi Srikanth',
    categoryType: 'SINGLES',
    categoryName: "Men's Singles Open",
    checkedIn: true,
    scheduledTime: '2025-11-06T10:30:00',
  },
  {
    id: 6,
    participantName: 'Satwiksairaj Rankireddy / Ashwini Ponnappa',
    categoryType: 'DOUBLES',
    categoryName: 'Mixed Doubles Open',
    checkedIn: false,
    scheduledTime: '2025-11-06T15:00:00',
  },
];

export default function RegistrationsGridDemo() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryType | 'ALL'>('ALL');

  // Filter registrations based on category
  const filteredRegistrations =
    categoryFilter === 'ALL'
      ? mockRegistrations
      : mockRegistrations.filter((r) => r.categoryType === categoryFilter);

  // Category Badge Component (UX Refinement #2)
  const CategoryBadge = ({ type }: { type: CategoryType }) => {
    const config = {
      SINGLES: { label: 'S', color: 'primary' as const, tooltip: 'Singles' },
      DOUBLES: { label: 'D', color: 'success' as const, tooltip: 'Doubles' },
    };

    const { label, color, tooltip } = config[type];

    return (
      <Tooltip title={tooltip} arrow>
        <Chip
          label={label}
          size="small"
          color={color}
          sx={{
            fontWeight: 600,
            minWidth: 32,
            height: 24,
          }}
        />
      </Tooltip>
    );
  };

  // Truncated Name with Tooltip Component (UX Refinement #7)
  const TruncatedName = ({ name, maxLength = 30 }: { name: string; maxLength?: number }) => {
    const truncated = name.length > maxLength ? `${name.substring(0, maxLength - 3)}...` : name;
    const isTruncated = name.length > maxLength;

    return isTruncated ? (
      <Tooltip title={name} arrow placement="top">
        <Typography
          variant="body2"
          sx={{
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {truncated}
        </Typography>
      </Tooltip>
    ) : (
      <Typography variant="body2">{name}</Typography>
    );
  };

  // DataGrid columns with UX refinements
  const columns: GridColDef[] = [
    {
      field: 'categoryType',
      headerName: 'Type',
      width: 80,
      renderCell: (params: GridRenderCellParams<Registration>) => (
        <CategoryBadge type={params.row.categoryType} />
      ),
    },
    {
      field: 'participantName',
      headerName: 'Participant',
      width: 250,
      renderCell: (params: GridRenderCellParams<Registration>) => (
        <TruncatedName name={params.row.participantName} maxLength={30} />
      ),
    },
    {
      field: 'categoryName',
      headerName: 'Category',
      width: 200,
    },
    {
      field: 'checkedIn',
      headerName: 'Check-In',
      width: 120,
      renderCell: (params: GridRenderCellParams<Registration>) => (
        <Chip
          label={params.row.checkedIn ? 'Checked In' : 'Pending'}
          size="small"
          color={params.row.checkedIn ? 'success' : 'default'}
          variant={params.row.checkedIn ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'scheduledTime',
      headerName: 'Scheduled Time',
      width: 180,
      valueFormatter: (params) => {
        const date = new Date(params);
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Registrations Grid Demo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enhanced DataGrid with category badges, truncation, and filters
          </Typography>
        </Box>

        {/* Category Filter (UX Refinement) */}
        <ToggleButtonGroup
          value={categoryFilter}
          exclusive
          onChange={(_, newValue) => newValue && setCategoryFilter(newValue)}
          size="small"
        >
          <ToggleButton value="ALL">All</ToggleButton>
          <ToggleButton value="SINGLES">
            <Box display="flex" alignItems="center" gap={0.5}>
              <Chip label="S" size="small" color="primary" />
              Singles
            </Box>
          </ToggleButton>
          <ToggleButton value="DOUBLES">
            <Box display="flex" alignItems="center" gap={0.5}>
              <Chip label="D" size="small" color="success" />
              Doubles
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* DataGrid */}
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filteredRegistrations}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          slots={{
            noRowsOverlay: () => (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="100%"
                gap={2}
              >
                <SportsTennisIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                <Typography variant="h6" color="text.secondary">
                  No registrations found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  {categoryFilter !== 'ALL'
                    ? `No ${categoryFilter.toLowerCase()} registrations to display`
                    : 'Register players and teams using the form above'}
                </Typography>
              </Box>
            ),
          }}
        />
      </Paper>

      {/* Implementation Notes */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          UX Refinements Demonstrated
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              1. Category Badges (Color-Coded)
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Chip label="S" size="small" color="primary" />
                <Typography variant="body2">Singles (Blue)</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip label="D" size="small" color="success" />
                <Typography variant="body2">Doubles (Green)</Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Allows quick visual scanning of registration type without reading text
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              2. Name Truncation with Tooltips
            </Typography>
            <Typography variant="body2" paragraph>
              Long team names (e.g., "Satwiksairaj Rankireddy / Ashwini Ponnappa") are truncated to
              prevent horizontal scrolling. Hover to see full name in tooltip.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Implementation: maxLength=30, ellipsis after 27 characters
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              3. Category Filters
            </Typography>
            <Typography variant="body2">
              Toggle between All/Singles/Doubles to focus on specific registration types. Useful for
              tournament organizers managing large registrations.
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              4. Empty State with Guidance
            </Typography>
            <Typography variant="body2">
              When no rows match the filter, display informative message with icon instead of blank
              table. Try filtering to "Singles" after clearing data to see this.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
