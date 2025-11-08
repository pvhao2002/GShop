'use client';
import {useCallback, useEffect, useState} from 'react';
import apiClient from '@/api/apiClient';
import { API_ENDPOINTS } from '@/constants/api';
import Modal from './Modal';
import ProductForm from './ProductForm';
import ImageModal from './ImageModal';
import ProductEdit from "@/app/components/ProductEdit";
import ProductVariantModal from "@/app/components/ProductVariantModal";
import './ProductTable.css';

interface Variant {
    id?: number;
    size?: string;
    color?: string;
    colorHex?: string;
    quantity?: number;
    additionalPrice?: number;
}

interface Product {
    id: number;
    name: string;
    price: number;
    category?: { id: number; name: string };
    isActive?: boolean;
    images?: string[];
    createdAt?: string;
    hasVariants?: boolean;
    totalInventory?: number;
    variants: Variant[];
}

interface PagedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    page: number;
    size: number;
}

export default function ProductTable() {
    const [products, setProducts] = useState<Product[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [editItem, setEditItem] = useState<Product | null>(null);
    const [showImages, setShowImages] = useState<string[] | null>(null);
    const [openVariantModal, setOpenVariantModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // ✅ pagination states
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadProducts = useCallback(async (pageNum = 0) => {
        setLoading(true);
        try {
            const res = await apiClient.get(API_ENDPOINTS.PRODUCTS.BASE, {
                params: { page: pageNum, size },
            });
            const data = res.data;
            setProducts(data.content ?? []);
            setTotalPages(data.totalPages ?? 0);
            setPage(data.page ?? 0);
        } catch (err) {
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
        }
    }, [size]);

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this product?')) return;
        await apiClient.delete(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`);
        await loadProducts(page);
    };

    const handleSuccess = () => {
        setOpenModal(false);
        setEditItem(null);
        loadProducts(page);
    };

    const handleViewVariants = async (product: Product) => {
        const rsDetailProduct = await apiClient.get(`${API_ENDPOINTS.PRODUCTS.BASE}/${product.id}`);
        setSelectedProduct(rsDetailProduct.data);
        setOpenVariantModal(true);
    };

    useEffect(() => {
        loadProducts(page);
    }, [page, loadProducts]);


    return (
        <div className="product-table-container">
            <div className="toolbar">
                <h2>Product Management</h2>
                <button
                    onClick={() => {
                        setEditItem(null);
                        setOpenModal(true);
                    }}
                >
                    + Add Product
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading products...</div>
            ) : (
                <>
                    <table className="product-table">
                        <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price (VND)</th>
                            <th>Inventory</th>
                            <th>Variants</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="no-data">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        {p.images?.length ? (
                                            <img
                                                src={p.images[0]}
                                                alt={p.name}
                                                className="thumb"
                                                onClick={() => setShowImages(p.images!)}
                                            />
                                        ) : (
                                            <span className="no-img">No image</span>
                                        )}
                                    </td>
                                    <td>{p.name}</td>
                                    <td>{p.category?.name ?? '-'}</td>
                                    <td>{p.price.toLocaleString('vi-VN')}</td>
                                    <td>{p.totalInventory ?? 0}</td>
                                    <td>{p.hasVariants ? 'Yes' : 'No'}</td>
                                    <td>
                      <span
                          className={p.isActive ? 'status-active' : 'status-inactive'}
                      >
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                                    </td>
                                    <td>
                                        <button className="view-btn" onClick={() => handleViewVariants(p)}>
                                            View
                                        </button>
                                        <button
                                            className="edit-btn"
                                            onClick={() => {
                                                setEditItem(p);
                                                setOpenModal(true);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(p.id)}
                                        >
                                            Delete
                                        </button>
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

            {/* Modal thêm/sửa */}
            <Modal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setEditItem(null);
                }}
                title={editItem ? 'Edit Product' : 'Add Product'}
            >
                {editItem ? (
                    <ProductEdit
                        productId={editItem.id}
                        onCancel={() => setOpenModal(false)}
                        onSaveSuccess={handleSuccess}
                    />
                ) : (
                    <ProductForm
                        onSuccess={handleSuccess}
                        onCancel={() => setOpenModal(false)}
                    />
                )}
            </Modal>

            {/* Popup hiển thị ảnh */}
            {showImages && (
                <ImageModal open={true} images={showImages} onClose={() => setShowImages(null)} />
            )}

            {/* Popup variant */}
            <ProductVariantModal
                open={openVariantModal}
                variants={selectedProduct?.variants || []}
                productName={selectedProduct?.name}
                onClose={() => setOpenVariantModal(false)}
            />
        </div>
    );
}
