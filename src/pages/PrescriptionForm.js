import React, { useState } from "react";
import { auth, db } from "../firebase"; 
import { doc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./App.css";

const PrescriptionForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    medication: "",
    dosage: "",
    quantity: "",
    signature: "",
    prescribedDate: new Date().toLocaleDateString(),
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const user = auth.currentUser;

      if (!user) {
        setMessage({ text: "You must be logged in to save prescriptions.", type: "error" });
        setLoading(false);
        return;
      }

      const prescriptionRef = doc(db, "users", user.uid, "prescriptions", Date.now().toString());

      await setDoc(prescriptionRef, formData);

      setMessage({ text: "Prescription saved successfully!", type: "success" });
      setSubmitted(true);
    } catch (error) {
      setMessage({ text: "Error saving prescription. Please try again.", type: "error" });
    }

    setLoading(false);
  };

  const handleClear = () => {
    setFormData({
      name: "",
      dob: "",
      medication: "",
      dosage: "",
      quantity: "",
      signature: "",
      prescribedDate: new Date().toLocaleDateString(),
    });
    setSubmitted(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login"); 
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="prescription-container" style={{ backgroundImage: "url('/images/Doctor.jpg')" }}>
      <div className="header-login-signup" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", width: "100%", backgroundColor: "#0082b5", padding: "15px" }}>
        <div className="horizantal" style={{ display: "flex", alignItems: "center" }}>
          <img src="/images/Logo.png" alt="Logo" style={{ width: "150px", height: "auto", marginRight: "10px" }} />
          <h1 style={{ fontFamily: "serif", fontSize: "55px", fontWeight: "bold", margin: 0 }}>THE KIDZ KLINIK</h1>
        </div>

        <button onClick={handleSignOut} className="signout-button">Sign Out</button>
      </div>

      {!submitted ? (
        <div className="form-container">
          <h1 className="clinic-title">THE KIDZ KLINIK</h1>
          <h2 className="form-title">PRESCRIPTION FORM</h2>

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

          <form onSubmit={handleSubmit} className="prescription-form">
            <div className="form-group">
              <label>Patient’s Name:</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Date of Birth:</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Medication:</label>
              <input type="text" name="medication" value={formData.medication} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Dosage:</label>
              <input type="text" name="dosage" value={formData.dosage} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Quantity:</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
            </div>

            <div className="form-group signature-container">
              <label>Signature:</label>
              <div className="signature-box">
                <input type="text" name="signature" placeholder="Sign here..." value={formData.signature} onChange={handleChange} required />
              </div>
            </div>

            <div className="button-container">
              <button type="submit" className="submit-button" disabled={loading}>{loading ? "Saving..." : "SUBMIT"}</button>
              <button type="button" className="clear-button" onClick={handleClear}>CLEAR</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="report-container">
          <h1 className="clinic-title">THE KIDZ KLINIK</h1>
          <h2 className="report-title">PRESCRIPTION REPORT</h2>

          <p><strong>Patient’s Name:</strong> {formData.name}</p>
          <p><strong>Date of Birth:</strong> {formData.dob}</p>
          <p><strong>Medication:</strong> {formData.medication}</p>
          <p><strong>Dosage:</strong> {formData.dosage}</p>
          <p><strong>Quantity:</strong> {formData.quantity}</p>
          <p><strong>Prescribed on:</strong> {formData.prescribedDate}</p>

          <div className="signature-report">
            <p><strong>Signature:</strong></p>
            <div className="signature-display">{formData.signature}</div>
          </div>

          <button className="back-button" onClick={handleClear}>Back to Form</button>
        </div>
      )}
    </div>
  );
};

export default PrescriptionForm;