import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Search, Sparkles, Download, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { translateQueryToFilter } from '../services/gemini';
import * as XLSX from 'xlsx';
export const ReportExtractor = ({ rows, headers }) => {
    const [query, setQuery] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const handleExtract = async () => {
        if (!query.trim())
            return;
        setIsExtracting(true);
        setError(null);
        try {
            const { logic } = await translateQueryToFilter(query, headers);
            // eslint-disable-next-line no-new-func
            const filterFn = new Function('row', `try { return ${logic}; } catch(e) { return false; }`);
            const filtered = rows.filter(row => filterFn(row));
            setResults(filtered);
        }
        catch (err) {
            setError("AI Translation failed. Please try a simpler query.");
        }
        finally {
            setIsExtracting(false);
        }
    };
    const downloadReport = () => {
        if (!results)
            return;
        const ws = XLSX.utils.json_to_sheet(results);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "AI_Extracted_Report");
        XLSX.writeFile(wb, `Custom_Report_${new Date().getTime()}.xlsx`);
    };
    return (_jsxs("div", { className: "space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700", children: [_jsxs("div", { className: "bg-slate-900 rounded-[60px] p-16 border border-white/5 relative overflow-hidden shadow-2xl", children: [_jsx("div", { className: "absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full -mr-32 -mt-32" }), _jsxs("div", { className: "relative z-10 space-y-8", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "bg-indigo-600 p-4 rounded-2xl text-white shadow-xl shadow-indigo-900/20", children: _jsx(Sparkles, { size: 32 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-3xl font-black text-white tracking-tighter", children: "Query Intelligence Hub" }), _jsx("p", { className: "text-slate-500 text-sm font-medium", children: "Extract custom reports using natural language instructions." })] })] }), _jsxs("div", { className: "flex flex-col md:flex-row gap-6", children: [_jsxs("div", { className: "flex-1 relative group", children: [_jsx(Search, { className: "absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors", size: 20 }), _jsx("input", { type: "text", placeholder: "e.g. Show me all staff from India with expired cards...", className: "w-full bg-slate-950 border border-white/5 rounded-3xl pl-16 pr-6 py-6 text-lg font-medium text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all shadow-inner", value: query, onChange: (e) => setQuery(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleExtract() })] }), _jsxs("button", { onClick: handleExtract, disabled: isExtracting || !query.trim(), className: "bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-10 py-6 rounded-3xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-2xl active:scale-95", children: [isExtracting ? _jsx(RefreshCw, { className: "animate-spin", size: 18 }) : _jsx(Sparkles, { size: 18 }), "Extract Report"] })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx("span", { className: "text-[10px] text-slate-600 font-black uppercase tracking-widest", children: "Suggestions:" }), ["Expired in Dubai", "Nationality: Pakistan", "Escape Reports Only"].map(s => (_jsx("button", { onClick: () => setQuery(s), className: "text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-4 py-1.5 rounded-full border border-white/5 transition-all lowercase", children: s }, s)))] })] })] }), error && (_jsxs("div", { className: "bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-center gap-4 text-rose-500 animate-in zoom-in-95", children: [_jsx(AlertCircle, { size: 24 }), _jsx("p", { className: "font-bold text-sm", children: error })] })), results !== null && (_jsxs("div", { className: "bg-white rounded-[50px] border border-slate-200 shadow-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-8", children: [_jsxs("div", { className: "p-12 border-b border-slate-100 flex items-center justify-between bg-slate-50/30", children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsx("div", { className: "bg-indigo-100 p-4 rounded-2xl text-indigo-600", children: _jsx(FileText, { size: 24 }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Extraction Result" }), _jsxs("p", { className: "text-xs font-black text-slate-400 uppercase tracking-widest mt-1", children: [results.length, " Records Isolated"] })] })] }), _jsxs("button", { onClick: downloadReport, className: "bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-3", children: [_jsx(Download, { size: 18 }), " Download Excel"] })] }), _jsxs("div", { className: "p-8 max-h-[500px] overflow-auto custom-scrollbar", children: [_jsxs("table", { className: "w-full text-xs text-left border-collapse", children: [_jsx("thead", { children: _jsx("tr", { className: "border-b border-slate-100", children: headers.slice(0, 6).map(h => _jsx("th", { className: "px-6 py-4 font-black text-slate-500 uppercase tracking-widest", children: h }, h)) }) }), _jsx("tbody", { children: results.slice(0, 50).map((r, i) => (_jsx("tr", { className: "hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0", children: headers.slice(0, 6).map(h => _jsx("td", { className: "px-6 py-4 text-slate-600 font-medium", children: String(r[h] || '') }, h)) }, i))) })] }), results.length > 50 && (_jsxs("div", { className: "p-10 text-center text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]", children: ["Previewing 50 of ", results.length, " records. Download full report to see all."] })), results.length === 0 && (_jsx("div", { className: "p-20 text-center text-slate-300 font-black uppercase tracking-[0.5em]", children: "No matching records found." }))] })] }))] }));
};
