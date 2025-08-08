
import type { SitewideAnalysis, SeoAnalysisResult, ActionItem, DailyActionPlan, AiConfig, PageAction, KeywordIdea, TechnicalAudit } from '../types';
import { generateImplementationGuide } from './aiService';
import { slugify } from '../utils/utility';

type RawTask = {
    id: string;
    title: string;
    type: ActionItem['type'];
    priority: ActionItem['priority'];
    context: string;
}

const collateTasks = (sitewideAnalysis: SitewideAnalysis, seoAnalysis: SeoAnalysisResult): RawTask[] => {
    const tasks: RawTask[] = [];

    // 1. Technical Health Action Items
    sitewideAnalysis.technicalHealth.actionItems.forEach(item => {
        tasks.push({
            id: slugify(`technical-${item.item}`),
            title: item.item,
            type: 'technical',
            priority: item.priority,
            context: `This is a site-wide technical SEO fix. The issue identified was: "${sitewideAnalysis.technicalHealth.summary}". The specific item to address is: "${item.item}".`
        });
    });

    // 2. Page-Level Actions (Content Updates/Rewrites)
    seoAnalysis.pageActions.forEach(action => {
        const title = action.rewriteDetails?.suggestedHeadline || `Optimize: ${action.url}`;
        tasks.push({
            id: slugify(action.url),
            title: title,
            type: 'content_update',
            priority: action.priority,
            context: `This is a content update for the existing page: ${action.url}. \nReason: ${action.rewriteDetails?.reason}. \nEvidence: ${action.rewriteDetails?.evidence}. \nOptimization Tasks: ${action.optimizationTasks?.map(t => t.task).join(', ') || 'N/A'}`
        });
    });

    // 3. New Content from Keyword Ideas
    seoAnalysis.keywords.forEach(keyword => {
        tasks.push({
            id: slugify(`new-content-${keyword.phrase}`),
            title: keyword.title,
            type: 'new_content',
            priority: 'medium', // Default priority for new content
            context: `This is a new piece of content based on a keyword opportunity. \nKeyword: "${keyword.phrase}". \nIntent: ${keyword.intent}. \nContent Angle: ${keyword.contentAngle}. \nStrategic Rationale: ${keyword.rationale}.`
        });
    });

    return tasks;
}

const prioritizeAndGroupTasks = (actionItems: ActionItem[]): DailyActionPlan[] => {
    const priorityOrder: Record<ActionItem['priority'], number> = { high: 1, medium: 2, low: 3 };
    const sortedActions = [...actionItems].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    const dailyPlans: DailyActionPlan[] = [];
    let currentDay = 1;
    let actionsForToday: ActionItem[] = [];

    const planStructure = [
        { focus: "Critical Technical Fixes & High-Impact Content", types: ['technical', 'content_update'], priorities: ['high'] },
        { focus: "High-Priority Content & New Opportunities", types: ['content_update', 'new_content'], priorities: ['high'] },
        { focus: "Medium-Priority Content Updates", types: ['content_update'], priorities: ['medium'] },
        { focus: "New Content Creation", types: ['new_content'], priorities: ['medium', 'low'] },
        { focus: "Low-Priority Optimizations", types: ['technical', 'content_update'], priorities: ['low'] },
    ];
    
    planStructure.forEach(phase => {
        const phaseActions = sortedActions.filter(action =>
            phase.types.includes(action.type) && phase.priorities.includes(action.priority)
        );

        if (phaseActions.length > 0) {
            dailyPlans.push({
                day: currentDay++,
                focus: phase.focus,
                actions: phaseActions
            });
        }
    });

    // Handle any remaining actions that didn't fit the structure
    const remainingActions = sortedActions.filter(action => 
        !dailyPlans.some(plan => plan.actions.some(a => a.id === action.id))
    );
    
    if (remainingActions.length > 0) {
        dailyPlans.push({
            day: currentDay++,
            focus: "Final Optimizations",
            actions: remainingActions
        });
    }

    return dailyPlans;
}

export const createActionPlan = async (
    aiConfig: AiConfig,
    sitewideAnalysis: SitewideAnalysis,
    seoAnalysis: SeoAnalysisResult,
    onLog: (message: string) => void
): Promise<DailyActionPlan[]> => {
    onLog("Collating all tasks from analysis...");
    const rawTasks = collateTasks(sitewideAnalysis, seoAnalysis);
    
    const actionItemPromises = rawTasks.map(task => {
        onLog(`Generating implementation guide for: "${task.title}"`);
        return generateImplementationGuide(aiConfig, task.title, task.type, task.context)
            .then(guide => ({
                ...guide,
                id: task.id,
                title: task.title,
                type: task.type,
                completed: false,
            }))
            .catch(error => {
                console.error(`Failed to generate guide for task "${task.title}":`, error);
                // Return a fallback action item on error
                return {
                    id: task.id,
                    title: task.title,
                    type: task.type,
                    priority: task.priority,
                    impact: 1,
                    estimatedTime: "N/A",
                    dependencies: [],
                    toolsRequired: [],
                    stepByStepImplementation: ["AI failed to generate steps for this task. Please review the context manually."],
                    prompts: [],
                    verificationChecklist: [{ item: "Verify task was completed manually", checked: false }],
                    successVerification: [],
                    nextSteps: [],
                    completed: false,
                };
            });
    });

    const actionItems = await Promise.all(actionItemPromises);
    onLog("All implementation guides generated.");

    onLog("Prioritizing and grouping tasks into a daily plan...");
    const dailyPlans = prioritizeAndGroupTasks(actionItems as ActionItem[]);
    onLog("Action plan successfully structured.");
    
    return dailyPlans;
}