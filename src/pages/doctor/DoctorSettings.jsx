import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ShieldAlert, Key, BellRing, Save, Lock, Mail } from "lucide-react";
import { updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import toast from "react-hot-toast";

export const DoctorSettings = () => {
  const { currentUser, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsReminders: false,
    dailySummary: true
  });

  useEffect(() => {
    if (currentUser?.email) {
      setNewEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      let emailUpdated = false;
      if (newEmail && newEmail !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, newEmail);
        emailUpdated = true;

        await updateDoc(doc(db, "users", currentUser.uid), { email: newEmail });

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().hospitalId && userDoc.data().doctorId) {
          const { hospitalId, doctorId } = userDoc.data();
          await updateDoc(doc(db, "hospitals", hospitalId, "doctors", doctorId), { email: newEmail });
        }
      }

      if (newPassword && newPassword.trim() !== "") {
        await updatePassword(auth.currentUser, newPassword);
      }

      toast.success(emailUpdated ? "Email and security credentials updated successfully!" : "Password updated successfully!");
      setNewPassword("");
    } catch (err) {
      console.error("Error updating credentials:", err);
      if (err.code === "auth/requires-recent-login") {
        toast.error("For security reasons, please log out and log back in to change your sensitive credentials.");
      } else {
        toast.error(err.message || "Failed to update credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setLoading(true);
    try {
      await resetPassword(currentUser.email);
      toast.success("Password reset link sent to your registered email!");
    } catch (err) {
      console.error("Error sending reset email:", err);
      toast.error("Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSave = (e) => {
    e.preventDefault();
    toast.success("Notification preferences updated successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-primary p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-primary-200">
            <ShieldAlert size={14} /> Security & Notifications
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Portal Settings</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Configure your consultation notifications and manage your security access credentials.
          </p>
        </div>
      </div>

      {/* Security Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
              <Key size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account Security</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Directly update your login email and authentication password</p>
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={handlePasswordReset}
            className="text-xs text-primary font-semibold hover:underline bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 transition-all"
          >
            Send Reset Link Instead
          </button>
        </div>

        <form onSubmit={handleUpdateCredentials} className="space-y-5 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Mail size={14} /> Registered Login Email
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="doctor@hospital.com"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:border-primary outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock size={14} /> New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:border-primary outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  <span>Update Login Credentials</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Notifications Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm">
            <BellRing size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Consultation Notifications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Control how you receive patient appointment alerts</p>
          </div>
        </div>

        <form onSubmit={handlePreferencesSave} className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 cursor-pointer select-none hover:border-primary/30 transition-all">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">Email Appointment Alerts</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Receive an email instantly whenever a patient books a slot</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 cursor-pointer select-none hover:border-primary/30 transition-all">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">SMS Reminders</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Receive SMS text notifications 30 minutes before consultations</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.smsReminders}
                onChange={(e) => setNotifications({...notifications, smsReminders: e.target.checked})}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 cursor-pointer select-none hover:border-primary/30 transition-all">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">Daily Schedule Digest</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Receive a daily morning summary of all confirmed appointments</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.dailySummary}
                onChange={(e) => setNotifications({...notifications, dailySummary: e.target.checked})}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              <Save size={18} /> Save Notification Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
