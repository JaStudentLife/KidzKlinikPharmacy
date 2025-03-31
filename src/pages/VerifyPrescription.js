import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "./App.css";

const VerifyPrescription = () => {
  const [patients, setPatients] = useState([]);
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPatientsAndPrescriptions = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const filteredPatients = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        if (userData.role === "patient") {
          const prescriptionsSnapshot = await getDocs(
            collection(db, "users", userDoc.id, "prescriptions")
          );

          if (!prescriptionsSnapshot.empty) {
            const prescriptions = prescriptionsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            filteredPatients.push({
              id: userDoc.id,
              email: userData.email,
              prescriptions,
            });
          }
        }
      }

      setPatients(filteredPatients);
    } catch (error) {
      console.error("Error fetching patients and prescriptions:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPatientsAndPrescriptions();
  }, []);

  const toggleDropdown = (id) => {
    setExpandedPatientId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "50px auto",
        padding: "30px",
        background: "#f7fafd",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>🧾 Verified Patients with Prescriptions</h2>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading patients...</p>
      ) : patients.length === 0 ? (
        <p style={{ textAlign: "center" }}>No patients with prescriptions found.</p>
      ) : (
        patients.map((patient) => (
          <div
            key={patient.id}
            style={{
              background: "#fff",
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "10px",
              border: "1px solid #ddd",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p><strong>Patient ID:</strong> {patient.id}</p>
                <p><strong>Email:</strong> {patient.email}</p>
              </div>
              <button
                onClick={() => toggleDropdown(patient.id)}
                style={{
                  padding: "8px 14px",
                  backgroundColor: "#0077aa",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                {expandedPatientId === patient.id ? "Hide Prescriptions" : "View Prescriptions"}
              </button>
            </div>

            {expandedPatientId === patient.id && (
              <div style={{ marginTop: "15px" }}>
                {patient.prescriptions.map((prescription, idx) => (
                  <div
                    key={prescription.id}
                    style={{
                      background: "#eef9ff",
                      padding: "15px",
                      marginTop: "10px",
                      borderRadius: "8px",
                      borderLeft: "4px solid #0077aa",
                    }}
                  >
                    <h4>Prescription #{idx + 1}</h4>
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
        ))
      )}
    </div>
  );
};

export default VerifyPrescription;
