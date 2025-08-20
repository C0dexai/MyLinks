
import React, { useState, useMemo } from 'react';

const images = [
    'https://picsum.photos/seed/page1/600/400',
    'https://picsum.photos/seed/page2/600/400',
    'https://picsum.photos/seed/page3/600/400',
    'https://picsum.photos/seed/page4/600/400',
    'https://picsum.photos/seed/page5/600/400',
    'https://picsum.photos/seed/page6/600/400',
    'https://picsum.photos/seed/page7/600/400',
    'https://picsum.photos/seed/page8/600/400',
    'https://picsum.photos/seed/page9/600/400',
    'https://picsum.photos/seed/page10/600/400'
];
const imagesPerPage = 4;

const PagesView: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const totalPages = Math.ceil(images.length / imagesPerPage);

    const paginatedImages = useMemo(() => {
        const start = (currentPage - 1) * imagesPerPage;
        const end = start + imagesPerPage;
        return images.slice(start, end).map((url, index) => ({ url, originalIndex: start + index }));
    }, [currentPage]);

    const handleSelectImage = (index: number) => {
        setSelectedImageIndex(index);
    };

    const handlePrevImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1);
        }
    };

    const handleNextImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }
    };
    
    return (
        <div className="w-full h-full flex flex-col p-6 md:p-10">
            <div className="flex flex-col flex-grow">
                <div className="relative flex-shrink-0 h-[60vh] flex items-center justify-center bg-[rgba(0,0,0,0.5)] rounded-xl mb-4 border border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                    {selectedImageIndex !== null ? (
                        <img src={images[selectedImageIndex]} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl p-2" />
                    ) : (
                        <div className="text-gray-400 font-bold text-center">Click a thumbnail below to view the image.</div>
                    )}
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-4">
                        <button onClick={handlePrevImage} disabled={selectedImageIndex === null || selectedImageIndex === 0} className="bg-[rgba(30,30,30,0.8)] text-[#00F0FF] border border-[#00F0FF] rounded-full w-10 h-10 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                        <button onClick={handleNextImage} disabled={selectedImageIndex === null || selectedImageIndex === images.length - 1} className="bg-[rgba(30,30,30,0.8)] text-[#00F0FF] border border-[#00F0FF] rounded-full w-10 h-10 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                    </div>
                </div>
                
                <div className="flex-grow grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 overflow-y-auto p-4 bg-[rgba(30,30,30,0.8)] border border-[#00FF8C] rounded-xl shadow-[0_0_20px_rgba(0,255,140,0.5)]">
                    {paginatedImages.map(({ url, originalIndex }) => (
                        <div key={originalIndex} onClick={() => handleSelectImage(originalIndex)} className={`bg-[rgba(0,0,0,0.3)] border border-[rgba(0,240,255,0.2)] rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:scale-105 hover:border-[#00F0FF] hover:shadow-[0_0_10px_var(--neon-blue)] ${selectedImageIndex === originalIndex ? 'scale-105 border-[#00FF8C] shadow-[0_0_15px_var(--neon-green)]' : ''}`}>
                            <img src={url} alt={`Thumbnail ${originalIndex + 1}`} className="w-full h-24 object-cover opacity-70 hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50">Previous</button>
                        <span className="text-sm font-medium text-gray-400">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50">Next</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PagesView;
