
import React, { useState, useMemo } from 'react';
import { Link, Todo, NotepadEntry, View } from '../types';

interface SearchViewProps {
    links: Link[];
    todos: Todo[];
    notepad: NotepadEntry | undefined;
    onNavigate: (view: View, url?: string) => void;
}

const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    // Escape special characters in query for regex
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark class="bg-neon-purple/50 text-white not-italic rounded px-1">$1</mark>');
};

const getSnippet = (text: string, query: string, context = 50) => {
    if (!query) return text.slice(0, 150) + (text.length > 150 ? '...' : '');
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) {
        // Should not happen if we already checked for inclusion, but as a fallback:
        return text.slice(0, 150) + (text.length > 150 ? '...' : '');
    }

    const start = Math.max(0, index - context);
    const end = Math.min(text.length, index + query.length + context);

    const prefix = start > 0 ? '...' : '';
    const suffix = end < text.length ? '...' : '';
    
    const snippetText = text.substring(start, end);

    return prefix + highlightMatch(snippetText, query) + suffix;
};


const SearchView: React.FC<SearchViewProps> = ({ links, todos, notepad, onNavigate }) => {
    const [query, setQuery] = useState('');

    const searchResults = useMemo(() => {
        if (!query.trim()) {
            return { links: [], todos: [], notepad: [] };
        }

        const lowerCaseQuery = query.toLowerCase();

        const foundLinks = links.filter(link =>
            link.description.toLowerCase().includes(lowerCaseQuery) ||
            link.url.toLowerCase().includes(lowerCaseQuery)
        );

        const foundTodos = todos.filter(todo =>
            todo.text.toLowerCase().includes(lowerCaseQuery)
        );

        const notepadMatches: { snippet: string }[] = [];
        if (notepad && notepad.content.toLowerCase().includes(lowerCaseQuery)) {
             notepadMatches.push({ snippet: getSnippet(notepad.content, query) });
        }


        return {
            links: foundLinks,
            todos: foundTodos,
            notepad: notepadMatches,
        };
    }, [query, links, todos, notepad]);
    
    const hasResults = searchResults.links.length > 0 || searchResults.todos.length > 0 || searchResults.notepad.length > 0;

    return (
        <div className="w-full h-full p-6 md:p-10 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold text-center mb-6">Global Search</h1>
                <div className="relative glass neon p-2 mb-8">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search across links, todos, and notes..."
                        className="w-full bg-transparent text-lg p-3 pl-12 text-white placeholder-gray-400 focus:outline-none"
                        autoFocus
                    />
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                </div>

                {query && (
                    <div className="flex-grow w-full overflow-y-auto space-y-6">
                        {searchResults.links.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-3 text-neon-green" style={{textShadow: '0 0 8px var(--neon-green)'}}>Matching Links</h2>
                                <div className="space-y-3">
                                    {searchResults.links.map(link => (
                                        <div key={link.id} onClick={() => onNavigate(View.Iframe, link.url)} className="glass-subtle p-3 rounded-lg cursor-pointer hover:bg-neon-blue/10 transition-colors border border-transparent hover:border-neon-blue">
                                            <p className="font-bold" dangerouslySetInnerHTML={{ __html: highlightMatch(link.description, query) }}></p>
                                            <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: highlightMatch(link.url, query) }}></p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {searchResults.todos.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-3 text-neon-purple" style={{textShadow: '0 0 8px var(--neon-purple)'}}>Matching Tasks</h2>
                                <div className="space-y-3">
                                    {searchResults.todos.map(todo => (
                                        <div key={todo.id} onClick={() => onNavigate(View.Todo)} className="glass-subtle p-3 rounded-lg cursor-pointer hover:bg-neon-purple/10 transition-colors border border-transparent hover:border-neon-purple">
                                            <p dangerouslySetInnerHTML={{ __html: highlightMatch(todo.text, query) }}></p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        
                        {searchResults.notepad.length > 0 && (
                             <section>
                                <h2 className="text-xl font-semibold mb-3 text-yellow-400" style={{textShadow: '0 0 8px #facc15'}}>Matching in Notepad</h2>
                                <div className="space-y-3">
                                    {searchResults.notepad.map((match, index) => (
                                        <div key={index} onClick={() => onNavigate(View.Notepad)} className="glass-subtle p-3 rounded-lg cursor-pointer hover:bg-yellow-400/10 transition-colors border border-transparent hover:border-yellow-400">
                                            <p className="text-gray-300 italic" dangerouslySetInnerHTML={{ __html: match.snippet }}></p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {!hasResults && (
                            <div className="text-center text-gray-400 py-10 glass rounded-lg">
                                <p className="text-lg">No results found for "{query}"</p>
                            </div>
                        )}
                    </div>
                )}
                 {!query && (
                    <div className="text-center text-gray-500 pt-10">
                        <p>Start typing to search your workspace.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default SearchView;
