
import React from 'react';
import type { StrategicRoadmapData } from '../types';

const ImpactMeter: React.FC<{ value: number }> = ({ value }) => {
    const percentage = Math.max(0, Math.min(100, value || 0));
    const circumference = 2 * Math.PI * 36; // 2 * pi * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    let colorClass = 'text-green-400';
    if (percentage < 75) colorClass = 'text-yellow-400';
    if (percentage < 50) colorClass = 'text-red-400';

    return (
        <div className="relative h-40 w-40 shrink-0">
            <svg className="h-full w-full" viewBox="0 0 80 80">
                <circle className="text-gray-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="36" cx="40" cy="40"/>
                <circle
                    className={`${colorClass} transition-all duration-1000 ease-out`}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="36"
                    cx="40"
                    cy="40"
                    transform="rotate(-90 40 40)"
                    style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${colorClass}`}>
                <span className="text-4xl font-bold">{percentage}</span>
                <span className="text-sm font-semibold tracking-wider uppercase">IMPACT</span>
            </div>
        </div>
    );
};

const StepIcon: React.FC<{ step: number }> = ({ step }) => (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 border border-gray-700 text-teal-300 font-bold text-lg shrink-0">
        {step}
    </div>
);

export const StrategicRoadmap: React.FC<{ roadmap: StrategicRoadmapData }> = ({ roadmap }) => {
    const { missionStatement, projectedImpactScore, actionPlan } = roadmap;

    return (
        <div className="bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-700/60 shadow-2xl space-y-8 bg-grid-pattern-subtle">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-grow max-w-3xl text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400">
                        Your Strategic Roadmap
                    </h2>
                    <p className="mt-4 text-lg text-gray-300 italic">
                        "{missionStatement}"
                    </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Projected Impact</h3>
                    <ImpactMeter value={projectedImpactScore} />
                </div>
            </div>

            <div className="border-t border-gray-800 pt-8">
                <h3 className="text-xl font-bold text-center text-gray-200 mb-6">Your 3-Step Action Plan</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {actionPlan.map((item, index) => (
                        <div key={index} className="bg-gray-950/60 p-6 rounded-lg border border-gray-800/80 flex flex-col items-start gap-4 transition-all duration-300 hover:border-teal-500/50 hover:shadow-xl hover:-translate-y-1">
                            <StepIcon step={index + 1} />
                            <div>
                                <h4 className="font-bold text-lg text-teal-300">{item.title}</h4>
                                <p className="mt-2 text-sm text-gray-400">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                .bg-grid-pattern-subtle {
                    background-image:
                        linear-gradient(to right, rgba(37, 99, 235, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(37, 99, 235, 0.05) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
            `}</style>
        </div>
    );
};
