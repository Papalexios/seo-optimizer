
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ErrorMessage } from './components/ErrorMessage';
import { HistoryPanel } from './components/HistoryPanel';
import {
  generateSitewideAudit,
  generateSeoAnalysis,
  generateExecutiveSummary,
} from './services/aiService';
import { rankUrls } from './utils/seoScoring';
import { crawlSitemap } from './services/crawlingService';
import { createActionPlan } from './services/actionPlanService';
import type { HistoricalAnalysis, CrawlProgress, AnalysisLogEntry, GscSite, GscTokenResponse, AiConfig, SitemapUrlEntry } from './types';
import { AnalysisInProgress } from './components/AnalysisInProgress';
import { CrawlingAnimation } from './components/CrawlingAnimation';
import { GuidedAnalysisWizard, type WizardSubmitData } from './components/GuidedAnalysisWizard';
import { Modal } from './components/Modal';
import { GoogleSearchConsoleConnect } from './components/GoogleSearchConsoleConnect';
import { AiConfiguration } from './components/AiConfiguration';
import { ActionPlanDashboard } from './components/ActionPlanDashboard';

const HISTORY_STORAGE_KEY = 'seo-analyzer-history-v13';
const AI_CONFIG_STORAGE_KEY = 'seo-analyzer-ai-config-v13';

type AppState = 'idle' | 'loading' | 'results' | 'error' | 'configure_ai';

const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<HistoricalAnalysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  
  const [appState, setAppState] = useState<AppState>('idle');
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState<boolean>(false);
  const [crawlProgress, setCrawlProgress] = useState<CrawlProgress | null>(null);
  const [analysisLog, setAnalysisLog] = useState<AnalysisLogEntry[]>([]);

  const [gscToken, setGscToken] = useState<GscTokenResponse | null>(null);
  const [gscSites, setGscSites] = useState<GscSite[]>([]);
  const [isGscModalOpen, setIsGscModalOpen] = useState<boolean>(false);
  const [aiConfig, setAiConfig] = useState<AiConfig | null>(null);
  
  const isGscConnected = useMemo(() => !!gscToken, [gscToken]);

  const analysisToDisplay = useMemo(() => {
    if (!selectedAnalysisId) return null;
    return analysisHistory.find(h => h.id === selectedAnalysisId) ?? null;
  }, [selectedAnalysisId, analysisHistory]);

  const updateAnalysisInHistory = (id: string, updatedAnalysis: Partial<HistoricalAnalysis>) => {
    const updatedHistory = analysisHistory.map(h => h.id === id ? { ...h, ...updatedAnalysis } : h);
    setAnalysisHistory(updatedHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const handleToggleTaskComplete = useCallback((actionItemId: string) => {
    if (!analysisToDisplay || !analysisToDisplay.actionPlan) return;

    const newActionPlan = analysisToDisplay.actionPlan.map(day => ({
      ...day,
      actions: day.actions.map(action =>
        action.id === actionItemId
          ? { ...action, completed: !action.completed }
          : action
      ),
    }));

    updateAnalysisInHistory(analysisToDisplay.id, { actionPlan: newActionPlan });
  }, [analysisToDisplay, analysisHistory]);

  useEffect(() => {
    try {
        const storedConfig = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
        if (storedConfig) {
            setAiConfig(JSON.parse(storedConfig));
        } else {
            setAppState('configure_ai');
        }

        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
            const history = JSON.parse(storedHistory) as HistoricalAnalysis[];
            setAnalysisHistory(history);
            if (history.length > 0 && storedConfig) {
                const latestAnalysisId = history[0].id;
                setSelectedAnalysisId(latestAnalysisId);
                setAppState('results');
            }
        }
    } catch (e) {
        console.error("Failed to parse from localStorage", e);
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        localStorage.removeItem(AI_CONFIG_STORAGE_KEY);
        setAppState('configure_ai');
    }
  }, []);

  const handleNewAnalysis = () => {
    setSelectedAnalysisId(null);
    setAppState(aiConfig ? 'idle' : 'configure_ai');
    setError(null);
  };
  
  const handleAiConfigChange = (config: AiConfig) => {
    setAiConfig(config);
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config));
    setAppState('idle');
  }
  
  const handleAiSettingsChange = () => {
    setAppState('configure_ai');
  };

  const log = (message: string, status: AnalysisLogEntry['status'] = 'running') => {
      setAnalysisLog(prev => [...prev, { timestamp: new Date().toISOString(), message, status }]);
  }

  const handleSubmit = useCallback(async (data: WizardSubmitData) => {
    if (!data.sitemapUrl) {
      setError('Please enter your sitemap.xml URL.');
      setAppState('error');
      return;
    }
    if (!aiConfig) {
      setError('AI Provider is not configured.');
      setAppState('configure_ai');
      return;
    }
    
    let initialSitemapUrl: URL;
    try {
        initialSitemapUrl = new URL(data.sitemapUrl);
    } catch (_) {
        setError('Please enter a valid sitemap URL (e.g., https://example.com/sitemap.xml).');
        setAppState('error');
        return;
    }
    
    const competitorUrls = data.competitorSitemaps.split('\n').map(u => u.trim()).filter(Boolean);

    setAppState('loading');
    setError(null);
    setSelectedAnalysisId(null);
    setCrawlProgress(null);
    setAnalysisLog([]);
    
    try {
      log('Crawling your sitemap...', 'running');
      const urlEntries: SitemapUrlEntry[] = await crawlSitemap(initialSitemapUrl.toString(), (progress: CrawlProgress) => {
        requestAnimationFrame(() => {
            setCrawlProgress(progress);
        });
      });
      log(`Found ${urlEntries.length} URLs in your sitemap.`, 'complete');

      if (urlEntries.length === 0) {
          throw new Error("Crawl complete, but no URLs were found. Your sitemap might be empty or in a format that could not be parsed.");
      }
      
      const rankedUrls = rankUrls(urlEntries);
      log(`Scored and prioritized ${rankedUrls.length} relevant pages.`, 'complete');
      
      log('Initiating Sitewide Strategic Audit...', 'running');
      const sitewideAnalysis = await generateSitewideAudit(
        aiConfig,
        rankedUrls, 
        competitorUrls, 
        data.analysisType, 
        data.targetLocation, 
        (msg) => log(msg)
      );
      log('Sitewide Strategic Audit complete.', 'complete');
      
      const strategicGoals = sitewideAnalysis.strategicRoadmap.actionPlan.map(item => item.title);

      log('Generating Page-Level Action Plan...', 'running');
      const { analysis, sources } = await generateSeoAnalysis(
        aiConfig,
        rankedUrls, 
        data.analysisType, 
        data.targetLocation,
        strategicGoals,
        (msg) => log(msg)
      );
      log('Page-Level Action Plan complete.', 'complete');
      
      log('Generating Step-by-Step Implementation Plan...', 'running');
      const actionPlan = await createActionPlan(aiConfig, sitewideAnalysis, analysis, (msg) => log(msg));
      log('Implementation Plan generated successfully.', 'complete');

      log('Synthesizing 80/20 Executive Action Plan...', 'running');
      const executiveSummary = await generateExecutiveSummary(aiConfig, sitewideAnalysis, analysis);
      log('Executive Action Plan complete.', 'complete');

      const newAnalysis: HistoricalAnalysis = {
        id: new Date().toISOString(),
        date: new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        sitemapUrl: data.url,
        competitorSitemaps: competitorUrls,
        sitewideAnalysis: sitewideAnalysis,
        analysis: analysis,
        sources: sources,
        analysisType: data.analysisType,
        location: data.targetLocation,
        actionPlan: actionPlan,
        executiveSummary: executiveSummary,
      };
      
      const updatedHistory = [newAnalysis, ...analysisHistory].slice(0, 10);
      setAnalysisHistory(updatedHistory);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

      setSelectedAnalysisId(newAnalysis.id);
      setAppState('results');

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(errorMessage);
      log(`Analysis failed: ${errorMessage}`, 'error');
      setAppState('error');
    }
  }, [aiConfig, analysisHistory]);

  const handleGscConnect = (token: GscTokenResponse, sites: GscSite[]) => {
    setGscToken(token);
    setGscSites(sites);
    setIsGscModalOpen(false);
  };

  const handleGscDisconnect = () => {
    setGscToken(null);
    setGscSites([]);
  };

  const renderContent = () => {
    switch (appState) {
        case 'configure_ai':
            return (
              <div className="max-w-3xl mx-auto mt-10">
                <AiConfiguration
                    onConfigured={handleAiConfigChange}
                    currentConfig={aiConfig}
                />
              </div>
            );
        case 'loading':
            return crawlProgress ? (
                <CrawlingAnimation progress={crawlProgress} />
            ) : (
                <AnalysisInProgress log={analysisLog} />
            );
        case 'results':
            if (analysisToDisplay && aiConfig) {
                 return (
                    <div className="mt-8 animate-fade-in">
                        <ActionPlanDashboard
                            analysis={analysisToDisplay}
                            onToggleTaskComplete={handleToggleTaskComplete}
                            aiConfig={aiConfig}
                            isGscConnected={isGscConnected}
                            onConnectGscClick={() => setIsGscModalOpen(true)}
                            gscToken={gscToken}
                        />
                    </div>
                 );
            }
             handleNewAnalysis(); 
             return <GuidedAnalysisWizard isLoading={false} onSubmit={handleSubmit} gscSites={gscSites} isGscConnected={isGscConnected} isAiConfigured={!!aiConfig} aiConfig={aiConfig} onAiSettingsClick={handleAiSettingsChange} />;
        case 'error':
            return (
                <div className="mt-8 text-center animate-fade-in">
                     {error && <ErrorMessage message={error} />}
                     {analysisLog.length > 0 && <div className="mt-6"><AnalysisInProgress log={analysisLog} /></div>}
                     <button
                        onClick={handleNewAnalysis}
                        className="mt-8 text-sm font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/30"
                    >
                        Start New Analysis
                    </button>
                </div>
            );

        case 'idle':
        default:
            return (
                 <GuidedAnalysisWizard 
                    isLoading={false}
                    onSubmit={handleSubmit}
                    gscSites={gscSites}
                    isGscConnected={isGscConnected}
                    isAiConfigured={!!aiConfig}
                    aiConfig={aiConfig}
                    onAiSettingsClick={handleAiSettingsChange}
                />
            );
    }
  }


  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans">
       {isGscModalOpen && (
         <Modal title="Connect Google Search Console" onClose={() => setIsGscModalOpen(false)}>
            <GoogleSearchConsoleConnect 
                onConnect={handleGscConnect}
                onDisconnect={handleGscDisconnect}
                isConnected={isGscConnected}
            />
         </Modal>
       )}
      <div className="flex">
        <HistoryPanel
            history={analysisHistory}
            selectedId={selectedAnalysisId}
            isOpen={isHistoryPanelOpen}
            onClose={() => setIsHistoryPanelOpen(false)}
            onSelect={(id) => {
                if (aiConfig) {
                    setSelectedAnalysisId(id);
                    setAppState('results');
                    setError(null);
                    setIsHistoryPanelOpen(false); // Close panel on mobile after selection
                } else {
                    setAppState('configure_ai');
                }
            }}
            onClear={() => {
                setAnalysisHistory([]);
                setSelectedAnalysisId(null);
                localStorage.removeItem(HISTORY_STORAGE_KEY);
                handleGscDisconnect();
                handleNewAnalysis();
            }}
        />
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto" style={{ height: '100vh' }}>
            <div className="max-w-7xl mx-auto">
                <Header 
                    onMenuClick={() => setIsHistoryPanelOpen(true)}
                    showNewAnalysisButton={appState === 'results'}
                    onNewAnalysisClick={handleNewAnalysis}
                    isGscConnected={isGscConnected}
                    onConnectClick={() => setIsGscModalOpen(true)}
                    isAiConfigured={!!aiConfig}
                    onAiSettingsClick={handleAiSettingsChange}
                />
                <main>
                    {renderContent()}
                </main>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
