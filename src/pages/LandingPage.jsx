import React from 'react';
import { Cpu, Zap, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="mesh min-h-screen text-slate-100 flex flex-col items-center justify-center relative overflow-hidden font-display py-20 px-4">
            {/* Header with Logo */}
            <header className="absolute top-0 left-0 w-full px-6 py-5 flex items-center z-10">
                <div className="flex items-center gap-3 select-none">
                    <div className="size-8 text-primary">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                            <path d="M4 4L17.3333 17.3333" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2"></path>
                        </svg>
                    </div>
                    <h2 className="text-white text-xl font-bold tracking-tight font-display">AURORA</h2>
                </div>
            </header>

            {/* Main Hero */}
            <div className="text-center max-w-4xl mx-auto z-10 mb-16 mt-8" style={{ animationDelay: '0.1s' }}>
                <h1 className="wave-headline text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white leading-tight">
                    Create Once. Post Everywhere with AURORA.
                </h1>
                <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed font-body">
                    The ultimate AI Content Studio for the AI for Bharat Hackathon. Powered by Amazon Bedrock. Transform blogs, articles, and scripts into optimized social media assets in seconds.
                </p>
                <div className="flex gap-4 justify-center">
                    <button className="btn-p" onClick={() => navigate('/auth-dark')}>
                        Get Started Free
                    </button>
                    <button className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-white font-medium transition-colors" onClick={() => navigate('/auth-dark')}>
                        Log In
                    </button>
                </div>
            </div>

            {/* AWS Power Section */}
            <div className="w-full max-w-5xl mx-auto z-10 pt-10" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-center text-slate-400 uppercase tracking-widest text-sm font-bold mb-8">The AWS Power</h3>
                <div className="dock-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface-dark border border-surface-border p-6 rounded-2xl flex flex-col items-center text-center gap-3 transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                        <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2 ring-1 ring-blue-500/30">
                            <Cpu className="w-7 h-7" />
                        </div>
                        <h4 className="text-lg font-bold text-white">Context Engine</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Powered by AWS Comprehend for intelligent intent detection.</p>
                    </div>

                    <div className="bg-surface-dark border border-surface-border p-6 rounded-2xl flex flex-col items-center text-center gap-3 transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10">
                        <div className="h-14 w-14 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2 ring-1 ring-purple-500/30">
                            <Zap className="w-7 h-7" />
                        </div>
                        <h4 className="text-lg font-bold text-white">Creative Core</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Powered by Amazon Bedrock for multi-platform generation.</p>
                    </div>

                    <div className="bg-surface-dark border border-surface-border p-6 rounded-2xl flex flex-col items-center text-center gap-3 transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10">
                        <div className="h-14 w-14 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 mb-2 ring-1 ring-orange-500/30">
                            <Layers className="w-7 h-7" />
                        </div>
                        <h4 className="text-lg font-bold text-white">Serverless Flow</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Orchestrated seamlessly via AWS Step Functions & Lambda.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
