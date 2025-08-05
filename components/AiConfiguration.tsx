
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { AiProvider, AiConfig } from '../types';
import { validateApiKey } from '../services/aiValidationService';

interface AiConfigurationProps {
  onConfigured: (config: AiConfig) => void;
  currentConfig: AiConfig | null;
}

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

const providerDetails = {
  gemini: { name: 'Google Gemini', logo: '♊️', getLink: 'https://aistudio.google.com/app/apikey' },
  openai: { name: 'OpenAI', logo: '🧠', getLink: 'https://platform.openai.com/api-keys' },
  anthropic: { name: 'Anthropic Claude', logo: '✍️', getLink: 'https://console.anthropic.com/settings/keys' },
  openrouter: { name: 'OpenRouter', logo: '🔄', getLink: 'https://openrouter.ai/keys' },
};

const ValidationIndicator: React.FC<{ state: ValidationState, message?: string }> = ({ state, message }) => {
    switch(state) {
        case 'validating': return <div className="flex items-center gap-1 text-xs text-yellow-400"><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Validating...</span></div>;
        case 'valid': return <div className="flex items-center gap-1 text-xs text-green-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><span>API Key is valid</span></div>;
        case 'invalid': return <div className="flex items-center gap-1 text-xs text-red-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg><span>{message || 'Invalid API Key'}</span></div>;
        default: return null;
    }
}

export const AiConfiguration: React.FC<AiConfigurationProps> = ({ onConfigured, currentConfig }) => {
  const [provider, setProvider] = useState<AiProvider>(currentConfig?.provider || 'gemini');
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [model, setModel] = useState(currentConfig?.model || '');
  const [validationState, setValidationState] = useState<ValidationState>(currentConfig ? 'valid' : 'idle');
  const [validationMessage, setValidationMessage] = useState<string>('');
  
  const debouncedValidate = useCallback((config: AiConfig) => {
    if (!config.apiKey) {
      setValidationState('idle');
      return;
    }
    setValidationState('validating');
    validateApiKey(config).then(({ success, message }) => {
      setValidationState(success ? 'valid' : 'invalid');
      setValidationMessage(message || '');
    });
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
        // Trim inputs before validation to prevent errors from accidental whitespace
        debouncedValidate({ provider, apiKey: apiKey.trim(), model: model.trim() });
    }, 500);
    return () => clearTimeout(handler);
  }, [provider, apiKey, model, debouncedValidate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationState === 'valid') {
      onConfigured({ provider, apiKey: apiKey.trim(), model: model.trim() });
    }
  };
  
  return (
    <div className="bg-gray-900/50 p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-700/60 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-200">Configure AI Provider</h2>
        <p className="text-gray-400 mt-2">
            {currentConfig 
              ? 'View or update your AI provider settings below.'
              : 'Choose your preferred AI service and enter your API key to begin.'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">AI Provider</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(providerDetails) as AiProvider[]).map(p => (
              <button type="button" key={p} onClick={() => setProvider(p)} className={`p-3 text-center rounded-lg border-2 transition-all duration-200 ${provider === p ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-800/60 border-gray-700 hover:border-gray-600'}`}>
                <span className="text-2xl">{providerDetails[p].logo}</span>
                <span className="block text-sm font-semibold mt-1 text-gray-200">{providerDetails[p].name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
            <div className="flex justify-between items-baseline">
                <label htmlFor="apiKey" className="block text-sm font-semibold text-gray-400 mb-1">API Key</label>
                <ValidationIndicator state={validationState} message={validationMessage} />
            </div>
            <input id="apiKey" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} required placeholder={`Enter your ${providerDetails[provider].name} API Key`} className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 placeholder-gray-500" />
            <a href={providerDetails[provider].getLink} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-blue-400 hover:underline mt-1.5 inline-block">Where do I find my API key?</a>
        </div>

        {provider === 'openrouter' && (
          <div className="animate-fade-in">
            <label htmlFor="model" className="block text-sm font-semibold text-gray-400 mb-1">Model Name (Optional)</label>
            <input id="model" type="text" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g., mistralai/mixtral-8x7b-instruct" className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 placeholder-gray-500" />
            <p className="text-xs text-gray-500 mt-1.5">Leave blank to use the default (OpenAI GPT-4o).</p>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-800">
          <button type="submit" disabled={validationState !== 'valid'} className="w-full px-8 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200">
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
};
