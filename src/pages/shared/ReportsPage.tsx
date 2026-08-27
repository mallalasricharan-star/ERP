import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  School,
  Award,
  CalendarCheck,
  CheckCircle2,
  User,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { marksService } from '../../services/marksService';
import { excelService } from '../../services/excelService';
import { calculateGrade, formatDate } from '../../lib/utils';
import { ClassRoom, Student, StudentReport } from '../../types';

export const ReportsPage: React.FC = () => {
  const { role, user } = useAuth();

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const [report, setReport] = useState<StudentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isTeacher = role === 'teacher';

  // Load classes on mount
  useEffect(() => {
    const loadInit = async () => {
      setIsLoading(true);
      try {
        const clsList = await classService.getClasses();
        setClasses(clsList);

        let defaultClassId = clsList[0]?.id || '';
        if (isTeacher && user?.assigned_class) {
          const matched = clsList.find(
            c => `Class ${c.class_number}` === user.assigned_class || c.id === user.assigned_class_id
          );
          if (matched) defaultClassId = matched.id;
        }

        setSelectedClassId(defaultClassId);
      } finally {
        setIsLoading(false);
      }
    };
    loadInit();
  }, [isTeacher, user]);

  // Load students when class changes
  useEffect(() => {
    if (!selectedClassId) return;

    const loadStudents = async () => {
      try {
        const stList = await studentService.getStudents({ class_id: selectedClassId });
        setStudents(stList);
        if (stList.length > 0) {
          setSelectedStudentId(stList[0].id);
        } else {
          setSelectedStudentId('');
          setReport(null);
        }
      } catch (err) {
        console.error('Error loading students:', err);
      }
    };

    loadStudents();
  }, [selectedClassId]);

  // Load report when selected student changes
  useEffect(() => {
    if (!selectedStudentId) {
      setReport(null);
      return;
    }

    const loadReport = async () => {
      setIsLoading(true);
      try {
        const rep = await marksService.getStudentReport(selectedStudentId);
        setReport(rep);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [selectedStudentId]);

  const handlePrint = () => {
    window.print();
  };

  const selectedClassObj = classes.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Non-printable Controls Header */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Academic Marksheet & Report Card</h1>
          <p className="text-sm text-slate-500 mt-1">Generate official grade report cards with auto-calculated GPA and attendance telemetry</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => excelService.exportMarksReport(selectedClassId || undefined)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Class Excel</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!report}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report Card</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar (Hidden during Print) */}
      <div className="print:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Class
          </label>
          <select
            disabled={isTeacher}
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Class {c.class_number} (Sec {c.section})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Select Student
          </label>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                #{s.roll_number} - {s.student_name} ({s.admission_number})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Report Card Document as per requirement #23 */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : report ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-10 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
          {/* Institutional Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold mb-2 shadow-md shadow-blue-500/30">
              <School className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              EduPrime International School
            </h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
              Affiliated Academic Foundation • Academic Session 2026–2027
            </p>
            <div className="inline-block mt-3 px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wider">
              Comprehensive Progress Report Card
            </div>
          </div>

          {/* Student Profile Overview Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 my-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Student Name</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{report.student.student_name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Admission Number</span>
              <span className="text-sm font-mono font-bold text-blue-600 mt-0.5 block">{report.student.admission_number}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Class & Section</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">Class {report.class_number} - Section {report.student.section}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Roll Number</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">#{report.student.roll_number}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Date of Birth</span>
              <span className="font-semibold text-slate-700 mt-0.5 block">{formatDate(report.student.date_of_birth)}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Gender</span>
              <span className="font-semibold text-slate-700 mt-0.5 block">{report.student.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Father / Mother</span>
              <span className="font-semibold text-slate-700 mt-0.5 block">{report.student.father_name || report.student.mother_name || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Emergency Phone</span>
              <span className="font-mono font-semibold text-slate-700 mt-0.5 block">{report.student.parent_phone || '—'}</span>
            </div>
          </div>

          {/* Academic Marksheet Table */}
          <div className="my-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Academic Performance & Subject Marks</span>
            </h3>

            <div className="rounded-2xl border border-slate-300 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4 text-center">Maximum Marks</th>
                    <th className="py-3 px-4 text-center">Obtained Marks</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.marks.map((sub, i) => {
                    const { color } = calculateGrade(sub.percentage);
                    return (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{sub.subject_name}</td>
                        <td className="py-3 px-4 text-center font-mono font-medium text-slate-500">{sub.maximum_marks}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900">{sub.obtained_marks}</td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-700">{sub.percentage}%</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-xs border ${color}`}>
                            {sub.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-900">
                    <td className="py-3 px-4 uppercase tracking-wider">Grand Total</td>
                    <td className="py-3 px-4 text-center font-mono">{report.total_maximum}</td>
                    <td className="py-3 px-4 text-center font-mono text-blue-700 text-base">{report.total_obtained}</td>
                    <td className="py-3 px-4 text-center text-blue-700 text-base">{report.overall_percentage}%</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-lg font-extrabold text-sm">
                        {report.overall_grade}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Attendance Summary Section */}
          <div className="my-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 text-white rounded-xl">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Annual Attendance Record</h4>
                <p className="text-xs text-slate-500 mt-0.5">Recorded roll call participation for academic year</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-bold text-slate-800 text-center">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Working Days</span>
                <span className="text-base">{report.attendance_summary.total_days || 1}</span>
              </div>
              <div>
                <span className="text-emerald-600 text-[10px] uppercase block">Days Present</span>
                <span className="text-base text-emerald-600">{report.attendance_summary.present_days}</span>
              </div>
              <div>
                <span className="text-rose-600 text-[10px] uppercase block">Days Absent</span>
                <span className="text-base text-rose-600">{report.attendance_summary.absent_days}</span>
              </div>
              <div>
                <span className="text-blue-600 text-[10px] uppercase block">Attendance Pct</span>
                <span className="text-base text-blue-700">{report.attendance_summary.percentage}%</span>
              </div>
            </div>
          </div>

          {/* Grading Scale Reference */}
          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800 uppercase block mb-1.5">Official Grading Scale Reference:</span>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center font-medium">
              <div className="p-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">90–100: A+</div>
              <div className="p-1 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold">80–89: A</div>
              <div className="p-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold">70–79: B+</div>
              <div className="p-1 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">60–69: B</div>
              <div className="p-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">50–59: C</div>
              <div className="p-1 rounded bg-orange-50 text-orange-800 border border-orange-200 font-bold">40–49: D</div>
              <div className="p-1 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold">&lt;40: F</div>
            </div>
          </div>

          {/* Institutional Signatures */}
          <div className="grid grid-cols-3 gap-8 pt-12 mt-8 border-t border-slate-200 text-center text-xs text-slate-600">
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-2"></div>
              <span className="font-bold text-slate-800">Class Teacher Signature</span>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-2"></div>
              <span className="font-bold text-slate-800">Head Master Signature</span>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-2"></div>
              <span className="font-bold text-slate-800">Institutional Seal</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border text-center text-slate-500">
          Select a student from the menu above to generate the report card.
        </div>
      )}
    </div>
  );
};
