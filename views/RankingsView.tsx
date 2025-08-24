

import React, { useState, useMemo } from 'react';
import { Link } from '../types';

interface RankingsViewProps {
    links: Link[];
    onUpdateLink: (link: Link) => Promise<void>;
}

const ROWS_PER_PAGE = 7;

const StarRating: React.FC<{ rating: number; onRate: (rating: number) => void }> = ({ rating, onRate }) => {
    return (
        <div className="flex items-center justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRate(star)}
                    className={`text-2xl transition-transform duration-150 ease-in-out hover:scale-125 ${star <= rating ? 'text-neon-blue filter drop-shadow-[0_0_5px_var(--neon-blue)]' : 'text-gray-600'}`}
                    aria-label={`Rate ${star} stars`}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

const RankingsView: React.FC<RankingsViewProps> = ({ links, onUpdateLink }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const sortedLinks = useMemo(() => {
        return [...links].sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0));
    }, [links]);

    const totalPages = Math.ceil(sortedLinks.length / ROWS_PER_PAGE);
    const paginatedLinks = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return sortedLinks.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [currentPage, sortedLinks]);
    
    const handleRate = async (link: Link, newRating: number) => {
        if (link.rating === newRating) return; // Avoid redundant updates
        await onUpdateLink({ ...link, rating: newRating });
    };

    return (
        <div className="w-full h-full p-4 md:p-6 flex flex-col">
            <div className="flex-shrink-0 glass neon p-4 md:p-6 mb-6">
                <h1 className="text-3xl font-bold">Website Rankings</h1>
                <p className="mt-2 text-gray-400">Links are ranked by the number of visits. You can also rate them.</p>
            </div>

            <div className="flex-grow overflow-auto glass neon p-2">
                <table className="w-full text-left">
                    <thead className="border-b-2 border-[rgba(255,255,255,.15)]">
                        <tr>
                            <th className="p-4 text-neon-green text-shadow-[0_0_8px_var(--neon-green)]">Snapshot</th>
                            <th className="p-4 text-neon-green text-shadow-[0_0_8px_var(--neon-green)]">Description</th>
                            <th className="p-4 text-neon-green text-shadow-[0_0_8px_var(--neon-green)] w-24 text-center">Visits</th>
                            <th className="p-4 text-neon-green text-shadow-[0_0_8px_var(--neon-green)] w-48 text-center">Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLinks.map((link) => (
                            <tr key={link.id} className="border-b border-[rgba(255,255,255,.1)] hover:bg-[rgba(255,255,255,.05)]">
                                <td className="p-2">
                                    <img 
                                        src={link.imageUrl || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} 
                                        alt={`Snapshot of ${link.description}`}
                                        className="w-40 h-24 object-cover rounded-md border border-gray-700 bg-gray-800"
                                    />
                                </td>
                                <td className="p-4 font-medium">{link.description}</td>
                                <td className="p-4 text-center text-lg font-mono text-neon-purple">{link.visitCount || 0}</td>
                                <td className="p-4">
                                    <StarRating
                                        rating={link.rating || 0}
                                        onRate={(newRating) => handleRate(link, newRating)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex-shrink-0 flex justify-center items-center gap-4 mt-6">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-primary px-4 py-2 disabled:opacity-50">Previous</button>
                    <span className="text-sm font-medium text-gray-400">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-primary px-4 py-2 disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
};

export default RankingsView;