import { useEffect, useState } from "react";
import { useProjectStore } from "../../state/useProjectStore";

const TOAST_DURATION_MS = 4000;

export function Toast() {
  const toastMessage = useProjectStore((s) => s.toastMessage);
  const toastVariant = useProjectStore((s) => s.toastVariant);
  const setToast = useProjectStore((s) => s.setToast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toastMessage) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = setTimeout(() => {
      setToast(undefined);
      setVisible(false);
    }, TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [toastMessage, setToast]);

  if (!toastMessage || !visible) return null;

  return (
    <div className={`toast toast--${toastVariant}`} role="alert">
      {toastMessage}
    </div>
  );
}
