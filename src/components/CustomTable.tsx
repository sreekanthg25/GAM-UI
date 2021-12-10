import React, { useState } from 'react';

import { TableContainer, Table, TableCell, TableRow, TableHead, TableBody, TablePagination } from '@mui/material';

import { get } from '@/utils/common';

interface columnProps {
  label: string;
  field: string;
  renderer?: <T extends Record<string, T>>(row: Record<string, T>) => React.ReactNode | string | undefined;
}

interface CustomTableProps<T> {
  columns: columnProps[];
  rows: Record<string | number, T>[];
  page?: number;
  count?: number;
}

const CustomTable = <T extends Record<string, T>>(
  props: CustomTableProps<T>,
): React.ReactElement<CustomTableProps<T>> => {
  const { columns, rows = [], page = 10, count } = props;
  const totalCount = count ?? rows.length;
  const [currPage, setNewPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(page);

  const renderHeaderCells = () => {
    return columns.map(({ label }) => <TableCell key={label}> {label}</TableCell>);
  };

  const handleChangePage = (_: unknown, newValue: number) => {
    setNewPage(newValue);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const renderRows = () => {
    const startIndex = currPage * rowsPerPage;
    const rowsToDisplay = rows.slice(startIndex, startIndex + rowsPerPage);
    return rowsToDisplay.map((row, index) => (
      <TableRow key={row.id ? `${row.id}` : index}>
        {columns.map(({ field }) => {
          const value = get(row, field);
          return <TableCell key={field}>{value}</TableCell>;
        })}
      </TableRow>
    ));
  };

  const renderPagination = () => {
    return (
      <TablePagination
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
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
    <TableContainer>
      {renderPagination()}
      <Table>
        <TableHead>
          <TableRow>{renderHeaderCells()}</TableRow>
        </TableHead>
        <TableBody>{renderRows()}</TableBody>
      </Table>
      {renderPagination()}
    </TableContainer>
  );
};

export default CustomTable;
