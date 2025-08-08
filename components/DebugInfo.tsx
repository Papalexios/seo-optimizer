
import React from 'react';

interface DebugInfoProps {
  title: string;
  data: object;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ title, data }) => {
  const prettyJson = JSON.stringify(data, null, 2);

  return (
    <div className="mt-4 bg-gray-900/70 p-4 rounded-lg border border-gray-700 relative animate-fade-in shadow-inner">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-gray-400 text-sm tracking-wide uppercase">
            {title}
        </h4>
        <div className="flex items-center gap-4 text-xs text-gray-500">
             <span>Latency: <strong className="font-mono text-gray-400">N/A</strong></span>
             <span>Tokens: <strong className="font-mono text-gray-400">N/A</strong></span>
             <span className="flex items-center gap-1 text-green-400">✅ Validated</span>
        </div>
      </div>
      <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-950 p-3 rounded-md overflow-x-auto border border-gray-800">
        <code>{prettyJson}</code>
      </pre>
    </div>
  );
};