import React, { useState, useEffect } from 'react';
import { BookOpen, PlusCircle, Edit2, Trash2, School, Award, Filter } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { subjectService } from '../../services/subjectService';
import { classService } from '../../services/classService';
import { ClassRoom, Subject } from '../../types';

export const AdminSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClassFilter, setSelectedClassFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    subject_name: '',
    class_id: '',
    maximum_marks: 100
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subs, clsList] = await Promise.all([
        subjectService.getSubjects(selectedClassFilter || undefined),
        classService.getClasses()
      ]);
      setSubjects(subs);
      setClasses(clsList);
      if (clsList.length > 0 && !formData.class_id) {
        setFormData(prev => ({ ...prev, class_id: clsList[0].id }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClassFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await subjectService.addSubject(formData);
      toast.success(`Subject "${formData.subject_name}" created.`);
      setIsAddModalOpen(false);
      setFormData({
        subject_name: '',
        class_id: classes[0]?.id || '',
        maximum_marks: 100
      });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    setIsSubmitting(true);
    try {
      await subjectService.updateSubject(selectedSubject.id, {
        subject_name: formData.subject_name,
        maximum_marks: Number(formData.maximum_marks)
      });
      toast.success('Subject details updated.');
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedSubject) return;
    setIsSubmitting(true);
    try {
      await subjectService.deleteSubject(selectedSubject.id);
      toast.success('Subject removed.');
      setIsDeleteDialogOpen(false);
      setSelectedSubject(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Subjects Curriculum</h1>
          <p className="text-sm text-slate-500 mt-1">Administer class-wise curriculum subjects and maximum scoring thresholds (Admin Only)</p>
        </div>

        <button
          onClick={() => {
            setFormData({
              subject_name: '',
              class_id: classes[0]?.id || '',
              maximum_marks: 100
            });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Class Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Filter By Class:</span>
          <select
            value={selectedClassFilter}
            onChange={e => setSelectedClassFilter(e.target.value)}
            className="py-1.5 px-3 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white text-slate-800 font-medium"
          >
            <option value="">All Classes (1 to 6)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>Class {c.class_number}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {subjects.length} Subjects Total
        </span>
      </div>

      {/* Subjects Grid grouped by Class */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))
        ) : subjects.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border">
            No subjects configured for the selected class.
          </div>
        ) : (
          subjects.map(subject => (
            <div
              key={subject.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex flex-col justify-between hover:border-blue-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{subject.subject_name}</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1">
                        <School className="w-3 h-3" />
                        Class {subject.class_number}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Maximum Marks</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                    {subject.maximum_marks} pts
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedSubject(subject);
                    setFormData({
                      subject_name: subject.subject_name,
                      class_id: subject.class_id,
                      maximum_marks: subject.maximum_marks
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedSubject(subject);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Subject Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Subject">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={formData.subject_name}
              onChange={e => setFormData({ ...formData, subject_name: e.target.value })}
              placeholder="e.g. Mathematics, Science, Telugu"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Class *</label>
            <select
              value={formData.class_id}
              onChange={e => setFormData({ ...formData, class_id: e.target.value })}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 bg-white"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>Class {c.class_number}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Maximum Marks *</label>
            <input
              type="number"
              min={1}
              required
              value={formData.maximum_marks}
              onChange={e => setFormData({ ...formData, maximum_marks: Number(e.target.value) })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Subject Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={formData.subject_name}
              onChange={e => setFormData({ ...formData, subject_name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Maximum Marks *</label>
            <input
              type="number"
              min={1}
              required
              value={formData.maximum_marks}
              onChange={e => setFormData({ ...formData, maximum_marks: Number(e.target.value) })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteSubmit}
        title="Delete Subject"
        message={`Are you sure you want to remove "${selectedSubject?.subject_name}" from Class ${selectedSubject?.class_number}? Existing marks associated with this subject will also be affected.`}
        confirmText="Delete Subject"
        isLoading={isSubmitting}
      />
    </div>
  );
};
