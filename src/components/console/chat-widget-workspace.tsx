import { useState } from 'react';
import { ToyBrick, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const syntaxHighlighterStyle = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: 'transparent',
    margin: 0,
    padding: '1rem',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: 'transparent',
  },
  'pre[class*="language-"] > code[class*="language-"]': {
    ...oneDark['pre[class*="language-"] > code[class*="language-"]'],
    background: 'transparent',
  },
  'pre[class*="language-"] > code[class*="language-"]::before': {
    display: 'none'
  },
  'pre[class*="language-"] > code[class*="language-"]::after': {
    display: 'none'
  }
};

export default function ChatWidgetWorkspace({ key, item, active = false }: { key: string; item: { _out: { content: string | number | any; state: any } }; active?: boolean }) {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(item['_out'], null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
        <span key={key} className={`flex flex-col mb-4 w-full max-w-[75%] mx-auto ${!active ? 'opacity-50' : ''}`}>
            <div className="text-xs text-gray-400 bg-neutral-800/70 font-mono px-2 py-2 rounded-t flex flex-row items-center justify-between gap-1">
                <span className="flex items-center gap-1">WORKSPACE <ToyBrick className="h-4 w-4" /></span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-600 text-gray-300 hover:text-white transition-colors"
                    title="Copy JSON"
                >
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <div className="text-sm bg-neutral-700 text-white p-4 rounded-b font-mono">
                <SyntaxHighlighter 
                    language="json" 
                    style={syntaxHighlighterStyle}
                >
                    {jsonString}
                </SyntaxHighlighter>
            </div>
        </span>
  )
}
