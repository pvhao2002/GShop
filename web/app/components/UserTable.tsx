'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/api/apiClient';
import { API_ENDPOINTS } from '@/constants/api';
import './UserTable.css';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string | { name: string };
    isActive?: boolean;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    totalOrders?: number;
    totalSpent?: number;
    lastOrderDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface PagedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export default function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const loadUsers = async (pageNum = 0) => {
        setLoading(true);
        try {
            const res = await apiClient.get(API_ENDPOINTS.USERS.BASE, {
                params: { page: pageNum, size, search: search || undefined },
            });
            const data: PagedResponse<User> = res.data;
            setUsers(data.content ?? []);
            setTotalPages(data.totalPages ?? 0);
            setPage(data.page ?? 0);
        } catch (err) {
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers(page);
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadUsers(0);
    };

    return (
        <div className="user-table-container">
            <div className="toolbar">
                <h2>User Management</h2>
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search by name, email, phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit">Search</button>
                </form>
            </div>

            {loading ? (
                <div className="loading">Loading users...</div>
            ) : (
                <>
                    <table className="user-table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Address</th>
                            <th>Total Orders</th>
                            <th>Total Spent (₫)</th>
                            <th>Last Order</th>
                            <th>Created At</th>
                            <th>Updated At</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={12} className="no-data">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((u, idx) => (
                                <tr key={u.id}>
                                    <td>{page * size + idx + 1}</td>
                                    <td>{`${u.firstName ?? ''} ${u.lastName ?? ''}`}</td>
                                    <td>{u.email}</td>
                                    <td>{u.phone || '—'}</td>
                                    <td>
                      <span
                          className={`role-badge ${String(u.role)
                              .toLowerCase()
                              .replace(/\W/g, '')}`}
                      >
                        {typeof u.role === 'string'
                            ? u.role
                            : u.role?.name ?? 'USER'}
                      </span>
                                    </td>
                                    <td>
                      <span
                          className={
                              u.isActive ? 'status-active' : 'status-inactive'
                          }
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                                    </td>
                                    <td>
                                        {[u.street, u.city, u.country]
                                            .filter(Boolean)
                                            .join(', ') || '—'}
                                    </td>
                                    <td>{u.totalOrders ?? 0}</td>
                                    <td>
                                        {u.totalSpent
                                            ? u.totalSpent.toLocaleString('vi-VN')
                                            : '—'}
                                    </td>
                                    <td>
                                        {u.lastOrderDate
                                            ? new Date(u.lastOrderDate).toLocaleDateString()
                                            : '—'}
                                    </td>
                                    <td>
                                        {u.createdAt
                                            ? new Date(u.createdAt).toLocaleDateString()
                                            : '—'}
                                    </td>
                                    <td>
                                        {u.updatedAt
                                            ? new Date(u.updatedAt).toLocaleDateString()
                                            : '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>

                    {/* ✅ Pagination */}
                    <div className="pagination">
                        <button
                            className="page-btn"
                            disabled={page <= 0}
                            onClick={() => setPage(page - 1)}
                        >
                            ← Prev
                        </button>
                        <span className="page-info">
              Page {page + 1} / {totalPages}
            </span>
                        <button
                            className="page-btn"
                            disabled={page + 1 >= totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
