import React, { useState } from "react";
import axios from "axios";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post("/api/forgot-password", { email });
      if (response.data.success) {
        setMessage(response.data.message);
      } else {
        setError(response.data.message || "Something went wrong.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at top right, #6366f1, #1e2a4a)', 
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="forgot-password-card" style={{ 
        backgroundColor: '#ffffff', 
        padding: '2.5rem', 
        borderRadius: '16px', 
        width: '100%', 
        maxWidth: '480px', 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <button className="lp-back-link" onClick={onBackToLogin} style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.6rem', 
          marginBottom: '2rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          color: '#475569',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '600',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '0.6rem 1.25rem',
          borderRadius: '12px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.color = '#6366f1';
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.borderColor = '#6366f1';
          e.currentTarget.style.transform = 'translateX(-4px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = '#475569';
          e.currentTarget.style.background = '#f8fafc';
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <ArrowLeft size={16} strokeWidth={2.5} /> 
          <span>Back to Sign In</span>
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            backgroundColor: '#eef2ff', 
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            color: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Mail size={32} strokeWidth={2} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0 0 0.5rem', color: '#1e293b' }}>Forgot Password</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {message && <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #dcfce7',
          color: '#166534', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>{message}</div>}

        {error && <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fee2e2',
          color: '#dc2626', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="lp-field">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>
          </div>

          <button type="submit" className="lp-btn-primary" disabled={loading} style={{ 
            padding: '0.875rem',
            borderRadius: '10px',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)'
          }}
          onMouseOver={(e) => {
            if(!loading) {
              e.target.style.backgroundColor = '#4338ca';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.2)';
            }
          }}
          onMouseOut={(e) => {
            if(!loading) {
              e.target.style.backgroundColor = '#4f46e5';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)';
            }
          }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
