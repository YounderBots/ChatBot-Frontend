/**
 * useToast — lightweight inline-toast hook (no third-party library required).
 *
 * Usage:
 *   const { toasts, showToast, ToastContainer } = useToast();
 *   // in JSX: <ToastContainer />
 *   // trigger: showToast("Saved!", "success")  // variant: success | danger | warning | info
 */
import { useCallback, useState } from "react";
import { Alert } from "react-bootstrap";

let _id = 0;

export function useToast(autoHideMs = 3500) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = "success") => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), autoHideMs);
  }, [autoHideMs]);

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const ToastContainer = () => (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 280,
        maxWidth: 400,
      }}
    >
      {toasts.map(t => (
        <Alert
          key={t.id}
          variant={t.variant}
          dismissible
          onClose={() => dismiss(t.id)}
          className="mb-0 shadow-sm"
          style={{ fontSize: 14 }}
        >
          {t.message}
        </Alert>
      ))}
    </div>
  );

  return { toasts, showToast, ToastContainer };
}
