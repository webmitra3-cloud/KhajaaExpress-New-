const DataTable = ({ columns, rows }) => {
  return (
    <div className="table-wrapper card">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row._id || row.id || index}>
              {columns.map((column) => (
                <td key={column.header}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
