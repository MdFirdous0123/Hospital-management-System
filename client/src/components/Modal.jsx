import { FiX } from 'react-icons/fi';

// Reusable modal — pass title, onClose, children (body), and footer (buttons)
export default function Modal({ title, onClose, children, footer, maxWidth = 520 }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn-icon" onClick={onClose}><FiX /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
