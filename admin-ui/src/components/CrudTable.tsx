import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Box } from '@mui/material'

export function CrudTable({ rows, columns, onRowClick }:{ rows:any[], columns:GridColDef[], onRowClick?:(row:any)=>void }) {
  return (
    <Box sx={{ height: 520, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5,10,25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        onRowDoubleClick={(p)=> onRowClick && onRowClick(p.row)}
        getRowId={(r)=> r.id}
      />
    </Box>
  )
}
