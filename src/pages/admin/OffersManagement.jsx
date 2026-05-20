import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { Search, Plus, Edit, Trash2, Tag, CheckCircle2, XCircle, Percent, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export const OffersManagement = () => {
  const [offers, setOffers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount: "",
    image: "",
    hospitalId: "",
    active: true
  });

  const fetchData = async () => {
    try {
      const offersSnap = await getDocs(collection(db, "offers"));
      setOffers(offersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const hospSnap = await getDocs(collection(db, "hospitals"));
      setHospitals(hospSnap.docs.map(d => ({ id: d.id, name: d.data().name })));
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreate = () => {
    setEditingOffer(null);
    setFormData({ title: "", description: "", discount: "", image: "", hospitalId: "", active: true });
    setImageFile(null);
    setShowModal(true);
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title || "",
      description: offer.description || "",
      discount: offer.discount || "",
      image: offer.image || "",
      hospitalId: offer.hospitalId || "",
      active: offer.active ?? true
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        const imageRef = ref(storage, `offers/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      const finalData = { ...formData, image: imageUrl };

      if (editingOffer) {
        await updateDoc(doc(db, "offers", editingOffer.id), finalData);
        toast.success("Offer updated successfully");
      } else {
        await addDoc(collection(db, "offers"), {
          ...finalData,
          createdAt: serverTimestamp()
        });
        toast.success("Offer created successfully");
      }
      setShowModal(false);
      setImageFile(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to save offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "offers", id), { active: !currentStatus });
      toast.success(`Offer ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        await deleteDoc(doc(db, "offers", id));
        toast.success("Offer deleted");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete offer");
      }
    }
  };

  const filteredOffers = offers.filter(o => 
    o.title?.toLowerCase().includes(search.toLowerCase()) || 
    o.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Offers & Promotions</h1>
          <p className="text-slate-500">Manage discounts and special hospital offers</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
        >
          <Plus size={20} />
          Create Offer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search offers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
            <div className="col-span-full py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              No offers found.
            </div>
          ) : (
            filteredOffers.map((offer) => (
              <div key={offer.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all group relative">
                <div className="h-40 bg-slate-100 relative">
                  {offer.image ? (
                    <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon size={40} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                      offer.active ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                    }`}>
                      {offer.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-primary font-bold text-sm shadow-sm flex items-center gap-1">
                    <Percent size={14} />
                    {offer.discount}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-900 mb-1 truncate">{offer.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{offer.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 bg-slate-50 p-2 rounded-lg">
                    <Tag size={16} className="text-slate-400" />
                    <span className="truncate">
                      {hospitals.find(h => h.id === offer.hospitalId)?.name || "All Hospitals"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleActive(offer.id, offer.active)}
                      className={`flex items-center gap-1.5 text-sm font-medium ${
                        offer.active ? "text-amber-500 hover:text-amber-600" : "text-emerald-500 hover:text-emerald-600"
                      }`}
                    >
                      {offer.active ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                      {offer.active ? "Deactivate" : "Activate"}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingOffer ? "Edit Offer" : "Create Offer"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-lg">
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. 50% Off Full Body Checkup"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  placeholder="Offer details..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Discount Text</label>
                  <input
                    type="text"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g. 50% OFF"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-slate-700">Active</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Hospital (Optional)</label>
                <select
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">All Hospitals</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Offer Image</label>
                <div 
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all duration-200 ${dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
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
                  <div className="space-y-2 text-center w-full">
                    {(imageFile || formData.image) ? (
                      <div className="mx-auto flex justify-center mb-4 relative group w-max">
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : formData.image} 
                          alt="Preview" 
                          className="h-32 w-32 object-cover rounded-xl shadow-sm border-2 border-slate-200" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <span className="text-white text-xs font-medium px-2 text-center">Click to change</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                        <ImageIcon className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none transition-colors">
                        <span>Upload an image</span>
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

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
                >
                  {editingOffer ? "Save Changes" : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
