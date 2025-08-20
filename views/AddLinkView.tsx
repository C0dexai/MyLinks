
import React, { useState } from 'react';
import { Link } from '../types';

interface AddLinkViewProps {
    onAddLink: (link: Omit<Link, 'id'>) => Promise<void>;
}

const AddLinkView: React.FC<AddLinkViewProps> = ({ onAddLink }) => {
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim() && url.trim()) {
            onAddLink({ description, url });
            setDescription('');
            setUrl('');
        }
    };

    return (
        <div className="w-full h-full p-6 md:p-10 flex items-center justify-center">
            <div className="max-w-2xl w-full neon-card p-8 rounded-xl">
                <h1 className="text-3xl font-bold">Add a New Link</h1>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        required
                        className="form-input w-full p-3 border rounded bg-gray-700 border-gray-600 text-white"
                    />
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="URL"
                        required
                        className="form-input w-full p-3 border rounded bg-gray-700 border-gray-600 text-white"
                    />
                    <button type="submit" className="w-full btn-primary text-white font-semibold py-3 px-4 rounded-lg">
                        Add Link
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddLinkView;
