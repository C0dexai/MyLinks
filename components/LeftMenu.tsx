
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, View } from '../types';

interface LeftMenuProps {
    links: Link[];
    onSwitchView: (view: View, url?: string) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

const icons = {
    collapse: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>,
    expand: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>,
    home: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    edit: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    delete: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
};

const LeftMenu: React.FC<LeftMenuProps> = ({ links, onSwitchView, onEdit, onDelete }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [width, setWidth] = useState(256);
    const navRef = useRef<HTMLElement>(null);
    const isResizing = useRef(false);

    useEffect(() => {
        const savedState = localStorage.getItem('menuState_v4');
        if (savedState) {
            const { collapsed, width: savedWidth } = JSON.parse(savedState);
            setIsCollapsed(collapsed);
            setWidth(savedWidth || 256);
        }
    }, []);

    const saveState = useCallback((collapsed: boolean, newWidth: number) => {
        localStorage.setItem('menuState_v4', JSON.stringify({ collapsed, width: newWidth }));
    }, []);

    const toggleCollapse = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);
        saveState(newCollapsedState, width);
    };
    
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.classList.add('is-resizing');
    };

    const handleMouseUp = useCallback(() => {
        if (isResizing.current) {
            isResizing.current = false;
            document.body.classList.remove('is-resizing');
            saveState(isCollapsed, width);
        }
    }, [isCollapsed, width, saveState]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing.current) {
            const newWidth = Math.max(80, Math.min(e.clientX, 500));
            setWidth(newWidth);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const homeLink: Link = { id: 0, description: "Home", url: "#", isHome: true };

    const iconNavItems = [
        { view: View.AddLink, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>, label: 'Home' },
        { view: View.Pages, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>, label: 'Internet' },
        { view: View.Connect, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><path d="M12 2a10 10 0 0 0-9 12.87V22h18v-7.13A10 10 0 0 0 12 2z"/></svg>, label: 'Connect' }
    ];

    return (
        <nav
            ref={navRef}
            className="bg-gray-800 text-white p-4 flex flex-col flex-shrink-0 shadow-lg h-screen relative"
            style={{ width: isCollapsed ? '80px' : `${width}px`, transition: isResizing.current ? 'none' : 'width 0.3s ease-in-out' }}
        >
            <div className="flex items-center justify-between mb-4">
                {!isCollapsed && <h2 className="text-xl font-bold whitespace-nowrap text-gray-200" style={{ textShadow: 'none' }}>My Links</h2>}
                <button onClick={toggleCollapse} className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white ml-auto">
                    {isCollapsed ? icons.expand : icons.collapse}
                </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-700">
                {iconNavItems.map(item => (
                    <button key={item.view} onClick={() => onSwitchView(item.view)} className="flex flex-col items-center justify-center aspect-square bg-[rgba(30,30,30,0.8)] border border-[#00F0FF] rounded-lg shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all duration-200 hover:bg-[rgba(0,240,255,0.2)] hover:border-[#00FF8C] hover:shadow-[0_0_15px_rgba(0,255,140,0.5)]">
                        <div className="text-[#00F0FF] filter drop-shadow-[0_0_5px_var(--neon-blue)]">{item.icon}</div>
                        {!isCollapsed && <span className="text-xs font-medium text-gray-400 mt-1">{item.label}</span>}
                    </button>
                ))}
            </div>

            <div className="flex-grow overflow-y-auto space-y-2">
                {[homeLink, ...links].map(link => (
                    <div key={link.id} className={`menu-entry flex items-center p-2 rounded-md ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onSwitchView(link.isHome ? View.AddLink : View.Iframe, link.url);
                            }}
                            className="flex items-center overflow-hidden flex-grow cursor-pointer"
                        >
                            <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm text-black ${link.isHome ? 'bg-[#00FF8C] shadow-[0_0_8px_var(--neon-green)]' : 'bg-[#BF00FF] shadow-[0_0_8px_var(--neon-purple)]'}`}>
                                {link.isHome ? icons.home : link.description.charAt(0).toUpperCase()}
                            </div>
                            {!isCollapsed && <span className="link-text font-medium whitespace-nowrap overflow-hidden ml-3 text-gray-200">{link.description}</span>}
                        </a>
                        {!link.isHome && !isCollapsed && (
                            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                <button onClick={() => onEdit(link.id)} className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600">{icons.edit}</button>
                                <button onClick={() => onDelete(link.id)} className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600">{icons.delete}</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div id="resize-handle" onMouseDown={handleMouseDown}></div>
        </nav>
    );
};

export default LeftMenu;
