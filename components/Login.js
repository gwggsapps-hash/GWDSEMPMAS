import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { login } from '../services/firebase';
import { ShieldCheck, Lock, Mail, Loader2 } from 'lucide-react';
export const Login = () => {
    // Pre-filled credentials as requested
    const [email, setEmail] = useState('admin@empmas.com');
    const [password, setPassword] = useState('admin123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
        }
        catch (err) {
            setError("Invalid credentials. Please use admin@empmas.com / admin123");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-[#020617] flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md bg-slate-900 border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full -mr-20 -mt-20" }), _jsxs("div", { className: "relative z-10", children: [_jsx("div", { className: "flex justify-center mb-8", children: _jsx("div", { className: "bg-slate-800 p-4 rounded-2xl border border-white/5 shadow-xl", children: _jsx(ShieldCheck, { className: "text-indigo-500", size: 40 }) }) }), _jsx("h2", { className: "text-3xl font-black text-white text-center tracking-tighter mb-2", children: "Secure Access" }), _jsx("p", { className: "text-slate-500 text-center text-xs font-black uppercase tracking-widest mb-10", children: "DataHarmonizer Pro" }), _jsxs("form", { onSubmit: handleLogin, className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-xs font-bold text-slate-400 uppercase ml-2", children: "Email Identity" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500", size: 18 }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-slate-950 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all", placeholder: "admin@empmas.com", required: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-xs font-bold text-slate-400 uppercase ml-2", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500", size: 18 }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-slate-950 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all", placeholder: "admin123", required: true })] })] }), error && _jsx("div", { className: "text-rose-500 text-xs font-bold text-center bg-rose-500/10 py-3 rounded-lg", children: error }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95 flex items-center justify-center gap-2", children: loading ? _jsx(Loader2, { className: "animate-spin" }) : "Authenticate" })] }), _jsxs("div", { className: "mt-8 text-center", children: [_jsx("p", { className: "text-[10px] text-slate-600 font-bold mb-2", children: "DEFAULT ADMIN CREDENTIALS" }), _jsx("p", { className: "text-[10px] text-indigo-400 font-mono", children: "admin@empmas.com \u2022 admin123" })] })] })] }) }));
};
