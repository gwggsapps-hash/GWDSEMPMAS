import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { generatePivotData } from '../utils/dataProcessor';
export const PivotView = ({ rows, headers }) => {
    const [config, setConfig] = useState({
        rowField: headers[0],
        columnField: headers[1] || headers[0],
        valueField: headers.find(h => h.includes('Number')) || headers[0],
        aggType: 'count'
    });
    const pivotData = useMemo(() => {
        return generatePivotData(rows, config.rowField, config.columnField, config.valueField, config.aggType);
    }, [rows, config]);
    const handleExportPivot = () => {
        const headerRow = [config.rowField, ...pivotData.columns].join(',');
        const bodyRows = pivotData.rows.map((r) => {
            const rowVals = [r.row, ...pivotData.columns.map(c => r[c] || 0)];
            return rowVals.join(',');
        });
        const csvContent = [headerRow, ...bodyRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `pivot_export_${new Date().getTime()}.csv`);
        link.click();
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row items-end gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200", children: [_jsxs("div", { className: "flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 mb-1 uppercase", children: "Rows" }), _jsx("select", { className: "w-full p-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none", value: config.rowField, onChange: (e) => setConfig({ ...config, rowField: e.target.value }), children: headers.map(h => _jsx("option", { value: h, children: h }, h)) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 mb-1 uppercase", children: "Columns" }), _jsx("select", { className: "w-full p-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none", value: config.columnField, onChange: (e) => setConfig({ ...config, columnField: e.target.value }), children: headers.map(h => _jsx("option", { value: h, children: h }, h)) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 mb-1 uppercase", children: "Values" }), _jsx("select", { className: "w-full p-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none", value: config.valueField, onChange: (e) => setConfig({ ...config, valueField: e.target.value }), children: headers.map(h => _jsx("option", { value: h, children: h }, h)) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 mb-1 uppercase", children: "Aggregator" }), _jsxs("select", { className: "w-full p-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none", value: config.aggType, onChange: (e) => setConfig({ ...config, aggType: e.target.value }), children: [_jsx("option", { value: "count", children: "Count" }), _jsx("option", { value: "sum", children: "Sum" })] })] })] }), _jsxs("button", { onClick: handleExportPivot, className: "bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 whitespace-nowrap h-[42px]", children: [_jsx(Download, { size: 18 }), " Export Pivot"] })] }), _jsx("div", { className: "overflow-auto border border-slate-200 rounded-xl shadow-sm bg-white custom-scrollbar max-h-[500px]", children: _jsxs("table", { className: "w-full text-sm text-left border-collapse", children: [_jsx("thead", { className: "bg-slate-50 sticky top-0 z-10 shadow-sm", children: _jsxs("tr", { children: [_jsxs("th", { className: "px-5 py-4 font-bold border-b border-slate-200 bg-slate-100 text-slate-700 uppercase text-xs tracking-wider", children: [config.rowField, " ", _jsx("span", { className: "text-slate-400 font-normal", children: "by" }), " ", config.columnField] }), pivotData.columns.map(c => (_jsx("th", { className: "px-5 py-4 font-bold border-b border-slate-200 text-center text-slate-700 uppercase text-xs tracking-wider min-w-[100px]", children: c }, c)))] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: pivotData.rows.map((r, i) => (_jsxs("tr", { className: "hover:bg-indigo-50/30 transition-colors", children: [_jsx("td", { className: "px-5 py-3 font-semibold border-r border-slate-100 bg-slate-50/50 text-slate-800", children: r.row }), pivotData.columns.map(c => (_jsx("td", { className: "px-5 py-3 text-center text-slate-600", children: r[c] !== undefined ? r[c].toLocaleString() : '-' }, c)))] }, i))) })] }) })] }));
};
