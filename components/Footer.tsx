
import React, { useState, useEffect } from 'react';

const Footer: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const savedState = localStorage.getItem('footerState_v1');
        if (savedState) {
            setIsCollapsed(JSON.parse(savedState).collapsed);
        }
    }, []);

    const toggleFooter = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('footerState_v1', JSON.stringify({ collapsed: newState }));
    };

    return (
        <footer
            className={`bg-gray-800 text-gray-400 border-t border-gray-700 transition-all duration-300 ease-in-out relative ${isCollapsed ? 'h-14 py-2' : 'h-auto p-4'}`}
        >
            <div className={`flex items-center justify-center h-full transition-opacity duration-300 ${isCollapsed ? 'opacity-0 invisible h-0 overflow-hidden' : 'opacity-100'}`}>
                <p className="text-sm">
                    &copy; 2025 Multi-App SPA. All rights reserved.
                </p>
            </div>
            <button
                onClick={toggleFooter}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-300 text-[#00F0FF] filter drop-shadow-[0_0_5px_var(--neon-blue)] ${isCollapsed ? 'rotate-180' : ''}`}
                >
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
            </button>
        </footer>
    );
};

export default Footer;
