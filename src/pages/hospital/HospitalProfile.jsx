import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";
import { Building2, MapPin, Phone, Star, AlertCircle, ImageIcon, Save } from "lucide-react";
import toast from "react-hot-toast";

export const HospitalProfile = () => {
  const { currentUser } = useAuth();
  const [hospitalId, setHospitalId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    image: "",
    rating: "4.5",
    about: "",
    emergency: false,
    contact: "",
  });

  const fetchHospitalProfile = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (userSnap.exists()) {
        const hId = userSnap.data().hospitalId;
        setHospitalId(hId);
        if (hId) {
          const hospSnap = await getDoc(doc(db, "hospitals", hId));
          if (hospSnap.exists()) {
            setFormData({
              name: hospSnap.data().name || "",
              location: hospSnap.data().location || "",
              image: hospSnap.data().image || "",
              rating: hospSnap.data().rating || "4.5",
              about: hospSnap.data().about || "",
              emergency: hospSnap.data().emergency || false,
              contact: hospSnap.data().contact || "",
            });
          }
        }
      }
    } catch (err) {
      console.error("Error fetching hospital profile:", err);
      toast.error("Failed to load hospital profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalProfile();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hospitalId) return toast.error("Hospital identity not established");

    setIsSubmitting(true);
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        const imageRef = ref(storage, `hospitals/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const finalData = { ...formData, image: imageUrl };
      await updateDoc(doc(db, "hospitals", hospitalId), finalData);
      setFormData(finalData);
      setImageFile(null);
      toast.success("Hospital profile updated successfully");
    } catch (err) {
      console.error("Error updating hospital profile:", err);
      toast.error("Failed to update hospital profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hospital Profile</h1>
        <p className="text-slate-500">Edit your hospital's listing details, contact info, and features</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hospital Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    required
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emergency}
                      onChange={(e) => setFormData({ ...formData, emergency: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-slate-700">Emergency Services</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Hospital Showcase Image</label>
              <div 
                className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-all duration-200 h-[280px] flex-col items-center ${dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setImageFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <div className="space-y-2 text-center w-full flex flex-col justify-center items-center">
                  {(imageFile || formData.image) ? (
                    <div className="relative group w-full max-w-[280px]">
                      <img 
                        src={imageFile ? URL.createObjectURL(imageFile) : formData.image} 
                        alt="Preview" 
                        className="h-44 w-full object-cover rounded-xl shadow-sm border border-slate-200" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Click to select new image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                  <div className="flex text-sm text-slate-600 justify-center pt-2">
                    <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none transition-colors">
                      <span>Upload a file</span>
                      <input 
                        type="file" 
                        className="sr-only" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) setImageFile(e.target.files[0]);
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">About / Bio</label>
            <textarea
              required
              rows={5}
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              placeholder="Provide a detailed description of your hospital, history, and specialties..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
