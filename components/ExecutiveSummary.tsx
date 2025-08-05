


import React from 'react';
import type { ExecutiveSummary as ExecutiveSummaryType, HistoricalAnalysis } from '../types';
import { CopyReportButton } from './CopyReportButton';

const RewriteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>;
const OptimizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M11.983 1.904a1.75 1.75 0 00-3.966 0l-3.134 6.346a1.75 1.75 0 001.65 2.503h6.268a1.75 1.75 0 001.65-2.503L11.983 1.904zM10 12.25a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5a.75.75 0 01.75-.75z" /></svg>;
const NewContentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>;
const RedirectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3 3a1 1 0 000 2h11.586l-2.293 2.293a1 1 0 101.414 1.414l4-4a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 1.414L14.586 3H3z" /><path d="M1e-8 8.25a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H0zM3 13.75a.75.75 0 000 1.5h11.586l-2.293 2.293a.75.75 0 101.06 1.06l3.5-3.5a.75.75 0 000-1.06l-3.5-3.5a.75.75 0 10-1.06 1.06L14.586 13.75H3z" /></svg>;
const DecayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.5c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V5z" clipRule="evenodd" /></svg>;


const SectionCard: React.FC<{ icon: React.ReactNode, title: string, items: any[], renderItem: (item: any, index: number) => React.ReactNode }> = ({ icon, title, items, renderItem }) => {
    if (!items || items.length === 0) return null;
    
    return (
        <div className="bg-gray-950/60 p-4 rounded-lg border border-gray-700/60">
            <h3 className="flex items-center gap-2 font-bold text-lg text-teal-300 mb-3">{icon} {title}</h3>
            <div className="space-y-3">
                {items.map(renderItem)}
            </div>
        </div>
    );
};

interface ExecutiveSummaryProps {
  summary: ExecutiveSummaryType;
  analysis: HistoricalAnalysis;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary, analysis }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-grow">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400">{summary.summaryTitle}</h2>
          <p className="mt-2 text-gray-300 text-lg italic">"{summary.summaryIntroduction}"</p>
        </div>
        <div className="shrink-0 pt-1">
            <CopyReportButton analysis={analysis} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <SectionCard
            icon={<DecayIcon />}
            title="Predicted Content Decay"
            items={summary.contentDecay}
            renderItem={(item, i) => (
                <div key={i} className="bg-gray-800/80 p-3 rounded-md">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline break-all text-sm">{item.url}</a>
                    <p className="text-xs text-gray-400 mt-1 italic">Reason: {item.reason}</p>
                    <p className="text-sm text-gray-200 mt-2 font-medium"><strong>Action:</strong> {item.instruction}</p>
                </div>
            )}
        />
        <SectionCard
            icon={<RewriteIcon />}
            title="Top Pages to Rewrite"
            items={summary.rewrites}
            renderItem={(item, i) => (
                <div key={i} className="bg-gray-800/80 p-3 rounded-md">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline break-all text-sm">{item.url}</a>
                    <p className="text-xs text-gray-400 mt-1 italic">Reason: {item.reason}</p>
                    <p className="text-sm text-gray-200 mt-2 font-medium"><strong>Action:</strong> {item.instruction}</p>
                </div>
            )}
        />
        <SectionCard
            icon={<OptimizeIcon />}
            title="Top Pages to Optimize"
            items={summary.optimizations}
            renderItem={(item, i) => (
                <div key={i} className="bg-gray-800/80 p-3 rounded-md">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline break-all text-sm">{item.url}</a>
                    <p className="text-xs text-gray-400 mt-1 italic">Reason: {item.reason}</p>
                    <p className="text-sm text-gray-200 mt-2 font-medium"><strong>Action:</strong> {item.instruction}</p>
                </div>
            )}
        />
        <SectionCard
            icon={<NewContentIcon />}
            title="Top New Content Ideas"
            items={summary.newContent}
            renderItem={(item, i) => (
                <div key={i} className="bg-gray-800/80 p-3 rounded-md">
                    <p className="font-semibold text-gray-200 text-base">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-1 italic">Topic: {item.topic}</p>
                    <p className="text-sm text-gray-300 mt-2"><strong>Reason:</strong> {item.reason}</p>
                </div>
            )}
        />
        <SectionCard
            icon={<RedirectIcon />}
            title="Critical Redirects"
            items={summary.redirects}
            renderItem={(item, i) => (
                 <div key={i} className="bg-gray-800/80 p-3 rounded-md text-sm">
                    <p className="font-mono break-all"><strong className="text-red-400">From:</strong> {item.from}</p>
                    <p className="font-mono break-all"><strong className="text-green-400">To:</strong> {item.to}</p>
                    <p className="text-xs text-gray-400 mt-2 italic">Reason: {item.reason}</p>
                 </div>
            )}
        />
      </div>
    </div>
  );
};
