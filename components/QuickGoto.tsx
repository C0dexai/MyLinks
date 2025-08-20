
import React, { useState, useEffect, useRef } from 'react';
import { Link, View } from '../types';

interface QuickGotoProps {
    links: Link[];
    onSwitchView: (view: View, url?: string) => void;
}

const QuickGoto: React.FC<QuickGotoProps> = ({ links, onSwitchView }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNavigation = (view: View, url?: string) => {
        onSwitchView(view, url);
        setIsOpen(false);
    };
    
    return (
        <div ref={wrapperRef} className="fixed bottom-8 right-8 z-50">
            <button
                id="glowing-orb"
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold relative overflow-hidden focus:outline-none transition-all duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white filter drop-shadow-[0_0_5px_rgba(255,255,255,0.7)]">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10c0 4-3 9-10 9s-10-5-10-9a10 10 0 0 1 10-10z"></path>
                </svg>
            </button>
            {isOpen && (
                <div id="quick-goto-submenu" className="absolute bottom-full right-0 mb-4 w-56 rounded-lg shadow-xl p-3 flex flex-col space-y-2">
                    <button onClick={() => handleNavigation(View.AddLink)} className="w-full text-left px-3 py-2 rounded-md hover:bg-[rgba(0,240,255,0.2)] flex items-center gap-2 transition-colors">
                         <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs bg-[#00FF8C] shadow-[0_0_8px_var(--neon-green)] text-black">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                         </div>
                         <span className="text-white">Add Link</span>
                    </button>
                    <div className="border-t border-gray-600 my-1"></div>
                    <div className="flex flex-col space-y-1 max-h-40 overflow-y-auto">
                        {links.map(link => (
                             <button key={link.id} onClick={() => handleNavigation(View.Iframe, link.url)} className="w-full text-left px-3 py-2 rounded-md hover:bg-[rgba(0,240,255,0.2)] flex items-center gap-2 transition-colors">
                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs bg-[#BF00FF] shadow-[0_0_8px_var(--neon-purple)] text-black">
                                    {link.description.charAt(0).toUpperCase()}
                                </span>
                                <span className="text-white truncate">{link.description}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickGoto;
