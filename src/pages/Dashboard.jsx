import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, History, Grid, LogOut, Copy, Download, RefreshCw, Edit2, Camera, Briefcase, PlaySquare, FileText, PlusCircle, Bookmark, Send, X, CloudUpload, Check, Menu, Trash2, Star, Save, Link } from 'lucide-react';
import { API_BASE_URL } from "../config";
import {
    parseTokensFromHash,
    setSession,
    getSession,
    isSessionValid,
    clearSession,
    authorizedFetch,
    getLoginUrl,
    getLogoutUrl,
} from "../auth";

const Dashboard = () => {
    const navigate = useNavigate();

    // Structural UI States
    const [showModal, setShowModal] = useState(false);
    const [showConnectedAccounts, setShowConnectedAccounts] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Core Generation States
    const [inputText, setInputText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [activePlatform, setActivePlatform] = useState("instagram");
    const [generatedOutputs, setGeneratedOutputs] = useState({});

    // Copy Button Polish State
    const [isCopied, setIsCopied] = useState(false);

    // AI Typing states
    const [typedText, setTypedText] = useState("");
    const typingTimerRef = useRef(null);
    const captionRef = useRef(null);

    // Professional Toast Notification Array
    const [toasts, setToasts] = useState([]);

    const [showHistory, setShowHistory] = useState(false);
    const [historyItems, setHistoryItems] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyFilter, setHistoryFilter] = useState('all');

    // Saved Assets State
    const [showSavedAssets, setShowSavedAssets] = useState(false);
    const [savedAssets, setSavedAssets] = useState(() => {
        try {
            const stored = localStorage.getItem("aurora_saved_assets");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    const [isLoadingAssets, setIsLoadingAssets] = useState(false);

    // --- AUTH STATES ---
    const [token, setToken] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [userProfile, setUserProfile] = useState({ name: "User", picture: "" });

    // ── Auth bootstrap (runs ONCE) ──
    useEffect(() => {
        // 1. If URL has tokens from Hosted UI callback, parse ONCE
        const hash = window.location.hash;
        if (hash && hash.includes('id_token')) {
            const parsed = parseTokensFromHash(hash);
            if (parsed) {
                setSession(parsed);
                setToken(parsed.idToken);
                // Clean hash from URL so it's never re-parsed
                window.history.replaceState(
                    {},
                    document.title,
                    window.location.pathname + window.location.search
                );
                setAuthReady(true);
                return;
            }
        }

        // 2. Otherwise check localStorage for existing valid session
        if (isSessionValid()) {
            const session = getSession();
            setToken(session.idToken);
        }
        // Whether valid or not, auth check is done
        setAuthReady(true);
    }, []);

    // Extract user info from token
    useEffect(() => {
        if (token) {
            try {
                const payloadBase64Url = token.split('.')[1];
                const base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);

                const email = payload.email || "";
                const username = payload['cognito:username'] || "";

                let displayName = "User";
                if (email) {
                    displayName = email.split('@')[0];
                } else if (username) {
                    displayName = username;
                }

                setUserProfile({
                    name: displayName,
                    picture: payload.picture || ""
                });
            } catch (e) {
                console.error("Failed to parse token payload", e);
            }
        }
    }, [token]);

    const handleLogin = () => {
        window.location.href = getLoginUrl();
    };

    const handleLogout = () => {
        clearSession();
        setToken(null);
        window.location.href = getLogoutUrl();
    };


    const showToast = (type, message) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter(t => t.id !== id));
        }, 2500);
    };

    /** AI Response Extraction (Handles formats A/B/C/D/E) **/
    const extractResult = (payload) => {
        if (!payload) return "";
        if (payload.result) return payload.result;
        if (payload.body) {
            if (typeof payload.body === 'string') {
                try {
                    const parsedBody = JSON.parse(payload.body);
                    if (parsedBody.result) return parsedBody.result;
                } catch (e) { }
            } else if (typeof payload.body === 'object') {
                if (payload.body.result) return payload.body.result;
            }
        }
        if (payload.generatedText) return payload.generatedText;
        if (payload.message) return payload.message;
        return "";
    };

    /** Typing Effect + Auto-scroll Trigger **/
    useEffect(() => {
        const fullText = generatedOutputs[activePlatform] || "";
        setTypedText("");

        if (typingTimerRef.current) clearInterval(typingTimerRef.current);

        if (!fullText) return;

        let currentIndex = 0;
        typingTimerRef.current = setInterval(() => {
            currentIndex++;
            setTypedText(fullText.slice(0, currentIndex));

            // Auto scroll dynamically
            if (captionRef.current) {
                captionRef.current.scrollTop = captionRef.current.scrollHeight;
            }

            if (currentIndex >= fullText.length) {
                clearInterval(typingTimerRef.current);
            }
        }, 15);

        return () => {
            if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        };
    }, [generatedOutputs, activePlatform]);

    /** Close modal on ESC key **/
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && showHistory) {
                setShowHistory(false);
            }
        };
        if (showHistory) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showHistory]);

    /** API Triggers **/
    const handleGenerate = async () => {
        if (!inputText.trim()) {
            showToast("info", "Please add source material first.");
            return;
        }

        setIsGenerating(true);

        try {
            const response = await authorizedFetch(
                `${API_BASE_URL}/generate`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: inputText, platform: activePlatform }),
                }
            );

            if (response.status === 401) {
                showToast("error", "Session expired. Please log in again.");
                setIsGenerating(false);
                return;
            }

            const rawText = await response.text();

            let data;
            try {
                data = JSON.parse(rawText);
            } catch (jsonErr) {
                console.error("JSON parse error:", jsonErr);
                showToast("error", "Invalid JSON response from server.");
                setIsGenerating(false);
                return;
            }

            const output = extractResult(data);

            if (!output || !output.trim()) {
                showToast("error", "Generation returned empty content. Try again.");
                setIsGenerating(false);
                return;
            }

            setGeneratedOutputs((prev) => ({ ...prev, [activePlatform]: output }));
            showToast("success", `Content generated for ${activePlatform}`);

            // Silently refresh history in background (don't open drawer)
            fetchHistory(false).catch(() => { });
        } catch (error) {
            console.error("API Call Failed:", error);
            const errorMsg = error.message?.includes('fetch')
                ? "Network error. Check your connection and try again."
                : "Generation failed. Please try again.";
            showToast("error", errorMsg);
        } finally {
            setIsGenerating(false);
        }
    };

    const fetchHistory = async (openDrawer = true) => {
        setIsSidebarOpen(false);
        setIsLoadingHistory(true);
        try {
            const response = await authorizedFetch(
                `${API_BASE_URL}/history`,
                {}
            );

            if (response.status === 401) {
                showToast("error", "Session expired. Please log in again.");
                setIsLoadingHistory(false);
                return;
            }

            if (!response.ok) throw new Error(`History error: ${response.status}`);
            const data = await response.json();
            setHistoryItems(data.items || []);
            if (openDrawer) setShowHistory(true);
        } catch (err) {
            console.error("History fetch failed:", err);
            // Fallback: show empty history panel for demo
            setHistoryItems([]);
            if (openDrawer) {
                setShowHistory(true);
                showToast("info", "History unavailable — showing local session only");
            }
        } finally {
            setIsLoadingHistory(false);
        }
    };

    /** Delete History Item **/
    const deleteHistoryItem = async (e, requestId) => {
        e.stopPropagation();
        if (!requestId) return;
        try {
            const response = await authorizedFetch(
                `${API_BASE_URL}/history/${requestId}`,
                { method: "DELETE" }
            );
            if (response.ok) {
                setHistoryItems(prev => prev.filter(item => (item.requestId || item.sk) !== requestId));
                showToast("success", "History item deleted");
            } else {
                showToast("error", "Failed to delete item");
            }
        } catch (err) {
            console.error("Delete failed:", err);
            showToast("error", "Delete failed");
        }
    };

    /** Save Asset **/
    const handleSaveAsset = async () => {
        const content = generatedOutputs[activePlatform] || "";
        if (!content.trim()) {
            showToast("info", "Nothing to save yet.");
            return;
        }
        try {
            // Local fallback: The /assets API routes have not been deployed to AWS API Gateway yet.
            const newAsset = {
                sk: Date.now().toString(),
                platform: activePlatform,
                content: content,
                createdAt: new Date().toISOString()
            };

            const existingRaw = localStorage.getItem("aurora_saved_assets");
            const existingAssets = existingRaw ? JSON.parse(existingRaw) : [];
            const updatedAssets = [newAsset, ...existingAssets];

            localStorage.setItem("aurora_saved_assets", JSON.stringify(updatedAssets));

            // Sync with current view if panel is open
            setSavedAssets(updatedAssets);

            showToast("success", `Saved to ${activePlatform} assets ⭐`);
        } catch (err) {
            console.error("Save asset failed:", err);
            showToast("error", "Save failed");
        }
    };

    /** Fetch Saved Assets **/
    const fetchSavedAssets = async () => {
        setIsSidebarOpen(false);
        setIsLoadingAssets(true);
        try {
            // Local fallback matching save fallback
            const existingRaw = localStorage.getItem("aurora_saved_assets");
            const existingAssets = existingRaw ? JSON.parse(existingRaw) : [];

            setSavedAssets(existingAssets);
            setShowSavedAssets(true);
        } catch (err) {
            console.error("Assets fetch failed:", err);
            showToast("error", "Failed to load assets");
        } finally {
            setIsLoadingAssets(false);
        }
    };

    /** Filtered History Items **/
    const filteredHistory = historyFilter === 'all'
        ? historyItems
        : historyItems.filter(item => (item.response?.platform || '').toLowerCase() === historyFilter);

    /** Clipboard Actions **/
    const handleCopy = async () => {
        const textToCopy = generatedOutputs[activePlatform] || "";
        if (!textToCopy.trim()) {
            showToast("info", "Nothing to copy yet...");
            return;
        }

        try {
            await navigator.clipboard.writeText(textToCopy);
            showToast("success", "Copied ✅");
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1000);
        } catch (e) {
            console.error("Copy failed:", e);
            showToast("error", "Copy failed");
        }
    };

    /** Blob TXT Actions **/
    const handleDownload = () => {
        const textToDownload = generatedOutputs[activePlatform] || "";
        if (!textToDownload.trim()) {
            showToast("info", "Nothing to download yet.");
            return;
        }

        const element = document.createElement("a");
        const file = new Blob([textToDownload], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `aurora-${activePlatform}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        showToast("success", "Downloaded ✅");
    };

    /** View Helpers **/
    const platforms = [
        { id: 'instagram', icon: Camera, label: 'Instagram' },
        { id: 'linkedin', icon: Briefcase, label: 'LinkedIn' },
        { id: 'youtube', icon: PlaySquare, label: 'YouTube' },
        { id: 'blog', icon: FileText, label: 'Blog' }
    ];

    const charsTooShort = inputText.trim().length > 0 && inputText.trim().length < 10;
    const isOverLimit = inputText.length > 5000;
    const disableGenerate = isGenerating || charsTooShort || isOverLimit || inputText.trim().length === 0;

    if (!authReady) {
        return <div className="min-h-screen bg-background-dark flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div></div>;
    }

    if (!token) {
        return (
            <div className="bg-background-dark text-slate-100 font-display min-h-screen flex items-center justify-center overflow-hidden relative bg-[url('https://images.unsplash.com/photo-1579033461380-adb47c3eb938?ixlib=rb-4.0.3&auto=format&fit=crop&w=2564&q=80')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/80 to-black/80 backdrop-blur-md z-0"></div>
                <div className="relative z-10 w-full max-w-md p-8 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <div className="h-16 w-16 mb-6 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(77,136,255,0.4)]">
                        <svg className="text-white w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to Aurora AI</h2>
                    <p className="text-slate-400 text-sm text-center mb-8 px-4">Sign in to access your professional content studio and view your generation history.</p>
                    <button
                        onClick={handleLogin}
                        className="w-full py-3.5 px-4 bg-white text-black hover:bg-slate-200 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Sign in securely
                    </button>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-6">Powered by AWS Cognito</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-dark text-slate-100 font-display min-h-screen flex overflow-hidden selection:bg-primary/30 selection:text-white relative bg-[url('https://images.unsplash.com/photo-1579033461380-adb47c3eb938?ixlib=rb-4.0.3&auto=format&fit=crop&w=2564&q=80')] bg-cover bg-center">

            {/* Enhanced Glass Base Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-slate-900/70 to-black/70 backdrop-blur-md z-0"></div>

            {/* Premium Glass Toast Notification System Array Render */}
            <div className="fixed top-8 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toastItem) => (
                    <div key={toastItem.id} className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border bg-white/5 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto
                        ${toastItem.type === "success" ? "border-emerald-500/30 text-emerald-400"
                            : toastItem.type === "error" ? "border-rose-500/30 text-rose-400"
                                : "border-slate-500/30 text-slate-300"}`}>

                        {toastItem.type === "success" ? <Check className="w-5 h-5" />
                            : toastItem.type === "error" ? <X className="w-5 h-5" />
                                : <FileText className="w-5 h-5" />}

                        <span className="font-medium text-sm tracking-wide">{toastItem.message}</span>
                    </div>
                ))}
            </div>

            {/* Platform Settings Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-white font-bold text-base flex items-center gap-2">
                                <span className="text-xl">⚙️</span> Custom Context
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-300">Platform Target</label>
                                <input className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="e.g. Threads" type="text" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-300">Tone Requirements</label>
                                <textarea className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none" placeholder="e.g. Ensure emojis..." rows={3}></textarea>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-black/20 border-t border-white/10 flex items-center justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/5 hover:text-white transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => { setShowModal(false); showToast("info", "Custom context coming soon!"); }} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-primary to-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/20">
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Connected Accounts Modal */}
            {showConnectedAccounts && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-white font-bold text-base flex items-center gap-2">
                                <Link className="w-5 h-5 text-primary" />
                                Connected Accounts
                            </h3>
                            <button onClick={() => setShowConnectedAccounts(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Connect accounts to personalize content using previous posts and platform history.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => { showToast("info", "Instagram account integration coming soon"); }}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-lg transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Camera className="w-5 h-5 text-pink-400" />
                                        <span className="text-sm font-medium text-white">Connect Instagram</span>
                                    </div>
                                    <span className="text-xs text-slate-500 group-hover:text-slate-400">Not connected</span>
                                </button>
                                <button
                                    onClick={() => { showToast("info", "LinkedIn account integration coming soon"); }}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-lg transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="w-5 h-5 text-blue-400" />
                                        <span className="text-sm font-medium text-white">Connect LinkedIn</span>
                                    </div>
                                    <span className="text-xs text-slate-500 group-hover:text-slate-400">Not connected</span>
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-black/20 border-t border-white/10 flex items-center justify-end">
                            <button onClick={() => setShowConnectedAccounts(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/5 hover:text-white transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ HISTORY START */}
            {showHistory && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowHistory(false)}
                        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity"
                    />
                    {/* Drawer Panel */}
                    <div className="fixed inset-y-0 right-0 z-[80] w-full max-w-sm bg-slate-900/95 border-l border-white/10 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
                        <div className="px-6 py-5 border-b border-white/10 shrink-0 bg-black/20 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    <History className="w-5 h-5 text-primary" />
                                    History Logs
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={fetchHistory} className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-white/5 transition-all" title="Refresh History">
                                        <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button onClick={() => setHistoryItems([])} className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-white/5 transition-all" title="Clear Locally">
                                        <X className="w-4 h-4 text-rose-400/80" />
                                    </button>
                                    <div className="w-px h-5 bg-white/10 mx-1"></div>
                                    <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-white/5 transition-all" title="Close Drawer">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            {/* Platform Filter Chips */}
                            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                                {[{ id: 'all', label: 'All' }, ...platforms].map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setHistoryFilter(p.id)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border
                                            ${historyFilter === p.id
                                                ? 'bg-primary/20 text-primary border-primary/30'
                                                : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'}`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10"
                            ref={(el) => { if (el && showHistory) el.scrollTop = 0; }}
                        >
                            {isLoadingHistory ? (
                                // Shimmering Skeleton Loader for History
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 animate-pulse flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                                            <div className="h-3 w-16 bg-white/10 rounded-md"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 w-full bg-white/10 rounded-md"></div>
                                            <div className="h-3 w-4/5 bg-white/10 rounded-md"></div>
                                        </div>
                                    </div>
                                ))
                            ) : historyItems.length === 0 ? (
                                <div className="text-center py-10 flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                        <History className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <p className="text-slate-400 font-medium">No history yet.</p>
                                </div>
                            ) : (
                                filteredHistory.map((item, idx) => (
                                    <div
                                        key={item.requestId || item.sk || idx}
                                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 cursor-pointer transition-all duration-200 group relative block w-full text-left"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">{item.response?.platform || "Unknown"}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-500 font-medium">
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""}
                                                </span>
                                                <button
                                                    onClick={(e) => deleteHistoryItem(e, item.requestId || item.sk)}
                                                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity mb-3">
                                            {item.request?.text || item.response?.result || "No preview available..."}
                                        </p>
                                        {/* Reuse Prompt Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (item.request?.text) setInputText(item.request.text);
                                                if (item.response?.platform) {
                                                    setActivePlatform(item.response.platform);
                                                    if (item.response.result) {
                                                        setGeneratedOutputs(prev => ({ ...prev, [item.response.platform]: item.response.result }));
                                                    }
                                                }
                                                setShowHistory(false);
                                                showToast("success", "Prompt loaded — ready to regenerate");
                                            }}
                                            className="flex items-center gap-1.5 text-xs font-bold text-primary/80 hover:text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/10 hover:border-primary/20 transition-all"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            Reuse Prompt
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
            {/* ✅ HISTORY END */}

            {/* ✅ SAVED ASSETS START */}
            {showSavedAssets && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowSavedAssets(false)}
                        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity"
                    />
                    {/* Drawer Panel */}
                    <div className="fixed inset-y-0 right-0 z-[80] w-full max-w-sm bg-slate-900/95 border-l border-white/10 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
                        <div className="px-6 py-5 border-b border-white/10 shrink-0 bg-black/20 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    <Bookmark className="w-5 h-5 text-amber-400" />
                                    Saved Assets
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={fetchSavedAssets} className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-white/5 transition-all" title="Refresh Assets">
                                        <RefreshCw className={`w-4 h-4 ${isLoadingAssets ? 'animate-spin' : ''}`} />
                                    </button>
                                    <div className="w-px h-5 bg-white/10 mx-1"></div>
                                    <button onClick={() => setShowSavedAssets(false)} className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-white/5 transition-all" title="Close Drawer">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10"
                            ref={(el) => { if (el && showSavedAssets) el.scrollTop = 0; }}
                        >
                            {isLoadingAssets ? (
                                // Shimmering Skeleton Loader
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 animate-pulse flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                                            <div className="h-3 w-16 bg-white/10 rounded-md"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 w-full bg-white/10 rounded-md"></div>
                                            <div className="h-3 w-4/5 bg-white/10 rounded-md"></div>
                                        </div>
                                    </div>
                                ))
                            ) : savedAssets.length === 0 ? (
                                <div className="text-center py-10 flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                        <Bookmark className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <p className="text-slate-400 font-medium">No saved assets yet.</p>
                                    <p className="text-xs text-slate-500 text-center max-w-[200px]">Generate content and click the star icon to save it here.</p>
                                </div>
                            ) : (
                                savedAssets.map((asset, idx) => (
                                    <div
                                        key={asset.sk || idx}
                                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 cursor-pointer transition-all duration-200 group relative block w-full text-left"
                                        onClick={() => {
                                            if (asset.platform) {
                                                setActivePlatform(asset.platform);
                                                if (asset.content) {
                                                    setGeneratedOutputs(prev => ({ ...prev, [asset.platform]: asset.content }));
                                                }
                                            }
                                            setShowSavedAssets(false);
                                            showToast("success", "Asset loaded into editor");
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">{asset.platform || "Unknown"}</span>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity mb-3 whitespace-pre-wrap">
                                            {asset.content || "Empty asset..."}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        await navigator.clipboard.writeText(asset.content || "");
                                                        showToast("success", "Asset copied ✅");
                                                    } catch (err) {
                                                        showToast("error", "Failed to copy");
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10 transition-all"
                                            >
                                                <Copy className="w-3 h-3" />
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
            {/* ✅ SAVED ASSETS END */}

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
            )}

            {/* Sleek Integrated Sidebar UI */}
            <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-white/5 border-r border-white/10 backdrop-blur-3xl flex flex-col z-50 transform transition-transform duration-300 lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between gap-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(77,136,255,0.4)]">
                            <svg className="text-white w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path className="animate-pulse" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-white text-lg font-bold leading-tight">Aurora AI</h1>
                            <p className="text-slate-400 text-[11px] font-medium tracking-wide uppercase">Content Studio</p>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-none">
                    <div className="space-y-1">
                        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Menu</p>
                        <a onClick={(e) => { e.preventDefault(); showToast("info", "Workspace features coming soon!"); }} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/20 border border-primary/30 text-white shadow-sm transition-colors cursor-pointer" href="#">
                            <Grid className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold">Workspace</span>
                        </a>
                        <button onClick={fetchHistory} className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group">
                            <History className="w-4 h-4 group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium">History Logs</span>
                        </button>
                        <button onClick={fetchSavedAssets} className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group">
                            <Bookmark className="w-4 h-4 group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium">Saved Assets</span>
                        </button>
                    </div>
                </div>
                <div className="p-4 border-t border-white/5 space-y-2 bg-black/20 shrink-0">
                    <a onClick={(e) => { e.preventDefault(); setShowConnectedAccounts(true); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group cursor-pointer" href="#">
                        <Link className="w-5 h-5 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">Connected Accounts</span>
                    </a>
                    <a onClick={(e) => { e.preventDefault(); showToast("info", "Settings panel coming soon!"); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group cursor-pointer" href="#">
                        <Settings className="w-5 h-5 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">Settings</span>
                    </a>
                    <div className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl bg-white/5 border border-white/10 transition-colors">
                        {userProfile.picture ? (
                            <div className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 shrink-0 bg-white/10" style={{ backgroundImage: `url('${userProfile.picture}')` }}></div>
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(77,136,255,0.3)]">
                                <span className="text-white font-bold text-xs">{userProfile.name.charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                        <div className="flex flex-col flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate capitalize">{userProfile.name}</p>
                        </div>
                        <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 transition-colors p-1" title="Sign Out">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Application Body */}
            <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-2xl flex items-center justify-between px-4 sm:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1 text-slate-400 hover:text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-white text-sm tracking-wide font-bold hidden sm:block">Editor</h2>
                        <div className="h-4 w-px bg-white/20 mx-2 hidden lg:block"></div>
                        <div className="hidden lg:flex gap-1 bg-black/40 rounded-lg p-1 border border-white/10">
                            <button className="px-3 py-1 rounded bg-white/10 text-white text-xs font-bold shadow-sm">Professional</button>
                            <button onClick={() => showToast("info", "Additional tones coming soon!")} className="px-3 py-1 rounded text-slate-400 hover:text-white text-xs font-medium transition-colors">Friendly</button>
                            <button onClick={() => showToast("info", "Additional tones coming soon!")} className="px-3 py-1 rounded text-slate-400 hover:text-white text-xs font-medium transition-colors">Witty</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            {charsTooShort && <span className="text-rose-400 text-xs font-medium hidden sm:block animate-pulse">Too short</span>}
                            <button
                                onClick={handleGenerate}
                                disabled={disableGenerate}
                                className={`h-[38px] px-6 mx-2 sm:mx-0 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 transition-all duration-300
                                    ${disableGenerate
                                        ? "opacity-50 cursor-not-allowed bg-white/5 text-slate-400 border border-white/5"
                                        : "bg-white text-black hover:bg-slate-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-transparent"
                                    }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    "Generate Output"
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-4 sm:p-8 gap-6">
                    {/* Left Segment - Source context */}
                    <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgb(0,0,0,0.4)] min-h-[400px] lg:min-h-0 relative group">
                        <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                                <FileText className="text-primary w-4 h-4" />
                                Source Context
                            </h3>
                            <button
                                onClick={() => setInputText("")}
                                className="text-xs text-slate-400 font-medium hover:text-white transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="flex-1 p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto scrollbar-none">
                            <div onClick={() => showToast("info", "File upload coming soon! Paste text below instead.")} className="border border-dashed border-white/20 hover:border-primary/50 hover:bg-white/5 transition-all duration-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer shrink-0 group/upload">
                                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover/upload:scale-110 group-hover/upload:shadow-[0_0_15px_rgba(77,136,255,0.3)] transition-all duration-300">
                                    <CloudUpload className="text-slate-400 group-hover/upload:text-primary w-5 h-5 transition-colors" />
                                </div>
                                <p className="text-slate-300 text-sm font-medium">Upload Reference File</p>
                                <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-wide">TXT, DOCX, or PDF</p>
                            </div>
                            <div className="flex-1 flex flex-col relative min-h-[250px] gap-3">
                                <div className="relative flex-1 flex flex-col">
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (!disableGenerate) handleGenerate();
                                            }
                                        }}
                                        className={`flex-1 bg-black/20 rounded-xl p-5 text-slate-200 text-sm leading-relaxed focus:bg-black/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none placeholder-slate-600 scrollbar-none transition-all duration-300 backdrop-blur-md border ${isOverLimit ? 'border-rose-500/50 focus:ring-rose-500 box-shadow-[0_0_10px_rgb(244,63,94,0.2)]' : 'border-white/10'}`}
                                        placeholder="Enter your product description, rough notes, or raw draft here..."
                                    ></textarea>
                                    <div className={`absolute bottom-3 right-3 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border transition-colors ${isOverLimit ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : inputText.length > 4000 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-black/60 text-slate-400 border-white/5'}`}>
                                        {inputText.length} / 5000
                                    </div>
                                </div>
                                <div className="flex items-center justify-between shrink-0">
                                    <p className="text-xs text-slate-500 font-medium tracking-wide">
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300 mr-1">Enter</kbd> to generate
                                        <span className="mx-2 text-slate-700">•</span>
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300 mr-1">Shift</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300 mr-1">Enter</kbd> for new line
                                    </p>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={disableGenerate}
                                        className={`px-5 py-2.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 transition-all duration-300
                                            ${disableGenerate
                                                ? "opacity-50 cursor-not-allowed bg-white/5 text-slate-400 border border-white/5"
                                                : "bg-gradient-to-r from-primary to-blue-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_15px_rgba(77,136,255,0.3)] border border-transparent"
                                            }`}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                Generate <Send className="w-3.5 h-3.5 ml-1" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Segment - Generation Results */}
                    <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgb(0,0,0,0.4)] min-h-[500px] lg:min-h-0 relative">
                        <div className="px-4 py-3 border-b border-white/10 bg-black/20 flex gap-1 overflow-x-auto scrollbar-none shrink-0 relative items-center">
                            {platforms.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setActivePlatform(p.id)}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-300
                                        ${activePlatform === p.id
                                            ? "bg-white/10 text-white font-bold"
                                            : "hover:bg-white/5 text-slate-400 hover:text-white font-medium"
                                        }`}
                                >
                                    <p.icon className={`w-4 h-4 ${activePlatform === p.id ? 'text-primary' : ''}`} />
                                    {p.label}
                                    {activePlatform === p.id && (
                                        <span className="absolute -bottom-3 left-0 w-full h-[2px] bg-primary shadow-[0_-2px_8px_rgba(77,136,255,0.8)]"></span>
                                    )}
                                </button>
                            ))}
                            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-md text-xs font-medium transition-colors whitespace-nowrap ml-auto">
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Context</span>
                            </button>
                        </div>

                        <div className="flex-1 p-6 sm:p-8 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-black/10">
                            <div className="max-w-xl mx-auto space-y-8">
                                <div className="relative min-h-[150px]">
                                    {isGenerating ? (
                                        /* Advanced Skeleton Loader per requirements */
                                        <div className="space-y-4 animate-pulse pt-2">
                                            <div className="h-3 bg-white/10 rounded-full w-3/4"></div>
                                            <div className="h-3 bg-white/10 rounded-full w-full"></div>
                                            <div className="h-3 bg-white/10 rounded-full w-full"></div>
                                            <div className="h-3 bg-white/10 rounded-full w-5/6"></div>
                                            <div className="h-3 bg-white/10 rounded-full w-1/2 mt-6"></div>
                                        </div>
                                    ) : (
                                        <div
                                            ref={captionRef}
                                            className="text-[15px] text-slate-200 leading-relaxed whitespace-pre-wrap font-light tracking-wide max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2"
                                        >
                                            {typedText || ""}

                                            {!generatedOutputs[activePlatform] && !isGenerating && (
                                                <div className="opacity-70 flex flex-col items-center justify-center py-10">
                                                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                                        <FileText className="w-6 h-6 text-primary/80" />
                                                    </div>
                                                    <p className="text-slate-300 font-medium text-sm">No content generated yet</p>
                                                    <p className="text-xs text-slate-500 mt-1 max-w-[200px] text-center">Add source notes and click generate</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center shrink-0 rounded-b-2xl">
                            <div className="flex gap-1.5">
                                <button
                                    onClick={handleGenerate}
                                    disabled={disableGenerate}
                                    className={`p-2.5 rounded-lg border border-transparent transition-all duration-300 ${!disableGenerate ? 'text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10 active:scale-[0.95]' : 'text-slate-600 cursor-not-allowed'}`}
                                    title="Regenerate Draft"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin text-primary' : ''}`} />
                                </button>
                                <button onClick={() => showToast("info", "Manual editing coming soon!")} className="p-2.5 border border-transparent hover:bg-white/10 rounded-lg text-slate-400 hover:text-white hover:border-white/10 active:scale-[0.95] transition-all duration-300" title="Manual Edit">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveAsset}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-amber-500/10 hover:border-amber-500/20 text-slate-200 hover:text-amber-400 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                    title="Save as Asset"
                                >
                                    <Star className="w-4 h-4" />
                                    <span className="hidden sm:inline">Save</span>
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-200 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                                    <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy"}</span>
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-primary/20 border border-primary/30 hover:bg-primary hover:border-primary text-white rounded-lg text-sm font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(77,136,255,0.1)] hover:shadow-[0_0_25px_rgba(77,136,255,0.3)]"
                                >
                                    <Download className="w-4 h-4 opacity-80" />
                                    <span className="hidden sm:inline">Export</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
