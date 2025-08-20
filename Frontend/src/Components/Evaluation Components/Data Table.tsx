import React from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowKey: (item: T) => string | number;
  actions?: (item: T) => React.ReactNode;
  selectable?: boolean;
  loading?: boolean;
}

function DataTable<T>({
  data,
  columns,
  getRowKey,
  actions,
  selectable = false,
  loading,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto text-white shadow-xl">
      <table className="table text-lg">
        <thead className="sticky top-0 z-1 bg-gradient-to-r from-[#1c402a] to-[#1b2e3e] text-xl font-bold text-white">
          <tr>
            {selectable && (
              <th>
                <input type="checkbox" className="checkbox" />
              </th>
            )}
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`w-[100%] ${col.className}`}
              >
                {col.header}
              </th>
            ))}
            {actions && <th></th>}
          </tr>
        </thead>
        <tbody className="bg-black/20">
          {loading ? (
            // Show 3 skeleton rows
            [...Array(3)].map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                {selectable && (
                  <td>
                    <div className="skeleton h-8 w-5"></div>
                  </td>
                )}
                {columns.map((_, colIndex) => (
                  <td key={colIndex}>
                    <div className="skeleton py-6 h-8 w-full"></div>
                  </td>
                ))}
                {actions && (
                  <td>
                    <div className="skeleton h-6 w-12"></div>
                  </td>
                )}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="text-center py-8 text-gray-400">
                No data available.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={getRowKey(item)}
                className="transition-colors duration-500 hover:bg-gradient-to-r from-[#1c402a]/40 to-[#1b2e3e]/40"
              >
                {selectable && (
                  <td>
                    <input type="checkbox" className="checkbox" />
                  </td>
                )}
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {typeof col.accessor === "function"
                      ? col.accessor(item)
                      : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
                {actions && (
                  <td className="text-sm text-gray-300">
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
