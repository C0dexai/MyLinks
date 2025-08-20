
import React, { useState, useEffect, useCallback } from 'react';
import { Instruction } from '../types';

interface InstructionPanelProps {
    instructions: Instruction | undefined;
    onUpdateInstructions: (instructions: Instruction) => void;
}

const InstructionPanel: React.FC<InstructionPanelProps> = ({ instructions, onUpdateInstructions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [systemInstruction, setSystemInstruction] = useState('');
    const [aiInstruction, setAiInstruction] = useState('');

    const defaultSystemInstruction = `As the central orchestrator, prioritize efficient resource allocation and task sequencing. Ensure seamless handoffs between AI agents (LYRA, KARA) and monitor overall progress. If a task stalls, initiate automated retry mechanisms or escalate to human oversight. Maintain a comprehensive log of all operations and decisions for post-mortem analysis. Focus on minimizing latency and maximizing throughput across the entire deployment pipeline. Adapt dynamically to changing project requirements and resource availability.`;
    const defaultAiInstruction = `As the AI Supervisor, ensure all agent outputs (code, configurations, responses) adhere to the highest quality standards, security best practices, and user requirements. Verify consistency, correctness, and completeness. Provide constructive feedback to individual agents for continuous improvement. Intervene if agent behavior deviates from expected norms or if outputs are suboptimal. Maintain a clear audit trail of agent actions and decisions. Optimize for interpretability and explainability of agent-generated artifacts.`;

    useEffect(() => {
        if (instructions) {
            setSystemInstruction(instructions.system || defaultSystemInstruction);
            setAiInstruction(instructions.ai || defaultAiInstruction);
        } else {
             setSystemInstruction(defaultSystemInstruction);
            setAiInstruction(defaultAiInstruction);
        }
    }, [instructions, defaultSystemInstruction, defaultAiInstruction]);

    const handleSave = useCallback(() => {
        onUpdateInstructions({
            id: 1, // There's only one set of instructions
            system: systemInstruction,
            ai: aiInstruction,
        });
    }, [systemInstruction, aiInstruction, onUpdateInstructions]);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            handleSave();
        }, 500); // Debounce save
        
        return () => {
            clearTimeout(handler);
        };
    }, [systemInstruction, aiInstruction, handleSave]);


    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-28 right-8 w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl z-50 focus:outline-none bg-[#BF00FF] shadow-[0_0_15px_rgba(191,0,255,0.5)] transition-all hover:bg-[#A000E0] hover:shadow-[0_0_20px_rgba(191,0,255,0.7)]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.51-1H5a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H12a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V12a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
            <div
                id="instruction-panel"
                className={`fixed top-0 right-0 h-full w-80 shadow-lg transition-transform duration-300 z-40 p-4 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[#FF00BF] text-shadow-[0_0_10px_var(--neon-pink)]">Custom Instructions</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    <label className="block text-sm font-medium text-gray-400 mb-1">System Orchestrator Instruction:</label>
                    <textarea value={systemInstruction} onChange={(e) => setSystemInstruction(e.target.value)} className="form-input w-full h-40 resize-none mb-4 bg-[#282828] border-[#00FF8C] text-[#00FF8C] shadow-[0_0_5px_rgba(0,255,140,0.3)]"></textarea>

                    <label className="block text-sm font-medium text-gray-400 mb-1">AI Supervisor Instruction:</label>
                    <textarea value={aiInstruction} onChange={(e) => setAiInstruction(e.target.value)} className="form-input w-full h-40 resize-none bg-[#282828] border-[#00FF8C] text-[#00FF8C] shadow-[0_0_5px_rgba(0,255,140,0.3)]"></textarea>
                </div>
            </div>
        </>
    );
};

export default InstructionPanel;
