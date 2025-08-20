
export interface Link {
    id: number;
    description: string;
    url: string;
    isHome?: boolean;
}

export interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

export interface ApiEndpoint {
    id: number;
    name: string;
    url: string;
}

export interface NotepadEntry {
    id: number;
    content: string;
}

export interface Instruction {
    id: number;
    system: string;
    ai: string;
}

export enum View {
    AddLink = 'add-link-view',
    Pages = 'pages-view',
    Iframe = 'content-frame',
    Todo = 'todo-view',
    Notepad = 'notepad-view',
    AIConsole = 'ai-console-view',
    Connect = 'connect-view',
    Inference = 'inference-view',
}
