import { Mail, EyeOff, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthLight = () => {
    return (
        <div className="bg-background-dark font-body antialiased min-h-screen flex flex-col aurora-auth-bg-var2 text-slate-100 relative">
            <header className="w-full px-6 py-5 flex items-center justify-between z-10 absolute top-0 left-0">
                <div className="flex items-center gap-3 select-none cursor-pointer">
                    <div className="size-8 text-primary">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                            <path d="M4 4L17.3333 17.3333" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2"></path>
                        </svg>
                    </div>
                    <h2 className="text-white text-xl font-bold tracking-tight font-display">Aurora</h2>
                </div>
                <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#">Help & Support</a>
            </header>

            <main className="flex-1 flex items-center justify-center p-4 relative z-10 w-full mt-16">
                <div className="aurora-wave"></div>
                <div className="w-full max-w-[480px] bg-surface-auth-dark/90 backdrop-blur-xl border border-surface-border rounded-xl shadow-[0_0_40px_-10px_rgba(77,136,255,0.15)] overflow-hidden relative z-20">
                    <div className="px-8 pt-10 pb-6 text-center">
                        <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome back</h1>
                        <p className="text-slate-400 text-sm">Sign in to Aurora to continue crafting your content</p>
                    </div>

                    <div className="px-8 pb-8 flex flex-col gap-5">
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={(e) => { e.preventDefault(); window.location.href = '/dashboard' }} className="flex items-center justify-center gap-2 h-12 rounded-lg bg-[#202e4b] hover:bg-[#2b3b55] text-white text-sm font-medium transition-colors border border-transparent hover:border-slate-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M23.5 12.2C23.5 11.4 23.4 10.6 23.2 9.8H12V14.4H18.5C18.2 15.9 17.4 17.2 16.1 18.1V21.1H20C22.2 19 23.5 15.9 23.5 12.2Z" fill="#4285F4"></path>
                                    <path d="M12 24C15.2 24 17.9 22.9 19.9 21.1L16.1 18.1C15 18.8 13.6 19.2 12 19.2C8.9 19.2 6.3 17.1 5.3 14.3H1.3V17.4C3.4 21.5 7.6 24 12 24Z" fill="#34A853"></path>
                                    <path d="M5.3 14.3C5.1 13.6 5 12.8 5 12C5 11.2 5.1 10.4 5.3 9.7V6.6H1.3C0.5 8.2 0 10 0 12C0 14 0.5 15.8 1.3 17.4L5.3 14.3Z" fill="#FBBC05"></path>
                                    <path d="M12 4.8C13.7 4.8 15.3 5.4 16.5 6.5L19.9 3.1C17.9 1.2 15.2 0 12 0C7.6 0 3.4 2.5 1.3 6.6L5.3 9.7C6.3 6.9 8.9 4.8 12 4.8Z" fill="#EA4335"></path>
                                </svg>
                                Google
                            </button>
                            <button onClick={(e) => { e.preventDefault(); window.location.href = '/dashboard' }} className="flex items-center justify-center gap-2 h-12 rounded-lg bg-[#202e4b] hover:bg-[#2b3b55] text-white text-sm font-medium transition-colors border border-transparent hover:border-slate-600">
                                <svg className="w-5 h-5 fill-current text-[#0077b5]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>LinkedIn</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
                                LinkedIn
                            </button>
                        </div>

                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-slate-700"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider">Or continue with</span>
                            <div className="flex-grow border-t border-slate-700"></div>
                        </div>

                        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); window.location.href = '/dashboard'; }}>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-slate-300 text-sm font-medium ml-1" htmlFor="email-light">Email address</label>
                                <div className="relative group">
                                    <input className="w-full bg-[#0f1623] text-white border border-slate-700 rounded-lg px-4 py-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-500 font-body text-base" id="email-light" placeholder="name@company.com" type="email" required />
                                    <div className="absolute right-3 top-3.5 text-slate-500 group-focus-within:text-primary transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-slate-300 text-sm font-medium" htmlFor="password-light">Password</label>
                                    <a className="text-primary text-xs font-medium hover:underline" href="#">Forgot password?</a>
                                </div>
                                <div className="relative group">
                                    <input className="w-full bg-[#0f1623] text-white border border-slate-700 rounded-lg px-4 py-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-500 font-body text-base" id="password-light" placeholder="••••••••" type="password" required />
                                    <button className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors cursor-pointer" type="button">
                                        <EyeOff className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <button className="mt-4 w-full h-12 bg-btn-gradient hover:opacity-90 rounded-lg text-white font-bold text-base shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2" type="submit">
                                Sign In
                                <ArrowRight className="w-5 h-5 flex-shrink-0" />
                            </button>
                        </form>
                    </div>
                    <div className="bg-[#202e4b]/50 px-8 py-4 border-t border-surface-border flex items-center justify-center gap-2">
                        <span className="text-slate-400 text-sm">Don&apos;t have an account?</span>
                        <a className="text-primary font-bold text-sm hover:underline" href="#">Create Account</a>
                    </div>
                </div>


            </main>

            <footer className="w-full p-6 text-center z-10 relative">
                <p className="text-slate-500 text-xs">© 2024 Aurora AI Inc. All rights reserved. | <Link to="/auth-dark" className="hover:text-primary">Variant 1</Link></p>
            </footer>
        </div>
    );
};

export default AuthLight;
