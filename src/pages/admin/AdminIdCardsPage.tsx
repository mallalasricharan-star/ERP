import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Printer,
  Search,
  School,
  QrCode,
  Phone,
  Calendar,
  User,
  ShieldCheck,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { Student, ClassRoom } from '../../types';

export const AdminIdCardsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stList, clList] = await Promise.all([
        studentService.getStudents({
          class_id: selectedClassId || undefined,
          search: searchQuery || undefined
        }),
        classService.getClasses()
      ]);
      setStudents(stList);
      setClasses(clList);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load students for ID generation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClassId, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Screen Page Header (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Exclusive Authority</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Student ID Card Generator</h1>
          <p className="text-sm text-slate-500 mt-1">Generate official high-security student identity cards formatted for batch printing</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print All ID Cards ({students.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Hidden on Print) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search student or admission no..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
          >
            <option value="">All Classes (1 to 6)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Class {c.class_number}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Displaying {students.length} Student ID Cards
        </span>
      </div>

      {/* ID CARDS GRID (Both Screen & Print Formatted) */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 print:hidden">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 print:hidden">
          No students found matching your selected class.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 print:p-0">
          {students.map((st, index) => {
            const avatarColor = getAvatarBg(index);
            const initials = st.student_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

            return (
              <div
                key={st.id}
                className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden relative flex flex-col justify-between print:shadow-none print:border-slate-400 print:break-inside-avoid"
                style={{ width: '100%', minHeight: '260px' }}
              >
                {/* ID Header */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-white">
                      <School className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold tracking-wider uppercase">EDUPRIME SCHOOL</h4>
                      <p className="text-[9px] text-blue-200 font-medium">STUDENT IDENTITY CARD • 2026-27</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    CLASS {st.class_number}
                  </span>
                </div>

                {/* ID Body */}
                <div className="p-4 flex gap-4">
                  {/* Photo / Avatar */}
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className={`w-20 h-24 rounded-xl ${avatarColor} text-white flex flex-col items-center justify-center font-bold text-xl shadow-inner border border-slate-200`}>
                      <span>{initials}</span>
                      <span className="text-[9px] font-mono opacity-80 mt-1">PHOTO</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-500">
                      ROLL #{st.roll_number}
                    </span>
                  </div>

                  {/* Student Demographic Details */}
                  <div className="space-y-1 text-xs text-slate-700 flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate">{st.student_name}</h3>
                    
                    <div className="pt-0.5 space-y-0.5 text-[11px]">
                      <p className="flex items-center gap-1">
                        <span className="font-bold text-slate-500 w-16">Adm No:</span>
                        <span className="font-mono font-bold text-blue-700">{st.admission_number}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="font-bold text-slate-500 w-16">Grade:</span>
                        <span className="font-semibold text-slate-800">Class {st.class_number} (Sec {st.section})</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="font-bold text-slate-500 w-16">DOB:</span>
                        <span className="text-slate-800">{st.date_of_birth}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="font-bold text-slate-500 w-16">Guardian:</span>
                        <span className="truncate text-slate-800">{st.father_name || st.mother_name || 'N/A'}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="font-bold text-slate-500 w-16">Emergency:</span>
                        <span className="font-mono text-slate-900 font-semibold">{st.parent_phone || '—'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* ID Footer (Barcode / Authority Signature) */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="font-mono tracking-tighter text-slate-400">||||| |||| || |||||||</div>
                    <span className="font-mono">{st.admission_number}</span>
                  </div>
                  <span className="font-bold text-slate-700 uppercase italic">Principal Sign</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function getAvatarBg(index: number): string {
  const bgs = [
    'bg-blue-600',
    'bg-emerald-600',
    'bg-purple-600',
    'bg-indigo-600',
    'bg-teal-600',
    'bg-cyan-600'
  ];
  return bgs[index % bgs.length];
}
