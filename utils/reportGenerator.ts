
import type { HistoricalAnalysis, ExecutiveSummary, StrategicRoadmapData, DailyActionPlan, SitewideAnalysis } from '../types';

const generateExecutiveSummaryMarkdown = (summary: ExecutiveSummary): string => {
    if (!summary) return '';
    let markdown = `## 🚀 ${summary.summaryTitle}\n\n`;
    markdown += `> ${summary.summaryIntroduction}\n\n`;

    if (summary.contentDecay && summary.contentDecay.length > 0) {
        markdown += `### Predicted Content Decay\n`;
        summary.contentDecay.forEach(item => {
            markdown += `- **URL:** ${item.url}\n`;
            markdown += `  - **Action:** ${item.instruction}\n`;
            markdown += `  - **Reason:** ${item.reason}\n`;
        });
        markdown += `\n`;
    }

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
    let markdown = `## 🗓️ Detailed Daily Action Plan\n\n`;
    actionPlan.forEach(day => {
        markdown += `### Day ${day.day}: ${day.focus}\n\n`;
        day.actions.forEach(action => {
            markdown += `#### ☐ ${action.title}\n\n`;
            markdown += `*   **Type:** ${action.type.replace('_', ' ')}\n`;
            markdown += `*   **Priority:** ${action.priority}\n`;
            markdown += `*   **Impact:** ${action.impact}/10\n`;
            markdown += `*   **Estimated Time:** ${action.estimatedTime}\n\n`;
            
            markdown += `**Step-by-Step Implementation:**\n`;
            action.stepByStepImplementation.forEach((step, i) => {
                const cleanedStep = step.replace(/^\d+\.\s*/, '');
                markdown += `${i + 1}. ${cleanedStep}\n`;
            });
            markdown += `\n`;

            if (action.prompts && action.prompts.length > 0) {
                markdown += `**AI Prompts:**\n`;
                action.prompts.forEach(p => {
                    markdown += `*   **${p.title}**\n`;
                    markdown += '    ```\n' + p.prompt + '\n    ```\n\n';
                });
            }

            markdown += `**Verification Checklist:**\n`;
            action.verificationChecklist.forEach(check => {
                markdown += `- [ ] ${check.item}\n`;
            });
            markdown += `\n---\n\n`;
        });
    });
    return markdown;
};

const generateSitewideAuditMarkdown = (audit: SitewideAnalysis): string => {
    if (!audit) return '';
    let markdown = `## 🔍 Sitewide Audit Details\n\n`;
    
    // Technical Health
    if (audit.technicalHealth) {
        markdown += `### Technical Health: **${audit.technicalHealth.status.replace('_', ' ')}**\n`;
        markdown += `> ${audit.technicalHealth.summary}\n\n`;
        if (audit.technicalHealth.actionItems.length > 0) {
            markdown += `**Recommended Actions:**\n`;
            audit.technicalHealth.actionItems.forEach(item => {
                markdown += `- **${item.item}** (Priority: ${item.priority})\n`;
            });
            markdown += `\n`;
        }
    }

    // Zero-to-One Initiatives
    if (audit.zeroToOneInitiatives && audit.zeroToOneInitiatives.length > 0) {
        markdown += `### 💡 Zero-to-One Initiatives\n`;
        audit.zeroToOneInitiatives.forEach(item => {
            markdown += `#### ${item.initiativeName} (${item.initiativeType})\n`;
            markdown += `*   **Description:** ${item.description}\n`;
            markdown += `*   **Rationale:** ${item.strategicRationale}\n`;
            markdown += `*   **Impact/Effort:** ${item.impact}/${item.effort}\n\n`;
        });
    }

    // Content Gaps
    if (audit.contentGaps && audit.contentGaps.length > 0) {
        markdown += `### 🧩 Content Gaps\n`;
        audit.contentGaps.forEach(gap => {
            markdown += `#### ${gap.topic}\n`;
            markdown += `*   **Rationale:** ${gap.rationale}\n`;
            markdown += `*   **Suggested Title:** ${gap.suggestedTitle}\n`;
            markdown += `*   **Keywords:** ${gap.keywordIdeas.join(', ')}\n`;
            markdown += `*   **Impact/Effort:** ${gap.impact}/${gap.effort}\n\n`;
        });
    }
    
    // Topic Clusters
    if (audit.topicClusters && audit.topicClusters.length > 0) {
        markdown += `### 🕸️ Topic Clusters & Internal Linking\n`;
        audit.topicClusters.forEach(cluster => {
            markdown += `#### Cluster: ${cluster.clusterName}\n`;
            markdown += `*   **Pillar Page:** ${cluster.pillarPage}\n`;
            if (cluster.fortificationPlan.length > 0) {
                markdown += `*   **Linking Plan:**\n`;
                cluster.fortificationPlan.forEach(link => {
                    markdown += `    - Link from \`${link.linkFrom}\` to \`${link.linkTo}\` with anchor text "${link.anchorText}"\n`;
                });
            }
            markdown += `\n`;
        });
    }

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
        report += `------------------------------\n\n`;
    }

    if (analysis.sitewideAnalysis) {
        report += generateSitewideAuditMarkdown(analysis.sitewideAnalysis);
    }

    return report;
};
