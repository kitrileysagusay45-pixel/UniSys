import React, { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import AdminLayout from "./AdminLayout";
import FacultyLayout from "./FacultyLayout";
import StudentLayout from "./StudentLayout";
import StudentRegister from "./StudentRegister";
import FacultyRegister from "./FacultyRegister";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import DisplayScaleControl from "./DisplayScaleControl";

export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const loggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const savedUser = sessionStorage.getItem("user");
    if (loggedIn && !savedUser) {
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("user");
      return false;
    }
    return loggedIn;
  });

  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [authView, setAuthView] = useState(() => {
    if (window.location.pathname === "/reset-password") return "reset-password";
    return "login";
  }); // login | forgot-password | reset-password

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      const savedUser = sessionStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("user", JSON.stringify(userData));

    // Navigate based on role
    const role = userData.role || "admin";
    if (role === "admin") {
      window.history.pushState({}, "", "/admin/dashboard");
    } else if (role === "faculty") {
      window.history.pushState({}, "", "/faculty/dashboard");
    } else if (role === "student") {
      window.history.pushState({}, "", "/student/dashboard");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("user");
    // Force a full page reload to the login page to ensure all state is cleared
    window.location.href = "/login";
  };

  // Not logged in — show auth views
  if (!isLoggedIn) {
    if (authView === "forgot-password") {
      return <ForgotPassword onBackToLogin={() => setAuthView("login")} />;
    }
    if (authView === "reset-password") {
      return <ResetPassword />;
    }
    if (authView === "student-register") {
      return <StudentRegister onRegisterSuccess={handleLogin} onBackToLogin={() => setAuthView("login")} />;
    }
    if (authView === "faculty-register") {
      return <FacultyRegister onRegisterSuccess={handleLogin} onBackToLogin={() => setAuthView("login")} />;
    }
    return (
      <>
        <LoginPage
          onLogin={handleLogin}
          onStudentRegister={() => setAuthView("student-register")}
          onFacultyRegister={() => setAuthView("faculty-register")}
          onForgotPassword={() => setAuthView("forgot-password")}
        />
        <DisplayScaleControl />
      </>
    );
  }

  // Logged in — route to role-specific layout
  const role = user?.role || "admin";

  if (role === "faculty") {
    return (
      <>
        <FacultyLayout user={user} onLogout={handleLogout} />
        <DisplayScaleControl />
      </>
    );
  }

  if (role === "student") {
    return (
      <>
        <StudentLayout user={user} onLogout={handleLogout} />
        <DisplayScaleControl />
      </>
    );
  }

  // Default: admin
  return (
    <>
      <AdminLayout user={user} onLogout={handleLogout} />
      <DisplayScaleControl />
    </>
  );
}
