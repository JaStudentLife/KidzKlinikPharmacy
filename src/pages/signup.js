import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [role, setRole] = useState("patient");
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const validatePassword = (pwd) => {
    const hasNumber = /\d/;
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/;
    return hasNumber.test(pwd) && hasSymbol.test(pwd);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    if (!validatePassword(password)) {
      setMessage({ text: "Password must contain at least one number and one symbol.", type: "error" });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        role,
      });

      setMessage({ text: "Signup successful! Redirecting to login...", type: "success" });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    }
  };

  return (
    <div className="signup-container">
      <div className="header-login-signup" style={{ alignItems: "center", paddingBottom: "10px", width: "100%" }}>
        <div className="horizantal" style={{ display: "flex", alignItems: "center" }}>
          <img src="/images/Logo.png" alt="Logo" style={{ width: "150px", height: "auto", marginRight: "10px" }} />
          <h1 style={{ fontFamily: "serif", fontSize: "55px", fontWeight: "bold", margin: 0 }}>THE KIDZ KLINIK</h1>
        </div>
        <hr style={{ width: "90%", marginTop: "10px", border: "1px solid #888" }} />
      </div>

      <div className="form-wrapper">
        <img src="/images/IMG_8F77EFF687EC-1.jpeg" alt="Family" className="form-image" />
        <form onSubmit={handleSignup} className="signup-form">
          <h2 className="signup-title">SIGN UP</h2>

          {message.text && (
            <div className={`message ${message.type}`} style={{
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
              color: message.type === "success" ? "green" : "red",
              background: message.type === "success" ? "#d4edda" : "#f8d7da",
              border: message.type === "success" ? "1px solid #c3e6cb" : "1px solid #f5c6cb",
              textAlign: "center"
            }}>
              {message.text}
            </div>
          )}

          <label>Email:</label>
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
    style={{ width: "100%", paddingRight: "40px" }}
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
      zIndex: 2
    }}
  />
</div>


<label>Re-enter Password:</label>
<div style={{ position: "relative", display: "flex", alignItems: "center" }}>
  <input
    type={showConfirmPassword ? "text" : "password"}
    placeholder="Re-enter your password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
    className="form-input"
    style={{ width: "100%", paddingRight: "40px" }}
  />
  <FontAwesomeIcon
    icon={showConfirmPassword ? faEyeSlash : faEye}
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    style={{
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#666",
      zIndex: 2
    }}
  />
</div>

          <button type="submit" className="signup-button">SIGN UP</button>

          <p className="register-text">
            Already have an account? <a href="/login" className="register-link">Login here</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
