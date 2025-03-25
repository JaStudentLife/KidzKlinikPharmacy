import React, { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const VerifyPrescription = () => {
  const [patientId, setPatientId] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFetchPrescriptions = async () => {
    setLoading(true);
    setMessage("");
    setPrescriptions([]);

    try {
      const prescriptionsRef = collection(db, "users", patientId, "prescriptions");
      const snapshot = await getDocs(prescriptionsRef);

      if (snapshot.empty) {
        setMessage("No prescriptions found for this patient.");
      } else {
        const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPrescriptions(results);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setMessage("Failed to fetch prescriptions. Please check the Patient ID.");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "50px auto",
        padding: "30px",
        background: "#f7fafd",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>🔎 Verify Prescription</h2>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="patientId" style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>
          Enter Patient ID (UID):
        </label>
        <input
          type="text"
          id="patientId"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="e.g. 5pN1j...abc9"
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            marginBottom: "10px"
          }}
        />
        <button
          onClick={handleFetchPrescriptions}
          disabled={loading || !patientId}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0077aa",
            color: "white",
            border: "none",
            fontWeight: "bold",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          {loading ? "Fetching..." : "View Prescriptions"}
        </button>
      </div>

      {message && (
        <p style={{ color: "red", fontWeight: "500", marginTop: "10px", textAlign: "center" }}>{message}</p>
      )}

      {prescriptions.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          {prescriptions.map((prescription, idx) => (
            <div
              key={prescription.id}
              style={{
                background: "#fff",
                padding: "20px",
                marginBottom: "25px",
                borderRadius: "10px",
                borderLeft: "6px solid #0077aa",
              }}
            >
              <h3 style={{ marginBottom: "10px" }}>Prescription #{idx + 1}</h3>
              <p><strong>Name:</strong> {prescription.name}</p>
              <p><strong>DOB:</strong> {prescription.dob}</p>
              <p><strong>Prescribed Date:</strong> {prescription.prescribedDate}</p>
              <p><strong>Signature:</strong> {prescription.signature}</p>

              <div style={{ marginTop: "10px" }}>
                <strong>Medications:</strong>
                {prescription.medications.map((med, i) => (
                  <div key={i} style={{ marginLeft: "15px", marginTop: "4px" }}>
                    <p>• <strong>{med.medication}</strong> – {med.dosage}, Qty: {med.quantity}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerifyPrescription;