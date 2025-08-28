import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { StoredImage } from '../types';

interface ImageGenViewProps {
    onAddImage: (image: Omit<StoredImage, 'id'>) => Promise<void>;
}

const ImageGenView: React.FC<ImageGenViewProps> = ({ onAddImage }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<{ base64: string; dataUrl: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setSaveSuccess(false);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                setGeneratedImage({ base64: base64ImageBytes, dataUrl: imageUrl });
            } else {
                setError('Image generation failed. The model did not return an image.');
            }
        } catch (err: any) {
            console.error('Error generating image:', err);
            setError(err.message || 'An unexpected error occurred during image generation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToGallery = async () => {
        if (!generatedImage) return;
        setIsSaving(true);
        try {
            await onAddImage({
                name: prompt.substring(0, 50) || 'Generated Image',
                dataUrl: generatedImage.dataUrl,
            });
            setSaveSuccess(true);
        } catch (err) {
            console.error('Error saving image:', err);
            setError('Failed to save image to gallery.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full h-full p-6 md:p-10 flex flex-col items-center">
            <div className="max-w-4xl w-full">
                <h1 className="text-3xl font-bold text-center mb-6">Image Generation</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Controls */}
                    <div className="glass neon p-6 flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-neon-green">Configuration</h2>
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-400 mb-2">Prompt</label>
                            <textarea
                                id="prompt"
                                rows={5}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., A futuristic neon city with flying cars, photorealistic"
                                className="form-input w-full"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-400 mb-2">Aspect Ratio</label>
                            <select
                                id="aspectRatio"
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="form-input w-full"
                                disabled={isLoading}
                            >
                                <option value="1:1">Square (1:1)</option>
                                <option value="16:9">Widescreen (16:9)</option>
                                <option value="9:16">Portrait (9:16)</option>
                                <option value="4:3">Landscape (4:3)</option>
                                <option value="3:4">Tall (3:4)</option>
                            </select>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full btn-primary font-semibold py-3 px-4 flex items-center justify-center disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                                    <span>Generating...</span>
                                </>
                            ) : (
                                'Generate Image'
                            )}
                        </button>
                    </div>

                    {/* Output */}
                    <div className="glass neon p-4 flex flex-col items-center justify-center min-h-[300px]">
                        {isLoading && (
                             <div className="text-center">
                                <div className="w-16 h-16 rounded-full animate-spin mb-4"
                                    style={{
                                        border: '4px solid rgba(var(--neon-b), 0.2)',
                                        borderTopColor: 'rgb(var(--neon-b))',
                                        boxShadow: '0 0 15px rgba(var(--neon-b), 0.5)'
                                    }}>
                                </div>
                                <p className="text-neon-blue">Conjuring pixels...</p>
                             </div>
                        )}
                        {error && !isLoading && (
                            <div className="text-center text-red-400 p-4">
                                <h3 className="font-bold text-lg mb-2">Generation Failed</h3>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                        {!isLoading && !error && generatedImage && (
                            <div className="w-full text-center">
                                <img src={generatedImage.dataUrl} alt={prompt} className="max-w-full max-h-[400px] object-contain rounded-lg mx-auto" />
                                <div className="mt-4 flex gap-4 justify-center">
                                    <button onClick={handleSaveToGallery} disabled={isSaving || saveSuccess} className="btn-secondary px-4 py-2 disabled:opacity-50">
                                        {saveSuccess ? 'Saved ✓' : (isSaving ? 'Saving...' : 'Save to Gallery')}
                                    </button>
                                     <button onClick={() => { setGeneratedImage(null); setSaveSuccess(false); }} className="btn-secondary px-4 py-2">
                                        Generate Another
                                    </button>
                                </div>
                            </div>
                        )}
                        {!isLoading && !error && !generatedImage && (
                            <div className="text-center text-gray-500">
                                <p>Your generated image will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageGenView;
