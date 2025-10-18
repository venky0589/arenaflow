import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Box, LinearProgress } from '@mui/material'

interface CrudTableProps {
  rows: any[]
  columns: GridColDef[]
  onRowClick?: (row: any) => void
  loading?: boolean
}

export function CrudTable({ rows, columns, onRowClick, loading = false }: CrudTableProps) {
  return (
    <Box sx={{ height: 520, width: '100%' }}>
      {loading && <LinearProgress />}
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        onRowDoubleClick={(p) => onRowClick && onRowClick(p.row)}
        getRowId={(r) => r.id}
        loading={loading}
        sx={{ minHeight: 400 }}
      />
    </Box>
  )
}
