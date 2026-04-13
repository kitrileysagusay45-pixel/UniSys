import React, { useState, useEffect } from "react";
import { Plus, Minus, RotateCcw, Monitor, ZoomIn } from "lucide-react";

const DisplayScaleControl = () => {
  const [scale, setScale] = useState(() => {
    const saved = localStorage.getItem("unisys_ui_scale");
    return saved ? parseInt(saved, 10) : 100;
  });

  const [visible, setVisible] = useState(false);

  // Apply scale to body
  useEffect(() => {
    document.body.style.zoom = `${scale}%`;
    localStorage.setItem("unisys_ui_scale", scale);
  }, [scale]);

  // Projector / External Screen Auto-Detection
  useEffect(() => {
    const detectProjector = () => {
      // Heuristic: If screen is 1080p or smaller and has standard 1:1 pixel ratio,
      // it's likely a projector or standard presentation display.
      const isStandardDPI = window.devicePixelRatio === 1;
      const isStandardResolution = window.screen.width <= 1920;

      if (isStandardDPI && isStandardResolution && scale < 100) {
        console.log("External display detected: Reseting scale to 100% for readability.");
        setScale(100);
      }
    };

    detectProjector();
    window.addEventListener("resize", detectProjector);
    return () => window.removeEventListener("resize", detectProjector);
  }, []);

  const adjustScale = (delta) => {
    setScale((prev) => {
      const next = prev + delta;
      return Math.min(Math.max(next, 60), 150);
    });
  };

  const resetScale = () => setScale(100);

  return (
    <div 
      className="display-scale-toolbar"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 16px",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        borderRadius: "999px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: visible ? 1 : 0.6,
        transform: visible ? "translateY(0) scale(1)" : "translateY(5px) scale(0.95)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "12px" }}>
        <ZoomIn size={16} color="#64748b" />
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", minWidth: "40px", textAlign: "center" }}>
          {scale}%
        </span>
      </div>

      <div style={{ display: "flex", gap: "4px" }}>
        <button 
          onClick={() => adjustScale(-10)}
          title="Zoom Out"
          disabled={scale <= 60}
          style={buttonStyle(scale <= 60)}
        >
          <Minus size={14} />
        </button>
        
        <button 
          onClick={() => adjustScale(10)}
          title="Zoom In"
          disabled={scale >= 150}
          style={buttonStyle(scale >= 150)}
        >
          <Plus size={14} />
        </button>

        <button 
          onClick={resetScale}
          title="Reset to 100%"
          style={{
            ...buttonStyle(false),
            marginLeft: "4px",
            background: "#3C3489",
            color: "#fff",
            border: "none",
          }}
        >
          <RotateCcw size={14} />
          <span style={{ fontSize: "11px", fontWeight: "600", marginLeft: "4px" }}>Reset</span>
        </button>
      </div>

      {window.devicePixelRatio === 1 && window.screen.width <= 1920 && (
        <div style={{ marginLeft: "4px" }} title="Optimized for Projector">
          <Monitor size={14} color="#10b981" />
        </div>
      )}
    </div>
  );
};

const buttonStyle = (disabled) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: disabled ? "#cbd5e1" : "#475569",
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "all 0.2s",
  outline: "none",
  padding: 0,
});

export default DisplayScaleControl;
