
import React, { useState } from 'react';
import { ApiEndpoint } from '../types';

interface InferenceViewProps {
    endpoints: ApiEndpoint[];
    onAddEndpoint: (endpoint: Omit<ApiEndpoint, 'id'>) => Promise<void>;
    onDeleteEndpoint: (id: number) => Promise<void>;
}

const InferenceView: React.FC<InferenceViewProps> = ({ endpoints, onAddEndpoint, onDeleteEndpoint }) => {
    const [selectedEndpoint, setSelectedEndpoint] = useState('');
    const [url, setUrl] = useState('');
    const [token, setToken] = useState('');
    const [body, setBody] = useState('{}');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [newEndpointName, setNewEndpointName] = useState('');

    const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const endpointId = e.target.value;
        setSelectedEndpoint(endpointId);
        const endpoint = endpoints.find(ep => ep.id.toString() === endpointId);
        setUrl(endpoint ? endpoint.url : '');
    };

    const handleSaveEndpoint = async () => {
        if (newEndpointName.trim() && url.trim()) {
            await onAddEndpoint({ name: newEndpointName, url });
            setNewEndpointName('');
        }
    };

    const handleDeleteEndpoint = async () => {
        if (selectedEndpoint) {
            await onDeleteEndpoint(parseInt(selectedEndpoint, 10));
            setSelectedEndpoint('');
            setUrl('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResponse('');
        try {
            let parsedBody;
            try {
                parsedBody = JSON.parse(body);
            } catch (error) {
                throw new Error('Invalid JSON in request body.');
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(parsedBody),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || `Request failed with status ${res.status}`);
            }
            setResponse(JSON.stringify(data, null, 2));

        } catch (error: any) {
            setResponse(JSON.stringify({ error: error.message }, null, 2));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div id="inference-view" className="w-full h-full p-6 md:p-10 flex items-center justify-center">
            <div className="max-w-4xl w-full neon-card p-8 rounded-xl">
                <h1 className="text-3xl font-bold">🚀 API Inference Console</h1>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 font-bold">Saved Endpoints</label>
                        <div className="flex gap-2">
                            <select value={selectedEndpoint} onChange={handleEndpointChange} className="form-input w-full p-2">
                                <option value="">Select an endpoint</option>
                                {endpoints.map(ep => <option key={ep.id} value={ep.id}>{ep.name}</option>)}
                            </select>
                            <button onClick={handleDeleteEndpoint} disabled={!selectedEndpoint} className="btn-danger p-2 rounded-lg disabled:opacity-50">Delete</button>
                        </div>
                    </div>
                     <div>
                        <label className="block mb-2 font-bold">Save New Endpoint</label>
                        <div className="flex gap-2">
                            <input type="text" value={newEndpointName} onChange={(e) => setNewEndpointName(e.target.value)} placeholder="New Endpoint Name" className="form-input w-full p-2" />
                            <button onClick={handleSaveEndpoint} disabled={!newEndpointName.trim() || !url.trim()} className="btn-primary p-2 rounded-lg disabled:opacity-50">Save</button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <label htmlFor="url" className="block mb-2 font-bold">Endpoint URL</label>
                        <input type="url" id="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/v1/infer" required className="form-input w-full p-2" />
                    </div>
                     <div>
                        <label htmlFor="token" className="block mb-2 font-bold">Bearer Token</label>
                        <input type="text" id="token" value={token} onChange={e => setToken(e.target.value)} placeholder="Your API bearer token" required className="form-input w-full p-2" />
                    </div>
                    <div>
                        <label htmlFor="body" className="block mb-2 font-bold">Request Body (JSON)</label>
                        <textarea id="body" value={body} onChange={e => setBody(e.target.value)} rows={8} className="form-input w-full p-2 font-mono text-sm"></textarea>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full btn-primary font-semibold py-3 px-4 rounded-lg disabled:opacity-50">
                        {isLoading ? 'Sending...' : 'Send Request'}
                    </button>
                </form>

                <div className="mt-6">
                    <label className="block mb-2 font-bold">Response</label>
                    <pre className="h-48 p-3 rounded-lg overflow-y-auto text-sm font-mono">{response || '// API response will appear here...'}</pre>
                </div>
            </div>
        </div>
    );
};

export default InferenceView;
