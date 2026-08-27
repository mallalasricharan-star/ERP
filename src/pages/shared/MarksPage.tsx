import React, { useState, useEffect } from 'react';
import { Award, Save, Download, School, BookOpen, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { marksService } from '../../services/marksService';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import { studentService } from '../../services/studentService';
import { excelService } from '../../services/excelService';
import { calculateGrade } from '../../lib/utils';
import { ClassRoom, Subject, Student, Mark } from '../../types';

export const MarksPage: React.FC = () => {
  const { role, user } = useAuth();
  const toast = useToast();

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marksMap, setMarksMap] = useState<{ [studentId: string]: number | '' }>({});

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const isTeacher = role === 'teacher';

  // Load Classes on mount
  useEffect(() => {
    const loadClasses = async () => {
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
    loadClasses();
  }, [isTeacher, user]);

  // Load Subjects when class changes
  useEffect(() => {
    if (!selectedClassId) return;

    const loadSubjects = async () => {
      try {
        const subList = await subjectService.getSubjects(selectedClassId);
        setSubjects(subList);
        if (subList.length > 0) {
          setSelectedSubjectId(subList[0].id);
        } else {
          setSelectedSubjectId('');
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };

    loadSubjects();
  }, [selectedClassId]);

  // Load Students and existing marks when Class and Subject are selected
  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId) {
      setStudents([]);
      setMarksMap({});
      return;
    }

    const loadStudentsAndMarks = async () => {
      setIsLoading(true);
      setValidationError('');
      try {
        const [studentList, existingMarks] = await Promise.all([
          studentService.getStudents({ class_id: selectedClassId }),
          marksService.getMarks({ class_id: selectedClassId, subject_id: selectedSubjectId })
        ]);

        setStudents(studentList);

        const map: { [studentId: string]: number | '' } = {};
        studentList.forEach(s => {
          const m = existingMarks.find(em => em.student_id === s.id);
          map[s.id] = m !== undefined ? m.marks : '';
        });
        setMarksMap(map);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudentsAndMarks();
  }, [selectedClassId, selectedSubjectId]);

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const maxMarks = currentSubject?.maximum_marks || 100;

  const handleMarkChange = (studentId: string, value: string) => {
    setValidationError('');
    if (value === '') {
      setMarksMap(prev => ({ ...prev, [studentId]: '' }));
      return;
    }

    const num = Number(value);
    if (isNaN(num)) return;

    if (num < 0) {
      setValidationError('Marks cannot be negative.');
      return;
    }
    if (num > maxMarks) {
      setValidationError(`Marks cannot exceed the maximum mark threshold of ${maxMarks} for ${currentSubject?.subject_name}.`);
      return;
    }

    setMarksMap(prev => ({ ...prev, [studentId]: num }));
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !selectedSubjectId) return;

    // Validate entries
    const entries: { student_id: string; marks: number }[] = [];
    for (const st of students) {
      const val = marksMap[st.id];
      if (val === '' || val === undefined) {
        setValidationError(`Please enter marks for ${st.student_name} (Roll #${st.roll_number}).`);
        return;
      }
      if (Number(val) < 0 || Number(val) > maxMarks) {
        setValidationError(`Invalid marks for ${st.student_name}. Must be between 0 and ${maxMarks}.`);
        return;
      }
      entries.push({ student_id: st.id, marks: Number(val) });
    }

    setIsSaving(true);
    try {
      await marksService.saveBatchMarks(selectedClassId, selectedSubjectId, entries);
      toast.success(`Academic marks recorded successfully for ${currentSubject?.subject_name} (${entries.length} students).`);
      setValidationError('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save marks');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedClassObj = classes.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Academic Marks Entry</h1>
          <p className="text-sm text-slate-500 mt-1">Class-wise and subject-wise examination scores with instant grade computing</p>
        </div>

        <button
          onClick={() => excelService.exportMarksReport(selectedClassId || undefined)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Export Marks Excel</span>
        </button>
      </div>

      {/* Class & Subject Selector Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select Class
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

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 min-w-[180px]"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.subject_name} (Max: {s.maximum_marks})
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentSubject && (
          <div className="flex items-center gap-3 bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs text-blue-900">
            <Award className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <span className="font-bold">{currentSubject.subject_name}</span>
              <span className="text-slate-500 block text-[11px]">Maximum Score: <strong className="text-blue-700">{currentSubject.maximum_marks} pts</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Marks Table */}
      <form onSubmit={handleSaveMarks} className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Score Sheet: Class {selectedClassObj?.class_number || ''} — {currentSubject?.subject_name || 'Subject'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Input obtained marks (0 to {maxMarks}) for each student</p>
            </div>

            <button
              type="submit"
              disabled={isSaving || students.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Marks'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Admission No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4 w-40">Obtained Marks</th>
                  <th className="py-3 px-4 text-center">Score %</th>
                  <th className="py-3 px-4 text-center">Calculated Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No students enrolled in this class.
                    </td>
                  </tr>
                ) : (
                  students.map(student => {
                    const rawVal = marksMap[student.id];
                    const numVal = rawVal === '' || rawVal === undefined ? 0 : Number(rawVal);
                    const pct = maxMarks > 0 ? Math.round((numVal / maxMarks) * 100) : 0;
                    const { grade, color } = calculateGrade(pct);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-700">#{student.roll_number}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 text-xs">{student.admission_number}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{student.student_name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 font-semibold">{maxMarks}</td>
                        <td className="py-3.5 px-4">
                          <input
                            type="number"
                            min={0}
                            max={maxMarks}
                            required
                            value={rawVal ?? ''}
                            onChange={e => handleMarkChange(student.id, e.target.value)}
                            placeholder="0"
                            className="w-24 px-3 py-1.5 text-sm font-bold text-slate-900 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 outline-none text-center bg-white"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {rawVal !== '' && rawVal !== undefined ? `${pct}%` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {rawVal !== '' && rawVal !== undefined ? (
                            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold border ${color}`}>
                              {grade}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving || students.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Recording Scores...' : 'Save & Commit Marks'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
