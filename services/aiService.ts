

import { GoogleGenAI } from "@google/genai";
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { getSystemInstruction, USER_PROMPT_TEMPLATE, getSitewideAuditSystemInstruction, SITEWIDE_AUDIT_USER_PROMPT_TEMPLATE, IMPLEMENTATION_GUIDE_SYSTEM_INSTRUCTION, IMPLEMENTATION_GUIDE_USER_PROMPT_TEMPLATE, COMPETITOR_DISCOVERY_SYSTEM_INSTRUCTION, EXECUTIVE_SUMMARY_SYSTEM_INSTRUCTION, EXECUTIVE_SUMMARY_USER_PROMPT_TEMPLATE } from '../constants';
import type { SeoAnalysisResult, GroundingSource, AnalysisType, SnippetOpportunity, SerpInsights, SitewideAnalysis, PagePerformance, AiConfig, ActionItem, ExecutiveSummary } from "../types";

// --- AI HARDENING: RETRY LOGIC & ROBUST PARSING ---
const withRetry = async <T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> => {
    let lastError: Error | undefined;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            console.warn(`Attempt ${i + 1} failed for ${fn.name}. Retrying in ${delay}ms...`, error);
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay * (i + 1)));
            }
        }
    }
    throw lastError;
};

const extractJsonFromString = (text: string): string | null => {
    const markdownMatch = text.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[2]) {
        try {
            const potentialJson = markdownMatch[2].trim();
            JSON.parse(potentialJson);
            return potentialJson;
        } catch (e) { /* Ignore parsing error here, try the next method */ }
    }
    let braceCount = 0;
    let startIndex = -1;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') {
            if (braceCount === 0) startIndex = i;
            braceCount++;
        } else if (text[i] === '}') {
            if (startIndex === -1) continue;
            braceCount--;
            if (braceCount === 0) {
                const potentialJson = text.substring(startIndex, i + 1);
                try {
                    JSON.parse(potentialJson);
                    return potentialJson;
                } catch (e) { startIndex = -1; }
            }
        }
    }
    return null;
};

const robustJsonParse = <T>(text: string, validator: (data: any) => data is T, context: string): T => {
    if (!text || typeof text !== 'string' || text.trim() === '') {
        throw new Error(`The AI returned an empty or invalid response for ${context}.`);
    }
    const commonErrors = ["i apologize", "cannot", "api key not valid", "rate limit"];
    const lowerCaseText = text.toLowerCase();
    if (commonErrors.some(err => lowerCaseText.includes(err))) {
         throw new Error(`The AI returned a blocking error: "${text.slice(0, 100)}..."`);
    }
    const jsonString = extractJsonFromString(text);
    if (!jsonString) {
        throw new Error(`Could not find a valid JSON object in the AI's response.`);
    }
    let data;
    try {
        data = JSON.parse(jsonString);
    } catch (e) {
        throw new Error(`The AI returned a malformed JSON object that could not be parsed.`);
    }
    if (!validator(data)) {
        throw new Error(`The AI returned a JSON object with a missing or incorrect structure for ${context}.`);
    }
    return data;
}

const validateSeoAnalysisResult = (data: any): data is SeoAnalysisResult => {
    return 'pageActions' in data && 'keywords' in data && Array.isArray(data.pageActions) && Array.isArray(data.keywords);
}

const validateSitewideAnalysis = (data: any): data is SitewideAnalysis => (
    'strategicRoadmap' in data &&
    'technicalHealth' in data &&
    'contentGaps' in data &&
    'topicClusters' in data &&
    'siteArchitectureGraph' in data &&
    'localBusinessAudit' in data &&
    'zeroToOneInitiatives' in data &&
    Array.isArray(data.contentGaps) &&
    Array.isArray(data.topicClusters) &&
    Array.isArray(data.zeroToOneInitiatives) &&
    typeof data.strategicRoadmap.projectedImpactScore === 'number'
);

const validateImplementationGuide = (data: any): data is Omit<ActionItem, 'id' | 'title' | 'type' | 'completed'> => {
  return (
    'priority' in data &&
    'impact' in data &&
    'estimatedTime' in data &&
    'dependencies' in data && Array.isArray(data.dependencies) &&
    'toolsRequired' in data && Array.isArray(data.toolsRequired) &&
    'stepByStepImplementation' in data && Array.isArray(data.stepByStepImplementation) &&
    'prompts' in data && Array.isArray(data.prompts) &&
    'verificationChecklist' in data && Array.isArray(data.verificationChecklist) &&
    'successVerification' in data && Array.isArray(data.successVerification) &&
    'nextSteps' in data && Array.isArray(data.nextSteps)
  );
};

const validateExecutiveSummary = (data: any): data is ExecutiveSummary => {
  return (
    'summaryTitle' in data && typeof data.summaryTitle === 'string' &&
    'summaryIntroduction' in data && typeof data.summaryIntroduction === 'string' &&
    'rewrites' in data && Array.isArray(data.rewrites) &&
    'optimizations' in data && Array.isArray(data.optimizations) &&
    'newContent' in data && Array.isArray(data.newContent) &&
    'redirects' in data && Array.isArray(data.redirects)
  );
};


// --- UNIVERSAL AI CALL FUNCTION ---
interface CallAiOptions {
    useGoogleSearch?: boolean;
    responseMimeType?: 'application/json' | 'text/plain';
}

const callAi = async (
    config: AiConfig,
    systemInstruction: string,
    userPrompt: string,
    options: CallAiOptions = {}
): Promise<{ text: string, sources?: GroundingSource[] }> => {
    const { provider, apiKey, model } = config;
    const { useGoogleSearch = false, responseMimeType = 'text/plain' } = options;

    switch (provider) {
        case 'gemini': {
            const ai = new GoogleGenAI({ apiKey });
            const modelName = model || 'gemini-2.5-flash';
            const tools = useGoogleSearch ? [{ googleSearch: {} }] : undefined;
            const response = await ai.models.generateContent({
                model: modelName,
                contents: userPrompt,
                config: {
                    systemInstruction,
                    tools,
                    // Defensive programming: Unconditionally set mime type to undefined if tools are present,
                    // as Gemini API forbids using tools with a forced JSON response.
                    responseMimeType: tools ? undefined : responseMimeType,
                },
            });
            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
                ?.map(c => c.web)
                .filter(s => s?.uri)
                .map(s => ({ uri: s.uri, title: s.title || '' }))
                .filter((s, i, self) => i === self.findIndex(t => t.uri === s.uri)) ?? [];
            return { text: response.text, sources };
        }
        case 'openai':
        case 'openrouter': {
            const client = new OpenAI({
                apiKey,
                dangerouslyAllowBrowser: true,
                ...(provider === 'openrouter' && {
                    baseURL: 'https://openrouter.ai/api/v1',
                    defaultHeaders: {
                        'HTTP-Referer': 'https://orchestrator.ai', // Replace with actual site
                        'X-Title': 'Orchestrator AI', // Replace with actual site
                    },
                })
            });
            const modelName = provider === 'openrouter' 
                ? model || 'openai/gpt-4o'
                : model || 'gpt-4o';
            const response = await client.chat.completions.create({
                model: modelName,
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: userPrompt }
                ],
                ...(responseMimeType === 'application/json' && { response_format: { type: 'json_object' } })
            });
            return { text: response.choices[0].message.content || '' };
        }
        case 'anthropic': {
            const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
            const modelName = model || 'claude-3-5-sonnet-20240620';
            const response = await client.messages.create({
                model: modelName,
                system: systemInstruction,
                messages: [{ role: 'user', content: userPrompt }],
                max_tokens: 4096, // Anthropic requires max_tokens
            });
            const textContent = response.content.reduce((acc, block) => {
                if ('text' in block) {
                    return acc + block.text;
                }
                return acc;
            }, '');
            return { text: textContent };
        }
        default:
            throw new Error(`Unsupported AI provider: ${provider}`);
    }
};

export const discoverCompetitors = async (aiConfig: AiConfig, userUrl: string): Promise<string[]> => {
    if (aiConfig.provider !== 'gemini') {
        console.warn("Competitor discovery is only available for Gemini provider.");
        return [];
    }

    const validator = (data: any): data is { sitemaps: string[] } => {
        return 'sitemaps' in data && Array.isArray(data.sitemaps) && data.sitemaps.every((s: any) => typeof s === 'string');
    };
    
    const userPrompt = `The user's website is: ${userUrl}`;

    const { text } = await callAi(
        aiConfig,
        COMPETITOR_DISCOVERY_SYSTEM_INSTRUCTION,
        userPrompt,
        { useGoogleSearch: true }
    );
    const result = robustJsonParse(text, validator, 'CompetitorSitemaps');
    return result.sitemaps;
};

// --- REFACTORED SERVICE FUNCTIONS ---
export const generateSitewideAudit = async (aiConfig: AiConfig, urls: string[], competitorUrls: string[], analysisType: AnalysisType, location?: string, onLog: (message: string) => void = () => {}): Promise<SitewideAnalysis> => {
    return withRetry(async () => {
       onLog('Analyzing competitor strengths...');
       const userPrompt = SITEWIDE_AUDIT_USER_PROMPT_TEMPLATE
           .replace('${USER_URL_LIST}', urls.join('\n'))
           .replace('${COMPETITOR_URL_LIST}', competitorUrls.join('\n'));
       const systemInstruction = getSitewideAuditSystemInstruction(aiConfig.provider);
       
       onLog(`Sending request to ${aiConfig.provider} for Sitewide Audit...`);
       const { text } = await callAi(aiConfig, systemInstruction, userPrompt, { useGoogleSearch: true });
       
       onLog(`Received response from ${aiConfig.provider}. Validating structure...`);
       const result = robustJsonParse(text, validateSitewideAnalysis, 'SitewideAnalysis');
       onLog('Validated sitewide audit.');
       return result;
   });
};

export const generateSeoAnalysis = async (aiConfig: AiConfig, urls: string[], analysisType: AnalysisType, location: string | undefined, strategicGoals: string[], onLog: (message: string) => void = () => {}): Promise<{ analysis: SeoAnalysisResult, sources: GroundingSource[] }> => {
    return withRetry(async () => {
        onLog('Analyzing individual page strengths and weaknesses...');
        const userPrompt = USER_PROMPT_TEMPLATE
            .replace('${URL_LIST}', urls.join('\n'));
        const systemInstruction = getSystemInstruction(aiConfig.provider, analysisType, location, strategicGoals);
        
        onLog(`Sending request to ${aiConfig.provider} with Google Search grounding...`);
        const { text, sources } = await callAi(aiConfig, systemInstruction, userPrompt, { useGoogleSearch: true });
        
        onLog(`Received response from ${aiConfig.provider}. Extracting sources and validating structure...`);
        const analysis = robustJsonParse(text, validateSeoAnalysisResult, 'SeoAnalysisResult');
        onLog('Validated page-level analysis.');
        return { analysis, sources: sources || [] };
    });
};

export const generateImplementationGuide = async (
    aiConfig: AiConfig,
    taskTitle: string,
    taskType: ActionItem['type'],
    taskContext: string
): Promise<Omit<ActionItem, 'id' | 'title' | 'type' | 'completed'>> => {
    return withRetry(async () => {
        const userPrompt = IMPLEMENTATION_GUIDE_USER_PROMPT_TEMPLATE
            .replace('${taskType}', taskType)
            .replace('${taskTitle}', taskTitle)
            .replace('${taskContext}', taskContext);

        const { text } = await callAi(
            aiConfig,
            IMPLEMENTATION_GUIDE_SYSTEM_INSTRUCTION,
            userPrompt,
            { responseMimeType: 'application/json' }
        );
        
        return robustJsonParse(text, validateImplementationGuide, `ImplementationGuide for ${taskTitle}`);
    });
};

export const generateExecutiveSummary = async (
    aiConfig: AiConfig,
    sitewideAnalysis: SitewideAnalysis,
    seoAnalysis: SeoAnalysisResult
): Promise<ExecutiveSummary> => {
    return withRetry(async () => {
        const fullAnalysisData = {
            sitewideAnalysis,
            seoAnalysis
        };

        const userPrompt = EXECUTIVE_SUMMARY_USER_PROMPT_TEMPLATE
            .replace('${analysisJson}', JSON.stringify(fullAnalysisData, null, 2));

        const { text } = await callAi(
            aiConfig,
            EXECUTIVE_SUMMARY_SYSTEM_INSTRUCTION,
            userPrompt,
            { responseMimeType: 'application/json' }
        );
        
        return robustJsonParse(text, validateExecutiveSummary, 'ExecutiveSummary');
    });
};