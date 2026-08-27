import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl flex-shrink-0 ${
              isDanger ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mt-1">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors flex items-center gap-2 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-600/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20'
            } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
