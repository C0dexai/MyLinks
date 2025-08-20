
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
                className="modal-content bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md m-4 transform scale-100 border-2 border-[#BF00FF] shadow-[0_0_25px_rgba(191,0,255,0.5)]"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-4 text-[#BF00FF]">{title}</h2>
                {children}
            </div>
        </div>
    );
};

export default Modal;
