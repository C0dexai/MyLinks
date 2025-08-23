
import React, { useState, useEffect, useCallback } from 'react';
import { Link, Todo, ApiEndpoint, Instruction, NotepadEntry, OpenAiConfig } from './types';
import { View } from './types';
import LeftMenu from './components/LeftMenu';
import AddLinkView from './views/AddLinkView';
import PagesView from './views/PagesView';
import TodoView from './views/TodoView';
import NotepadView from './views/NotepadView';
import AIConsoleView from './views/AIConsoleView';
import ConnectView from './views/ConnectView';
import RankingsView from './views/RankingsView';
import InferenceView from './views/InferenceView';
import Modal from './components/Modal';
import QuickGoto from './components/QuickGoto';
import Footer from './components/Footer';
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

    const { data: links, addData: addLink, updateData: updateLink, deleteData: deleteLink, getData: getLink } = useIndexedDB<Link>(STORE_NAMES.links);
    const { data: todos, addData: addTodo, updateData: updateTodo, deleteData: deleteTodo } = useIndexedDB<Todo>(STORE_NAMES.todos);
    const { data: notepad, updateData: updateNotepad } = useIndexedDB<NotepadEntry>(STORE_NAMES.notepad);
    const { data: instructions, updateData: updateInstructions } = useIndexedDB<Instruction>(STORE_NAMES.instructions);
    const { data: apiEndpoints, addData: addApiEndpoint, deleteData: deleteApiEndpoint } = useIndexedDB<ApiEndpoint>(STORE_NAMES.endpoints);
    const { data: openAiConfig, updateData: updateOpenAiConfig } = useIndexedDB<OpenAiConfig>(STORE_NAMES.openai_config);

    const switchView = (view: View, url?: string) => {
        setActiveView(view);
        if (view === View.Iframe && url) {
            setIframeUrl(url);
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
        { id: View.AddLink, label: 'Add Link' },
        { id: View.Pages, label: 'Pages' },
        { id: View.Todo, label: 'Todo List' },
        { id: View.Notepad, label: 'Notepad' },
        { id: View.AIConsole, label: 'AI Console' },
        { id: View.Inference, label: 'Inference' },
        { id: View.Connect, label: 'Connect' },
        { id: View.Rankings, label: 'Rankings' },
    ];
    
    const iconNavItems = [
        { view: View.AddLink, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>, label: 'Home' },
        { view: View.Pages, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>, label: 'Internet' },
        { view: View.Connect, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><path d="M12 2a10 10 0 0 0-9 12.87V22h18v-7.13A10 10 0 0 0 12 2z"/></svg>, label: 'Connect' }
    ];

    const defaultIframeDataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(`
        <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>body{background-color:transparent;font-family:"Inter",sans-serif;margin:0;padding:0;display:flex;align-items:center;justify-content:center;height:100vh;width:100vw;overflow:hidden}:root{--neon-blue:#00F0FF;--neon-green:#00FF8C}.welcome-card{background-color:rgba(30,30,30,0.7);border:1px solid var(--neon-green);box-shadow:0 0 20px rgba(0,255,140,0.5);padding:3rem;border-radius:1rem;text-align:center;animation:pulsate-border 2s infinite alternate}@keyframes pulsate-border{from{border-color:var(--neon-green);box-shadow:0 0 20px rgba(0,255,140,0.5)}to{border-color:var(--neon-blue);box-shadow:0 0 25px rgba(0,240,255,0.7)}}.welcome-title{color:var(--neon-green);text-shadow:0 0 15px var(--neon-green);font-size:2.5rem;font-weight:700;margin-bottom:1rem}.welcome-text{color:#A0A0A0;font-size:1.1rem}.highlight-text{color:var(--neon-blue);font-weight:500;text-shadow:0 0 5px var(--neon-blue)}</style></head>
        <body><div class="welcome-card"><h1 class="welcome-title">Welcome to Your Pages!</h1><p class="welcome-text">This is your <span class="highlight-text">personalized web content viewer</span>.<br>Select a link from the menu or add a new one to get started.</p></div></body></html>`);
    
    return (
        <div className="flex h-screen bg-gray-900 text-gray-200">
            <LeftMenu
                links={links || []}
                onLinkNavigate={handleLinkNavigate}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />

            <main className="flex-grow flex flex-col bg-gray-900 overflow-hidden">
                <div className="bg-gray-800 text-gray-400 p-2 flex items-center justify-center text-sm border-b border-gray-700">
                    <span className="text-xs text-gray-500 mr-2">System USER: user_a95bfb54 | Session ID: session_1ab89b9e-e17</span>
                </div>

                <div className="bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between">
                    <nav className="-mb-px flex space-x-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => switchView(tab.id)}
                                className={`tab shrink-0 border-b-2 font-semibold px-1 py-3 text-sm ${activeView === tab.id ? 'active' : 'border-transparent'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                    <div className="flex items-center space-x-2">
                        {iconNavItems.map(item => (
                            <button 
                                key={item.view} 
                                onClick={() => switchView(item.view)}
                                title={item.label}
                                className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-[#00F0FF] transition-colors duration-200"
                            >
                                {item.icon}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-grow relative overflow-y-auto">
                    {activeView === View.AddLink && <AddLinkView onAddLink={addLink} />}
                    {activeView === View.Pages && <PagesView />}
                    {activeView === View.Iframe && <iframe src={iframeUrl || defaultIframeDataUrl} className="w-full h-full border-0" title="Content Frame"></iframe>}
                    {activeView === View.Todo && <TodoView todos={todos || []} onAddTodo={addTodo} onUpdateTodo={updateTodo} onDeleteTodo={deleteTodo} />}
                    {activeView === View.Notepad && <NotepadView notepad={notepad?.[0]} onUpdateNotepad={updateNotepad} />}
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

                <Footer />
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
                                <input type="text" id="edit-link-desc" name="desc" defaultValue={editingLink.description} required className="mt-1 form-input block w-full px-4 py-2 border rounded-lg bg-gray-700 border-gray-600 text-white" />
                            </div>
                            <div>
                                <label htmlFor="edit-link-url" className="block text-sm font-medium text-gray-400">URL</label>
                                <input type="url" id="edit-link-url" name="url" defaultValue={editingLink.url} required className="mt-1 form-input block w-full px-4 py-2 border rounded-lg bg-gray-700 border-gray-600 text-white" />
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
                            <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 btn-secondary rounded-lg">Cancel</button>
                            <button type="submit" className="px-4 py-2 btn-primary rounded-lg">Save Changes</button>
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
                            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 btn-secondary rounded-lg">Cancel</button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 btn-danger rounded-lg">Delete</button>
                        </div>
                    </div>
                </Modal>
            )}

            <QuickGoto links={links || []} onSwitchView={switchView} />
            <InstructionPanel 
                instructions={instructions?.[0]} 
                onUpdateInstructions={updateInstructions}
                openAiConfig={openAiConfig?.[0]}
                onUpdateOpenAiConfig={updateOpenAiConfig}
            />
        </div>
    );
};

export default App;