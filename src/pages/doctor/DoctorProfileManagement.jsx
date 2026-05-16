import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { User, Phone, DollarSign, Briefcase, Stethoscope, Save, Upload, CheckCircle2, ShieldCheck, Clock, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const defaultScheduleDays = {
  MON: { active: true, startTime: "09:00", endTime: "20:00" },
  TUE: { active: true, startTime: "09:00", endTime: "20:00" },
  WED: { active: true, startTime: "09:00", endTime: "20:00" },
  THU: { active: true, startTime: "09:00", endTime: "20:00" },
  FRI: { active: true, startTime: "09:00", endTime: "20:00" },
  SAT: { active: true, startTime: "09:00", endTime: "14:00" },
  SUN: { active: false, startTime: "09:00", endTime: "14:00" }
};

export const DoctorProfileManagement = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorDocRef, setDoctorDocRef] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    phone: "",
    fee: "",
    experience: "",
    about: "",
    education: "",
    qualifications: "",
    available: true,
    image: "",
    hospitalName: "",
    schedule: {
      slotDuration: "30",
      days: defaultScheduleDays
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?.uid) return;
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.hospitalId && userData.doctorId) {
            const ref = doc(db, "hospitals", userData.hospitalId, "doctors", userData.doctorId);
            setDoctorDocRef(ref);
            const docSnap = await getDoc(ref);
            if (docSnap.exists()) {
              const data = docSnap.data();
              const existingSchedule = data.schedule || {};
              let daysConfig = existingSchedule.days;
              if (!daysConfig) {
                const oldDays = existingSchedule.workingDays || ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
                const oldStart = existingSchedule.startTime || "09:00";
                const oldEnd = existingSchedule.endTime || "20:00";
                daysConfig = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].reduce((acc, d) => {
                  acc[d] = {
                    active: oldDays.includes(d),
                    startTime: oldStart,
                    endTime: d === "SAT" ? "14:00" : oldEnd
                  };
                  return acc;
                }, {});
              }
              setFormData({
                ...formData,
                ...data,
                schedule: {
                  slotDuration: existingSchedule.slotDuration || "30",
                  days: daysConfig
                },
                hospitalName: userData.hospitalName || "Hospital Medical Center"
              });
            }
          }
        }
      } catch (err) {
        console.error("Error fetching doctor profile:", err);
        toast.error("Failed to load doctor profile details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!doctorDocRef) {
      toast.error("Doctor profile reference missing. Contact administrator.");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        const storageRef = ref(storage, `doctors/${Date.now()}_${imageFile.name}`);
        const snap = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snap.ref);
      }

      const updatedData = {
        name: formData.name,
        category: formData.category,
        phone: formData.phone,
        fee: formData.fee,
        experience: formData.experience,
        about: formData.about,
        education: formData.education,
        qualifications: formData.qualifications,
        available: formData.available,
        schedule: formData.schedule,
        image: imageUrl
      };

      await updateDoc(doctorDocRef, updatedData);

      await updateDoc(doc(db, "users", currentUser.uid), {
        name: formData.name
      });

      setFormData(prev => ({ ...prev, image: imageUrl }));
      setImageFile(null);
      toast.success("Doctor profile updated successfully!");
    } catch (err) {
      console.error("Error saving doctor profile:", err);
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-primary p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-primary-200">
            <ShieldCheck size={14} /> Identity Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">My Clinical Profile</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Keep your consultation hours, fee structure, and clinical biography accurate for inquiring patients.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
        {/* Profile Avatar Upload */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-700">
          <div className="relative group shrink-0">
            <img
              src={imageFile ? URL.createObjectURL(imageFile) : (formData.image || "https://ui-avatars.com/api/?name=Doctor&background=random")}
              alt="Avatar"
              className="w-28 h-28 rounded-3xl object-cover border-4 border-primary/20 shadow-md"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity cursor-pointer text-white text-xs font-bold">
              <Upload size={18} className="mr-1" /> Change
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => { if (e.target.files[0]) setImageFile(e.target.files[0]); }} />
            </label>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formData.name || "Dr. Professional"}</h3>
            <p className="text-sm font-semibold text-primary">{formData.category || "Medical Specialist"}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Affiliated with: <span className="font-bold text-slate-700 dark:text-slate-300">{formData.hospitalName}</span></p>
          </div>

          <div className="sm:ml-auto">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 select-none shadow-sm hover:border-primary/30 transition-all">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className={`text-sm font-bold ${formData.available ? "text-green-600 dark:text-green-400" : "text-slate-500"}`}>
                {formData.available ? "● Accepting Patients" : "○ Currently Unavailable"}
              </span>
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Full Doctor Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:border-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Specialization</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:border-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Contact Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Consultation Fee ($)</label>
              <input
                type="number"
                required
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:border-primary outline-none transition-all text-primary font-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Experience (Yrs)</label>
              <input
                type="number"
                required
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:border-primary outline-none transition-all font-bold"
              />
            </div>
          </div>
        </div>

        {/* Text Areas */}
        <div className="space-y-6 pt-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Clinical Bio & Overview</label>
            <textarea
              rows={4}
              required
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              placeholder="Highlight your clinical focus, philosophy of care, and medical achievements..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm focus:border-primary outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Medical Education</label>
            <textarea
              rows={2}
              required
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              placeholder="e.g. MBBS from Harvard Medical School, MD in General Surgery"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm focus:border-primary outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Awards & Certifications</label>
            <textarea
              rows={2}
              required
              value={formData.qualifications}
              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              placeholder="e.g. Fellow of American College of Surgeons, Top Healthcare Provider 2024"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm focus:border-primary outline-none transition-all resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Working Hours & Schedule Management */}
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily Working Hours & Consultation Timings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure customized shift timings or mark days as closed individually</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Slot Interval:</label>
              <select
                value={formData.schedule?.slotDuration || "30"}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: { ...formData.schedule, slotDuration: e.target.value }
                })}
                className="bg-transparent text-slate-900 dark:text-white font-black text-sm outline-none cursor-pointer"
              >
                <option value="15">15 Mins</option>
                <option value="20">20 Mins</option>
                <option value="30">30 Mins</option>
                <option value="45">45 Mins</option>
                <option value="60">1 Hour</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {[
              { code: "MON", label: "Monday" },
              { code: "TUE", label: "Tuesday" },
              { code: "WED", label: "Wednesday" },
              { code: "THU", label: "Thursday" },
              { code: "FRI", label: "Friday" },
              { code: "SAT", label: "Saturday" },
              { code: "SUN", label: "Sunday" }
            ].map(({ code, label }) => {
              const dayObj = formData.schedule?.days?.[code] || defaultScheduleDays[code];
              return (
                <div key={code} className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  dayObj.active 
                    ? "bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 shadow-xs" 
                    : "bg-slate-100/50 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800 opacity-75"
                }`}>
                  <div className="flex items-center gap-4 w-40 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={dayObj.active} 
                        onChange={(e) => {
                          const updatedDays = {
                            ...formData.schedule?.days,
                            [code]: { ...dayObj, active: e.target.checked }
                          };
                          setFormData({
                            ...formData,
                            schedule: { ...formData.schedule, days: updatedDays }
                          });
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    <span className={`font-black text-sm tracking-wider ${dayObj.active ? "text-slate-900 dark:text-white" : "text-slate-400 line-through"}`}>
                      {label}
                    </span>
                  </div>

                  {dayObj.active ? (
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 sm:flex-initial">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Start:</span>
                        <input
                          type="time"
                          value={dayObj.startTime || "09:00"}
                          onChange={(e) => {
                            const updatedDays = {
                              ...formData.schedule?.days,
                              [code]: { ...dayObj, startTime: e.target.value }
                            };
                            setFormData({
                              ...formData,
                              schedule: { ...formData.schedule, days: updatedDays }
                            });
                          }}
                          className="bg-transparent font-bold text-xs sm:text-sm text-slate-900 dark:text-white outline-none cursor-pointer w-full sm:w-auto"
                        />
                      </div>

                      <span className="text-slate-400 font-bold hidden sm:inline">-</span>

                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 sm:flex-initial">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">End:</span>
                        <input
                          type="time"
                          value={dayObj.endTime || "20:00"}
                          onChange={(e) => {
                            const updatedDays = {
                              ...formData.schedule?.days,
                              [code]: { ...dayObj, endTime: e.target.value }
                            };
                            setFormData({
                              ...formData,
                              schedule: { ...formData.schedule, days: updatedDays }
                            });
                          }}
                          className="bg-transparent font-bold text-xs sm:text-sm text-slate-900 dark:text-white outline-none cursor-pointer w-full sm:w-auto"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs uppercase tracking-widest self-start sm:self-center">
                      Closed / Day Off
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-700">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 shrink-0"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

