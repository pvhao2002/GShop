interface Column<T> {
    key: keyof T;
    label: string;
}

interface Props<T> {
    columns: Column<T>[];
    data: T[];
}
import './DataTable.css';

export default function DataTable<T>({ columns, data }: Props<T>) {
    return (
        <table className="data-table">
            <thead>
            <tr>
                {columns.map(col => (
                    <th key={String(col.key)}>{col.label}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.length === 0 ? (
                <tr><td colSpan={columns.length}>No data available</td></tr>
            ) : (
                data.map((row, i) => (
                    <tr key={i}>
                        {columns.map(col => (
                            <td key={String(col.key)}>{String(row[col.key])}</td>
                        ))}
                    </tr>
                ))
            )}
            </tbody>
        </table>
    );
}
