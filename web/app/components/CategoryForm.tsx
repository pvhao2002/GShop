'use client';

import {useState} from 'react';
import './CategoryForm.css';
import apiClient from "@/api/apiClient";
import {API_ENDPOINTS} from "@/constants/api";

export default function CategoryForm({ category, onSuccess, onCancel }: any) {
    const [name, setName] = useState(category?.name || '');
    const [description, setDescription] = useState(category?.description || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (category) {
                await apiClient.put(`${API_ENDPOINTS.CATEGORIES.ADMIN}/${category.id}`, { name, description });
            } else {
                await apiClient.post(API_ENDPOINTS.CATEGORIES.ADMIN, { name, description });
            }
            onSuccess();
        } catch (err) {
            console.error('Error saving category:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="category-form" onSubmit={handleSubmit}>
            <div>
                <label>Name</label>
                <input
                    type="text"
                    placeholder="Category name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Description</label>
                <textarea
                    placeholder="Short description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="actions">
                <button type="button" className="cancel-btn" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? 'Saving...' : category ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
}
