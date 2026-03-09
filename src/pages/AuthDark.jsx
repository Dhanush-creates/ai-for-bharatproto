import { useState } from 'react';
import { Mail, EyeOff, Eye, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { setSession } from '../auth';

const AuthDark = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // New Attributes
    const [name, setName] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [gender, setGender] = useState('Prefer not to say');

    const [isVerification, setIsVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    // Status states
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: '', text: '' });
        setIsLoading(true);

        const cognitoEndpoint = "https://cognito-idp.us-east-1.amazonaws.com/";
        const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

        try {
            if (isVerification) {
                // --- VERIFICATION FLOW ---
                const res = await fetch(cognitoEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-amz-json-1.1",
                        "X-Amz-Target": "AWSCognitoIdentityProviderService.ConfirmSignUp"
                    },
                    body: JSON.stringify({
                        ClientId: clientId,
                        Username: email,
                        ConfirmationCode: verificationCode
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Failed to verify code");
                }

                setIsVerification(false);
                setVerificationCode('');
                setStatusMessage({
                    type: 'success',
                    text: 'Account verified successfully! Logging you in...'
                });

                // Auto-login after successful verification
                const loginRes = await fetch(cognitoEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-amz-json-1.1",
                        "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
                    },
                    body: JSON.stringify({
                        AuthFlow: "USER_PASSWORD_AUTH",
                        ClientId: clientId,
                        AuthParameters: {
                            USERNAME: email,
                            PASSWORD: password
                        }
                    })
                });

                const loginData = await loginRes.json();

                if (!loginRes.ok) {
                    setIsLogin(true);
                    throw new Error(loginData.message || "Failed to auto-login. Please sign in manually.");
                }

                if (loginData.AuthenticationResult && loginData.AuthenticationResult.IdToken) {
                    const expiresIn = loginData.AuthenticationResult.ExpiresIn || 3600;
                    setSession({
                        idToken: loginData.AuthenticationResult.IdToken,
                        expiresAt: Date.now() + expiresIn * 1000,
                    });
                    navigate('/dashboard', { replace: true });
                } else {
                    setIsLogin(true);
                    throw new Error("Missing authentication token from AWS");
                }
                return; // Navigation handled

            } else if (isLogin) {
                // --- LOGIN FLOW ---
                const res = await fetch(cognitoEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-amz-json-1.1",
                        "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
                    },
                    body: JSON.stringify({
                        AuthFlow: "USER_PASSWORD_AUTH",
                        ClientId: clientId,
                        AuthParameters: {
                            USERNAME: email,
                            PASSWORD: password
                        }
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    if (data.message === "User is not confirmed.") {
                        setIsVerification(true);
                        throw new Error("Please verify your email address to continue.");
                    }
                    throw new Error(data.message || "Failed to login");
                }

                if (data.AuthenticationResult && data.AuthenticationResult.IdToken) {
                    const expiresIn = data.AuthenticationResult.ExpiresIn || 3600;
                    setSession({
                        idToken: data.AuthenticationResult.IdToken,
                        expiresAt: Date.now() + expiresIn * 1000,
                    });
                    navigate('/dashboard', { replace: true });
                } else {
                    throw new Error("Missing authentication token from AWS");
                }

            } else {
                // --- SIGN UP FLOW ---
                const res = await fetch(cognitoEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-amz-json-1.1",
                        "X-Amz-Target": "AWSCognitoIdentityProviderService.SignUp"
                    },
                    body: JSON.stringify({
                        ClientId: clientId,
                        Username: email,
                        Password: password,
                        UserAttributes: [
                            { Name: "email", Value: email },
                            { Name: "name", Value: name || email.split('@')[0] },
                            { Name: "birthdate", Value: birthdate },
                            { Name: "gender", Value: gender }
                        ]
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Failed to sign up");
                }

                // Sign up successful, move to verification
                setIsVerification(true);
                setStatusMessage({
                    type: 'success',
                    text: 'Account created! Please check your email for the verification code.'
                });
            }
        } catch (err) {
            setStatusMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-dark font-body antialiased min-h-screen flex flex-col aurora-auth-bg-var1 text-slate-100 relative">
            <header className="w-full px-6 py-5 flex items-center justify-between z-10 absolute top-0 left-0">
                <div onClick={() => navigate('/dashboard')} className="flex items-center gap-3 select-none cursor-pointer">
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
                <div className="w-full max-w-[480px] bg-surface-auth-dark/90 backdrop-blur-xl border border-surface-border rounded-xl shadow-[0_0_40px_-10px_rgba(77,136,255,0.15)] overflow-hidden relative z-20 transition-all duration-300">
                    <div className="px-8 pt-10 pb-6 text-center">
                        <h1 className="text-3xl font-display font-bold text-white mb-2">{isLogin ? "Welcome back" : "Create an account"}</h1>
                        <p className="text-slate-400 text-sm">{isLogin ? "Sign in to Aurora to continue crafting your content" : "Sign up to start your AI-powered content journey"}</p>
                    </div>

                    <div className="px-8 pb-8 flex flex-col gap-5">

                        {statusMessage.text && (
                            <div className={`p-3 rounded-lg text-sm font-medium ${statusMessage.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                {statusMessage.text}
                            </div>
                        )}

                        <form className="flex flex-col gap-4" onSubmit={handleAuth}>
                            {isVerification ? (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-300 text-sm font-medium ml-1" htmlFor="code-dark">Verification Code</label>
                                    <div className="relative group">
                                        <input
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            className="w-full bg-[#0f1623] text-center text-white border border-slate-700 rounded-lg px-4 py-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-500 font-body text-xl tracking-[0.5em]"
                                            id="code-dark"
                                            placeholder="••••••"
                                            type="text"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 ml-1 mt-1">Enter the 6-digit code sent to your email.</p>
                                </div>
                            ) : (
                                <>
                                    {!isLogin && (
                                        <>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-300 text-sm font-medium ml-1" htmlFor="name-dark">Full Name</label>
                                                <div className="relative group">
                                                    <input
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="w-full bg-[#0f1623] text-white border border-slate-700 rounded-lg px-4 py-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-500 font-body text-base"
                                                        id="name-dark"
                                                        placeholder="John Doe"
                                                        type="text"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-300 text-sm font-medium ml-1" htmlFor="dob-dark">Date of Birth</label>
                                                <div className="relative group">
                                                    <input
                                                        value={birthdate}
                                                        onChange={(e) => setBirthdate(e.target.value)}
                                                        className="w-full bg-[#0f1623] text-white border border-slate-700 rounded-lg px-4 py-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body text-base"
                                                        id="dob-dark"
                                                        type="date"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-300 text-sm font-medium ml-1" htmlFor="gender-dark">Gender</label>
                                                <div className="relative group">
                                                    <select
                                                        value={gender}
                                                        onChange={(e) => setGender(e.target.value)}
                                                        className="w-full bg-[#0f1623] text-white border border-slate-700 rounded-lg px-4 py-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body text-base appearance-none"
                                                        id="gender-dark"
                                                        required
                                                    >
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Non-binary">Non-binary</option>
                                                        <option value="Prefer not to say">Prefer not to say</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-slate-300 text-sm font-medium ml-1" htmlFor="email-dark">Email address</label>
                                        <div className="relative group">
                                            <input
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-[#0f1623] text-white border border-slate-700 rounded-lg px-4 py-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-500 font-body text-base"
                                                id="email-dark"
                                                placeholder="name@company.com"
                                                type="email"
                                                required
                                            />
                                            <div className="absolute right-3 top-3.5 text-slate-500 group-focus-within:text-primary transition-colors">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-slate-300 text-sm font-medium" htmlFor="password-dark">Password</label>
                                            {isLogin && <a className="text-primary text-xs font-medium hover:underline" href="#">Forgot password?</a>}
                                        </div>
                                        <div className="relative group">
                                            <input
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-[#0f1623] text-white border border-slate-700 rounded-lg px-4 py-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-500 font-body text-base"
                                                id="password-dark"
                                                placeholder="••••••••"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                minLength={8}
                                            />
                                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors cursor-pointer" type="button">
                                                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {!isLogin && <p className="text-xs text-slate-500 ml-1 mt-1">Must be at least 8 characters</p>}
                                    </div>
                                </>
                            )}
                            <button disabled={isLoading} className={`mt-4 w-full h-12 bg-btn-gradient rounded-lg text-white font-bold text-base shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]'}`} type="submit">
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        {isVerification ? "Verify Account" : (isLogin ? "Sign In" : "Create Account")}
                                        <ArrowRight className="w-5 h-5 flex-shrink-0" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {!isVerification && (
                        <div className="bg-[#202e4b]/50 px-8 py-4 border-t border-surface-border flex items-center justify-center gap-2 transition-colors">
                            <span className="text-slate-400 text-sm">{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
                            <button onClick={() => { setIsLogin(!isLogin); setStatusMessage({ type: '', text: '' }); setPassword(''); }} className="text-primary font-bold text-sm hover:underline" type="button">
                                {isLogin ? "Create Account" : "Sign In"}
                            </button>
                        </div>
                    )}
                    {isVerification && (
                        <div className="bg-[#202e4b]/50 px-8 py-4 border-t border-surface-border flex items-center justify-center gap-2 transition-colors">
                            <span className="text-slate-400 text-sm">Need to use a different email?</span>
                            <button onClick={() => { setIsVerification(false); setStatusMessage({ type: '', text: '' }); }} className="text-primary font-bold text-sm hover:underline" type="button">
                                Go Back
                            </button>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-10 right-10 z-0 opacity-40 mix-blend-overlay pointer-events-none">
                    <div className="w-64 h-64 rounded-full bg-primary blur-[100px]"></div>
                </div>
                <div className="absolute top-20 left-10 z-0 opacity-30 mix-blend-overlay pointer-events-none">
                    <div className="w-72 h-72 rounded-full bg-purple-600 blur-[100px]"></div>
                </div>
            </main>


        </div>
    );
};

export default AuthDark;
