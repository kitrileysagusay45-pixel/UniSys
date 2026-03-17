// resources/js/context/CountContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

// ✅ Create context
const CountContext = createContext();

// ✅ Provider component
export const CountProvider = ({ children }) => {
  const [counts, setCounts] = useState({
    faculties: 0,
    students: 0,
    courses: 0,
    departments: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch latest counts from backend
  const fetchCounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/dashboard-counts");
      setCounts(res.data);
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch dashboard counts:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Automatically load once on mount, but only when logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      fetchCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Public refresh function (for Faculty.js, Student.js, etc.)
  const refreshCounts = async () => {
    await fetchCounts();
  };

  return (
    <CountContext.Provider value={{ counts, refreshCounts, loading, error }}>
      {children}
    </CountContext.Provider>
  );
};

// ✅ Custom hook for using counts anywhere
export const useCounts = () => useContext(CountContext);
