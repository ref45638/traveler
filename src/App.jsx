import React from "react";
import { HashRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { TripProvider } from "./context/TripContext";
import { LanguageProvider } from "./context/LanguageContext";
import Home from "./pages/Home";
import TripDetails from "./pages/TripDetails";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AcceptInvite from "./pages/AcceptInvite";

import { useTrips } from "./context/TripContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useTrips();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading)
    return (
      <div className="flex-center" style={{ height: "100vh" }}>
        Loading...
      </div>
    );
  return user ? children : null;
};

function App() {
  return (
    <LanguageProvider>
      <TripProvider>
        <Router>
          <div className="page-container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/trip/:tripId/*" element={<TripDetails />} />
                      <Route path="/invite/:inviteCode" element={<AcceptInvite />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </TripProvider>
    </LanguageProvider>
  );
}

export default App;
