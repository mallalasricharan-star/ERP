import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  PlusCircle,
  Download,
  Printer,
  Search,
  School,
  Layers,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { bookService } from '../../services/bookService';
import { classService } from '../../services/classService';
import { Book, ClassRoom } from '../../types';

export const BookStockPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add Book Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClassId, setNewClassId] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newTotalStock, setNewTotalStock] = useState('50');
  const [newPublisher, setNewPublisher] = useState('NCERT');

  // Adjust Stock Modal
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editTotal, setEditTotal] = useState('');
  const [editIssued, setEditIssued] = useState('');

  // Delete Dialog
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toast = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bList, cList] = await Promise.all([
        bookService.getBooks({ class_id: selectedClassId || undefined, search: searchQuery || undefined }),
        classService.getClasses()
      ]);
      setBooks(bList);
      setClasses(cList);
      if (cList.length > 0 && !newClassId) {
        setNewClassId(cList[0].id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load book stock');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClassId, searchQuery]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookService.addBook({
        book_title: newTitle,
        class_id: newClassId,
        subject: newSubject || 'General',
        total_stock: Number(newTotalStock),
        publisher: newPublisher
      });
      toast.success('Book stock entry added successfully.');
      setIsAddModalOpen(false);
      setNewTitle('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add book');
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    try {
      await bookService.updateStock(editingBook.id, Number(editTotal), Number(editIssued));
      toast.success('Stock adjusted.');
      setEditingBook(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to adjust stock');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await bookService.deleteBook(deletingId);
      toast.success('Book record removed.');
      setDeletingId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handlePrintStock = () => {
    window.print();
  };

  const totalCopies = books.reduce((sum, b) => sum + b.total_stock, 0);
  const totalIssued = books.reduce((sum, b) => sum + b.issued_stock, 0);
  const totalAvailable = books.reduce((sum, b) => sum + b.available_stock, 0);

  return (
    <div className="space-y-6">
      {/* Printable Header (Visible Only in Print) */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">EduPrime School Management System</h1>
        <h2 className="text-base font-bold text-slate-700 mt-1">Official Textbook & Curriculum Stock Report</h2>
        <p className="text-xs text-slate-500 mt-1">
          Date: {new Date().toLocaleDateString()} • Academic Year: 2026-2027
        </p>
      </div>

      {/* Screen Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Textbook & Curriculum Stock Management</h1>
          <p className="text-sm text-slate-500 mt-1">Track textbook distribution, inventory quantities, and print official stock sheets</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrintStock}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Stock Sheet</span>
          </button>
          <button
            type="button"
            onClick={() => bookService.exportToExcel(books)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Excel Export</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Book Entry</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Book Titles</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{books.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Print Stock</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{totalCopies}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Issued to Students</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{totalIssued}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Available in Store</span>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">{totalAvailable}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title or subject..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
          >
            <option value="">All Classes (1–6)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Class {c.class_number}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">{books.length} titles in stock</span>
      </div>

      {/* Stock Table (Both Screen & Print) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Publisher</th>
                <th className="py-3 px-4 text-center">Total Stock</th>
                <th className="py-3 px-4 text-center">Issued</th>
                <th className="py-3 px-4 text-center">Available</th>
                <th className="py-3 px-4 text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading book stock inventory...</td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">No book entries found for this class.</td>
                </tr>
              ) : (
                books.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-extrabold text-[11px]">
                        Class {b.class_number}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{b.book_title}</td>
                    <td className="py-3.5 px-4 text-slate-600">{b.subject}</td>
                    <td className="py-3.5 px-4 text-slate-500">{b.publisher || 'NCERT'}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">{b.total_stock}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">{b.issued_stock}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-blue-600">
                      <span className={`px-2 py-0.5 rounded-full ${b.available_stock > 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {b.available_stock}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right print:hidden">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingBook(b);
                            setEditTotal(String(b.total_stock));
                            setEditIssued(String(b.issued_stock));
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Adjust Stock"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(b.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Book"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD BOOK MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Textbook Stock Entry"
        subtitle="Record new curriculum textbook allocation"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Book Title *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Marigold English Textbook"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Class *
              </label>
              <select
                value={newClassId}
                onChange={e => setNewClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    Class {c.class_number} (Sec {c.section})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                placeholder="e.g. English, Maths"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Stock Quantity *
              </label>
              <input
                type="number"
                min={1}
                required
                value={newTotalStock}
                onChange={e => setNewTotalStock(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Publisher
              </label>
              <input
                type="text"
                value={newPublisher}
                onChange={e => setNewPublisher(e.target.value)}
                placeholder="e.g. NCERT / State Board"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Book Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* ADJUST STOCK MODAL */}
      <Modal
        isOpen={Boolean(editingBook)}
        onClose={() => setEditingBook(null)}
        title="Adjust Book Inventory"
        subtitle={editingBook?.book_title}
      >
        <form onSubmit={handleUpdateStock} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Print Stock
              </label>
              <input
                type="number"
                min={0}
                required
                value={editTotal}
                onChange={e => setEditTotal(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Issued to Students
              </label>
              <input
                type="number"
                min={0}
                max={Number(editTotal) || 0}
                required
                value={editIssued}
                onChange={e => setEditIssued(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 text-xs font-semibold text-slate-600 flex justify-between">
            <span>Calculated Available Stock:</span>
            <span className="font-bold text-blue-600">{Math.max(0, (Number(editTotal) || 0) - (Number(editIssued) || 0))} Copies</span>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingBook(null)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Book Record"
        message="Are you sure you want to remove this textbook stock entry from the inventory?"
        confirmText="Delete Entry"
        isDanger={true}
      />
    </div>
  );
};
