
import React, { useState } from 'react';
import { Todo } from '../types';

interface TodoViewProps {
    todos: Todo[];
    onAddTodo: (todo: Omit<Todo, 'id' | 'completed'>) => Promise<void>;
    onUpdateTodo: (todo: Todo) => Promise<void>;
    onDeleteTodo: (id: number) => Promise<void>;
}

const TodoView: React.FC<TodoViewProps> = ({ todos, onAddTodo, onUpdateTodo, onDeleteTodo }) => {
    const [newTodoText, setNewTodoText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTodoText.trim()) {
            onAddTodo({ text: newTodoText.trim() });
            setNewTodoText('');
        }
    };

    const handleToggle = (todo: Todo) => {
        onUpdateTodo({ ...todo, completed: !todo.completed });
    };

    return (
        <div className="w-full h-full p-6 md:p-10 flex items-center justify-center">
            <div className="max-w-2xl w-full neon-card p-8 rounded-xl">
                <h1 className="text-3xl font-bold">Todo List</h1>
                <form onSubmit={handleSubmit} className="flex gap-2 mt-6">
                    <input
                        type="text"
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        placeholder="What needs to be done?"
                        className="form-input flex-grow p-2 border rounded bg-gray-700 border-gray-600 text-white"
                    />
                    <button type="submit" className="btn-primary text-black px-4 rounded">
                        Add
                    </button>
                </form>
                <ul className="mt-4 space-y-2">
                    {todos.map(todo => (
                        <li key={todo.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-700/50">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => handleToggle(todo)}
                                    className="h-5 w-5 rounded border-gray-300 focus:ring-blue-500 bg-gray-700 accent-[#00FF8C] border-[#00FF8C] shadow-[0_0_5px_var(--neon-green)]"
                                />
                                <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                                    {todo.text}
                                </span>
                            </label>
                            <button
                                onClick={() => onDeleteTodo(todo.id)}
                                className="text-gray-400 hover:text-[#FF00BF] hover:text-shadow-[0_0_8px_var(--neon-pink)] text-xl font-bold transition-colors"
                            >
                                &times;
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TodoView;
