'use client';
import './ImageModal.css';

interface ImageModalProps {
    open: boolean;
    images: string[];
    onClose: () => void;
}

export default function ImageModal({ open, images, onClose }: ImageModalProps) {
    if (!open) return null;

    return (
        <div className="image-modal-overlay" onClick={onClose}>
            <div className="image-modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>✕</button>
                <div className="image-grid">
                    {images.map((img, i) => (
                        <img key={i} src={img} alt={`image-${i}`} className="image-item" />
                    ))}
                </div>
            </div>
        </div>
    );
}
