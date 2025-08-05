import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GscSite, GscTokenResponse } from '../types';
import { fetchGscSites } from '../services/gscService';

const GSC_CLIENT_ID_STORAGE_KEY = 'seo-analyzer-gsc-client-id-v12';
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleSearchConsoleConnectProps {
    onConnect: (token: GscTokenResponse, sites: GscSite[]) => void;
    onDisconnect: () => void;
    isConnected: boolean;
}

export const GoogleSearchConsoleConnect: React.FC<GoogleSearchConsoleConnectProps> = ({ onConnect, onDisconnect, isConnected }) => {
    const [clientId, setClientId] = useState<string>(() => localStorage.getItem(GSC_CLIENT_ID_STORAGE_KEY) || '');
    const [inputClientId, setInputClientId] = useState<string>(clientId);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const clientRef = useRef<any>(null);
    
    const isClientConfigured = !!clientId;

    const initClient = useCallback(() => {
        if (!clientId) return;
        
        if (window.google?.accounts?.oauth2) {
            try {
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: clientId,
                    scope: GSC_SCOPE,
                    callback: async (tokenResponse: GscTokenResponse) => {
                        if (tokenResponse.error) {
                            setError(`Error: ${tokenResponse.error_description || 'An unknown error occurred during authentication.'}`);
                            setIsLoading(false);
                            return;
                        }
                        try {
                            const sites = await fetchGscSites(tokenResponse.access_token);
                            onConnect(tokenResponse, sites);
                        } catch (e) {
                             setError(e instanceof Error ? e.message : 'An unknown error occurred while fetching sites.');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                     error_callback: (error: any) => {
                        setError(`Initialization Error: ${error.message || 'Failed to initialize Google client. Please check if the Client ID is correct and popups are not blocked.'}`);
                        setIsLoading(false);
                     }
                });
                clientRef.current = client;
                setError(null);
            } catch (e) {
                setError(e instanceof Error ? `OAuth Client Error: ${e.message}` : 'An unknown error occurred initializing the OAuth client.');
            }
        } else {
             setError('Google Identity Services script not loaded. Please try refreshing the page.');
        }
    }, [clientId, onConnect]);

    useEffect(() => {
        if(isClientConfigured){
            initClient();
        }
    }, [isClientConfigured, initClient]);
    

    const handleConnect = () => {
        setError(null);
        setIsLoading(true);
        if (clientRef.current) {
            clientRef.current.requestAccessToken({prompt: 'consent'});
        } else {
            setError('Google Identity Services client is not initialized. Please check your Client ID and try again.');
            setIsLoading(false);
            // Attempt to re-initialize
            initClient();
        }
    };

    const handleSaveClientId = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedId = inputClientId.trim();
        if(trimmedId){
            localStorage.setItem(GSC_CLIENT_ID_STORAGE_KEY, trimmedId);
            setClientId(trimmedId);
            setError(null);
        } else {
            setError('Please enter a valid Google Client ID.');
        }
    };
    
    const handleChangeClientId = () => {
        setClientId('');
        setInputClientId('');
        localStorage.removeItem(GSC_CLIENT_ID_STORAGE_KEY);
        clientRef.current = null;
        setError(null);
    }
    
    if (isConnected) {
        return (
            <div className="text-center animate-fade-in py-4">
                 <p className="text-lg text-green-400 font-semibold mb-4">Successfully connected to Google Search Console.</p>
                 <p className="text-sm text-gray-400 mb-6">You can now use real performance data in your analysis.</p>
                 <button onClick={onDisconnect} className="px-6 py-2.5 font-semibold text-gray-300 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                    Disconnect
                </button>
            </div>
        )
    }

    if (!isClientConfigured) {
         return (
             <div className="text-center animate-fade-in">
                <form onSubmit={handleSaveClientId}>
                    <p className="text-base text-gray-300 mb-4">
                        To connect your account, please enter your Google Cloud OAuth 2.0 Client ID. This is stored in your browser and never sent to our servers.
                    </p>
                    {error && <p className="text-red-400 mb-4 bg-red-900/50 border border-red-500 p-3 rounded-lg text-sm">{error}</p>}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                            type="text"
                            value={inputClientId}
                            onChange={(e) => setInputClientId(e.target.value)}
                            placeholder="xxxx-xxxx.apps.googleusercontent.com"
                            className="flex-grow w-full px-4 py-3 bg-gray-800/80 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 placeholder-gray-500"
                            aria-label="Google Client ID"
                        />
                         <button
                            type="submit"
                            disabled={!inputClientId}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        >
                           Save & Continue
                        </button>
                    </div>
                </form>
             </div>
         );
    }

    return (
        <div className="text-center py-4">
            <p className="text-base text-gray-300 mb-4">Your Client ID is configured. Click below to open the Google consent screen and connect your account.</p>
            {error && <p className="text-red-400 mb-4 bg-red-900/50 border border-red-500 p-3 rounded-lg text-sm">{error}</p>}
            <button
                onClick={handleConnect}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-3 px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg hover:from-blue-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
            >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12.5C5,8.75 8.36,5.73 12.19,5.73C15.04,5.73 16.56,6.95 17.03,7.39L19.24,5.28C17.58,3.84 15.3,2.73 12.19,2.73C6.77,2.73 2.5,7.24 2.5,12.5C2.5,17.76 6.77,22.27 12.19,22.27C17.6,22.27 21.5,18.33 21.5,12.81C21.5,12.09 21.43,11.59 21.35,11.1V11.1Z" /></svg>
                {isLoading ? 'Connecting...' : 'Connect with Google'}
            </button>
             <div className="mt-4">
                <button onClick={handleChangeClientId} className="text-xs text-gray-500 hover:text-gray-300 hover:underline">
                    Use a different Client ID
                </button>
            </div>
        </div>
    );
};
