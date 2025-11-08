'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/api/apiClient';
import { API_ENDPOINTS } from '@/constants/api';
import './ProductForm.css';

interface Product {
    id?: number;
    name: string;
    price: number;
    description?: string;
    categoryId?: number;
    images?: string[]; // ✅ list ảnh
    isActive?: boolean;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    product?: Product | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: Props) {
    const [name, setName] = useState(product?.name || '');
    const [price, setPrice] = useState(product?.price || 0);
    const [description, setDescription] = useState(product?.description || '');
    const [categoryId, setCategoryId] = useState<number | undefined>(
        product?.categoryId
    );
    const [images, setImages] = useState<string[]>(
        product?.images || []
    );
    const [categories, setCategories] = useState<Category[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Fetch categories
    useEffect(() => {
        apiClient.get(API_ENDPOINTS.CATEGORIES.BASE).then((res) => setCategories(res.data));
    }, []);

    // ✅ Chọn nhiều ảnh
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const readers: Promise<string>[] = Array.from(files).map(
            (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                })
        );

        Promise.all(readers).then((base64List) => {
            setImages((prev) => [...prev, ...base64List]);
        });
    };

    // ✅ Xoá 1 ảnh khỏi list
    const handleRemoveImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim() || name.length < 2) newErrors.name = 'Product name must be at least 2 characters.';
        if (price <= 0) newErrors.price = 'Price must be greater than 0.';
        if (!categoryId) newErrors.categoryId = 'Please select a category.';
        if (!product && images.length === 0)
            newErrors.imagesBase64 = 'Please upload at least one product image.';
        if (description.length > 500)
            newErrors.description = 'Description cannot exceed 500 characters.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const payload = { name, price, description, categoryId, images };

        try {
            if (product) {
                await apiClient.put(`${API_ENDPOINTS.PRODUCTS.ADMIN}/${product.id}`, payload);
            } else {
                await apiClient.post(API_ENDPOINTS.PRODUCTS.ADMIN, payload);
            }
            onSuccess();
        } catch (err) {
            console.error('Error saving product:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="product-form" onSubmit={handleSubmit}>
            {/* Product name */}
            <div>
                <label>Product Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Classic Blue Denim Jacket"
                    required
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Price */}
            <div>
                <label>Price (VND)</label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                />
                {errors.price && <span className="error-text">{errors.price}</span>}
            </div>

            {/* Category */}
            <div>
                <label>Category</label>
                <select
                    value={categoryId ?? ''}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    required
                >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
            </div>

            {/* Description */}
            <div>
                <label>Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short product description"
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            {/* Multiple Images */}
            <div>
                <label>Images</label>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} />
                {errors.imagesBase64 && <span className="error-text">{errors.imagesBase64}</span>}

                {images.length > 0 && (
                    <div className="image-grid">
                        {images.map((img, index) => (
                            <div key={index} className="image-wrapper">
                                <img src={img} alt={`preview-${index}`} className="preview-image" />
                                <button
                                    type="button"
                                    className="remove-img-btn"
                                    onClick={() => handleRemoveImage(index)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="actions">
                <button type="button" className="cancel-btn" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? 'Saving...' : product ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
}
