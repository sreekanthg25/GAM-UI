import React, { useState, useEffect } from 'react';

import {
  TableContainer,
  Table,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
  TablePagination,
  TableCellProps,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Paper,
  Typography,
} from '@mui/material';

import { Search as SearchIcon, Refresh as RefreshIcon, TextSnippetOutlined } from '@mui/icons-material';

import { get } from '@/utils/common';
import { useDebounce } from '@/hooks';

type ColumnProps = {
  label: string;
  field?: string;
  renderer?: (row: Record<string, unknown> | string | undefined) => React.ReactNode | string | undefined;
  cellProps?: TableCellProps;
};

interface CustomTableProps<T> {
  columns: ColumnProps[];
  rows: Record<string | number, T>[];
  page?: number;
  count?: number;
  searchFields?: string[];
  onRefreshTable?: () => void;
}

const CustomTable = <T extends Record<string, T>>(
  props: CustomTableProps<T>,
): React.ReactElement<CustomTableProps<T>> => {
  const { columns, rows = [], page = 10, onRefreshTable } = props;
  const [currPage, setNewPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(page);
  const [currentRows, setRows] = useState<CustomTableProps<T>['rows']>([]);
  const totalCount = currentRows.length;
  const [searchString, setSearchFilter] = useState('');

  useEffect(() => {
    const filteredRows = rows.filter((row) => {
      const value = get(row, columns?.[0]?.field ?? 'name') as string;
      return value ? value.toLowerCase().includes(searchString.toLowerCase()) : false;
    });
    setRows(filteredRows);
    setNewPage(0);
  }, [searchString, rows, columns]);

  const renderHeaderCells = () => {
    return columns.map(({ label, cellProps }) => (
      <TableCell {...cellProps} key={label}>
        {label}
      </TableCell>
    ));
  };

  const handleChangePage = (_: unknown, newValue: number) => {
    setNewPage(newValue);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const filterRows = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  const searchTable = useDebounce(filterRows);

  const renderRows = () => {
    const startIndex = currPage * rowsPerPage;
    const rowsToDisplay = currentRows.slice(startIndex, startIndex + rowsPerPage);
    return rowsToDisplay.map((row, index) => (
      <TableRow key={row.id ? `${row.id}` : index}>
        {columns.map(({ field, renderer, label, cellProps }) => {
          let node: React.ReactNode | Record<string, T> | undefined = field ? get(row, field) : row;
          if (renderer) {
            node = renderer(node);
          }
          return (
            <TableCell {...cellProps} key={label}>
              {node}
            </TableCell>
          );
        })}
      </TableRow>
    ));
  };

  const renderNoData = () => (
    <Paper
      sx={{ display: 'flex', justifyContent: 'center', py: 8, flexDirection: 'column', alignItems: 'center' }}
      variant="outlined"
    >
      <TextSnippetOutlined sx={{ fontSize: 40 }} />
      <Typography variant="body1">No data available</Typography>
    </Paper>
  );

  const renderPagination = () => {
    return (
      <TablePagination
        rowsPerPageOptions={[5, 10, 15, 20, 25, 50, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={currPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    );
  };

  return (
    <Box>
      <Grid container>
        <Grid item xs={6}>
          <TextField
            fullWidth
            type="search"
            variant="standard"
            placeholder="search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={searchTable}
          />
        </Grid>
        {onRefreshTable && (
          <Grid item xs={2}>
            <IconButton onClick={onRefreshTable}>
              <RefreshIcon />
            </IconButton>
          </Grid>
        )}
      </Grid>
      <TableContainer>
        {renderPagination()}
        <Table>
          <TableHead>
            <TableRow>{renderHeaderCells()}</TableRow>
          </TableHead>
          <TableBody>{renderRows()}</TableBody>
        </Table>
        {!currentRows.length && renderNoData()}
        {renderPagination()}
      </TableContainer>
    </Box>
  );
};

export default CustomTable;
