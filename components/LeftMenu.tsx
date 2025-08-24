

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from '../types';

interface LeftMenuProps {
    links: Link[];
    onLinkNavigate: (link: Link) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

const icons = {
    collapse: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>,
    expand: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>,
    edit: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    delete: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
    book: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
    code: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
};

const LeftMenu: React.FC<LeftMenuProps> = ({ links, onLinkNavigate, onEdit, onDelete }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [width, setWidth] = useState(256);
    const [isInformativeOpen, setInformativeOpen] = useState(true);
    const [isDevelopmentOpen, setDevelopmentOpen] = useState(true);
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

    const { informativeLinks, developmentLinks } = useMemo(() => ({
        informativeLinks: links.filter(l => l.category === 'informative'),
        developmentLinks: links.filter(l => l.category === 'development')
    }), [links]);

    const renderLinkRow = (link: Link) => (
        <div key={link.id} className="menu-entry flex items-center p-2 rounded-md group justify-between">
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); onLinkNavigate(link); }}
                title={link.description}
                className="flex items-center overflow-hidden flex-grow cursor-pointer"
            >
                <img src={link.imageUrl || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} alt={link.description} className="flex-shrink-0 w-8 h-8 object-cover rounded-md bg-gray-700" />
                <span className="link-text font-medium whitespace-nowrap overflow-hidden ml-3 text-gray-200">{link.description}</span>
            </a>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(link.id)} className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600">{icons.edit}</button>
                <button onClick={() => onDelete(link.id)} className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600">{icons.delete}</button>
            </div>
        </div>
    );

    return (
        <nav
            ref={navRef}
            className="glass text-white p-4 flex flex-col flex-shrink-0 h-screen relative"
            style={{ width: isCollapsed ? '80px' : `${width}px`, transition: isResizing.current ? 'none' : 'width 0.3s ease-in-out', background: 'rgba(var(--glass-bg-rgb), .15)' }}
        >
            <div className="flex items-center justify-between mb-4">
                {!isCollapsed && <h2 className="text-xl font-bold whitespace-nowrap text-gray-200" style={{ textShadow: 'none' }}>My Links</h2>}
                <button onClick={toggleCollapse} className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white ml-auto">
                    {isCollapsed ? icons.expand : icons.collapse}
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-2">
                {isCollapsed ? (
                    links.map(link => (
                        <a
                            key={link.id}
                            href="#"
                            onClick={(e) => { e.preventDefault(); onLinkNavigate(link); }}
                            title={link.description}
                            className="flex items-center justify-center p-1 rounded-md cursor-pointer menu-entry"
                        >
                            <img src={link.imageUrl || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} alt={link.description} className="w-10 h-10 object-cover rounded-md bg-gray-700" />
                        </a>
                    ))
                ) : (
                    <>
                        {informativeLinks.length > 0 && (
                            <div>
                                <button onClick={() => setInformativeOpen(!isInformativeOpen)} className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-700 text-gray-300">
                                    <div className="flex items-center gap-2">
                                        {icons.book}
                                        <h3 className="font-bold text-sm">Informative</h3>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isInformativeOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>
                                {isInformativeOpen && <div className="mt-1 space-y-1 pl-2 border-l-2 border-gray-700">{informativeLinks.map(renderLinkRow)}</div>}
                            </div>
                        )}
                         {developmentLinks.length > 0 && (
                            <div className="mt-2">
                                <button onClick={() => setDevelopmentOpen(!isDevelopmentOpen)} className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-700 text-gray-300">
                                    <div className="flex items-center gap-2">
                                        {icons.code}
                                        <h3 className="font-bold text-sm">Development</h3>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isDevelopmentOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>
                                {isDevelopmentOpen && <div className="mt-1 space-y-1 pl-2 border-l-2 border-gray-700">{developmentLinks.map(renderLinkRow)}</div>}
                            </div>
                        )}
                    </>
                )}
            </div>
            <div id="resize-handle" onMouseDown={handleMouseDown}></div>
        </nav>
    );
};

export default LeftMenu;