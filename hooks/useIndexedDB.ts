
import { useState, useEffect, useCallback } from 'react';
import { DB_NAME, DB_VERSION, STORE_NAMES } from '../constants';

let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                Object.values(STORE_NAMES).forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                    }
                });
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
