
import React from 'react';

interface ModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="modal-backdrop fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="modal-content glass neon p-8 w-full max-w-md m-4 transform scale-100"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
};

export default Modal;