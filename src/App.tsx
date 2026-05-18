import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import TrackingPage from "./pages/TrackingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminShipmentDetail from "./pages/AdminShipmentDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/track/:trackingId" element={<TrackingPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Admin Routes (Auth protected within components) */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/shipment/:id" element={<AdminShipmentDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
