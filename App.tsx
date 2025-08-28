

import React, { useState, useEffect, useCallback } from 'react';
import { Link, Todo, ApiEndpoint, Instruction, NotepadEntry, OpenAiConfig, StoredImage } from './types';
import { View } from './types';
import LeftMenu from './components/LeftMenu';
import AddLinkView from './views/AddLinkView';
import PagesView from './views/PagesView';
import TodoView from './views/TodoView';
import NotepadView from './views/NotepadView';
import ImageGenView from './views/ImageGenView';
import SearchView from './views/SearchView';
import AIConsoleView from './views/AIConsoleView';
import ConnectView from './views/ConnectView';
import RankingsView from './views/RankingsView';
import InferenceView from './views/InferenceView';
import Modal from './components/Modal';
import QuickGoto from './components/QuickGoto';
import InstructionPanel from './components/InstructionPanel';
import { useIndexedDB } from './hooks/useIndexedDB';
import { STORE_NAMES } from './constants';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<View>(View.AddLink);
    const [iframeUrl, setIframeUrl] = useState<string>('');
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<Link | null>(null);
    const [deletingLinkId, setDeletingLinkId] = useState<number | null>(null);
    const [editingCategory, setEditingCategory] = useState<'informative' | 'development'>('informative');
    const [urlInputValue, setUrlInputValue] = useState('');
    const [isInstructionPanelOpen, setInstructionPanelOpen] = useState(false);
    const [isIframeLoading, setIsIframeLoading] = useState(false);


    const { data: links, addData: addLink, updateData: updateLink, deleteData: deleteLink, getData: getLink } = useIndexedDB<Link>(STORE_NAMES.links);
    const { data: todos, addData: addTodo, updateData: updateTodo, deleteData: deleteTodo } = useIndexedDB<Todo>(STORE_NAMES.todos);
    const { data: notepad, updateData: updateNotepad } = useIndexedDB<NotepadEntry>(STORE_NAMES.notepad);
    const { data: instructions, updateData: updateInstructions } = useIndexedDB<Instruction>(STORE_NAMES.instructions);
    const { data: apiEndpoints, addData: addApiEndpoint, deleteData: deleteApiEndpoint } = useIndexedDB<ApiEndpoint>(STORE_NAMES.endpoints);
    const { data: openAiConfig, updateData: updateOpenAiConfig } = useIndexedDB<OpenAiConfig>(STORE_NAMES.openai_config);
    const { data: storedImages, addData: addStoredImage } = useIndexedDB<StoredImage>(STORE_NAMES.images);

    const switchView = (view: View, url?: string) => {
        if (view !== View.Iframe) {
            setIsIframeLoading(false);
        }
        setActiveView(view);
        if (view === View.Iframe && url) {
            setIframeUrl(url);
        }
    };

    const handleGoToUrl = (e: React.FormEvent) => {
        e.preventDefault();
        if (urlInputValue.trim()) {
            let fullUrl = urlInputValue.trim();
            if (!/^(https?:\/\/)/i.test(fullUrl)) {
                fullUrl = `https://${fullUrl}`;
            }
            setIsIframeLoading(true);
            switchView(View.Iframe, fullUrl);
        }
    };

    const handleEditClick = useCallback(async (id: number) => {
        const link = await getLink(id);
        if(link) {
            setEditingLink(link);
            setEditingCategory(link.category);
            setEditModalOpen(true);
        }
    }, [getLink]);

    const handleDeleteClick = useCallback((id: number) => {
        setDeletingLinkId(id);
        setDeleteModalOpen(true);
    }, []);

    const handleSaveEdit = async (description: string, url: string, category: 'informative' | 'development') => {
        if (editingLink) {
            await updateLink({ ...editingLink, description, url, category });
            setEditModalOpen(false);
            setEditingLink(null);
        }
    };

    const handleLinkNavigate = async (link: Link) => {
        setIsIframeLoading(true);
        if (link.id !== undefined) {
            const linkToUpdate = await getLink(link.id);
            if (linkToUpdate) {
                const updatedLink = { ...linkToUpdate, visitCount: (linkToUpdate.visitCount || 0) + 1 };
                await updateLink(updatedLink);
            }
        }
        switchView(View.Iframe, link.url);
    };

    const handleConfirmDelete = async () => {
        if (deletingLinkId !== null) {
            await deleteLink(deletingLinkId);
            setDeleteModalOpen(false);
            setDeletingLinkId(null);
        }
    };

    const tabs = [
        { id: View.AddLink, label: 'Add Link', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg> },
        { id: View.Pages, label: 'Pages', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg> },
        { id: View.Todo, label: 'Todo List', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="m9 14 2 2 4-4"></path></svg> },
        { id: View.Notepad, label: 'Notepad', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
        { id: View.ImageGen, label: 'Image Gen', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.7c.3.3.3.8 0 1.1l-2.8 2.8c-.3.3-.8.3-1.1 0l-1.5-1.5-1.4-1.4c-.2-.2-.2-.5 0-.7l4.2-4.2c.2-.2.5-.2.7 0l2 .1c.2 0 .3.2.3.3v1.5c0 .3-.1.5-.3.7l-1.6 1.6 -1.2 1.2z"/><path d="M12 22a7 7 0 0 1-7-7c0-2.2 1-4.2 2.5-5.5C8.9 8 10.3 7 12 7a7 7 0 0 1 7 7c0 .8-.2 1.5-.4 2.2"/><path d="M20 2c-1 .5-2 1.3-2.6 2.4"/><path d="M16 6c-.5 1-1.3 2-2.4 2.6"/><path d="M4 14c.6-1.2 1.5-2.2 2.6-2.8"/><path d="M7 21a6.8 6.8 0 0 1-1.3-4.4c0-1.2.3-2.4.9-3.5"/></svg> },
        { id: View.Search, label: 'Search', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> },
        { id: View.Rankings, label: 'Rankings', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg> },
        { id: View.AIConsole, label: 'AI Console', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg> },
        { id: View.Inference, label: 'Inference', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> },
        { id: View.Connect, label: 'Connect', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> },
    ];
    
    const iconNavItems = [
        { view: View.AddLink, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>, label: 'Home' },
        { view: View.Pages, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>, label: 'Internet' },
        { view: View.Connect, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><path d="M12 2a10 10 0 0 0-9 12.87V22h18v-7.13A10 10 0 0 0 12 2z"/></svg>, label: 'Connect' }
    ];

    const defaultIframeDataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(`
        <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>body{background-color:transparent;font-family:"Inter",sans-serif;margin:0;padding:0;display:flex;align-items:center;justify-content:center;height:100vh;width:100vw;overflow:hidden}:root{--neon-b:0,229,255;--neon-a:255,0,200}.welcome-card{background:rgba(18,18,21,.4);backdrop-filter:blur(12px) saturate(120%);border:1px solid rgba(255,255,255,.15);box-shadow:0 8px 30px rgba(0,0,0,.35);padding:3rem;border-radius:16px;text-align:center;position:relative}.welcome-card::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:linear-gradient(120deg,rgb(var(--neon-b)) 0%,rgb(var(--neon-a)) 50%,rgb(var(--neon-b)) 100%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;filter:drop-shadow(0 0 8px rgba(var(--neon-a),.35))}.welcome-title{font-family:Orbitron,system-ui,sans-serif;color:#F5F5F7;text-shadow:0 0 8px rgba(var(--neon-b),.5);font-size:2.5rem;font-weight:700;margin-bottom:1rem}.welcome-text{color:#A9B1D6;font-size:1.1rem}.highlight-text{color:rgb(var(--neon-b));font-weight:500;text-shadow:0 0 5px rgb(var(--neon-b))}</style></head>
        <body><div class="welcome-card"><h1 class="welcome-title">Welcome to Your Pages!</h1><p class="welcome-text">This is your <span class="highlight-text">personalized web content viewer</span>.<br>Select a link from the menu or add a new one to get started.</p></div></body></html>`);
    
    return (
        <div className="flex h-screen text-gray-200">
            <LeftMenu
                links={links || []}
                onLinkNavigate={handleLinkNavigate}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />

            <main className="flex-grow flex flex-col overflow-hidden">
                <div className="text-gray-400 px-4 py-1 flex items-center justify-between text-sm border-b border-[rgba(255,255,255,.15)]">
                    <span className="text-xs text-gray-500">System USER: user_a95bfb54 | Session ID: session_1ab89b9e-e17</span>
                     <form onSubmit={handleGoToUrl} className="flex items-center">
                        <input
                            type="text"
                            value={urlInputValue}
                            onChange={(e) => setUrlInputValue(e.target.value)}
                            placeholder="Enter URL to visit..."
                            className="form-input w-72 h-7 text-xs rounded-md"
                        />
                        <button type="submit" className="btn-primary ml-2 px-3 h-7 text-xs">
                            Go
                        </button>
                    </form>
                </div>

                <div className="border-b border-[rgba(255,255,255,.15)] px-4 flex items-center justify-between gap-6">
                    <nav className="-mb-px flex space-x-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => switchView(tab.id)}
                                className={`tab shrink-0 border-b-2 font-semibold px-3 py-3 text-sm flex items-center gap-2 ${activeView === tab.id ? 'active' : 'border-transparent'}`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-2">
                        {iconNavItems.map(item => (
                            <button 
                                key={item.view} 
                                onClick={() => switchView(item.view)}
                                title={item.label}
                                className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-neon-blue transition-colors duration-200"
                            >
                                {item.icon}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-grow relative overflow-y-auto">
                    {activeView === View.AddLink && <AddLinkView onAddLink={addLink} />}
                    {activeView === View.Pages && <PagesView storedImages={storedImages || []} onAddImage={addStoredImage} />}
                    {activeView === View.Iframe && (
                        <div className="relative w-full h-full">
                            {isIframeLoading && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[rgba(11,14,17,0.7)] backdrop-blur-sm transition-opacity duration-300">
                                    <div className="w-16 h-16 rounded-full animate-spin"
                                         style={{
                                             border: '4px solid rgba(var(--neon-b), 0.2)',
                                             borderTopColor: 'rgb(var(--neon-b))',
                                             boxShadow: '0 0 15px rgba(var(--neon-b), 0.5)'
                                         }}>
                                    </div>
                                </div>
                            )}
                            <iframe 
                                src={iframeUrl || defaultIframeDataUrl} 
                                className={`w-full h-full border-0 transition-opacity duration-300 ${isIframeLoading ? 'opacity-50' : 'opacity-100'}`}
                                title="Content Frame"
                                onLoad={() => setIsIframeLoading(false)}
                            />
                        </div>
                    )}
                    {activeView === View.Todo && <TodoView todos={todos || []} onAddTodo={addTodo} onUpdateTodo={updateTodo} onDeleteTodo={deleteTodo} />}
                    {activeView === View.Notepad && <NotepadView notepad={notepad?.[0]} onUpdateNotepad={updateNotepad} />}
                    {activeView === View.ImageGen && <ImageGenView onAddImage={addStoredImage} />}
                    {activeView === View.Search && <SearchView 
                        links={links || []}
                        todos={todos || []}
                        notepad={notepad?.[0]}
                        onNavigate={switchView}
                    />}
                    {activeView === View.AIConsole && <AIConsoleView />}
                    {activeView === View.Connect && <ConnectView 
                        links={links}
                        todos={todos}
                        notepad={notepad?.[0]}
                        endpoints={apiEndpoints}
                        instructions={instructions?.[0]}
                        openAiConfig={openAiConfig?.[0]}
                    />}
                    {activeView === View.Rankings && <RankingsView links={links || []} onUpdateLink={updateLink} />}
                    {activeView === View.Inference && <InferenceView endpoints={apiEndpoints || []} onAddEndpoint={addApiEndpoint} onDeleteEndpoint={deleteApiEndpoint} />}
                </div>

            </main>

            {isEditModalOpen && editingLink && (
                <Modal
                    title="Edit Link"
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                >
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const desc = (e.target as HTMLFormElement).elements.namedItem('desc') as HTMLInputElement;
                        const url = (e.target as HTMLFormElement).elements.namedItem('url') as HTMLInputElement;
                        handleSaveEdit(desc.value, url.value, editingCategory);
                    }}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="edit-link-desc" className="block text-sm font-medium text-gray-400">Description</label>
                                <input type="text" id="edit-link-desc" name="desc" defaultValue={editingLink.description} required className="mt-1 form-input block w-full px-4 py-2" />
                            </div>
                            <div>
                                <label htmlFor="edit-link-url" className="block text-sm font-medium text-gray-400">URL</label>
                                <input type="url" id="edit-link-url" name="url" defaultValue={editingLink.url} required className="mt-1 form-input block w-full px-4 py-2" />
                            </div>
                             <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Category</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="edit-category"
                                            value="informative"
                                            checked={editingCategory === 'informative'}
                                            onChange={() => setEditingCategory('informative')}
                                            className="form-radio h-4 w-4 text-neon-blue bg-gray-700 border-gray-600 focus:ring-neon-blue"
                                        />
                                        <span className="text-gray-300">Informative</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="edit-category"
                                            value="development"
                                            checked={editingCategory === 'development'}
                                            onChange={() => setEditingCategory('development')}
                                            className="form-radio h-4 w-4 text-neon-purple bg-gray-700 border-gray-600 focus:ring-neon-purple"
                                        />
                                        <span className="text-gray-300">Development</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 btn-secondary">Cancel</button>
                            <button type="submit" className="px-4 py-2 btn-primary">Save Changes</button>
                        </div>
                    </form>
                </Modal>
            )}

            {isDeleteModalOpen && (
                <Modal
                    title="Confirm Deletion"
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                >
                    <div>
                        <p className="text-gray-400 mt-2">Are you sure you want to delete this link? This action cannot be undone.</p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 btn-secondary">Cancel</button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 btn-danger">Delete</button>
                        </div>
                    </div>
                </Modal>
            )}

            <QuickGoto links={links || []} onSwitchView={switchView} onOpenSettings={() => setInstructionPanelOpen(true)} />
            <InstructionPanel 
                isOpen={isInstructionPanelOpen}
                onClose={() => setInstructionPanelOpen(false)}
                instructions={instructions?.[0]} 
                onUpdateInstructions={updateInstructions}
                openAiConfig={openAiConfig?.[0]}
                onUpdateOpenAiConfig={updateOpenAiConfig}
            />
        </div>
    );
};

export default App;