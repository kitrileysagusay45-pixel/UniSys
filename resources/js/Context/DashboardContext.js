import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create the context
const DashboardContext = createContext();

// ✅ Provider Component
export const DashboardProvider = ({ children }) => {
  const [counts, setCounts] = useState({
    faculties: 0,
    students: 0,
    courses: 0,
    departments: 0,
  });

  // ✅ Fetch dashboard counts from backend
  const fetchCounts = async () => {
    try {
      const res = await axios.get("/api/dashboard-counts");
      setCounts({
        faculties: res.data.faculties || 0,
        students: res.data.students || 0,
        courses: res.data.courses || 0,
        departments: res.data.departments || 0,
      });
    } catch (error) {
      console.error("❌ Failed to fetch dashboard counts:", error);
    }
  };

  // Run once when app loads
  useEffect(() => {
    fetchCounts();
  }, []);

  // ✅ Public refresh function (called in Faculty.js, Student.js, etc.)
  const refreshCounts = async () => {
    await fetchCounts();
  };

  return (
    <DashboardContext.Provider value={{ counts, refreshCounts }}>
      {children}
    </DashboardContext.Provider>
  );
};

// ✅ Custom hook to use counts easily anywhere
export const useDashboard = () => useContext(DashboardContext);
