import React, { useState } from 'react';

import {
  TableContainer,
  Table,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
  TablePagination,
  TableCellProps,
} from '@mui/material';

import { get } from '@/utils/common';

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
}

const CustomTable = <T extends Record<string, T>>(
  props: CustomTableProps<T>,
): React.ReactElement<CustomTableProps<T>> => {
  const { columns, rows = [], page = 10, count } = props;
  const totalCount = count ?? rows.length;
  const [currPage, setNewPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(page);

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

  const renderRows = () => {
    const startIndex = currPage * rowsPerPage;
    const rowsToDisplay = rows.slice(startIndex, startIndex + rowsPerPage);
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
