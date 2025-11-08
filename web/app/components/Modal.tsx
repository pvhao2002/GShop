'use client';
import './Modal.css';
import React from "react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
    if (!open) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <header>
                    <h3>{title}</h3>
                    <button onClick={onClose} className="close-btn">✕</button>
                </header>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}
