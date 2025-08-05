
import React, { useState } from 'react';
import { ActionItem, ChecklistItem } from '../types';
import { PromptLibrary } from './PromptLibrary';
import { slugify } from '../utils/utility';

const priorityStyles: { [key in ActionItem['priority']]: string } = {
    high: 'border-red-500/80 bg-red-900/30 text-red-300',
    medium: 'border-yellow-500/80 bg-yellow-900/30 text-yellow-300',
    low: 'border-sky-500/80 bg-sky-900/30 text-sky-300',
};

const typeIcons: Record<ActionItem['type'], React.ReactNode> = {
    technical: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M11.09 3.552A1.75 1.75 0 009.02.884L3.655 4.755a1.75 1.75 0 00-.884 1.528V13.7a1.75 1.75 0 00.884 1.528l5.365 3.87a1.75 1.75 0 002.14 0l5.365-3.87a1.75 1.75 0 00.884-1.528V6.283a1.75 1.75 0 00-.884-1.528L11.09 3.552zM9.75 6.422a.75.75 0 01.75-.75h.001a.75.75 0 01.75.75v3.655a.75.75 0 01-1.5 0V6.422zM10 12a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>,
    content_update: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>,
    new_content: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>,
};


const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
            isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
    >
        {children}
    </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={className}>
        <h4 className="font-semibold text-gray-400 text-sm mb-2">{title}</h4>
        {children}
    </div>
);


export const ActionItemCard: React.FC<{ actionItem: ActionItem; onToggleTaskComplete: (id: string) => void }> = ({ actionItem, onToggleTaskComplete }) => {
    const [activeTab, setActiveTab] = useState<'implementation' | 'details' | 'prompts' | 'verification'>('implementation');
    const { id, title, type, priority, impact, estimatedTime, completed } = actionItem;

    const checkboxId = slugify(`task-${id}`);

    return (
        <div className={`p-4 rounded-lg border-l-4 transition-all duration-300 ${priorityStyles[priority]} ${completed ? 'opacity-60 bg-gray-900/20' : ''}`}>
            <div className="flex items-start gap-4">
                <div className="flex items-center h-6">
                    <input
                        id={checkboxId}
                        type="checkbox"
                        checked={completed}
                        onChange={() => onToggleTaskComplete(id)}
                        className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-900"
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor={checkboxId} className={`font-semibold text-lg cursor-pointer ${completed ? 'line-through text-gray-400' : 'text-gray-100'}`}>
                        {title}
                    </label>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-800/70 capitalize">
                            {typeIcons[type]} {type.replace('_', ' ')}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-green-400" title="Estimated business impact">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 10.843l1.928-5.322a.75.75 0 00-1.456-.528l-2.433 6.723a.75.75 0 00.26 1.01l3.567 2.082a.75.75 0 001.036-.953l-1.895-3.002z" /><path d="M4.5 9.343a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75zM5.25 12.093a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5zM6 15.593a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" /></svg>
                            Impact: {impact}/10
                        </span>
                        <span className="flex items-center gap-1.5" title="Estimated time to complete">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>
                            {estimatedTime}
                        </span>
                    </div>
                </div>
            </div>

            {!completed && (
                <div className="mt-4 pl-9 space-y-4 animate-fade-in">
                    <div className="p-1 bg-gray-800/50 rounded-lg inline-flex items-center gap-1 flex-wrap">
                        <TabButton isActive={activeTab === 'implementation'} onClick={() => setActiveTab('implementation')}>Implementation</TabButton>
                        <TabButton isActive={activeTab === 'details'} onClick={() => setActiveTab('details')}>Details</TabButton>
                        <TabButton isActive={activeTab === 'prompts'} onClick={() => setActiveTab('prompts')}>AI Prompts</TabButton>
                        <TabButton isActive={activeTab === 'verification'} onClick={() => setActiveTab('verification')}>Verification</TabButton>
                    </div>

                    <div className="p-4 bg-gray-950/50 rounded-lg border border-gray-700/60 min-h-[100px]">
                        {activeTab === 'implementation' && (
                            <ol className="space-y-3 text-sm list-decimal list-inside text-gray-300">
                                {actionItem.stepByStepImplementation.map((step, index) => <li key={index}>{step}</li>)}
                            </ol>
                        )}
                         {activeTab === 'details' && (
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <Section title="Tools Required">
                                    <ul className="space-y-2">
                                        {actionItem.toolsRequired.map((tool, index) => (
                                            <li key={index} className="flex items-center gap-2 text-gray-300">
                                                <span>-</span>
                                                {tool.url ? <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{tool.name}</a> : <span>{tool.name}</span>}
                                            </li>
                                        ))}
                                        {actionItem.toolsRequired.length === 0 && <span className="text-gray-500 italic">None</span>}
                                    </ul>
                                </Section>
                                <Section title="Dependencies">
                                     <ul className="space-y-2">
                                        {actionItem.dependencies.map((dep, index) => <li key={index} className="text-gray-300">- {dep}</li>)}
                                        {actionItem.dependencies.length === 0 && <span className="text-gray-500 italic">None</span>}
                                    </ul>
                                </Section>
                                <Section title="Next Steps" className="md:col-span-2">
                                    <ul className="space-y-3">
                                        {actionItem.nextSteps.map((step, index) => (
                                            <li key={index} className="text-gray-300 bg-gray-800/50 p-3 rounded-md border border-gray-700">
                                                <p className="font-semibold">{step.action}</p>
                                                <p className="text-xs text-gray-400 mt-1">{step.rationale}</p>
                                            </li>
                                        ))}
                                        {actionItem.nextSteps.length === 0 && <span className="text-gray-500 italic">None</span>}
                                    </ul>
                                </Section>
                            </div>
                         )}
                        {activeTab === 'prompts' && <PromptLibrary prompts={actionItem.prompts} />}
                        {activeTab === 'verification' && (
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                 <Section title="Implementation Checklist">
                                     <ul className="space-y-3">
                                        {actionItem.verificationChecklist.map((check, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-gray-600 bg-gray-900 shrink-0"></div>
                                                <span className="text-gray-300">{check.item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                 </Section>
                                <Section title="Success Metrics">
                                    <ul className="space-y-3">
                                        {actionItem.successVerification.map((sv, index) => (
                                            <li key={index} className="bg-gray-800/50 p-3 rounded-md border border-gray-700">
                                                <p className="font-semibold text-teal-300">{sv.method}</p>
                                                <p className="text-gray-300 mt-1">{sv.metric}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </Section>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
