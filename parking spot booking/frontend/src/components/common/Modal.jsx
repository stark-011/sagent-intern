import Button from "./Button";

const Modal = ({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft">
        <h3 className="font-display text-lg font-semibold text-slate-900">{title}</h3>
        <div className="mt-3">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
            {loading ? "Please wait..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
