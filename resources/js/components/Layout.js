import React, { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import StudentRegister from "./StudentRegister";
import FacultyRegister from "./FacultyRegister";
import AdminLayout from "./AdminLayout";
import FacultyLayout from "./FacultyLayout";
import StudentLayout from "./StudentLayout";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

const getStoredUser = () => {
  const savedUser = localStorage.getItem("user");
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch (err) {
    console.warn("Invalid user data in localStorage. Clearing auth state.", err);
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    return null;
  }
};

export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const savedUser = getStoredUser();
    if (loggedIn && !savedUser) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      return false;
    }
    return loggedIn;
  });

  const [user, setUser] = useState(() => {
    return getStoredUser();
  });

  const [authView, setAuthView] = useState(() => {
    const lastSegment = window.location.pathname.split("/").pop();
    if (lastSegment === "reset-password") return "reset-password";
    return "login";
  }); // login | student-register | faculty-register | forgot-password | reset-password

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      const savedUser = getStoredUser();
      if (savedUser) {
        setUser(savedUser);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", JSON.stringify(userData));

    // Navigate based on role
    const role = userData.role || "admin";
    if (role === "admin") {
      window.history.pushState({}, "", "/dashboard");
    } else if (role === "faculty") {
      window.history.pushState({}, "", "/faculty-dashboard");
    } else if (role === "student") {
      window.history.pushState({}, "", "/student-dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    // Force a full page reload to the login page to ensure all state is cleared
    window.location.href = "/login";
  };

  // Not logged in — show auth views
  if (!isLoggedIn) {
    if (authView === "student-register") {
      return <StudentRegister onBackToLogin={() => setAuthView("login")} />;
    }
    if (authView === "faculty-register") {
      return <FacultyRegister onBackToLogin={() => setAuthView("login")} />;
    }
    if (authView === "forgot-password") {
      return <ForgotPassword onBackToLogin={() => setAuthView("login")} />;
    }
    if (authView === "reset-password") {
      return <ResetPassword />;
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onStudentRegister={() => setAuthView("student-register")}
        onFacultyRegister={() => setAuthView("faculty-register")}
        onForgotPassword={() => setAuthView("forgot-password")}
      />
    );
  }

  // Logged in — route to role-specific layout
  const role = user?.role || "admin";

  if (role === "faculty") {
    return <FacultyLayout user={user} onLogout={handleLogout} />;
  }

  if (role === "student") {
    return <StudentLayout user={user} onLogout={handleLogout} />;
  }

  // Default: admin
  return <AdminLayout user={user} onLogout={handleLogout} />;
}
