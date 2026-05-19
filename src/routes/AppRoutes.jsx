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
import { MyBookings } from "../pages/MyBookings";
import { AccessDenied } from "../pages/AccessDenied";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminProtectedRoute } from "./AdminProtectedRoute";

import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { HospitalsManagement } from "../pages/admin/HospitalsManagement";
import { DoctorsManagement } from "../pages/admin/DoctorsManagement";
import { AppointmentsManagement } from "../pages/admin/AppointmentsManagement";
import { UsersManagement } from "../pages/admin/UsersManagement";
import { CategoriesManagement } from "../pages/admin/CategoriesManagement";
import { GalleryManagement } from "../pages/admin/GalleryManagement";
import { Settings } from "../pages/admin/Settings";

import { DoctorProtectedRoute } from "./DoctorProtectedRoute";
import { DoctorLayout } from "../layouts/DoctorLayout";
import { DoctorDashboard } from "../pages/doctor/DoctorDashboard";
import { DoctorAppointments } from "../pages/doctor/DoctorAppointments";
import { DoctorProfileManagement } from "../pages/doctor/DoctorProfileManagement";
import { DoctorSettings } from "../pages/doctor/DoctorSettings";
import { DoctorMessages } from "../pages/doctor/DoctorMessages";

import { HospitalProtectedRoute } from "./HospitalProtectedRoute";
import { HospitalLayout } from "../layouts/HospitalLayout";
import { HospitalDashboard } from "../pages/hospital/HospitalDashboard";
import { HospitalDoctors } from "../pages/hospital/HospitalDoctors";
import { HospitalAppointments } from "../pages/hospital/HospitalAppointments";
import { HospitalProfile } from "../pages/hospital/HospitalProfile";


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
          <Route path="dashboard" element={<MyBookings />} />
          <Route path="my-bookings" element={<MyBookings />} />
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
          <Route path="admin/gallery" element={<GalleryManagement />} />
          <Route path="admin/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Doctor Routes */}
      <Route element={<DoctorProtectedRoute />}>
        <Route element={<DoctorLayout />}>
          <Route path="doctor" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="doctor/appointments" element={<DoctorAppointments />} />
          <Route path="doctor/messages" element={<DoctorMessages />} />
          <Route path="doctor/profile" element={<DoctorProfileManagement />} />
          <Route path="doctor/settings" element={<DoctorSettings />} />
        </Route>
      </Route>

      {/* Hospital Routes */}
      <Route element={<HospitalProtectedRoute />}>
        <Route element={<HospitalLayout />}>
          <Route path="hospital" element={<Navigate to="/hospital/dashboard" replace />} />
          <Route path="hospital/dashboard" element={<HospitalDashboard />} />
          <Route path="hospital/doctors" element={<HospitalDoctors />} />
          <Route path="hospital/appointments" element={<HospitalAppointments />} />
          <Route path="hospital/profile" element={<HospitalProfile />} />
        </Route>
      </Route>
    </Routes>
  );
};
