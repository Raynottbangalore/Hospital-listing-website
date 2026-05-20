import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { Search, ShieldAlert, Edit, Trash2, UserPlus, Shield, Check, X as XIcon } from "lucide-react";
import toast from "react-hot-toast";

const MODULES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "hospitals", label: "Hospitals" },
  { id: "doctors", label: "Doctors" },
  { id: "appointments", label: "Appointments" },
  { id: "offers", label: "Offers" },
  { id: "users", label: "Users" },
  { id: "analytics", label: "Analytics" },
  { id: "categories", label: "Categories" },
  { id: "gallery", label: "Gallery" },
  { id: "settings", label: "Settings" }
];

const defaultPermissions = MODULES.reduce((acc, mod) => ({ ...acc, [mod.id]: false }), {});

export const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  
  // Form State
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [assignedHospitals, setAssignedHospitals] = useState([]);

  const fetchAdminsAndUsers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      setAdmins(usersData.filter(u => u.role === "admin"));
      setAllUsers(usersData.filter(u => u.role === "patient" || !u.role));

      const hospSnap = await getDocs(collection(db, "hospitals"));
      setHospitals(hospSnap.docs.map(d => ({ id: d.id, name: d.data().name })));
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminsAndUsers();
  }, []);

  const handleTogglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveAdmin = async () => {
    if (!editingAdmin && !selectedUserId) {
      toast.error("Please select a user to promote to admin");
      return;
    }

    const targetId = editingAdmin ? editingAdmin.id : selectedUserId;

    try {
      await updateDoc(doc(db, "users", targetId), {
        role: "admin",
        permissions: permissions,
        assignedHospitals: assignedHospitals
      });
      toast.success(editingAdmin ? "Admin permissions updated" : "New admin created");
      setShowModal(false);
      fetchAdminsAndUsers();
    } catch (error) {
      toast.error("Failed to save admin");
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setPermissions(admin.permissions || defaultPermissions);
    setAssignedHospitals(admin.assignedHospitals || []);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingAdmin(null);
    setSelectedUserId("");
    setPermissions(defaultPermissions);
    setAssignedHospitals([]);
    setShowModal(true);
  };

  const handleRemoveAdmin = async (id) => {
    if (window.confirm("Are you sure you want to remove admin rights from this user?")) {
      try {
        await updateDoc(doc(db, "users", id), {
          role: "patient",
          permissions: {}
        });
        toast.success("Admin removed");
        fetchAdminsAndUsers();
      } catch (error) {
        toast.error("Failed to remove admin");
      }
    }
  };

  const filteredAdmins = admins.filter(a => 
    a.name?.toLowerCase().includes(search.toLowerCase()) || 
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Management</h1>
          <p className="text-slate-500">Manage administrators and their module permissions</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
        >
          <UserPlus size={20} />
          Add Admin
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search admins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Admin Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Permissions Summary</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                    No admins found.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                          <ShieldAlert size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{admin.name}</p>
                          <p className="text-sm text-slate-500">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {admin.permissions && Object.entries(admin.permissions).map(([key, val]) => (
                          val && (
                            <span key={key} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md font-medium capitalize">
                              {key}
                            </span>
                          )
                        ))}
                        {(!admin.permissions || !Object.values(admin.permissions).some(v => v)) && (
                          <span className="text-sm text-slate-400 italic">No permissions assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Permissions"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleRemoveAdmin(admin.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Admin"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingAdmin ? "Edit Admin Permissions" : "Create New Admin"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-lg">
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {!editingAdmin && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Select User to Promote</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="">Select a user...</option>
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}

              {editingAdmin && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{editingAdmin.name}</h3>
                    <p className="text-sm text-slate-500">{editingAdmin.email}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Module Permissions</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(defaultPermissions).map((moduleKey) => (
                    <label
                      key={moduleKey}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        permissions[moduleKey]
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="font-medium capitalize">{moduleKey}</span>
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                        permissions[moduleKey] ? "bg-primary text-white" : "border border-slate-300"
                      }`}>
                        {permissions[moduleKey] && <Check size={14} />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={permissions[moduleKey]}
                        onChange={() => handleTogglePermission(moduleKey)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Assigned Hospitals (Optional)</label>
                <p className="text-xs text-slate-500 mb-2">Leave empty to grant access to all hospitals (based on permissions).</p>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1">
                  {hospitals.map((h) => (
                    <label key={h.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignedHospitals.includes(h.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedHospitals([...assignedHospitals, h.id]);
                          } else {
                            setAssignedHospitals(assignedHospitals.filter(id => id !== h.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-700">{h.name}</span>
                    </label>
                  ))}
                  {hospitals.length === 0 && <p className="text-sm text-slate-500 p-2">No hospitals found.</p>}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdmin}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
              >
                {editingAdmin ? "Save Permissions" : "Promote to Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
