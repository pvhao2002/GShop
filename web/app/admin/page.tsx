'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/api/apiClient';
import { API_ENDPOINTS } from '@/constants/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import './AdminDashboard.css';

interface TopProduct {
    productId: number;
    productName: string;
    totalRevenue: number;
    totalQuantitySold: number;
    orderCount: number;
}

interface MonthlyGrowth {
    month: string;
    orders: number;
    revenue: number;
    newCustomers: number;
}

interface DashboardResponse {
    totalCustomers: number;
    totalProducts: number;
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalCategories: number;
    pendingOrders: number;

    recentOrders: number;
    newCustomers: number;
    newProducts: number;
    recentPendingOrders: number;

    productsInStock: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    totalInventoryUnits: number;

    customersWithOrders: number;
    averageOrdersPerCustomer: number;
    averageSpentPerCustomer: number;

    topProducts: TopProduct[];
    monthlyGrowth: MonthlyGrowth[];

    generatedAt: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD);
                setStats(res.data);
            } catch (err) {
                console.error('Error loading dashboard metrics:', err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading || !stats) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Admin Dashboard</h2>
            <p className="dashboard-sub">
                Overview of business performance — updated at{' '}
                {new Date(stats.generatedAt).toLocaleString()}
            </p>

            {/* ===== KPI SECTION ===== */}
            <div className="dashboard-grid">
                <div className="card revenue">
                    <h3>Total Revenue</h3>
                    <p className="value">
                        {stats.totalRevenue?.toLocaleString('vi-VN')} ₫
                    </p>
                </div>
                <div className="card">
                    <h3>Total Orders</h3>
                    <p className="value">{stats.totalOrders}</p>
                </div>
                <div className="card">
                    <h3>Completed Orders</h3>
                    <p className="value">{stats.completedOrders}</p>
                </div>
                <div className="card">
                    <h3>Pending Orders</h3>
                    <p className="value">{stats.pendingOrders}</p>
                </div>
                <div className="card">
                    <h3>Total Customers</h3>
                    <p className="value">{stats.totalCustomers}</p>
                </div>
                <div className="card">
                    <h3>Products in Stock</h3>
                    <p className="value">{stats.productsInStock}</p>
                </div>
            </div>

            {/* ===== CHART SECTION ===== */}
            <div className="chart-container">
                <h3>📊 Monthly Growth</h3>
                {stats.monthlyGrowth?.length ? (
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={stats.monthlyGrowth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                                formatter={(value: number) =>
                                    value.toLocaleString('vi-VN') + ' ₫'
                                }
                            />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue (₫)" fill="#3b82f6" />
                            <Bar dataKey="orders" name="Orders" fill="#22c55e" />
                            <Bar dataKey="newCustomers" name="New Customers" fill="#0ea5e9" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="no-data">No growth data available.</p>
                )}
            </div>

            {/* ===== TOP PRODUCTS ===== */}
            <div className="top-products">
                <h3>🔥 Top Selling Products</h3>
                <table>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Revenue (₫)</th>
                        <th>Quantity Sold</th>
                        <th>Order Count</th>
                    </tr>
                    </thead>
                    <tbody>
                    {stats.topProducts?.length ? (
                        stats.topProducts.map((p, idx) => (
                            <tr key={p.productId}>
                                <td>{idx + 1}</td>
                                <td>{p.productName}</td>
                                <td>{p.totalRevenue.toLocaleString('vi-VN')}</td>
                                <td>{p.totalQuantitySold}</td>
                                <td>{p.orderCount}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="no-data">
                                No top product data found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
