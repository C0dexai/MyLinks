

import React, { useState, useEffect, useCallback } from 'react';
import { Instruction, OpenAiConfig } from '../types';

interface InstructionPanelProps {
    isOpen: boolean;
    onClose: () => void;
    instructions: Instruction | undefined;
    onUpdateInstructions: (instructions: Instruction) => void;
    openAiConfig: OpenAiConfig | undefined;
    onUpdateOpenAiConfig: (config: OpenAiConfig) => void;
}

const InstructionPanel: React.FC<InstructionPanelProps> = ({ isOpen, onClose, instructions, onUpdateInstructions, openAiConfig, onUpdateOpenAiConfig }) => {
    const [systemInstruction, setSystemInstruction] = useState('');
    const [aiInstruction, setAiInstruction] = useState('');
    const [openAiApiKey, setOpenAiApiKey] = useState('');
    const [isKeyVisible, setIsKeyVisible] = useState(false);

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
        if (openAiConfig) {
            setOpenAiApiKey(openAiConfig.apiKey || '');
        }
    }, [instructions, openAiConfig, defaultSystemInstruction, defaultAiInstruction]);

    const handleSave = useCallback(() => {
        onUpdateInstructions({
            id: 1, // There's only one set of instructions
            system: systemInstruction,
            ai: aiInstruction,
        });
        onUpdateOpenAiConfig({
            id: 1, // There's only one config
            apiKey: openAiApiKey,
        });
    }, [systemInstruction, aiInstruction, openAiApiKey, onUpdateInstructions, onUpdateOpenAiConfig]);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            handleSave();
        }, 500); // Debounce save
        
        return () => {
            clearTimeout(handler);
        };
    }, [systemInstruction, aiInstruction, openAiApiKey, handleSave]);


    return (
        <div
            className={`fixed top-0 right-0 h-full w-96 transition-transform duration-300 z-40 p-4 flex flex-col glass neon ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Custom Instructions & Keys</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1">OpenAI API Key:</label>
                    <div className="relative">
                        <input 
                            type={isKeyVisible ? 'text' : 'password'}
                            value={openAiApiKey} 
                            onChange={(e) => setOpenAiApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="form-input w-full pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setIsKeyVisible(!isKeyVisible)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
                        >
                            {isKeyVisible ? 
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> :
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            }
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1">System Orchestrator Instruction:</label>
                    <textarea value={systemInstruction} onChange={(e) => setSystemInstruction(e.target.value)} className="form-input w-full h-40 resize-none"></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">AI Supervisor Instruction:</label>
                    <textarea value={aiInstruction} onChange={(e) => setAiInstruction(e.target.value)} className="form-input w-full h-40 resize-none"></textarea>
                </div>
            </div>
        </div>
    );
};

export default InstructionPanel;