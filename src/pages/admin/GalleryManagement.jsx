import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Upload, Link as LinkIcon, Trash2, CheckCircle2, Star, ExternalLink, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const PRESET_IMAGES = [
  {
    id: "preset-1",
    name: "Default Hospital Illustration",
    url: "/assets/images/hero.png",
    type: "preset"
  },
  {
    id: "preset-2",
    name: "Modern Surgical Theater",
    url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1200&auto=format&fit=crop",
    type: "preset"
  },
  {
    id: "preset-3",
    name: "Compassionate Doctor Care",
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop",
    type: "preset"
  },
  {
    id: "preset-4",
    name: "Advanced Medical Diagnostics",
    url: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1200&auto=format&fit=crop",
    type: "preset"
  },
  {
    id: "preset-5",
    name: "Premium Clinic Reception",
    url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop",
    type: "preset"
  }
];

export const GalleryManagement = () => {
  const [gallery, setGallery] = useState([]);
  const [activeHeroUrl, setActiveHeroUrl] = useState("/assets/images/hero.png");
  const [loading, setLoading] = useState(true);
  const [uploadMode, setUploadMode] = useState("file"); // "file" or "url"
  const [imageFile, setImageFile] = useState(null);
  const [inputUrl, setInputUrl] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      const heroDocRef = doc(db, "settings", "hero");
      const heroSnap = await getDoc(heroDocRef);
      if (heroSnap.exists() && heroSnap.data().url) {
        setActiveHeroUrl(heroSnap.data().url);
      }

      const querySnapshot = await getDocs(collection(db, "gallery"));
      const uploadedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGallery(uploadedItems);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      toast.error("Failed to fetch gallery items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const handleSetActiveHero = async (url) => {
    try {
      const heroDocRef = doc(db, "settings", "hero");
      await setDoc(heroDocRef, { url, updatedAt: new Date().toISOString() });
      setActiveHeroUrl(url);
      toast.success("Hero section image updated successfully!");
    } catch (error) {
      console.error("Error setting active hero:", error);
      toast.error("Failed to update active hero image");
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!imageTitle.trim()) {
      toast.error("Please provide a title for the image");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalUrl = "";

      if (uploadMode === "file") {
        if (!imageFile) {
          toast.error("Please select an image file to upload");
          setIsSubmitting(false);
          return;
        }
        const storageRef = ref(storage, `gallery/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        finalUrl = await getDownloadURL(snapshot.ref);
      } else {
        if (!inputUrl.trim()) {
          toast.error("Please enter a valid image URL");
          setIsSubmitting(false);
          return;
        }
        finalUrl = inputUrl.trim();
      }

      const newDocData = {
        name: imageTitle.trim(),
        url: finalUrl,
        uploadedAt: new Date().toISOString(),
        type: "custom"
      };

      await addDoc(collection(db, "gallery"), newDocData);
      toast.success("Image added to gallery successfully!");

      setImageTitle("");
      setImageFile(null);
      setInputUrl("");
      fetchGalleryData();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to add image to gallery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this image from the gallery?")) {
      try {
        await deleteDoc(doc(db, "gallery", id));
        toast.success("Image deleted successfully");
        fetchGalleryData();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete image");
      }
    }
  };

  const allGalleryItems = [...PRESET_IMAGES, ...gallery];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-primary/10 relative overflow-hidden border border-white/10 w-full">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="space-y-3 relative z-10 w-full md:w-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-primary-200 shadow-sm w-fit">
            <ImageIcon size={14} /> Hero Gallery Engine
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">Hero Banner Management</h1>
          <p className="text-slate-300 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed">
            Update the primary hero section image instantly across the entire platform. Upload custom assets or choose from curated premium medical photography.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          id="preview-live-site-btn"
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-bold backdrop-blur-md transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 text-sm sm:text-base shrink-0"
        >
          <ExternalLink size={18} /> Live Preview
        </a>
      </div>

      {/* Active Hero Showcase */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 transition-colors w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Star size={22} fill="currentColor" className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">Active Hero Showcase</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Currently live on the platform homepage</p>
            </div>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 animate-pulse whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span> Live on Homepage
          </span>
        </div>

        <div className="relative rounded-2xl overflow-hidden border-4 border-slate-100 dark:border-slate-700 shadow-xl bg-slate-900 aspect-[16/9] md:aspect-[21/9] max-h-[420px] flex items-center justify-center group w-full">
          <img
            src={activeHeroUrl}
            alt="Active Hero Banner"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex items-end p-4 sm:p-6 md:p-8">
            <div className="text-white space-y-1.5 w-full overflow-hidden">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary-300 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm inline-block">Current Banner</span>
              <p className="text-xs sm:text-sm md:text-base font-mono text-slate-200 truncate w-full">{activeHeroUrl}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload New Asset */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 transition-colors w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-6 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Upload size={22} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">Add New Banner Asset</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Upload an image file or provide a direct web URL</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1.5 rounded-2xl gap-1 border border-slate-200 dark:border-slate-600 w-full sm:w-auto self-stretch sm:self-auto">
            <button
              type="button"
              id="upload-mode-file-btn"
              onClick={() => setUploadMode("file")}
              className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                uploadMode === "file"
                  ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <ImageIcon size={16} /> File Upload
            </button>
            <button
              type="button"
              id="upload-mode-url-btn"
              onClick={() => setUploadMode("url")}
              className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                uploadMode === "url"
                  ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <LinkIcon size={16} /> Image URL
            </button>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} id="gallery-upload-form" className="space-y-6 w-full">
          <div>
            <label htmlFor="image-title-input" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Image Title / Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="image-title-input"
              required
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
              placeholder="e.g. Modern Medical Campus 2026"
              className="w-full px-4 sm:px-5 py-3.5 sm:py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm sm:text-base"
            />
          </div>

          {uploadMode === "file" ? (
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Image File <span className="text-red-500">*</span>
              </label>
              <div
                className={`flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-3xl transition-all duration-200 w-full ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
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
                {imageFile ? (
                  <div className="space-y-3 text-center w-full px-4">
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="max-h-40 sm:max-h-48 rounded-2xl object-cover mx-auto shadow-md border border-slate-200 dark:border-slate-700 max-w-full"
                    />
                    <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 truncate w-full">{imageFile.name}</p>
                    <button
                      type="button"
                      id="remove-selected-file-btn"
                      onClick={() => setImageFile(null)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 underline px-3 py-1"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4 text-center py-4 sm:py-6 w-full">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md mx-auto text-primary shrink-0">
                      <Upload size={24} className="sm:w-7 sm:h-7" />
                    </div>
                    <div className="space-y-1 px-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 leading-snug">
                        Drag & Drop your image here or
                      </p>
                      <label htmlFor="upload-image-file-input" className="cursor-pointer text-primary font-bold hover:underline inline-block text-xs sm:text-sm py-1">
                        Browse from device
                        <input
                          type="file"
                          id="upload-image-file-input"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.files[0]) setImageFile(e.target.files[0]);
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium px-2 leading-tight">Supports High-res PNG, JPG, WEBP (Max 10MB)</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="upload-image-url-input" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Direct Image URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="upload-image-url-input"
                required={uploadMode === "url"}
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 sm:px-5 py-3.5 sm:py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-xs sm:text-sm break-all"
              />
              {inputUrl && (
                <div className="mt-4 w-full">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Preview:</p>
                  <img
                    src={inputUrl}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    alt="URL Preview"
                    className="max-h-40 sm:max-h-48 rounded-2xl object-cover shadow-md border border-slate-200 dark:border-slate-700 w-full"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2 sm:pt-4 w-full">
            <button
              type="submit"
              id="upload-submit-button"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 sm:py-3.5 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 text-sm sm:text-base active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Uploading Asset...</span>
                </>
              ) : (
                <>
                  <Upload size={18} className="sm:w-5 sm:h-5 shrink-0" />
                  <span>Add to Gallery</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Gallery Grid */}
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">Hero Gallery Assets</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Select any image below to instantly activate it as the primary hero banner</p>
          </div>
          <span className="self-start sm:self-auto text-xs sm:text-sm font-semibold text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-3.5 py-1.5 rounded-full whitespace-nowrap border border-slate-200 dark:border-slate-700">
            Total Assets: {allGalleryItems.length}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 sm:h-72 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
            {allGalleryItems.map((item, idx) => {
              const isActive = activeHeroUrl === item.url;
              return (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-2 flex flex-col w-full ${
                    isActive ? "border-primary ring-4 ring-primary/20 shadow-primary/10" : "border-slate-100 dark:border-slate-700"
                  }`}
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 group shrink-0 w-full">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Active Badge */}
                    {isActive ? (
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-[10px] sm:text-xs font-black shadow-lg backdrop-blur-md">
                        <CheckCircle2 size={14} className="sm:w-4 sm:h-4" /> ACTIVE HERO
                      </div>
                    ) : (
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-3 py-1 rounded-full bg-slate-900/60 text-slate-300 text-[10px] sm:text-xs font-bold backdrop-blur-md border border-white/10">
                        {item.type === "preset" ? "Curated Preset" : "Custom Asset"}
                      </div>
                    )}

                    {/* Quick Activate overlay button on hover */}
                    {!isActive && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900/40 backdrop-blur-[2px] p-4">
                        <button
                          type="button"
                          id={`gallery-overlay-set-active-btn-${item.id || idx}`}
                          onClick={() => handleSetActiveHero(item.url)}
                          className="w-full sm:w-auto px-5 py-3 bg-white text-primary rounded-2xl font-black text-xs sm:text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Star size={16} fill="currentColor" /> Set as Hero Banner
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Details and Actions */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4 w-full overflow-hidden">
                    <div className="w-full">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-1 w-full">{item.name}</h3>
                      <p className="text-[10px] sm:text-xs font-mono text-slate-400 dark:text-slate-500 truncate mt-1 w-full">{item.url}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 gap-2 w-full">
                      {isActive ? (
                        <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">
                          <CheckCircle2 size={16} className="sm:w-4 sm:h-4 shrink-0" /> Currently Active
                        </span>
                      ) : (
                        <button
                          type="button"
                          id={`gallery-card-set-active-btn-${item.id || idx}`}
                          onClick={() => handleSetActiveHero(item.url)}
                          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs sm:text-sm rounded-xl transition-colors active:scale-95"
                        >
                          Activate
                        </button>
                      )}

                      {item.type === "custom" && (
                        <button
                          type="button"
                          id={`gallery-delete-item-btn-${item.id || idx}`}
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors ml-auto shrink-0"
                          title="Delete image"
                        >
                          <Trash2 size={18} className="sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
