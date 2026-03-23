import EmptyState from "./EmptyState";

const DataTable = ({ columns, rows, emptyTitle = "No records found" }) => {
  if (!rows?.length) return <EmptyState title={emptyTitle} />;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={row.id || row.key}>
              {columns.map((column) => (
                <td
                  key={`${row.id || row.key}-${column.key}`}
                  className="px-4 py-3 align-top text-sm text-slate-700"
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
