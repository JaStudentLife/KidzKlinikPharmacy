import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./App.css";
import emailjs from '@emailjs/browser';
const PrescriptionForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    medications: [{ medication: "", dosage: "", quantity: "" }],
    signature: "",
    prescribedDate: new Date().toLocaleDateString(),
  });

  const [inventory, setInventory] = useState([]);
  const [medicationErrors, setMedicationErrors] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const snapshot = await getDocs(collection(db, "inventory"));
        const data = snapshot.docs.map(doc => doc.data());
        setInventory(data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchInventory();
  }, []);

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;

    if (["medication", "dosage", "quantity"].includes(name) && index !== null) {
      const updatedMeds = [...formData.medications];
      updatedMeds[index][name] = value;
      setFormData({ ...formData, medications: updatedMeds });

      const { medication, dosage, quantity } = updatedMeds[index];
      const isValid = inventory.some(item =>
        item.name.toLowerCase() === medication.toLowerCase() &&
        item.dosage.toLowerCase() === dosage.toLowerCase() &&
        parseInt(item.quantity) >= parseInt(quantity)
      );

      const updatedErrors = [...medicationErrors];
      updatedErrors[index] = isValid || (!medication || !dosage || !quantity)
        ? ""
        : `⚠️ ${medication} (${dosage}) is unavailable or insufficient`;

      setMedicationErrors(updatedErrors);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { medication: "", dosage: "", quantity: "" }],
    });
    setMedicationErrors([...medicationErrors, ""]);
  };

  const handleRemoveMedication = (index) => {
    const updatedMeds = formData.medications.filter((_, i) => i !== index);
    const updatedErrors = medicationErrors.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: updatedMeds });
    setMedicationErrors(updatedErrors);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
  
    const hasErrors = medicationErrors.some((error) => error !== "");
    if (hasErrors) {
      setMessage({ text: "Please resolve all medication issues before submitting.", type: "error" });
      setLoading(false);
      return;
    }
  
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage({ text: "You must be logged in to save prescriptions.", type: "error" });
        setLoading(false);
        return;
      }
  
      const prescriptionRef = doc(db, "users", user.uid, "prescriptions", Date.now().toString());
      await setDoc(prescriptionRef, formData);
  
      const usersSnapshot = await getDocs(collection(db, "users"));
      const pharmacistEmails = usersSnapshot.docs
        .map(doc => doc.data())
        .filter(user => user.role === "pharmacist")
        .map(user => user.email);
  
      const medDetails = formData.medications
        .map(m => `${m.medication} (${m.dosage}) x${m.quantity}`)
        .join(", ");
  
        await Promise.all(pharmacistEmails.map(email =>
          emailjs.send("service_zqdhd4e", "template_ovx2z1a", {
            title: "🧾 New Prescription Alert - The Kidz Klinik",
            message: `A new prescription has been submitted for review. Please log in to your dashboard to prepare the order.`,
            to_email: email,
          }, "Vcld9wnSGYfR9XGsl")
        ));
  
      setMessage({ text: "Prescription saved successfully!", type: "success" });
      setSubmitted(true);
    } catch (error) {
      console.error("Error saving prescription:", error);
      setMessage({ text: "Error saving prescription. Please try again.", type: "error" });
    }
  
    setLoading(false);
  };

  const handleClear = () => {
    setFormData({
      name: "",
      dob: "",
      medications: [{ medication: "", dosage: "", quantity: "" }],
      signature: "",
      prescribedDate: new Date().toLocaleDateString(),
    });
    setMedicationErrors([]);
    setSubmitted(false);
    setMessage({ text: "", type: "" });
  };

  return (
    <div className="prescription-container" style={{ backgroundImage: "url('/images/Doctor.jpg')" }}>
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

            {formData.medications.map((med, index) => (
              <div key={index} className="medication-group">
                <div className="form-group">
                  <label>Medication:</label>
                  <input type="text" name="medication" value={med.medication} onChange={(e) => handleChange(e, index)} required />
                </div>

                <div className="form-group">
                  <label>Dosage:</label>
                  <input type="text" name="dosage" value={med.dosage} onChange={(e) => handleChange(e, index)} required />
                </div>

                <div className="form-group">
                  <label>Quantity:</label>
                  <input type="number" name="quantity" value={med.quantity} onChange={(e) => handleChange(e, index)} required />
                </div>

                {medicationErrors[index] && (
                  <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                    {medicationErrors[index]}
                  </div>
                )}

                {index > 0 && (
                  <button type="button" onClick={() => handleRemoveMedication(index)} className="remove-button">
                    Remove
                  </button>
                )}
              </div>
            ))}

            <div className="form-group">
              <button type="button" onClick={handleAddMedication} className="add-button">
                + Add Another Medication
              </button>
            </div>

            <div className="form-group signature-container">
              <label>Signature:</label>
              <div className="signature-box">
                <input type="text" name="signature" placeholder="Sign here..." value={formData.signature} onChange={handleChange} required style={{ border: "none" }} />
              </div>
            </div>

            <div className="button-container">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Saving..." : "SUBMIT"}
              </button>
              <button type="button" className="clear-button" onClick={handleClear}>CLEAR</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="report-container">
          <h2 className="report-title">PRESCRIPTION REPORT</h2>

          <p><strong>Patient’s Name:</strong> {formData.name}</p>
          <p><strong>Date of Birth:</strong> {formData.dob}</p>

          {formData.medications.map((med, index) => (
            <div key={index}>
              <p><strong>Medication {index + 1}:</strong> {med.medication}</p>
              <p><strong>Dosage:</strong> {med.dosage}</p>
              <p><strong>Quantity:</strong> {med.quantity}</p>
            </div>
          ))}

          <p><strong>Prescribed on:</strong> {formData.prescribedDate}</p>
        </div>
      )}
    </div>
  );
};

export default PrescriptionForm;