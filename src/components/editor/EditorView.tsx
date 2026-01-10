"use client";

import { useState, useEffect, useRef } from "react";
import { MobileEditor } from "@/components/editor/MobileEditor";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    X, Play, Save, Folder, FileCode, ChevronRight, ChevronDown,
    Loader2, Image as ImageIcon, FileText, Bot, Sparkles,
    MessageSquare, Menu, FileJson, FileType, LayoutTemplate
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

interface EditorViewProps {
    isOpen: boolean;
    onClose: () => void;
    projectRoot?: string;
}

interface FileNode {
    name: string;
    type: "file" | "directory";
    path: string;
    children?: FileNode[];
}

interface OpenFile {
    path: string;
    name: string;
    content: string;
    isDirty: boolean;
    type: "code" | "image" | "markdown" | "unknown";
    mimeType?: string;
}

export function EditorView({ isOpen, onClose, projectRoot }: EditorViewProps) {
    const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
    const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
    const [isAgentOpen, setIsAgentOpen] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isMobileExplorerOpen, setIsMobileExplorerOpen] = useState(false);
    const [isLoadingFile, setIsLoadingFile] = useState(false);

    // Auto-detect language for Monaco
    const getLanguage = (filename: string) => {
        if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript';
        if (filename.endsWith('.jsx') || filename.endsWith('.js')) return 'javascript';
        if (filename.endsWith('.json')) return 'json';
        if (filename.endsWith('.css')) return 'css';
        if (filename.endsWith('.html')) return 'html';
        if (filename.endsWith('.md')) return 'markdown';
        return 'plaintext';
    };

    const utils = api.useUtils();

    // TRPC Hooks
    const { data: fileTree, isLoading: isLoadingTree } = api.inspector.getProjectTree.useQuery(
        { path: projectRoot || "" },
        { enabled: !!projectRoot && isOpen }
    );

    const { mutate: saveFile, isPending: isSaving } = api.inspector.writeFile.useMutation({
        onSuccess: () => {
            toast.success("File saved");
            setOpenFiles(prev => prev.map(f => f.path === activeFilePath ? { ...f, isDirty: false } : f));
        },
        onError: () => toast.error("Failed to save")
    });

    // Determine file type
    const getFileType = (path: string): OpenFile["type"] => {
        if (path.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) return "image";
        if (path.match(/\.(md|markdown)$/i)) return "markdown";
        return "code";
    };

    const handleFileClick = async (path: string) => {
        const name = path.split(/[\\/]/).pop() || "unknown";
        const type = getFileType(path);

        // Close mobile explorer on selection
        setIsMobileExplorerOpen(false);

        // Check if already open
        if (!openFiles.find(f => f.path === path)) {
            const newFile: OpenFile = { path, name, content: "", isDirty: false, type };
            // Add immediately with loading state implicit (content empty)
            setOpenFiles(prev => [...prev, newFile]);
            setActiveFilePath(path);

            setIsLoadingFile(true);
            try {
                // Now fetching all files, including images (as base64)
                // Cast to any because the client types might lag slightly behind backend update in this session
                const data = await utils.inspector.getFile.fetch({ path }) as any;

                setOpenFiles(prev => prev.map(f => f.path === path ? {
                    ...f,
                    content: data.content,
                    mimeType: data.mimeType // Store mimeType for images
                } : f));

            } catch (error) {
                toast.error("Failed to read file");
                // Remove the file tabs if failed? Or keep it with error?
                // For now, keep it open but empty.
            } finally {
                setIsLoadingFile(false);
            }
        } else {
            setActiveFilePath(path);
        }
    };

    const handleCloseFile = (e: React.MouseEvent, path: string) => {
        e.stopPropagation();
        const newFiles = openFiles.filter(f => f.path !== path);
        setOpenFiles(newFiles);
        if (activeFilePath === path) {
            setActiveFilePath(newFiles.length > 0 ? newFiles[newFiles.length - 1].path : null);
        }
    };

    const updateFileContent = (newContent: string) => {
        setOpenFiles(prev => prev.map(f => f.path === activeFilePath ? { ...f, content: newContent, isDirty: true } : f));
    };

    const activeFile = openFiles.find(f => f.path === activeFilePath);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-[#1e1e1e] text-zinc-300 font-sans flex flex-col animate-in fade-in duration-200">
            {/* Header / Tabs */}
            <div className="h-10 flex bg-[#1e1e1e] border-b border-zinc-800 select-none">
                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center px-3 border-r border-zinc-800">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMobileExplorerOpen(!isMobileExplorerOpen)}>
                        <Menu className="w-4 h-4" />
                    </Button>
                </div>

                {/* Desktop Explorer Label */}
                <div className="hidden md:flex w-64 border-r border-zinc-800 items-center px-4 bg-[#18181b]">
                    <span className="text-[11px] font-bold tracking-widest text-zinc-500">EXPLORER</span>
                </div>

                {/* Tabs */}
                <div className="flex-1 overflow-hidden relative bg-[#18181b]">
                    <ScrollArea className="w-full h-full whitespace-nowrap">
                        <div className="flex">
                            {openFiles.map(file => (
                                <div
                                    key={file.path}
                                    onClick={() => setActiveFilePath(file.path)}
                                    className={`
                                        flex items-center gap-2 px-3 py-2.5 text-xs border-r border-zinc-800 cursor-pointer min-w-[120px] max-w-[200px] group
                                        ${activeFilePath === file.path ? "bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]" : "bg-[#121214] text-zinc-500 hover:bg-[#1e1e1e] border-t-2 border-t-transparent"}
                                    `}
                                >
                                    <FileIcon name={file.name} type={file.type} className="w-3.5 h-3.5" />
                                    <span className="truncate flex-1">{file.name}</span>
                                    {file.isDirty && <div className="w-2 h-2 rounded-full bg-white transition-all transform scale-75" />}
                                    <X
                                        className={`w-3.5 h-3.5 rounded-sm p-0.5 hover:bg-zinc-700 ${activeFilePath === file.path ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                                        onClick={(e) => handleCloseFile(e, file.path)}
                                    />
                                </div>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="h-2" />
                    </ScrollArea>
                </div>

                {/* Controls */}
                <div className="flex items-center px-2 bg-[#18181b] border-l border-zinc-800">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsAgentOpen(!isAgentOpen)}
                        className={`h-8 w-8 ${isAgentOpen ? "text-purple-400 bg-purple-500/10" : "text-zinc-500 hover:text-white"}`}
                    >
                        <Bot className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500 hover:text-red-400">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Explorer Sidebar */}
                <div className={`
                    absolute md:static inset-y-0 left-0 w-64 bg-[#18181b] border-r border-zinc-800 flex flex-col z-20 transform transition-transform duration-200
                    ${isMobileExplorerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}>
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        {isLoadingTree ? (
                            <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 animate-spin text-zinc-500" /></div>
                        ) : (
                            <div className="py-2">
                                <FileTree nodes={fileTree as FileNode[] || []} onFileClick={handleFileClick} activePath={activeFilePath} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Overlay for mobile explorer */}
                {isMobileExplorerOpen && (
                    <div
                        className="absolute inset-0 bg-black/50 z-10 md:hidden"
                        onClick={() => setIsMobileExplorerOpen(false)}
                    />
                )}

                {/* Main Editor */}
                <div className="flex-1 relative flex flex-col min-w-0 bg-[#1e1e1e]">
                    {activeFile ? (
                        <>
                            {/* Editor Toolbar */}
                            {activeFile.type === 'markdown' && (
                                <div className="h-9 bg-[#1e1e1e] border-b border-zinc-800 flex justify-end px-4 items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs gap-2 text-zinc-400 hover:text-white"
                                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                                    >
                                        {isPreviewMode ? <FileCode className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                                        {isPreviewMode ? "Edit Code" : "Open Preview"}
                                    </Button>
                                </div>
                            )}

                            <div className="flex-1 relative overflow-hidden">
                                {activeFile.type === 'image' && activeFile.mimeType ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] overflow-auto p-8">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={`data:${activeFile.mimeType};base64,${activeFile.content}`}
                                            alt={activeFile.name}
                                            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg border border-zinc-800"
                                        />
                                    </div>
                                ) : activeFile.type === 'markdown' && isPreviewMode ? (
                                    <div className="absolute inset-0 p-8 overflow-auto prose prose-invert max-w-none bg-[#1e1e1e]">
                                        <ReactMarkdown>{activeFile.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <MobileEditor
                                        initialCode={activeFile.content}
                                        onChange={updateFileContent}
                                        language={getLanguage(activeFile.name)}
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                            <div className="w-24 h-24 rounded-2xl bg-zinc-800/30 flex items-center justify-center mb-6">
                                <Bot className="w-10 h-10 opacity-20" />
                            </div>
                            <p className="font-medium text-zinc-500">No file is open</p>
                            <div className="flex gap-2 mt-4">
                                <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-500">Ctrl+P to search</span>
                                <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-500">Drag & Drop supported</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Agent Drawer (Right Sidebar) */}
                {isAgentOpen && (
                    <div className="w-80 bg-[#18181b] border-l border-zinc-800 flex flex-col shadow-2xl absolute md:static right-0 inset-y-0 z-30">
                        <div className="h-10 border-b border-zinc-800 flex items-center px-4 justify-between bg-[#1e1e1e]">
                            <span className="text-[11px] font-bold text-purple-400 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> DOOM ASSIST
                            </span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 md:hidden" onClick={() => setIsAgentOpen(false)}>
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="bg-zinc-800/30 border border-zinc-700/30 p-4 rounded-xl text-sm text-zinc-400">
                                {activeFile ? (
                                    <>
                                        I'm reading <span className="text-green-400 font-mono text-xs">{activeFile.name}</span>.
                                        Need a refactor or explanation?
                                    </>
                                ) : (
                                    "Open a file so I can start analyzing."
                                )}
                            </div>
                        </div>
                        <div className="p-3 border-t border-zinc-800 bg-[#1e1e1e]">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Instruction..."
                                    className="w-full bg-[#121214] border border-zinc-800 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-white placeholder-zinc-600"
                                />
                                <Button size="icon" className="absolute right-1 top-1 h-6 w-6 bg-purple-600 hover:bg-purple-500 rounded text-white">
                                    <MessageSquare className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#007acc] text-white flex items-center px-3 text-[10px] justify-between select-none z-50">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1 font-medium"><Bot className="w-3 h-3" /> DOOM ZERO</span>
                    {activeFile && <span className="opacity-90">{activeFile.name} {activeFile.isDirty && "•"}</span>}
                </div>
                <div className="flex gap-4 opacity-90">
                    <span>Space: 4</span>
                    <span>UTF-8</span>
                    <span>{activeFile ? getLanguage(activeFile.name) : 'Plain Text'}</span>
                </div>
            </div>

            {/* Quick Actions (Floating) */}
            {activeFile?.isDirty && (
                <div className="absolute bottom-10 right-10 z-[70] animate-in slide-in-from-bottom-4 fade-in">
                    <Button
                        size="sm"
                        onClick={() => saveFile({ path: activeFile.path, content: activeFile.content })}
                        disabled={isSaving}
                        className="shadow-2xl bg-[#007acc] hover:bg-[#0063a5] text-white font-medium px-6"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes (Ctrl+S)
                    </Button>
                </div>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// File Tree Components with improved styling
// ----------------------------------------------------------------------

function FileIcon({ name, type, className }: { name: string, type?: string, className?: string }) {
    if (type === 'directory') return <Folder className={`text-blue-400 ${className}`} fill="currentColor" fillOpacity={0.2} />;

    if (name.endsWith('.tsx')) return <FileCode className={`text-blue-400 ${className}`} />;
    if (name.endsWith('.ts')) return <FileCode className={`text-blue-500 ${className}`} />;
    if (name.endsWith('.css')) return <LayoutTemplate className={`text-sky-400 ${className}`} />;
    if (name.endsWith('.json')) return <FileJson className={`text-yellow-400 ${className}`} />;
    if (name.endsWith('.md')) return <Bot className={`text-purple-400 ${className}`} />;
    if (name.match(/\.(png|jpg|svg)$/)) return <ImageIcon className={`text-green-400 ${className}`} />;

    return <FileText className={`text-zinc-500 ${className}`} />;
}

function FileTree({ nodes, onFileClick, activePath, depth = 0 }: { nodes: FileNode[], onFileClick: (path: string) => void, activePath: string | null, depth?: number }) {
    // Sort directories first, then files
    const sorted = [...nodes].sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
    });

    return (
        <div className="flex flex-col">
            {sorted.map((node) => (
                <FileTreeNode key={node.path} node={node} onFileClick={onFileClick} activePath={activePath} depth={depth} />
            ))}
        </div>
    );
}

function FileTreeNode({ node, onFileClick, activePath, depth }: { node: FileNode, onFileClick: (path: string) => void, activePath: string | null, depth: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const isDir = node.type === 'directory';

    const isActive = activePath === node.path;

    return (
        <div>
            <div
                className={`
                    flex items-center gap-1.5 py-1 px-2 cursor-pointer text-[13px] font-sans transition-colors select-none
                    ${isActive ? "bg-[#37373d] text-white" : "text-zinc-400 hover:bg-[#2a2d2e] hover:text-zinc-100"}
                `}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={() => isDir ? setIsOpen(!isOpen) : onFileClick(node.path)}
            >
                <span className="opacity-70">
                    {isDir ? (
                        isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                        <div className="w-3.5" />
                    )}
                </span>

                <FileIcon name={node.name} type={node.type as any} className="w-4 h-4" />

                <span className="truncate flex-1">{node.name}</span>
            </div>
            {isDir && isOpen && node.children && (
                <div className="flex flex-col">
                    <FileTree nodes={node.children} onFileClick={onFileClick} activePath={activePath} depth={depth + 1} />
                </div>
            )}
        </div>
    );
}
