
import React, { useState, useEffect, useCallback } from 'react';
import { Link, Todo, ApiEndpoint, Instruction } from './types';
import { View } from './types';
import LeftMenu from './components/LeftMenu';
import AddLinkView from './views/AddLinkView';
import PagesView from './views/PagesView';
import TodoView from './views/TodoView';
import NotepadView from './views/NotepadView';
import AIConsoleView from './views/AIConsoleView';
import ConnectView from './views/ConnectView';
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

    const { data: links, addData: addLink, updateData: updateLink, deleteData: deleteLink, getData: getLink } = useIndexedDB<Link>(STORE_NAMES.links);
    const { data: todos, addData: addTodo, updateData: updateTodo, deleteData: deleteTodo } = useIndexedDB<Todo>(STORE_NAMES.todos);
    const { data: notepad, updateData: updateNotepad } = useIndexedDB<any>(STORE_NAMES.notepad);
    const { data: instructions, updateData: updateInstructions } = useIndexedDB<Instruction>(STORE_NAMES.instructions);
    const { data: apiEndpoints, addData: addApiEndpoint, deleteData: deleteApiEndpoint } = useIndexedDB<ApiEndpoint>(STORE_NAMES.endpoints);

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
            setEditModalOpen(true);
        }
    }, [getLink]);

    const handleDeleteClick = useCallback((id: number) => {
        setDeletingLinkId(id);
        setDeleteModalOpen(true);
    }, []);

    const handleSaveEdit = async (description: string, url: string) => {
        if (editingLink) {
            await updateLink({ ...editingLink, description, url });
            setEditModalOpen(false);
            setEditingLink(null);
        }
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
    ];

    const defaultIframeDataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(`
        <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>body{background-color:transparent;font-family:"Inter",sans-serif;margin:0;padding:0;display:flex;align-items:center;justify-content:center;height:100vh;width:100vw;overflow:hidden}:root{--neon-blue:#00F0FF;--neon-green:#00FF8C}.welcome-card{background-color:rgba(30,30,30,0.7);border:1px solid var(--neon-green);box-shadow:0 0 20px rgba(0,255,140,0.5);padding:3rem;border-radius:1rem;text-align:center;animation:pulsate-border 2s infinite alternate}@keyframes pulsate-border{from{border-color:var(--neon-green);box-shadow:0 0 20px rgba(0,255,140,0.5)}to{border-color:var(--neon-blue);box-shadow:0 0 25px rgba(0,240,255,0.7)}}.welcome-title{color:var(--neon-green);text-shadow:0 0 15px var(--neon-green);font-size:2.5rem;font-weight:700;margin-bottom:1rem}.welcome-text{color:#A0A0A0;font-size:1.1rem}.highlight-text{color:var(--neon-blue);font-weight:500;text-shadow:0 0 5px var(--neon-blue)}</style></head>
        <body><div class="welcome-card"><h1 class="welcome-title">Welcome to Your Pages!</h1><p class="welcome-text">This is your <span class="highlight-text">personalized web content viewer</span>.<br>Select a link from the menu or add a new one to get started.</p></div></body></html>`);
    
    return (
        <div className="flex h-screen bg-gray-900 text-gray-200">
            <LeftMenu
                links={links || []}
                onSwitchView={switchView}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />

            <main className="flex-grow flex flex-col bg-gray-900 overflow-hidden">
                <div className="bg-gray-800 text-gray-400 p-2 flex items-center justify-center text-sm border-b border-gray-700">
                    <span className="text-xs text-gray-500 mr-2">System USER: user_a95bfb54 | Session ID: session_1ab89b9e-e17</span>
                </div>

                <div className="bg-gray-800 border-b border-gray-700 px-4">
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
                </div>

                <div className="flex-grow relative overflow-y-auto">
                    {activeView === View.AddLink && <AddLinkView onAddLink={addLink} />}
                    {activeView === View.Pages && <PagesView />}
                    {activeView === View.Iframe && <iframe src={iframeUrl || defaultIframeDataUrl} className="w-full h-full border-0" title="Content Frame"></iframe>}
                    {activeView === View.Todo && <TodoView todos={todos || []} onAddTodo={addTodo} onUpdateTodo={updateTodo} onDeleteTodo={deleteTodo} />}
                    {activeView === View.Notepad && <NotepadView notepad={notepad?.[0]} onUpdateNotepad={updateNotepad} />}
                    {activeView === View.AIConsole && <AIConsoleView />}
                    {activeView === View.Connect && <ConnectView />}
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
                        handleSaveEdit(desc.value, url.value);
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
            <InstructionPanel instructions={instructions?.[0]} onUpdateInstructions={updateInstructions} />
        </div>
    );
};

export default App;
