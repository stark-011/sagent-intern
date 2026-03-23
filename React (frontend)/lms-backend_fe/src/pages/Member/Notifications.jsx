import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import * as notifyService from "../../api/notifyService";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";
import {
  formatDateTime,
  getEntityId,
  getNotificationMessage,
  getUserId,
  isNotificationRead,
} from "../../utils/fieldUtils";

const Notifications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const userId = getUserId(user || {});

  const loadNotifications = async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await notifyService.getUserNotifications(userId);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const markAsRead = async (id) => {
    setUpdatingId(id);
    try {
      const updated = await notifyService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (getEntityId(item) === id ? updated : item))
      );
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error(error?.response?.data || error?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader text="Loading notifications..." />;

  return (
    <section className="space-y-6">
      <div className="panel">
        <h2 className="text-xl font-semibold text-slate-900">Due Date Reminders</h2>
        <p className="mt-2 text-sm text-slate-600">
          Notifications are fetched from your user notification feed.
        </p>
      </div>

      <div className="grid gap-4">
        {notifications.length === 0 && (
          <div className="panel text-sm text-slate-500">No notifications found.</div>
        )}

        {notifications.map((item) => {
          const id = getEntityId(item);
          const isRead = isNotificationRead(item);
          return (
            <article
              key={id || getNotificationMessage(item)}
              className={`panel border ${
                isRead ? "border-brand-100" : "border-accent-300 bg-accent-50/40"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {formatDateTime(item.createdAt || item.updatedAt || item.date)}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    {getNotificationMessage(item) || "Library reminder"}
                  </h3>
                </div>

                {!isRead && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => markAsRead(id)}
                    disabled={updatingId === id}
                  >
                    {updatingId === id ? "Updating..." : "Mark as Read"}
                  </button>
                )}

                {isRead && <span className="text-sm font-medium text-emerald-700">Read</span>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Notifications;
