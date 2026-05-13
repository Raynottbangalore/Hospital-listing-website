import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { Home } from "../pages/Home";
import { Hospitals } from "../pages/Hospitals";
import { HospitalDetails } from "../pages/HospitalDetails";
import { Doctors } from "../pages/Doctors";
import { DoctorProfile } from "../pages/DoctorProfile";
import { Booking } from "../pages/Booking";
import { About } from "../pages/About";
import { Contact } from "../pages/Contact";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { ForgotPassword } from "../pages/ForgotPassword";
import { Dashboard } from "../pages/Dashboard";
import { AccessDenied } from "../pages/AccessDenied";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminProtectedRoute } from "./AdminProtectedRoute";

import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { HospitalsManagement } from "../pages/admin/HospitalsManagement";
import { DoctorsManagement } from "../pages/admin/DoctorsManagement";
import { AppointmentsManagement } from "../pages/admin/AppointmentsManagement";
import { UsersManagement } from "../pages/admin/UsersManagement";
import { CategoriesManagement } from "../pages/admin/CategoriesManagement";
import { Settings } from "../pages/admin/Settings";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="hospitals" element={<Hospitals />} />
        <Route path="hospitals/:id" element={<HospitalDetails />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/:id" element={<DoctorProfile />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="booking" element={<Booking />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="unauthorized" element={<AccessDenied />} />
      
      {/* Admin Routes */}
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/hospitals" element={<HospitalsManagement />} />
          <Route path="admin/doctors" element={<DoctorsManagement />} />
          <Route path="admin/appointments" element={<AppointmentsManagement />} />
          <Route path="admin/users" element={<UsersManagement />} />
          <Route path="admin/categories" element={<CategoriesManagement />} />
          <Route path="admin/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
};
