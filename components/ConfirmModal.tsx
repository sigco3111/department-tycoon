import React from 'react';
import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void; // Corresponds to Modal's onClose, usually same as onCancel
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  onCancel,
  confirmButtonText = "확인",
  cancelButtonText = "취소",
  confirmButtonClass = "bg-red-600 hover:bg-red-500",
  cancelButtonClass = "bg-slate-600 hover:bg-slate-500",
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-slate-300 mb-6 whitespace-pre-line">
        {message}
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className={`px-4 py-2 rounded-md text-white shadow-md transition-colors text-sm font-medium ${cancelButtonClass}`}
        >
          {cancelButtonText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-md text-white shadow-md transition-colors text-sm font-medium ${confirmButtonClass}`}
        >
          {confirmButtonText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
