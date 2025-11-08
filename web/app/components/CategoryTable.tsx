'use client';
import {useState, useEffect} from 'react';
import apiClient from '@/api/apiClient';
import {API_ENDPOINTS} from '@/constants/api';
import Modal from './Modal';
import CategoryForm from './CategoryForm';
import './CategoryTable.css';

export default function CategoryTable() {
    const [categories, setCategories] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const loadCategories = async () => {
        const res = await apiClient.get(API_ENDPOINTS.CATEGORIES.BASE);
        setCategories(res.data);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        await apiClient.delete(`${API_ENDPOINTS.CATEGORIES.ADMIN}/${id}`);
        await loadCategories();
    };

    const handleSuccess = async () => {
        setOpenModal(false);
        setEditItem(null);
        await loadCategories();
    };

    useEffect(() => {
        loadCategories().then();
    }, []);

    return (
        <div className="category-table-container">
            <div className="toolbar">
                <h2>Category Management</h2>
                <button onClick={() => setOpenModal(true)}>+ Add Category</button>
            </div>

            <table className="category-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Products</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {categories.map((cat) => (
                    <tr key={cat.id}>
                        <td>{cat.id}</td>
                        <td>{cat.name}</td>
                        <td>{cat.description || '-'}</td>
                        <td>{cat.productCount ?? 0}</td>
                        <td>
                            <button className="edit-btn" onClick={() => {
                                setEditItem(cat);
                                setOpenModal(true);
                            }}>Edit
                            </button>
                            <button className="delete-btn" onClick={() => handleDelete(cat.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <Modal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setEditItem(null);
                }}
                title={editItem ? 'Edit Category' : 'Add Category'}
            >
                <CategoryForm category={editItem} onSuccess={handleSuccess} onCancel={() => setOpenModal(false)}/>
            </Modal>
        </div>
    );
}
