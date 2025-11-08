'use client';
import React from 'react';
import './ProductVariantModal.css';

interface Variant {
    id?: number;
    size?: string;
    color?: string;
    colorHex?: string;
    quantity?: number;
    additionalPrice?: number;
}

interface ProductVariantModalProps {
    open: boolean;
    variants: Variant[];
    productName?: string;
    onClose: () => void;
}

export default function ProductVariantModal({
                                                open,
                                                variants,
                                                productName,
                                                onClose,
                                            }: ProductVariantModalProps) {
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content product-variant-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Product Variants</h2>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="variant-info">
                    <p className="product-name">
                        <strong>Product:</strong> {productName ?? '—'}
                    </p>
                    {variants.length === 0 ? (
                        <p className="no-data">This product has no variants.</p>
                    ) : (
                        <div className="variant-list">
                            {variants.map((v, i) => (
                                <div key={i} className="variant-card">
                                    <div className="variant-title">
                                        <strong>Variant #{i + 1}</strong>
                                        <div
                                            className="color-preview"
                                            style={{
                                                backgroundColor: v.colorHex ?? '#ccc',
                                            }}
                                            title={v.color}
                                        />
                                    </div>

                                    <div className="variant-grid">
                                        <div>
                                            <span className="label">Size:</span>
                                            <span>{v.size || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="label">Color:</span>
                                            <span>{v.color || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="label">Color Hex:</span>
                                            <span>{v.colorHex || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="label">Quantity:</span>
                                            <span>{v.quantity ?? 0}</span>
                                        </div>
                                        <div>
                                            <span className="label">Additional Price:</span>
                                            <span>
                        {v.additionalPrice
                            ? v.additionalPrice.toLocaleString('vi-VN')
                            : 0}{' '}
                                                ₫
                      </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
