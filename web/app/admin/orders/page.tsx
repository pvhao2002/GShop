"use client";

import React, {useEffect, useState, useCallback} from "react";
import {
    Table,
    Tag,
    Space,
    Button,
    message,
    Spin,
    Pagination,
    Card,
    Popconfirm,
} from "antd";
import type {ColumnsType} from "antd/es/table";
import type {Dayjs} from "dayjs";
import dayjs from "dayjs";
import apiClient from "@/api/apiClient";
import {API_ENDPOINTS} from "@/constants/api";

interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}

interface OrderResponse {
    id: number;
    userName: string;
    userEmail: string;
    phone: string;
    shippingAddress: Address;
    paymentMethod: string;
    status: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    itemCount: number;
    createdAt: string;
    updatedAt: string;
}

interface PagedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
}

export default function OrderPage() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [total, setTotal] = useState(0);

    /** 🌀 Fetch orders */
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get<PagedResponse<OrderResponse>>(
                API_ENDPOINTS.ORDERS.BASE,
                {params: {page, size}}
            );
            const data = res.data;
            setOrders(data.content ?? []);
            setTotal(data.totalElements ?? 0);
        } catch (err: unknown) {
            if (err instanceof Error) message.error(err.message);
            else message.error("Error loading orders");
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    /** 🎨 Status color */
    const getStatusColor = (status: string): string => {
        switch (status) {
            case "DELIVERED":
                return "green";
            case "PROCESSING":
                return "blue";
            case "SHIPPED":
                return "cyan";
            case "CANCELLED":
                return "red";
            case "PENDING":
            default:
                return "orange";
        }
    };

    /** 🔁 Update order status */
    const updateOrderStatus = async (id: number, status: string) => {
        try {
            setLoading(true);
            await apiClient.put(`${API_ENDPOINTS.ORDERS.BASE}/${id}/status`, {
                status,
            });
            message.success(`✅ Updated order #${id} to ${status}`);
            fetchOrders();
        } catch (err: unknown) {
            if (err instanceof Error) message.error(err.message);
            else message.error("Failed to update order");
        } finally {
            setLoading(false);
        }
    };

    /** 📦 Table columns */
    const columns: ColumnsType<OrderResponse> = [
        {
            title: "Order ID",
            dataIndex: "id",
            key: "id",
            render: (id: number) => <b>#{id}</b>,
        },
        {
            title: "Customer",
            key: "userName",
            render: (_, record) => (
                <>
                    <div>
                        <b>{record.userName}</b>
                    </div>
                    <div style={{color: "#6b7280", fontSize: 12}}>
                        {record.userEmail}
                    </div>
                </>
            ),
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
            render: (v: string) => v || "—",
        },
        {
            title: "Address",
            key: "shippingAddress",
            render: (_, r) =>
                r.shippingAddress
                    ? `${r.shippingAddress.street}, ${r.shippingAddress.city}, ${r.shippingAddress.country}`
                    : "—",
        },
        {
            title: "Payment",
            dataIndex: "paymentMethod",
            key: "paymentMethod",
            render: (pm: string) => <Tag color="geekblue">{pm}</Tag>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (st: string) => <Tag color={getStatusColor(st)}>{st}</Tag>,
        },
        {
            title: "Total",
            dataIndex: "total",
            key: "total",
            render: (v: number) => `${Number(v).toLocaleString("vi-VN")} ₫`,
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (v: string) => dayjs(v).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, r) => {
                switch (r.status.toUpperCase()) {
                    case "PENDING":
                        return (
                            <Space>
                                <Button
                                    size="small"
                                    type="primary"
                                    onClick={() => updateOrderStatus(r.id, "PROCESSING")}
                                >
                                    Process
                                </Button>
                                <Popconfirm
                                    title="Cancel this order?"
                                    okText="Yes"
                                    cancelText="No"
                                    onConfirm={() => updateOrderStatus(r.id, "CANCELLED")}
                                >
                                    <Button size="small" danger>
                                        Cancel
                                    </Button>
                                </Popconfirm>
                            </Space>
                        );

                    case "PROCESSING":
                        return (
                            <Button
                                size="small"
                                type="primary"
                                onClick={() => updateOrderStatus(r.id, "SHIPPED")}
                            >
                                Ship
                            </Button>
                        );

                    case "SHIPPED":
                        return (
                            <Button
                                size="small"
                                type="primary"
                                onClick={() => updateOrderStatus(r.id, "DELIVERED")}
                            >
                                Complete
                            </Button>
                        );

                    default:
                        return null;
                }
            },
        },
    ];

    return (
        <Card
            style={{
                margin: 20,
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
            title={<h2 style={{margin: 0}}>📦 Order Management</h2>}
        >
            {loading ? (
                <div style={{textAlign: "center", padding: 40}}>
                    <Spin size="large"/>
                </div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="id"
                        pagination={false}
                        bordered
                    />

                    <div style={{textAlign: "right", marginTop: 16}}>
                        <Pagination
                            current={page + 1}
                            pageSize={size}
                            total={total}
                            onChange={(p, ps) => {
                                setPage(p - 1);
                                setSize(ps);
                            }}
                            showSizeChanger
                        />
                    </div>
                </>
            )}
        </Card>
    );
}
