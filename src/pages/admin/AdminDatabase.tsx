import React, { useState, useEffect } from 'react';
import { Table, Search, Eye, ShieldCheck, RefreshCw } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { databaseService, TableSummary } from '../../services/databaseService';

export const AdminDatabase: React.FC = () => {
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('profiles');
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initTables = async () => {
    setIsLoading(true);
    try {
      const tList = await databaseService.getAvailableTables();
      setTables(tList);
      await loadTableData('profiles');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initTables();
  }, []);

  const loadTableData = async (tableName: string, query?: string) => {
    try {
      const data = await databaseService.getTableData(tableName, query);
      setTableData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectTable = async (name: string) => {
    setSelectedTable(name);
    setSearchQuery('');
    await loadTableData(name);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    loadTableData(selectedTable, q);
  };

  const currentTableObj = tables.find(t => t.name === selectedTable);
  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Database Schema & Record Inspector</h1>
          <p className="text-sm text-slate-500 mt-1">Authenticated relational database browser with live table inspection (Admin Only)</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authenticated Secure Access</span>
          </div>
        </div>
      </div>

      {/* Table Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tables.map(t => (
          <button
            key={t.name}
            onClick={() => handleSelectTable(t.name)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedTable === t.name
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{t.label}</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
              selectedTable === t.name ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Info Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder={`Search across ${currentTableObj?.label || 'table'} records...`}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">{tableData.length} records shown</span>
          <button
            onClick={() => loadTableData(selectedTable, searchQuery)}
            className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
            title="Refresh Table Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Data View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-900 text-white z-10">
              <tr>
                {columns.map(col => (
                  <th key={col} className="py-3 px-4 uppercase font-bold tracking-wider text-[11px] whitespace-nowrap">
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
                <th className="py-3 px-4 text-right uppercase font-bold tracking-wider text-[11px]">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={Math.max(columns.length + 1, 1)} className="py-12 text-center text-slate-400 font-sans">
                    Loading table records from database...
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td colSpan={Math.max(columns.length + 1, 1)} className="py-12 text-center text-slate-400 font-sans">
                    No records found in this table matching the query.
                  </td>
                </tr>
              ) : (
                tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    {columns.map(col => {
                      const val = row[col];
                      const str = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '');
                      return (
                        <td key={col} className="py-3 px-4 max-w-xs truncate text-slate-700">
                          {str}
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedRow(row)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Record JSON"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspector Modal */}
      <Modal
        isOpen={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
        title="Record Inspector (JSON)"
        subtitle={`Table: ${selectedTable}`}
        maxWidth="2xl"
      >
        {selectedRow && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto max-h-96">
              <pre>{JSON.stringify(selectedRow, null, 2)}</pre>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
