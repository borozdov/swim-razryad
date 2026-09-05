import type { ReactNode } from 'react';
import s from './Table.module.css';

export type TableProps = {
  columns: readonly ReactNode[];
  rows: readonly (readonly ReactNode[])[];
  /** Indices of columns that hold numbers: monospace, tabular digits, aligned right. */
  numericColumns: readonly number[];
  /** Tighter cells and a smaller face, for a table that has to fit a phone screen whole. */
  compact?: boolean;
};

export function Table({ columns, rows, numericColumns, compact = false }: TableProps) {
  const numeric = new Set(numericColumns);
  const cellClass = (index: number) => (numeric.has(index) ? s.numeric : undefined);
  return (
    <div className={s.wrap}>
      <table className={compact ? `${s.table} ${s.compact}` : s.table}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} scope="col" className={cellClass(index)}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, index) => (
                <td key={index} className={cellClass(index)}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
