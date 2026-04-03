import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeNotification } from "../redux/notificationSlice";

const TYPE_CLASS = {
  success: "bg-success text-white",
  error: "bg-danger text-white",
  warning: "bg-warning text-dark",
  info: "bg-primary text-white",
};

const AUTO_DISMISS_MS = 3000;

function AdminToast() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.notification);

  useEffect(() => {
    if (items.length === 0) return;
    const last = items[items.length - 1];
    const timer = setTimeout(
      () => dispatch(removeNotification(last.id)),
      AUTO_DISMISS_MS,
    );
    return () => clearTimeout(timer);
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 320,
      }}
    >
      {items.map((n) => (
        <div
          key={n.id}
          className={`d-flex align-items-center justify-content-between gap-3 rounded px-4 py-4 shadow-sm ${TYPE_CLASS[n.type] ?? TYPE_CLASS.success}`}
          style={{ fontSize: "1.1rem", minWidth: 240 }}
        >
          <span>{n.message}</span>
          <button
            className="btn-close btn-close-white flex-shrink-0"
            style={{ filter: n.type === "warning" ? "invert(1)" : undefined }}
            onClick={() => dispatch(removeNotification(n.id))}
          />
        </div>
      ))}
    </div>
  );
}

export default AdminToast;
