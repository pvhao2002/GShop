interface Props {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

export default function AdminCard({ title, value, icon }: Props) {
    return (
        <div className="admin-card">
            <div className="icon">{icon}</div>
            <div className="content">
                <p>{title}</p>
                <h2>{value}</h2>
            </div>
        </div>
    );
}
