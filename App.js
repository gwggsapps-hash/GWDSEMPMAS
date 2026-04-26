import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { FileUp, Table, LayoutGrid, Sparkles, Search, Database, PieChart, LogOut, FileSpreadsheet, Trash2, ShieldCheck, Eye, Layers, FileText, CalendarDays, FileSearch, RefreshCw, X, Building2, ChevronDown, Users, Plus, AlertCircle } from 'lucide-react';
import { harmonizeData } from './utils/dataProcessor';
import { DataTable } from './components/DataTable';
import { PivotView } from './components/PivotView';
import { Dashboard } from './components/Dashboard';
import { ReportExtractor } from './components/ReportExtractor';
import { UserManagement } from './components/UserManagement';
import { generateDataSummary } from './services/gemini';
import { Login } from './components/Login';
import { fetchCompanies, uploadCompanyData, createCompanyEntity, deleteCompanyData, downloadCompanyFile, logout, subscribeToAuth } from './services/firebase';
const ADMIN_EMAIL = "admin@empmas.com";
const App = () => {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    // Data State
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [currentData, setCurrentData] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    // App UI State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [aiSummary, setAiSummary] = useState('');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [drillDownData, setDrillDownData] = useState(null);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    // Upload/Create State
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    // Forms
    const [uploadFile, setUploadFile] = useState(null);
    const [targetUploadCompanyId, setTargetUploadCompanyId] = useState('');
    const [newCompanyName, setNewCompanyName] = useState('');
    // 1. Auth Listener
    useEffect(() => {
        const unsubscribe = subscribeToAuth((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const adminStatus = currentUser.email === ADMIN_EMAIL;
                setIsAdmin(adminStatus);
                if (!adminStatus && activeTab === 'users') {
                    setActiveTab('dashboard');
                }
                loadCompanyList();
            }
            else {
                setIsAdmin(false);
                setCompanies([]);
                setCurrentData(null);
            }
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);
    // 2. Load Company List
    const loadCompanyList = async () => {
        try {
            const list = await fetchCompanies();
            setCompanies(list);
        }
        catch (error) {
            console.error("Failed to load companies", error);
        }
    };
    // 3. Load Selected Company Data
    useEffect(() => {
        if (!selectedCompanyId) {
            setCurrentData(null);
            return;
        }
        const loadFile = async () => {
            setIsLoadingData(true);
            const company = companies.find(c => c.id === selectedCompanyId);
            if (company) {
                if (!company.hasData || !company.storagePath) {
                    setCurrentData(null);
                    setIsLoadingData(false);
                    return; // Company exists but no file uploaded yet
                }
                try {
                    const arrayBuffer = await downloadCompanyFile(company.storagePath);
                    const wb = XLSX.read(arrayBuffer, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(ws);
                    const harmonized = harmonizeData(jsonData);
                    setCurrentData(harmonized);
                    setActiveTab('dashboard');
                }
                catch (err) {
                    console.error(err);
                    alert("Failed to load company data.");
                }
            }
            setIsLoadingData(false);
        };
        loadFile();
    }, [selectedCompanyId, companies]);
    // 4. Handle Create Entity (Admin)
    const handleCreateCompany = async () => {
        if (!newCompanyName.trim() || !user)
            return;
        setIsUploading(true); // Reuse loading state
        try {
            await createCompanyEntity(newCompanyName, user.uid);
            await loadCompanyList();
            setNewCompanyName('');
            setShowCreateModal(false);
        }
        catch (e) {
            alert("Failed to create entity");
        }
        finally {
            setIsUploading(false);
        }
    };
    // 5. Handle File Upload (Admin)
    const handleUploadSubmit = async () => {
        if (!uploadFile || !targetUploadCompanyId || !user)
            return;
        setIsUploading(true);
        try {
            await uploadCompanyData(uploadFile, targetUploadCompanyId, user.uid);
            await loadCompanyList();
            // If we uploaded to the currently selected company, reload the data
            if (selectedCompanyId === targetUploadCompanyId) {
                // Trigger reload by momentarily clearing selection or forcing update (handled by deps in useEffect)
                // For simplicity, just let the user see the success message
            }
            setUploadFile(null);
            setTargetUploadCompanyId('');
            setShowUploadModal(false);
            alert("Company Data Updated Successfully. Old data has been overwritten.");
        }
        catch (e) {
            alert("Upload Failed: " + e.message);
        }
        finally {
            setIsUploading(false);
        }
    };
    const handleFileSelect = (e) => {
        if (e.target.files?.[0]) {
            setUploadFile(e.target.files[0]);
        }
    };
    const handleDeleteCompany = async (id, path, e) => {
        e.stopPropagation();
        if (!confirm("Permanently delete this company and its data?"))
            return;
        try {
            await deleteCompanyData(id, path);
            if (selectedCompanyId === id)
                setSelectedCompanyId(null);
            await loadCompanyList();
        }
        catch (err) {
            alert("Delete failed.");
        }
    };
    // Filter Logic
    const filteredRows = useMemo(() => {
        if (!currentData)
            return [];
        if (!searchTerm)
            return currentData.rows;
        const s = searchTerm.toLowerCase();
        return currentData.rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(s)));
    }, [currentData, searchTerm]);
    const drillDownFiltered = useMemo(() => {
        if (!drillDownData)
            return [];
        if (!dateRange.start && !dateRange.end)
            return drillDownData.rows;
        return drillDownData.rows.filter(row => {
            const dateKey = Object.keys(row).find(k => k.includes('(Date)'));
            if (!dateKey)
                return true;
            const dateStr = String(row[dateKey]).split(';')[0].trim();
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                const rowDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                if (dateRange.start && rowDate < new Date(dateRange.start))
                    return false;
                if (dateRange.end && rowDate > new Date(dateRange.end))
                    return false;
            }
            return true;
        });
    }, [drillDownData, dateRange]);
    const handleDrillDown = (title, rows) => {
        setDrillDownData({ title, rows });
        setDateRange({ start: '', end: '' });
    };
    if (loadingAuth)
        return _jsx("div", { className: "h-screen bg-[#020617] flex items-center justify-center", children: _jsx(RefreshCw, { className: "animate-spin text-indigo-500", size: 40 }) });
    if (!user)
        return _jsx(Login, {});
    const selectedCompanyMeta = companies.find(c => c.id === selectedCompanyId);
    return (_jsxs("div", { className: "min-h-screen flex flex-col font-sans bg-[#020617] text-slate-300 overflow-hidden h-screen", children: [_jsxs("div", { className: `px-8 py-2.5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.4em] z-[100] border-b border-white/5 ${isAdmin ? 'bg-indigo-600/10 text-indigo-400' : 'bg-emerald-600/10 text-emerald-400'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [isAdmin ? _jsx(ShieldCheck, { size: 14 }) : _jsx(Eye, { size: 14 }), isAdmin ? 'Administrator Console' : 'Viewer Access'] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "text-slate-500", children: user.email }), _jsxs("button", { onClick: () => logout(), className: "hover:text-white flex items-center gap-2", children: [_jsx(LogOut, { size: 12 }), " Sign Out"] })] })] }), _jsxs("header", { className: "bg-slate-950 border-b border-white/5 px-8 py-5 flex items-center justify-between shrink-0", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "bg-gradient-to-br from-indigo-600 to-indigo-800 p-2.5 rounded-2xl text-white shadow-2xl", children: _jsx(Database, { size: 24 }) }), _jsx("div", { children: _jsxs("h1", { className: "text-xl font-black text-white tracking-tighter leading-none", children: ["DataHarmonizer ", _jsx("span", { className: "text-indigo-500", children: "Pro" })] }) })] }), _jsxs("div", { className: "flex items-center gap-6", children: [_jsx("div", { className: "relative z-50", children: _jsxs("div", { className: "relative group", children: [_jsx(Building2, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500", size: 16 }), _jsxs("select", { value: selectedCompanyId || '', onChange: (e) => setSelectedCompanyId(e.target.value), className: "appearance-none bg-slate-900 border border-white/10 rounded-xl pl-12 pr-10 py-2.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500 w-64 cursor-pointer", children: [_jsx("option", { value: "", disabled: true, children: "Select Company Entity" }), companies.map(c => (_jsxs("option", { value: c.id, children: [c.name, " ", !c.hasData ? '(Empty)' : ''] }, c.id)))] }), _jsx(ChevronDown, { className: "absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none", size: 14 })] }) }), _jsxs("div", { className: "relative group", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors", size: 16 }), _jsx("input", { type: "text", placeholder: "Global Filter...", className: "bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-64 text-white font-medium", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] })] })] }), _jsxs("main", { className: "flex-1 flex overflow-hidden", children: [_jsxs("aside", { className: "w-80 bg-slate-950/50 border-r border-white/5 p-6 flex flex-col space-y-8 hidden md:flex shrink-0", children: [isAdmin && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] px-2", children: "Data Ingestion" }), _jsxs("button", { onClick: () => setShowUploadModal(true), className: "w-full flex items-center gap-4 p-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl cursor-pointer transition-all shadow-xl shadow-indigo-900/20 group text-left", children: [_jsx(FileUp, { size: 20, className: "text-white" }), _jsx("span", { className: "text-sm font-black text-white uppercase tracking-widest", children: "Update Data" })] })] })), _jsxs("div", { className: "space-y-2 flex-1 overflow-y-auto custom-scrollbar", children: [_jsxs("div", { className: "flex items-center justify-between px-2 mb-3", children: [_jsx("div", { className: "text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]", children: "Entities" }), isAdmin && (_jsx("button", { onClick: () => setShowCreateModal(true), className: "bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white p-1 rounded-lg transition-all", title: "Add Entity", children: _jsx(Plus, { size: 14 }) }))] }), companies.map(c => (_jsxs("div", { onClick: () => setSelectedCompanyId(c.id), className: `w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${selectedCompanyId === c.id ? 'bg-white/5 text-white border border-white/5' : 'text-slate-500 hover:bg-white/5 border border-transparent'}`, children: [_jsxs("div", { className: "flex items-center gap-3 truncate", children: [_jsx(FileText, { size: 14, className: !c.hasData ? 'text-slate-700' : selectedCompanyId === c.id ? 'text-indigo-400' : 'text-slate-600' }), _jsxs("div", { className: "flex flex-col truncate", children: [_jsx("span", { className: "truncate", children: c.name }), _jsx("span", { className: "text-[9px] font-medium opacity-50", children: c.hasData ? new Date(c.uploadDate).toLocaleDateString() : 'No Data' })] })] }), isAdmin && (_jsx("button", { onClick: (e) => handleDeleteCompany(c.id, c.storagePath, e), className: "p-1.5 hover:bg-rose-500/20 hover:text-rose-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100", children: _jsx(Trash2, { size: 12 }) }))] }, c.id))), companies.length === 0 && _jsx("div", { className: "text-center text-[10px] text-slate-600 font-black uppercase tracking-widest py-10", children: "No Entities Configured" })] }), _jsxs("nav", { className: "space-y-2 pt-4 border-t border-white/5", children: [[
                                        { id: 'dashboard', label: 'Analysis Hub', icon: PieChart },
                                        { id: 'extract', label: 'Query Hub', icon: FileSearch },
                                        { id: 'pivot', label: 'Pivot Table', icon: LayoutGrid },
                                        { id: 'preview', label: 'Drive Grid', icon: Table },
                                        { id: 'ai', label: 'AI Narrative', icon: Sparkles },
                                    ].map(item => (_jsxs("button", { onClick: () => setActiveTab(item.id), disabled: !currentData, className: `w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === item.id ? 'bg-white/5 text-indigo-400 border border-white/5' : 'text-slate-500 hover:text-slate-200'} ${!currentData ? 'opacity-50 cursor-not-allowed' : ''}`, children: [_jsx(item.icon, { size: 20 }), " ", item.label] }, item.id))), isAdmin && (_jsxs("button", { onClick: () => setActiveTab('users'), className: `w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === 'users' ? 'bg-white/5 text-indigo-400 border border-white/5' : 'text-slate-500 hover:text-slate-200'}`, children: [_jsx(Users, { size: 20 }), " User Management"] }))] })] }), _jsxs("section", { className: "flex-1 overflow-auto bg-[#020617] p-12 custom-scrollbar relative", children: [isLoadingData && (_jsxs("div", { className: "h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in", children: [_jsx(RefreshCw, { className: "animate-spin text-indigo-500", size: 60 }), _jsx("p", { className: "text-slate-500 font-black uppercase tracking-widest text-xs", children: "Fetching Secure Data..." })] })), !isLoadingData && activeTab === 'users' && isAdmin && (_jsx("div", { className: "max-w-7xl mx-auto animate-in fade-in", children: _jsx(UserManagement, {}) })), !isLoadingData && activeTab !== 'users' && (!currentData || !selectedCompanyId) && (_jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto", children: [_jsx("div", { className: "w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center border border-white/5", children: _jsx(Layers, { size: 40, className: "text-slate-600" }) }), _jsx("h2", { className: "text-3xl font-black text-white tracking-tighter", children: selectedCompanyId ? (selectedCompanyMeta?.hasData ? 'Loading...' : 'Empty Entity') : 'Select an Entity' }), _jsx("p", { className: "text-slate-500 text-sm font-medium leading-relaxed", children: selectedCompanyId && !selectedCompanyMeta?.hasData
                                            ? "This company entity has been created but contains no data records. As an Admin, use the 'Update Data' button to upload an Excel sheet."
                                            : "Choose a company from the dropdown or sidebar to load its operational dashboard." }), selectedCompanyId && !selectedCompanyMeta?.hasData && isAdmin && (_jsx("button", { onClick: () => { setTargetUploadCompanyId(selectedCompanyId); setShowUploadModal(true); }, className: "bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl", children: "Upload Data Now" }))] })), currentData && !isLoadingData && activeTab !== 'users' && (_jsxs("div", { className: "max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700", children: [_jsxs("div", { className: "flex items-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-widest mb-8", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-emerald-500" }), " Live Stream: ", companies.find(c => c.id === selectedCompanyId)?.name] }), activeTab === 'dashboard' && _jsx(Dashboard, { rows: currentData.rows, onDrillDown: handleDrillDown }), activeTab === 'extract' && _jsx(ReportExtractor, { rows: currentData.rows, headers: currentData.headers }), activeTab === 'pivot' && _jsx(PivotView, { rows: currentData.rows, headers: currentData.headers }), activeTab === 'preview' && _jsx(DataTable, { headers: currentData.headers, rows: filteredRows, highlightTerm: searchTerm }), activeTab === 'ai' && (_jsxs("div", { className: "bg-slate-900 rounded-[60px] border border-white/5 p-20 relative overflow-hidden shadow-2xl", children: [_jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-16 relative z-10", children: [_jsx("h3", { className: "text-4xl font-black text-white tracking-tighter", children: "Narrative Synthesis" }), _jsxs("button", { onClick: async () => { setIsGeneratingAi(true); const s = await generateDataSummary(currentData.rows); setAiSummary(s); setIsGeneratingAi(false); }, disabled: isGeneratingAi, className: "bg-indigo-600 text-white px-12 py-6 rounded-[32px] font-black text-xl transition-all shadow-2xl", children: [isGeneratingAi ? _jsx(RefreshCw, { className: "animate-spin" }) : _jsx(Sparkles, {}), " ", aiSummary ? 'Regenerate' : 'Initiate'] })] }), _jsx("div", { className: "prose prose-invert max-w-none text-xl leading-relaxed text-slate-400 relative z-10 whitespace-pre-wrap italic", children: aiSummary || "Awaiting intelligence trigger..." })] }))] }))] })] }), showCreateModal && (_jsx("div", { className: "fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in", children: _jsxs("div", { className: "bg-slate-900 w-full max-w-md rounded-[50px] border border-white/10 p-12 space-y-10 shadow-2xl", children: [_jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-500", children: _jsx(Building2, { size: 32 }) }), _jsx("h3", { className: "text-3xl font-black text-white tracking-tighter", children: "New Entity" }), _jsx("p", { className: "text-slate-500 text-[10px] font-black uppercase tracking-widest", children: "Register Company Shell" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase ml-2 mb-1 block", children: "Entity Name" }), _jsx("input", { autoFocus: true, type: "text", className: "w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-lg font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500", value: newCompanyName, onChange: (e) => setNewCompanyName(e.target.value), placeholder: "e.g. Acme Corp" })] }), _jsx("p", { className: "text-xs text-slate-500 italic text-center", children: "Data can be uploaded to this entity after creation." })] }), _jsxs("div", { className: "flex gap-4 pt-4", children: [_jsx("button", { onClick: () => { setShowCreateModal(false); setNewCompanyName(''); }, className: "flex-1 py-4 text-slate-500 font-black uppercase text-[11px] hover:text-white transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleCreateCompany, disabled: isUploading || !newCompanyName.trim(), className: "flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-[11px] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2", children: isUploading ? _jsx(RefreshCw, { className: "animate-spin", size: 14 }) : "Create Entity" })] })] }) })), showUploadModal && (_jsx("div", { className: "fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in", children: _jsxs("div", { className: "bg-slate-900 w-full max-w-md rounded-[50px] border border-white/10 p-12 space-y-10 shadow-2xl", children: [_jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto text-indigo-500", children: _jsx(FileSpreadsheet, { size: 32 }) }), _jsx("h3", { className: "text-3xl font-black text-white tracking-tighter", children: "Update Data" }), _jsx("p", { className: "text-slate-500 text-[10px] font-black uppercase tracking-widest", children: "Secure Cloud Upload" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3", children: [_jsx(AlertCircle, { className: "text-amber-500 shrink-0", size: 18 }), _jsxs("p", { className: "text-[10px] text-amber-500 font-medium leading-relaxed", children: [_jsx("strong", { children: "Warning:" }), " Uploading a new file will ", _jsx("u", { children: "overwrite" }), " any existing data for the selected company. Only the latest file is stored."] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase ml-2 mb-1 block", children: "Target Entity" }), _jsxs("div", { className: "relative", children: [_jsxs("select", { className: "w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500 appearance-none", value: targetUploadCompanyId, onChange: (e) => setTargetUploadCompanyId(e.target.value), children: [_jsx("option", { value: "", disabled: true, children: "Select Company..." }), companies.map(c => (_jsxs("option", { value: c.id, children: [c.name, " ", c.hasData ? '(Has Data)' : '(Empty)'] }, c.id)))] }), _jsx(ChevronDown, { className: "absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none", size: 16 })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase ml-2 mb-1 block", children: "Source File (.xlsx, .csv)" }), _jsx("input", { type: "file", onChange: handleFileSelect, accept: ".xlsx,.csv", className: "w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 cursor-pointer" })] })] }), _jsxs("div", { className: "flex gap-4 pt-4", children: [_jsx("button", { onClick: () => { setShowUploadModal(false); setUploadFile(null); setTargetUploadCompanyId(''); }, className: "flex-1 py-4 text-slate-500 font-black uppercase text-[11px] hover:text-white transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleUploadSubmit, disabled: isUploading || !targetUploadCompanyId || !uploadFile, className: "flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[11px] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2", children: isUploading ? _jsx(RefreshCw, { className: "animate-spin", size: 14 }) : "Overwrite Data" })] })] }) })), drillDownData && (_jsx("div", { className: "fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in", children: _jsxs("div", { className: "bg-slate-900 w-full max-w-7xl h-[90vh] rounded-[70px] border border-white/10 flex flex-col overflow-hidden shadow-2xl", children: [_jsxs("div", { className: "p-12 border-b border-white/5 flex flex-col space-y-8 bg-white/5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-4xl font-black text-white tracking-tighter", children: drillDownData.title }), _jsx("button", { onClick: () => setDrillDownData(null), className: "p-5 hover:bg-white/5 rounded-full text-slate-500", children: _jsx(X, { size: 44 }) })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-8 bg-slate-950/50 p-6 rounded-[32px]", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(CalendarDays, { className: "text-indigo-400", size: 14 }), _jsx("input", { type: "date", className: "bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white", value: dateRange.start, onChange: (e) => setDateRange(prev => ({ ...prev, start: e.target.value })) })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(CalendarDays, { className: "text-indigo-400", size: 14 }), _jsx("input", { type: "date", className: "bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white", value: dateRange.end, onChange: (e) => setDateRange(prev => ({ ...prev, end: e.target.value })) })] })] })] }), _jsx("div", { className: "flex-1 overflow-hidden p-12 bg-slate-950", children: _jsx(DataTable, { headers: currentData?.headers || [], rows: drillDownFiltered }) })] }) }))] }));
};
export default App;
