
import React, { useState, useMemo } from 'react';
import { Todo } from '../types';

type KanbanStatus = 'todo' | 'in-progress' | 'done';

const COLUMN_CONFIG: { [key in KanbanStatus]: { title: string; color: string } } = {
    'todo': { title: 'Backlog', color: 'var(--neon-blue)' },
    'in-progress': { title: 'In Progress', color: 'var(--neon-purple)' },
    'done': { title: 'Completed', color: 'var(--neon-green)' },
};

const KANBAN_COLUMNS: KanbanStatus[] = ['todo', 'in-progress', 'done'];

interface TodoViewProps {
    todos: Todo[];
    onAddTodo: (todo: Omit<Todo, 'id'>) => Promise<void>;
    onUpdateTodo: (todo: Todo) => Promise<void>;
    onDeleteTodo: (id: number) => Promise<void>;
}

const TodoView: React.FC<TodoViewProps> = ({ todos, onAddTodo, onUpdateTodo, onDeleteTodo }) => {
    const [newTodoText, setNewTodoText] = useState('');
    const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTodoText.trim()) {
            onAddTodo({ text: newTodoText.trim(), status: 'todo' });
            setNewTodoText('');
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, todo: Todo) => {
        e.dataTransfer.setData('text/plain', todo.id.toString());
        e.currentTarget.classList.add('opacity-50', 'rotate-2');
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('opacity-50', 'rotate-2');
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: KanbanStatus) => {
        e.preventDefault();
        setDragOverColumn(status);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStatus: KanbanStatus) => {
        e.preventDefault();
        setDragOverColumn(null);
        const id = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const todoToMove = todos.find(t => t.id === id);
        
        if (todoToMove && todoToMove.status !== targetStatus) {
            await onUpdateTodo({ ...todoToMove, status: targetStatus });
        }
    };

    const filteredTodos = useMemo(() => {
        return KANBAN_COLUMNS.reduce((acc, status) => {
            acc[status] = todos.filter(todo => todo.status === status);
            return acc;
        }, {} as Record<KanbanStatus, Todo[]>);
    }, [todos]);

    return (
        <div className="w-full h-full p-4 md:p-6 flex flex-col">
            <div className="flex-shrink-0 neon-card p-4 md:p-6 rounded-xl mb-6">
                <h1 className="text-3xl font-bold">Kanban Board</h1>
                <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                    <input
                        type="text"
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        placeholder="Add a new task to the backlog..."
                        className="form-input flex-grow p-2 border rounded bg-gray-700 border-gray-600 text-white"
                    />
                    <button type="submit" className="btn-primary text-black px-4 rounded">
                        Add Task
                    </button>
                </form>
            </div>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
                {KANBAN_COLUMNS.map(status => (
                    <div 
                        key={status}
                        onDragOver={(e) => handleDragOver(e, status)}
                        onDragLeave={() => setDragOverColumn(null)}
                        onDrop={(e) => handleDrop(e, status)}
                        className={`bg-gray-800/50 rounded-lg p-4 flex flex-col transition-all duration-200 ${dragOverColumn === status ? 'shadow-[0_0_15px_var(--neon-green)]' : ''}`}
                    >
                        <h2 className="text-xl font-bold mb-4 flex justify-between items-center" style={{ color: COLUMN_CONFIG[status].color, textShadow: `0 0 8px ${COLUMN_CONFIG[status].color}` }}>
                            {COLUMN_CONFIG[status].title}
                            <span className="text-sm font-mono bg-gray-700 text-gray-300 rounded-full px-2 py-0.5">{filteredTodos[status].length}</span>
                        </h2>
                        <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                            {filteredTodos[status].map(todo => (
                                <div
                                    key={todo.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, todo)}
                                    onDragEnd={handleDragEnd}
                                    className="bg-gray-700 p-3 rounded-lg cursor-grab group relative border-l-4"
                                    style={{ borderColor: COLUMN_CONFIG[status].color }}
                                >
                                    <p className="text-gray-200">{todo.text}</p>
                                    <button
                                        onClick={() => onDeleteTodo(todo.id)}
                                        className="absolute top-1 right-1 p-1 text-gray-500 hover:text-[#FF00BF] transition-opacity opacity-0 group-hover:opacity-100"
                                        aria-label="Delete task"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodoView;
