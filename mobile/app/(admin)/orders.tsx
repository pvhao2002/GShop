import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminOrderList } from '@/components/admin/AdminOrderList';

export default function AdminOrders() {
    return (
        <AdminLayout title="Order Management">
            <AdminOrderList />
        </AdminLayout>
    );
}