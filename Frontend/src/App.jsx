// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

// Pages
import IndexPage from "./pages/Index.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import NotFoundPage from "./pages/NotFound.jsx";
import MyRidesPage from "./pages/MyRidesPage.jsx";
import RideChatPage from "./pages/RideChatPage.jsx";
import RideMapPage from "./pages/RideMapPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Routes
import PrivateRoute from "./components/PrivateRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>

            {/* ---------- PUBLIC ROUTES ---------- */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<IndexPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* ---------- PRIVATE ROUTES ---------- */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/my-rides" element={<MyRidesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/ride/:rideId/chat" element={<RideChatPage />} />
              <Route path="/ride/:rideId/map" element={<RideMapPage />} />
            </Route>

            {/* ---------- FALLBACK ---------- */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

export default App;
