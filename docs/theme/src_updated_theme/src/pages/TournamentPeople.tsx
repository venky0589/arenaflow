import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Chip
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import PersonIcon from '@mui/icons-material/Person'
import { TournamentRoleAssignment, TournamentRole } from '../types/tournamentRole'
import { tournamentRolesApi } from '../api/tournamentRoles'
import AddMemberDialog from '../components/AddMemberDialog'
import RoleChip from '../components/RoleChip'

export default function TournamentPeople() {
  const { tournamentId } = useParams<{ tournamentId: string }>()
  const [assignments, setAssignments] = useState<TournamentRoleAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [removeLoading, setRemoveLoading] = useState<number | null>(null)

  useEffect(() => {
    if (tournamentId) {
      loadAssignments()
    }
  }, [tournamentId])

  const loadAssignments = async () => {
    if (!tournamentId) return

    setLoading(true)
    setError('')
    try {
      const data = await tournamentRolesApi.getAll(Number(tournamentId))
      setAssignments(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load role assignments')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (assignmentId: number, userEmail: string, role: string) => {
    if (!tournamentId) return

    if (!confirm(`Remove ${role} role from ${userEmail}?`)) {
      return
    }

    setRemoveLoading(assignmentId)
    try {
      await tournamentRolesApi.remove(Number(tournamentId), assignmentId)
      await loadAssignments()
    } catch (err: any) {
      if (err.message?.includes('last OWNER')) {
        alert('Cannot remove the last OWNER from the tournament')
      } else {
        alert(err.message || 'Failed to remove role assignment')
      }
    } finally {
      setRemoveLoading(null)
    }
  }

  const groupByRole = (role: TournamentRole) =>
    assignments.filter(a => a.role === role)

  const renderRoleSection = (
    role: TournamentRole,
    title: string,
    description: string,
    removable: boolean = true
  ) => {
    const roleAssignments = groupByRole(role)

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {title}
                <Chip label={roleAssignments.length} size="small" sx={{ ml: 1 }} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Box>

          {roleAssignments.length === 0 ? (
            <Alert severity="info">No {title.toLowerCase()} assigned yet</Alert>
          ) : (
            <Stack spacing={1} divider={<Divider />}>
              {roleAssignments.map(assignment => (
                <Box
                  key={assignment.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon color="action" />
                    <Box>
                      <Typography variant="body1">
                        {assignment.userEmail}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        User ID: {assignment.userAccountId} •
                        Assigned by: {assignment.assignedByEmail} •
                        {new Date(assignment.assignedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RoleChip role={assignment.role} />
                    {removable && (
                      <IconButton
                        onClick={() => handleRemove(assignment.id, assignment.userEmail, assignment.role)}
                        color="error"
                        size="small"
                        disabled={removeLoading === assignment.id}
                      >
                        {removeLoading === assignment.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          )}

          {role === 'OWNER' && roleAssignments.length === 1 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This is the last OWNER. At least one OWNER must be assigned to the tournament.
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tournament People & Roles</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Member
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Role Hierarchy:</strong> OWNER can assign any role • ADMIN can assign STAFF/REFEREE •
          STAFF and REFEREE cannot assign roles
        </Typography>
      </Alert>

      {renderRoleSection(
        'OWNER',
        'Owners',
        'Full control over tournament, can assign any role',
        true
      )}

      {renderRoleSection(
        'ADMIN',
        'Admins',
        'Manage tournament operations, can assign STAFF and REFEREE',
        true
      )}

      {renderRoleSection(
        'STAFF',
        'Staff',
        'Check-in players and manage registrations',
        true
      )}

      {renderRoleSection(
        'REFEREE',
        'Referees',
        'Score matches and manage match status',
        true
      )}

      <AddMemberDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={loadAssignments}
        tournamentId={Number(tournamentId)}
      />
    </Box>
  )
}
