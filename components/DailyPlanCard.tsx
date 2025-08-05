
import React from 'react';
import type { DailyActionPlan } from '../types';
import { ActionItemCard } from './ActionItemCard';

interface DailyPlanCardProps {
    plan: DailyActionPlan;
    onToggleTaskComplete: (actionItemId: string) => void;
}

export const DailyPlanCard: React.FC<DailyPlanCardProps> = ({ plan, onToggleTaskComplete }) => {
    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-teal-300 mb-1">Day {plan.day}: <span className="text-gray-200">{plan.focus}</span></h3>
            <p className="text-gray-400 mb-6">Complete these tasks to stay on track with your SEO roadmap.</p>

            <div className="space-y-4">
                {plan.actions.map(action => (
                    <ActionItemCard 
                        key={action.id}
                        actionItem={action}
                        onToggleTaskComplete={onToggleTaskComplete}
                    />
                ))}
            </div>
        </div>
    );
};
