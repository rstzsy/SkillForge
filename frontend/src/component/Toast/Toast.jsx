import { useEffect } from 'react';
import './Toast.css';

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-animation">
      <div className="toast-notification">
        <div className="toast-content">
          {/* Icon */}
          {/* <div className="toast-icon">
            <svg className="toast-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div> */}
          
          {/* Message */}
          <span className="toast-message">{message}</span>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="toast-close"
          aria-label="Close"
        >
          <svg className="toast-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Toast;