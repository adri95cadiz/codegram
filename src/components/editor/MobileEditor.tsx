import React from 'react';
// @ts-ignore
import Editor, { Loader } from '@monaco-editor/react';

// Configure Monaco loader to use from CDN or local if preferred, 
// strictly speaking standard usage fetches from CDN (jsdelivr).
// For offline-capable PWA we might want local, but for now standard is fine.

interface MobileEditorProps {
    initialCode: string;
    onChange?: (val: string) => void;
    readOnly?: boolean;
    language?: string;
}

export const MobileEditor: React.FC<MobileEditorProps> = ({
    initialCode,
    onChange,
    readOnly = false,
    language = "typescript"
}) => {

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined && onChange) {
            onChange(value);
        }
    };

    return (
        <div className="w-full h-full relative group bg-[#1e1e1e]">
            {/* Monaco Editor */}
            <div className="absolute inset-0 z-10">
                <Editor
                    height="100%"
                    defaultLanguage={language}
                    defaultValue={initialCode}
                    value={initialCode} // Controlled mode if needed, but performance might suffer on large files
                    theme="vs-dark"
                    onChange={handleEditorChange}
                    options={{
                        readOnly,
                        minimap: { enabled: false }, // Save space on mobile
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 },
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        formatOnPaste: true,
                    }}
                    loading={<div className="text-zinc-500 text-xs p-4">Loading Vibe Engine...</div>}
                />
            </div>
        </div>
    );
};
