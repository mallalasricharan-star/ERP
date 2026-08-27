import React from 'react';
import { Download, FileSpreadsheet, School, Award, Users, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { excelService } from '../../services/excelService';

export const ExcelDownloadsPage: React.FC = () => {
  const { role, user } = useAuth();
  const toast = useToast();

  const handleDownloadClassAttendance = (classNum: number) => {
    try {
      excelService.exportClassAttendance(classNum);
      toast.success(`Class ${classNum} Attendance Excel file generated.`);
    } catch (err: any) {
      toast.error(err.message || 'Export failed');
    }
  };

  const handleDownloadMarks = () => {
    try {
      excelService.exportMarksReport();
      toast.success('Comprehensive Marks Report Excel file generated.');
    } catch (err: any) {
      toast.error(err.message || 'Export failed');
    }
  };

  const handleDownloadStudents = () => {
    try {
      excelService.exportStudentRegistry();
      toast.success('Student Registry Master Excel file generated.');
    } catch (err: any) {
      toast.error(err.message || 'Export failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Excel Export Center</h1>
        <p className="text-sm text-slate-500 mt-1">Export real database telemetry directly to Microsoft Excel format using SheetJS</p>
      </div>

      {/* Class Attendance Matrix Section as per requirement #19 */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Class-Wise Attendance Excel Matrices</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Includes student roster, calendar date columns (01-Aug, 02-Aug, ...), total present, absent, and attendance %
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          {[1, 2, 3, 4, 5, 6].map(classNum => (
            <div
              key={classNum}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-slate-900">Class {classNum}</span>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    Attendance Matrix
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Full monthly attendance matrix with daily status and percentages.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadClassAttendance(classNum)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Class {classNum} Excel</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Global Academic & Demographics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marks Excel Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Master Academic Scores Excel</h3>
                <p className="text-xs text-slate-500">All student marks across classes 1–6</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Exports comprehensive student marksheet including all subjects (English, Mathematics, Science, etc.), total obtained, total maximum, percentage, and assigned grades.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadMarks}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Marks Excel</span>
          </button>
        </div>

        {/* Student Master Registry Excel */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Registry Master Excel</h3>
                <p className="text-xs text-slate-500">Demographic and admission directory</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Exports all student demographic records: admission numbers, roll numbers, DOB, gender, father/mother names, residential addresses, and parent emergency phones.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadStudents}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm shadow-purple-600/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Student List Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
