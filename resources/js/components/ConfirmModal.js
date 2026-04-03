import React from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import "../../sass/confirm-modal.scss";

export default function ConfirmModal({ isOpen, title, message, type = "warning", onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) {
  if (!isOpen) return null;

  const icons = {
    warning: <AlertTriangle size={48} className="modal-icon warning" />,
    success: <CheckCircle size={48} className="modal-icon success" />,
    danger: <XCircle size={48} className="modal-icon danger" />,
  };

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="confirm-body">
          {icons[type] || icons.warning}
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-message">{message}</p>
        </div>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onCancel}>{cancelText}</button>
          <button className={`btn-confirm ${type}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
