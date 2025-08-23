import { useState, useEffect, useCallback } from 'react';
import { DB_NAME, DB_VERSION, STORE_NAMES } from '../constants';

let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Links Store
                if (!db.objectStoreNames.contains(STORE_NAMES.links)) {
                    const store = db.createObjectStore(STORE_NAMES.links, { keyPath: 'id', autoIncrement: true });
                    // Seed with sample data
                    store.add({ description: 'Google', url: 'https://google.com', imageUrl: 'https://s.wordpress.com/mshots/v1/https%3A%2F%2Fgoogle.com?w=400', visitCount: 5, rating: 5, category: 'informative' });
                    store.add({ description: 'GitHub', url: 'https://github.com', imageUrl: 'https://s.wordpress.com/mshots/v1/https%3A%2F%2Fgithub.com?w=400', visitCount: 3, rating: 4, category: 'development' });
                }

                // Todos Store
                if (!db.objectStoreNames.contains(STORE_NAMES.todos)) {
                    const store = db.createObjectStore(STORE_NAMES.todos, { keyPath: 'id', autoIncrement: true });
                    store.add({ text: 'Set up Kanban board', status: 'done' });
                    store.add({ text: 'Explore AI Connect chat', status: 'in-progress' });
                    store.add({ text: 'Add a new link to the list', status: 'todo' });
                }

                // Notepad Store
                if (!db.objectStoreNames.contains(STORE_NAMES.notepad)) {
                    const store = db.createObjectStore(STORE_NAMES.notepad, { keyPath: 'id' });
                    store.add({ id: 1, content: '# Welcome to your Notepad!\n\nThis is a full-featured markdown editor using Monaco, the engine that powers VS Code. You can use it to:\n\n- Write notes in **Markdown**.\n- Load content from local files or URLs.\n- Convert between formats (Markdown, HTML, Plain Text).\n- Save your work automatically.\n\nEnjoy!' });
                }
                
                // Instructions Store
                if (!db.objectStoreNames.contains(STORE_NAMES.instructions)) {
                    const store = db.createObjectStore(STORE_NAMES.instructions, { keyPath: 'id' });
                    store.add({ 
                        id: 1, 
                        system: `As the central orchestrator, prioritize efficient resource allocation and task sequencing. Ensure seamless handoffs between AI agents (LYRA, KARA) and monitor overall progress. If a task stalls, initiate automated retry mechanisms or escalate to human oversight. Maintain a comprehensive log of all operations and decisions for post-mortem analysis. Focus on minimizing latency and maximizing throughput across the entire deployment pipeline. Adapt dynamically to changing project requirements and resource availability.`,
                        ai: `As the AI Supervisor, ensure all agent outputs (code, configurations, responses) adhere to the highest quality standards, security best practices, and user requirements. Verify consistency, correctness, and completeness. Provide constructive feedback to individual agents for continuous improvement. Intervene if agent behavior deviates from expected norms or if outputs are suboptimal. Maintain a clear audit trail of agent actions and decisions. Optimize for interpretability and explainability of agent-generated artifacts.`
                    });
                }
                
                // Endpoints Store
                if (!db.objectStoreNames.contains(STORE_NAMES.endpoints)) {
                    db.createObjectStore(STORE_NAMES.endpoints, { keyPath: 'id', autoIncrement: true });
                }
                
                // OpenAI Config Store
                if (!db.objectStoreNames.contains(STORE_NAMES.openai_config)) {
                    const store = db.createObjectStore(STORE_NAMES.openai_config, { keyPath: 'id' });
                    store.add({ id: 1, apiKey: '' });
                }
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onerror = (event) => {
                reject('IndexedDB error: ' + (event.target as IDBOpenDBRequest).error);
            };
        });
    }
    return dbPromise;
};

export function useIndexedDB<T extends { id: number }>(storeName: string) {
    const [data, setData] = useState<T[] | null>(null);

    const refreshData = useCallback(async () => {
        const db = await getDb();
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        return new Promise<T[]>((resolve, reject) => {
            request.onsuccess = () => {
                const result = request.result as T[];
                setData(result);
                resolve(result);
            };
            request.onerror = () => {
                console.error('Error fetching data from', storeName);
                reject(request.error);
            };
        });
    }, [storeName]);
    
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const addData = async (item: Omit<T, 'id'>) => {
        const db = await getDb();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.add(item);
        
        return new Promise<void>((resolve, reject) => {
            transaction.oncomplete = () => {
                refreshData();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    };

    const updateData = async (item: T) => {
        const db = await getDb();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.put(item);

        return new Promise<void>((resolve, reject) => {
            transaction.oncomplete = () => {
                refreshData();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    };

    const deleteData = async (id: number) => {
        const db = await getDb();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.delete(id);

        return new Promise<void>((resolve, reject) => {
            transaction.oncomplete = () => {
                refreshData();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    };

    const getData = async (id: number) => {
        const db = await getDb();
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        return new Promise<T | undefined>((resolve, reject) => {
            request.onsuccess = () => resolve(request.result as T | undefined);
            request.onerror = () => reject(request.error);
        });
    };

    return { data, addData, updateData, deleteData, getData, refreshData };
}