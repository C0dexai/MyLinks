
import React, { useState } from 'react';
import { Link } from '../types';
import { GoogleGenAI } from '@google/genai';

interface AddLinkViewProps {
    onAddLink: (link: Omit<Link, 'id'>) => Promise<void>;
}

const AddLinkView: React.FC<AddLinkViewProps> = ({ onAddLink }) => {
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState<'informative' | 'development'>('informative');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateDetails = async () => {
        if (!url.trim() || !url.startsWith('http')) {
            alert('Please enter a valid URL to generate details.');
            return;
        }
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Provide a concise, single-sentence description for the website at the following URL: ${url}`,
            });
            setDescription(response.text);
            setImageUrl(`https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=400`);
        } catch (error) {
            console.error('Error generating details:', error);
            alert('Failed to generate details. You can still fill them in manually.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim() && url.trim()) {
            onAddLink({
                description,
                url,
                imageUrl,
                visitCount: 0,
                rating: 0,
                category,
            });
            setDescription('');
            setUrl('');
            setImageUrl('');
            setCategory('informative');
        }
    };

    return (
        <div className="w-full h-full p-6 md:p-10 flex items-center justify-center">
            <div className="max-w-2xl w-full neon-card p-8 rounded-xl">
                <h1 className="text-3xl font-bold">Add a New Link</h1>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <div className="flex items-stretch gap-2">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="URL"
                            required
                            className="form-input flex-grow w-full p-3 border rounded bg-gray-700 border-gray-600 text-white"
                        />
                        <button
                            type="button"
                            onClick={handleGenerateDetails}
                            disabled={isGenerating || !url}
                            title="Generate Details from URL"
                            className="btn-secondary px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                '✨'
                            )}
                        </button>
                    </div>
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
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Image URL (Snapshot)"
                        className="form-input w-full p-3 border rounded bg-gray-700 border-gray-600 text-white"
                    />
                     <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Category</label>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="category"
                                    value="informative"
                                    checked={category === 'informative'}
                                    onChange={() => setCategory('informative')}
                                    className="form-radio h-4 w-4 text-neon-blue bg-gray-700 border-gray-600 focus:ring-neon-blue"
                                />
                                <span className="text-gray-300">Informative</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="category"
                                    value="development"
                                    checked={category === 'development'}
                                    onChange={() => setCategory('development')}
                                    className="form-radio h-4 w-4 text-neon-purple bg-gray-700 border-gray-600 focus:ring-neon-purple"
                                />
                                <span className="text-gray-300">Development</span>
                            </label>
                        </div>
                    </div>
                    <button type="submit" className="w-full btn-primary text-white font-semibold py-3 px-4 rounded-lg">
                        Add Link
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddLinkView;