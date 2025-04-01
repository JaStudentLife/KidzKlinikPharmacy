import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "patient") {
          navigate("/patientHome"); 
        }else if (userData.role === "pharmacist") {
          navigate("/pharmacist"); 
        } else {
          navigate("/"); 
        }
      } else {
        setError("User role not found. Please contact support.");
      }
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="header-login-signup" style={{ alignItems: "center", paddingBottom: "10px", width:"100%" }}>
        <div className="horizantal" style={{ display: "flex", alignItems: "center" }}>
          <img src="/images/Logo.png" alt="Logo" style={{ width: "150px", height: "auto", marginRight: "10px" }} />
          <h1 style={{ fontFamily: "serif", fontSize: "55px", fontWeight: "bold", margin: 0 }}>THE KIDZ KLINIK</h1>
        </div>
        <hr style={{ width: "90%", marginTop: "10px", border: "1px solid #888" }} />
      </div>

      <div className="form-wrapper">
        <img src="/images/IMG_8F77EFF687EC-1.jpeg" alt="Family" className="form-image" />
        <form onSubmit={handleLogin} className="login-form">
          <h2 className="login-title">LOGIN</h2>

          <label>Username:</label>
          <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" />

          <label>Password:</label>
<div style={{ position: "relative", display: "flex", alignItems: "center" }}>
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="form-input"
    style={{
      width: "100%",
      paddingRight: "40px", // space for the eye icon
    }}
  />
  <FontAwesomeIcon
    icon={showPassword ? faEyeSlash : faEye}
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#666",
      zIndex: 2,
    }}
  />
</div>



          {error && <p className="error-message">{error}</p>}

          <div className="button-container">
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "LOGIN"}
            </button>
            <button type="button" className="forgot-button">FORGOT PASSWORD</button>
          </div>

          <p className="register-text">
            Don't have an account? <a href="/signup" className="register-link">Register here</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;