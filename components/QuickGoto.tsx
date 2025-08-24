

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, View } from '../types';

interface QuickGotoProps {
    links: Link[];
    onSwitchView: (view: View, url?: string) => void;
    onOpenSettings: () => void;
}

const QuickGoto: React.FC<QuickGotoProps> = ({ links, onSwitchView, onOpenSettings }) => {
    const [isOpen, setIsOpen] = useState(false);
    const orbRef = useRef<HTMLDivElement>(null);
    
    // Draggable state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const savedPosition = localStorage.getItem('orbPosition');
        if (savedPosition) {
            setPosition(JSON.parse(savedPosition));
        } else {
            // Default position to bottom right
            const x = window.innerWidth - 64 - 32; // width - right padding
            const y = window.innerHeight - 64 - 32; // height - bottom padding
            setPosition({ x, y });
        }
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (orbRef.current) {
            isDragging.current = true;
            const orbRect = orbRef.current.getBoundingClientRect();
            offset.current = {
                x: e.clientX - orbRect.left,
                y: e.clientY - orbRect.top,
            };
            // Prevent text selection while dragging
            e.preventDefault();
        }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging.current) {
            const newX = e.clientX - offset.current.x;
            const newY = e.clientY - offset.current.y;
            // Constrain within viewport
            const constrainedX = Math.max(0, Math.min(newX, window.innerWidth - 64));
            const constrainedY = Math.max(0, Math.min(newY, window.innerHeight - 64));
            setPosition({ x: constrainedX, y: constrainedY });
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        if (isDragging.current) {
            isDragging.current = false;
            // Save final position
            localStorage.setItem('orbPosition', JSON.stringify(position));
        }
    }, [position]);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);


    const handleNavigation = (view: View, url?: string) => {
        onSwitchView(view, url);
        setIsOpen(false);
    };

    const handleOrbClick = () => {
        // Only toggle menu if not dragging
        if (!isDragging.current) {
            setIsOpen(prev => !prev);
        }
    };
    
    return (
        <div 
            ref={orbRef} 
            className="fixed z-50 cursor-grab active:cursor-grabbing"
            style={{ top: `${position.y}px`, left: `${position.x}px` }}
        >
            <button
                id="glowing-orb"
                onClick={handleOrbClick}
                onMouseDown={handleMouseDown}
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold relative overflow-hidden focus:outline-none transition-all duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white filter drop-shadow-[0_0_5px_rgba(255,255,255,0.7)]">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10c0 4-3 9-10 9s-10-5-10-9a10 10 0 0 1 10-10z"></path>
                </svg>
            </button>
            {isOpen && (
                <div className="absolute bottom-full right-0 mb-4 w-56 p-3 flex flex-col space-y-2 glass neon">
                    <button onClick={() => { onOpenSettings(); setIsOpen(false); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-[rgba(0,240,255,0.2)] flex items-center gap-2 transition-colors">
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs bg-neon-purple shadow-[0_0_8px_var(--neon-purple)] text-black">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.51-1H5a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H12a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V12a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        </div>
                        <span className="text-white">Open Settings</span>
                    </button>
                     <div className="border-t border-[rgba(255,255,255,.15)] my-1"></div>
                    <button onClick={() => handleNavigation(View.AddLink)} className="w-full text-left px-3 py-2 rounded-md hover:bg-[rgba(0,240,255,0.2)] flex items-center gap-2 transition-colors">
                         <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs bg-neon-green shadow-[0_0_8px_var(--neon-green)] text-black">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                         </div>
                         <span className="text-white">Add Link</span>
                    </button>
                    <div className="border-t border-[rgba(255,255,255,.15)] my-1"></div>
                    <div className="flex flex-col space-y-1 max-h-40 overflow-y-auto">
                        {links.map(link => (
                             <button key={link.id} onClick={() => handleNavigation(View.Iframe, link.url)} className="w-full text-left px-3 py-2 rounded-md hover:bg-[rgba(0,240,255,0.2)] flex items-center gap-2 transition-colors">
                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs bg-neon-blue shadow-[0_0_8px_var(--neon-blue)] text-black">
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