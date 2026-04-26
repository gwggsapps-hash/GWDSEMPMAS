import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
const HighlightedText = ({ text, term }) => {
    if (!term)
        return _jsx(_Fragment, { children: text });
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return (_jsx(_Fragment, { children: parts.map((part, i) => part.toLowerCase() === term.toLowerCase() ? (_jsx("mark", { className: "bg-yellow-200 text-yellow-900 rounded-sm px-0.5 font-bold", children: part }, i)) : (part)) }));
};
export const DataTable = ({ headers, rows, highlightTerm = "" }) => {
    const [columnWidths, setColumnWidths] = useState({});
    const resizingRef = useRef(null);
    const onMouseDown = (header, e) => {
        const startX = e.pageX;
        const startWidth = columnWidths[header] || 200;
        resizingRef.current = { index: header, startX, startWidth };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        // Prevent text selection while resizing
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
    };
    const onMouseMove = (e) => {
        if (!resizingRef.current)
            return;
        const { index, startX, startWidth } = resizingRef.current;
        const diff = e.pageX - startX;
        const newWidth = Math.max(100, startWidth + diff);
        setColumnWidths((prev) => ({ ...prev, [index]: newWidth }));
    };
    const onMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
    };
    return (_jsx("div", { className: "overflow-auto max-h-[650px] border border-slate-200 rounded-2xl shadow-xl bg-white custom-scrollbar", children: _jsxs("table", { className: "w-full text-sm text-left border-collapse table-fixed", style: { width: 'max-content', minWidth: '100%' }, children: [_jsx("thead", { className: "bg-slate-50 sticky top-0 z-20 shadow-md", children: _jsx("tr", { children: headers.map((h, i) => {
                            const isSplit = h.includes('(');
                            const width = columnWidths[h] || 200;
                            return (_jsxs("th", { className: `relative px-6 py-4 font-bold text-slate-700 border-b border-slate-200 whitespace-nowrap uppercase tracking-wider text-[11px] ${isSplit ? 'bg-indigo-50/50' : ''}`, style: { width: `${width}px` }, children: [_jsxs("div", { className: "flex flex-col truncate pr-4", children: [_jsx("span", { className: isSplit ? 'text-indigo-600 truncate' : 'truncate', children: h.split('(')[0] }), isSplit && _jsxs("span", { className: "text-[9px] font-black text-indigo-400 mt-0.5", children: ["[", h.split('(')[1].replace(')', ''), "]"] })] }), _jsx("div", { onMouseDown: (e) => onMouseDown(h, e), className: "absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-indigo-400/50 transition-colors z-30" })] }, i));
                        }) }) }), _jsxs("tbody", { className: "divide-y divide-slate-100", children: [rows.map((row, rowIndex) => (_jsx("tr", { className: "hover:bg-indigo-50/20 transition-colors group", children: headers.map((h, colIndex) => {
                                const isSplit = h.includes('(');
                                const val = row[h] !== undefined ? String(row[h]) : "";
                                const width = columnWidths[h] || 200;
                                return (_jsx("td", { className: `px-6 py-4 text-slate-600 border-b border-slate-50 break-words leading-relaxed ${isSplit ? 'bg-indigo-50/10' : ''}`, style: { width: `${width}px` }, children: val ? (_jsx(HighlightedText, { text: val, term: highlightTerm })) : (_jsx("span", { className: "text-slate-200 italic font-light", children: "empty" })) }, colIndex));
                            }) }, rowIndex))), rows.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: headers.length, className: "px-6 py-20 text-center text-slate-400", children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("div", { className: "w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-2xl", children: "\uD83D\uDD0D" }) }), _jsx("p", { className: "font-bold uppercase tracking-widest text-xs", children: "No records matching the filter criteria." })] }) }) }))] })] }) }));
};
