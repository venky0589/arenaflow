import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { Box, LinearProgress } from '@mui/material'

interface CrudTableProps {
  rows: any[]
  columns: GridColDef[]
  onRowClick?: (row: any) => void
  loading?: boolean
  // Server-side pagination props
  paginationMode?: 'client' | 'server'
  rowCount?: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  // Checkbox selection props
  checkboxSelection?: boolean
  rowSelectionModel?: number[]
  onRowSelectionModelChange?: (newSelection: number[]) => void
}

export function CrudTable({
  rows,
  columns,
  onRowClick,
  loading = false,
  paginationMode = 'client',
  rowCount = 0,
  page = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  checkboxSelection = false,
  rowSelectionModel = [],
  onRowSelectionModelChange
}: CrudTableProps) {
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (model.page !== page && onPageChange) {
      onPageChange(model.page)
    }
    if (model.pageSize !== pageSize && onPageSizeChange) {
      onPageSizeChange(model.pageSize)
    }
  }

  return (
    <Box sx={{ height: 520, width: '100%' }}>
      {loading && <LinearProgress />}
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[10, 20, 50, 100]}
        paginationMode={paginationMode}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
        rowCount={paginationMode === 'server' ? rowCount : rows.length}
        onRowDoubleClick={(p) => onRowClick && onRowClick(p.row)}
        getRowId={(r) => r.id}
        loading={loading}
        checkboxSelection={checkboxSelection}
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(newSelection) => onRowSelectionModelChange && onRowSelectionModelChange(newSelection as number[])}
        sx={{ minHeight: 400 }}
      />
    </Box>
  )
}
