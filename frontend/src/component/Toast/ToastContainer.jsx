import { useEffect, useRef, useState } from "react";
import Toast from "./Toast";

let toastRef = null;

export function useToast() {
  return (message) => {
    toastRef?.current?.(message);
  };
}

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const addToast = useRef(null);

  useEffect(() => {
    addToast.current = (message) => {
      setToasts(prev => [
        ...prev,
        { id: Date.now(), message }
      ]);
    };
    toastRef = addToast;
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast
          key={t.id}
          message={t.message}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
