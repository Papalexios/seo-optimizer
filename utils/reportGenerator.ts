
import type { HistoricalAnalysis, ExecutiveSummary, StrategicRoadmapData, DailyActionPlan } from '../types';

const generateExecutiveSummaryMarkdown = (summary: ExecutiveSummary): string => {
    if (!summary) return '';
    let markdown = `## 🚀 ${summary.summaryTitle}\n\n`;
    markdown += `> ${summary.summaryIntroduction}\n\n`;

    if (summary.rewrites.length > 0) {
        markdown += `### Top Pages to Rewrite\n`;
        summary.rewrites.forEach(item => {
            markdown += `- **URL:** ${item.url}\n`;
            markdown += `  - **Action:** ${item.instruction}\n`;
            markdown += `  - **Reason:** ${item.reason}\n`;
        });
        markdown += `\n`;
    }

    if (summary.optimizations.length > 0) {
        markdown += `### Top Pages to Optimize\n`;
        summary.optimizations.forEach(item => {
            markdown += `- **URL:** ${item.url}\n`;
            markdown += `  - **Action:** ${item.instruction}\n`;
            markdown += `  - **Reason:** ${item.reason}\n`;
        });
        markdown += `\n`;
    }

    if (summary.newContent.length > 0) {
        markdown += `### Top New Content Ideas\n`;
        summary.newContent.forEach(item => {
            markdown += `- **Title:** ${item.title}\n`;
            markdown += `  - **Topic:** ${item.topic}\n`;
            markdown += `  - **Reason:** ${item.reason}\n`;
        });
        markdown += `\n`;
    }

    if (summary.redirects.length > 0) {
        markdown += `### Critical Redirects\n`;
        summary.redirects.forEach(item => {
            markdown += `- **From:** ${item.from}\n`;
            markdown += `  - **To:** ${item.to}\n`;
            markdown += `  - **Reason:** ${item.reason}\n`;
        });
        markdown += `\n`;
    }
    return markdown;
};

const generateStrategicRoadmapMarkdown = (roadmap: StrategicRoadmapData): string => {
    if (!roadmap) return '';
    let markdown = `## 🗺️ Strategic Roadmap\n\n`;
    markdown += `**Mission:** *${roadmap.missionStatement}*\n\n`;
    markdown += `### 3-Step Action Plan\n`;
    roadmap.actionPlan.forEach((step, index) => {
        markdown += `${index + 1}. **${step.title}**: ${step.description}\n`;
    });
    markdown += `\n`;
    return markdown;
};

const generateDailyActionPlanMarkdown = (actionPlan: DailyActionPlan[]): string => {
    if (!actionPlan || actionPlan.length === 0) return '';
    let markdown = `## 🗓️ Daily Action Plan Summary\n\n`;
    actionPlan.forEach(day => {
        markdown += `### Day ${day.day}: ${day.focus}\n`;
        day.actions.forEach(action => {
            markdown += `- [ ] ${action.title} (*Priority: ${action.priority}*)\n`;
        });
        markdown += `\n`;
    });
    return markdown;
};


export const generateReportMarkdown = (analysis: HistoricalAnalysis): string => {
    let report = `# SEO Strategy Report for ${analysis.sitemapUrl}\n\n`;
    report += `*Generated on ${new Date(analysis.date).toUTCString()}*\n\n`;
    report += `------------------------------\n\n`;

    if (analysis.executiveSummary) {
        report += generateExecutiveSummaryMarkdown(analysis.executiveSummary);
        report += `------------------------------\n\n`;
    }

    if (analysis.sitewideAnalysis?.strategicRoadmap) {
        report += generateStrategicRoadmapMarkdown(analysis.sitewideAnalysis.strategicRoadmap);
        report += `------------------------------\n\n`;
    }

    if (analysis.actionPlan) {
        report += generateDailyActionPlanMarkdown(analysis.actionPlan);
    }

    return report;
};
