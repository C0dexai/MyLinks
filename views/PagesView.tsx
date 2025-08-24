import React, { useState, useMemo, useRef } from 'react';
import { StoredImage } from '../types';

interface PagesViewProps {
    storedImages: StoredImage[];
    onAddImage: (image: Omit<StoredImage, 'id'>) => Promise<void>;
}

const imagesPerPage = 12;

const PagesView: React.FC<PagesViewProps> = ({ storedImages, onAddImage }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const totalPages = Math.ceil(storedImages.length / imagesPerPage);

    const paginatedImages = useMemo(() => {
        const start = (currentPage - 1) * imagesPerPage;
        const end = start + imagesPerPage;
        return storedImages.slice(start, end).map((image, index) => ({ ...image, originalIndex: start + index }));
    }, [currentPage, storedImages]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);

        const imagePromises = Array.from(files).map(file => {
            return new Promise<Omit<StoredImage, 'id'>>((resolve, reject) => {
                if (!file.type.startsWith('image/')) {
                    resolve(null as any); 
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => resolve({ name: file.name, dataUrl: reader.result as string });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        try {
            const newImages = (await Promise.all(imagePromises)).filter(Boolean);
            for (const image of newImages) {
                await onAddImage(image);
            }
            // After uploading, go to the last page to see new images
            const newTotalPages = Math.ceil((storedImages.length + newImages.length) / imagesPerPage);
            if(newTotalPages > 0) setCurrentPage(newTotalPages);

        } catch (error) {
            console.error("Error reading files:", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleSelectImage = (index: number) => {
        setSelectedImageIndex(index);
    };

    const handlePrevImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1);
        }
    };

    const handleNextImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex < storedImages.length - 1) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }
    };
    
    return (
        <div className="w-full h-full flex flex-col p-6 md:p-10">
            <div className="flex-shrink-0 mb-4 flex justify-between items-center">
                 <h1 className="text-3xl font-bold">Your Image Gallery</h1>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    onClick={handleUploadClick}
                    className="btn-primary px-4 py-2 flex items-center gap-2"
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            <span>Upload Images</span>
                        </>
                    )}
                </button>
            </div>

            <div className="flex flex-col flex-grow min-h-0">
                <div className="relative flex-shrink-0 h-[60vh] flex items-center justify-center mb-4 glass neon">
                    {storedImages.length === 0 ? (
                        <div className="text-gray-400 font-bold text-center p-4">
                            <h2 className="text-2xl text-neon-green mb-2">Your Gallery is Empty</h2>
                            <p>Click the "Upload Images" button to add your own pictures.</p>
                        </div>
                    ) : selectedImageIndex !== null ? (
                        <img src={storedImages[selectedImageIndex].dataUrl} alt={storedImages[selectedImageIndex].name} className="max-w-full max-h-full object-contain rounded-xl p-2" />
                    ) : (
                        <div className="text-gray-400 font-bold text-center">Click a thumbnail below to view an image.</div>
                    )}
                    
                    {selectedImageIndex !== null && storedImages.length > 1 && (
                        <>
                            <button 
                                onClick={handlePrevImage} 
                                disabled={selectedImageIndex === 0} 
                                className="absolute top-1/2 left-4 -translate-y-1/2 bg-[rgba(30,30,30,0.8)] text-neon-blue border border-neon-blue rounded-full w-10 h-10 flex items-center justify-center shadow-[0_0_10px_var(--neon-blue)] disabled:opacity-50 disabled:cursor-not-allowed z-10 transition-transform hover:scale-110"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <button 
                                onClick={handleNextImage} 
                                disabled={selectedImageIndex === storedImages.length - 1} 
                                className="absolute top-1/2 right-4 -translate-y-1/2 bg-[rgba(30,30,30,0.8)] text-neon-blue border border-neon-blue rounded-full w-10 h-10 flex items-center justify-center shadow-[0_0_10px_var(--neon-blue)] disabled:opacity-50 disabled:cursor-not-allowed z-10 transition-transform hover:scale-110"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </>
                    )}
                </div>
                
                {storedImages.length > 0 && (
                    <div className="flex-grow grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto p-4 glass neon">
                        {paginatedImages.map(({ dataUrl, name, originalIndex }) => (
                            <div key={originalIndex} onClick={() => handleSelectImage(originalIndex)} className={`bg-[rgba(0,0,0,0.3)] border border-[rgba(0,240,255,0.2)] rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:scale-105 hover:border-neon-blue hover:shadow-[0_0_10px_var(--neon-blue)] ${selectedImageIndex === originalIndex ? 'scale-105 border-neon-green shadow-[0_0_15px_var(--neon-green)]' : ''}`}>
                                <img src={dataUrl} alt={name} className="w-full h-40 object-cover opacity-70 hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-primary px-4 py-2 disabled:opacity-50">Previous</button>
                        <span className="text-sm font-medium text-gray-400">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-primary px-4 py-2 disabled:opacity-50">Next</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PagesView;