import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; 
import { doc, setDoc,getDocs,getDoc,collection,updateDoc,collectionGroup } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./App.css";
import PrescriptionForm from "./PrescriptionForm";
import AddMedication from "./addmedication";
import InventoryDashboard from "./InventoryDashboard";
import VerifyPrescription from "./VerifyPrescription";
import emailjs from '@emailjs/browser';
import Contact from "./Contact";

const Pharmacist = () => {
     const navigate = useNavigate();
     const [activeTab, setActiveTab] = useState("");
     const [prescriptions, setPrescriptions] = useState([
      {
        name: "Lola Morgan",
        dob: "2020-03-12",
        medication: "Amoxicillin",
        dosage: "250mg",
        quantity: "30",
        signature: "Dr. Smith",
        checklist: [false, false, false, false, false, false],
      },
      {
        name: "Jake Brown",
        dob: "2010-06-18",
        medication: "Ibuprofen",
        dosage: "200mg",
        quantity: "15",
        signature: "Dr. Taylor",
        checklist: [false, false, false, false, false, false],
      }
    ]);
    
    const toggleChecklist = (prescriptionIndex, itemIndex) => {
      const updated = [...prescriptions];
      updated[prescriptionIndex].checklist[itemIndex] = !updated[prescriptionIndex].checklist[itemIndex];
      setPrescriptions(updated);
    };
      useEffect(() => {
        const savedTab = localStorage.getItem("activeTab");
        if (savedTab) {
          setActiveTab(savedTab);
        }
      }, []);
    
      useEffect(() => {
        localStorage.setItem("activeTab", activeTab);
      }, [activeTab]);
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <div className="pharmacist-container">
      <div className="pharmacist-menu">
     
      <div className="header-login-signup" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#0082b5",
        padding: "15px"
      }}>
        <div className="horizantal" style={{ display: "flex", alignItems: "center" }}>
          <img src="/images/Logo.png" alt="Logo" style={{ width: "150px", marginRight: "10px" }} />
          <h1 style={{ fontFamily: "serif", fontSize: "55px", fontWeight: "bold", margin: 0, color: "white" }}>
            THE KIDZ KLINIK
          </h1>
        </div>
        <button onClick={handleSignOut} className="signout-button">Sign Out</button>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#e0f0f8",
        padding: "10px"
      }}>

        <button onClick={() => setActiveTab("home")} className={`tab-button ${activeTab === "home" ? "active" : ""}`}>Home</button>
                  <button onClick={() => setActiveTab("verify")} className={`tab-button ${activeTab === "verify" ? "active" : ""}`}>Verify Prescription</button>
                  <button onClick={() => setActiveTab("prepare")} className={`tab-button ${activeTab === "prepare" ? "active" : ""}`}>Prepare Order</button>
{/*                  <button onClick={() => setActiveTab("update")} className={`tab-button ${activeTab === "update" ? "active" : ""}`}>Update Order</button>
*/}                  <button onClick={() => setActiveTab("notify")} className={`tab-button ${activeTab === "notify" ? "active" : ""}`}>Notify Patient</button>
                  <button onClick={() => setActiveTab("addMed")} className={`tab-button ${activeTab === "addMed" ? "active" : ""}`}>Manage Medicine Inventory</button>
                  

        </div>
     
      </div>
  
  {activeTab === "home"  &&  <div className="pharmacist-content">
        <h2>Welcome, Pharmacist!</h2>
        <p>Select a task from the navigation bar above.</p>
      </div> }

      {activeTab === "verify" && (<VerifyPrescription/>)}
      {activeTab === "prepare" && (
 <PreparePrescription setActiveTab={setActiveTab}/>
)}

{activeTab === "update" && (
<UpdateOrder/>
)}
{activeTab === "notify" && (
  <NotifyPatient/>
)}
{activeTab === "addMed" && (
  <InventoryDashboard/>
)}
{activeTab === "contact" && <Contact />}


     
    </div>
  );
};

const PreparePrescription = () => {
  const [patients, setPatients] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [notAvailable, setNotAvailable] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, "users"));
      const data = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (userData.role === "patient") {
          const prescriptionsSnapshot = await getDocs(
            collection(db, "users", userDoc.id, "prescriptions")
          );
          if (!prescriptionsSnapshot.empty) {
            data.push({
              id: userDoc.id,
              email: userData.email,
              prescriptions: prescriptionsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })),
            });
          }
        }
      }
      setPatients(data);
      setLoading(false);
    };

    fetchAll();
  }, []);

  const handleCheckboxChange = (key) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotAvailableChange = (naKey, relatedKeys) => {
    setNotAvailable((prev) => {
      const updated = { ...prev, [naKey]: !prev[naKey] };
      if (!updated[naKey]) {
        setCheckedItems((prevChecked) => {
          const updatedChecked = { ...prevChecked };
          relatedKeys.forEach((key) => delete updatedChecked[key]);
          return updatedChecked;
        });
      }
      return updated;
    });
  };

  const isFinishDisabled = (prescription, keysBase) => {
    if (prescription.packed) return true;

    return prescription.medications.some((_, index) => {
      const naKey = `${keysBase}-${index}`;
      if (notAvailable[naKey]) return false;

      return !["medication", "dosage", "quantity"].every((field) =>
        checkedItems[`${keysBase}-${index}-${field}`]
      );
    });
  };

  const handleFinish = async (patientId, prescriptionId, keysBase) => {
    try {
      const inventoryRef = collection(db, "inventory");
      const snapshot = await getDocs(inventoryRef);
  
      const inventoryMap = {};
      snapshot.forEach((doc) => {
        inventoryMap[doc.id] = { ...doc.data(), docId: doc.id };
      });
  
      const patient = patients.find((p) => p.id === patientId);
      const prescription = patient.prescriptions.find((p) => p.id === prescriptionId);
  
      for (const med of prescription.medications) {
        const medName = med.medication?.trim().toLowerCase();
        const medDosage = med.dosage?.trim().toLowerCase();
  
        const match = Object.values(inventoryMap).find((inv) =>
          inv.name?.trim().toLowerCase() === medName &&
          inv.dosage?.trim().toLowerCase() === medDosage
        );
  
        if (match) {
          const currentQty = parseInt(match.quantity);
          const qtyToSubtract = parseInt(med.quantity);
          const newQty = currentQty - qtyToSubtract;
  
          console.log(`✅ Updating ${medName} (${medDosage}) — ${currentQty} ➝ ${Math.max(0, newQty)}`);
  
          try {
            await updateDoc(doc(db, "inventory", match.docId), {
              quantity: newQty < 0 ? 0 : newQty,
            });
          } catch (err) {
            console.error(`❌ Failed to update inventory for ${medName}:`, err);
          }
        } else {
          console.warn(`⚠️ No inventory match for ${medName} (${medDosage})`);
        }
      }
  
      await updateDoc(
        doc(db, "users", patientId, "prescriptions", prescriptionId),
        { packed: true }
      );
      alert("✅ Prescription packaged and inventory updated!");
  
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientId
            ? {
                ...p,
                prescriptions: p.prescriptions.map((pres) =>
                  pres.id === prescriptionId ? { ...pres, packed: true } : pres
                ),
              }
            : p
        )
      );
  
      const keysToClear = Object.keys(checkedItems).filter((k) =>
        k.startsWith(keysBase)
      );
      const naKeysToClear = Object.keys(notAvailable).filter((k) =>
        k.startsWith(keysBase)
      );
      setCheckedItems((prev) => {
        const newState = { ...prev };
        keysToClear.forEach((k) => delete newState[k]);
        return newState;
      });
      setNotAvailable((prev) => {
        const newState = { ...prev };
        naKeysToClear.forEach((k) => delete newState[k]);
        return newState;
      });
  
    } catch (err) {
      console.error("❌ Error in packaging process:", err);
      alert("❌ Failed to package prescription or update inventory.");
    }
  };
  
  
  return (
    <div style={{ padding: 40 }}>
      <h2>📦 Prepare All Prescriptions</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        patients.map((patient) => (
          <div key={patient.id} style={{ marginBottom: 40 }}>
            <h3>🧍‍♂️ Patient: {patient.email}</h3>
            {patient.prescriptions.map((prescription, pIdx) => {
              const keysBase = `${patient.id}-${prescription.id}`;

              return (
                <div
                  key={prescription.id}
                  style={{
                    padding: 20,
                    background: "#fff",
                    borderRadius: 10,
                    marginTop: 10,
                    border: prescription.packed ? "2px solid green" : "1px solid #ccc",
                  }}
                >
                  <h4>📑 Prescription #{pIdx + 1}</h4>
                  {prescription.packed && (
                    <p style={{ color: "green", fontWeight: "bold" }}>
                      ✅ Already Packaged
                    </p>
                  )}
                  <p>
                    <strong>Name:</strong> {prescription.name}
                  </p>
                  <p>
                    <strong>DOB:</strong> {prescription.dob}
                  </p>
                  {prescription.medications.map((med, index) => {
                    const naKey = `${keysBase}-${index}`;
                    const relatedKeys = ["medication", "dosage", "quantity"].map(
                      (field) => `${keysBase}-${index}-${field}`
                    );
                    const isDisabled = prescription.packed || notAvailable[naKey];

                    return (
                      <div
                        key={index}
                        style={{
                          borderTop: "1px solid #ccc",
                          paddingTop: 10,
                          marginTop: 10,
                        }}
                      >
                        <p>
                          <strong>Medication:</strong> {med.medication}
                        </p>
                        <label>
                          <input
                            type="checkbox"
                            checked={
                              checkedItems[`${keysBase}-${index}-medication`] || false
                            }
                            onChange={() =>
                              handleCheckboxChange(`${keysBase}-${index}-medication`)
                            }
                            disabled={isDisabled}
                          />{" "}
                          Confirm Medication Retrieved
                        </label>
                        <br />
                        <label>
                          <input
                            type="checkbox"
                            checked={
                              checkedItems[`${keysBase}-${index}-dosage`] || false
                            }
                            onChange={() =>
                              handleCheckboxChange(`${keysBase}-${index}-dosage`)
                            }
                            disabled={isDisabled}
                          />{" "}
                          Confirm Dosage
                        </label>
                        <br />
                        <label>
                          <input
                            type="checkbox"
                            checked={
                              checkedItems[`${keysBase}-${index}-quantity`] || false
                            }
                            onChange={() =>
                              handleCheckboxChange(`${keysBase}-${index}-quantity`)
                            }
                            disabled={isDisabled}
                          />{" "}
                          Confirm Quantity
                        </label>
                        <br />
                        <label style={{ color: "red" }}>
                          <input
                            type="checkbox"
                            checked={notAvailable[naKey] || false}
                            onChange={() =>
                              handleNotAvailableChange(naKey, relatedKeys)
                            }
                            disabled={prescription.packed}
                          />{" "}
                          Mark as Not Available
                        </label>
                      </div>
                    );
                  })}
                  <button
                    disabled={isFinishDisabled(prescription, keysBase)}
                    onClick={() =>
                      handleFinish(patient.id, prescription.id, keysBase)
                    }
                    style={{
                      marginTop: 20,
                      padding: 10,
                      backgroundColor: isFinishDisabled(prescription, keysBase)
                        ? "#ccc"
                        : "#0077aa",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      cursor: isFinishDisabled(prescription, keysBase)
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {prescription.packed ? "Already Packaged" : "Finish Packaging"}
                  </button>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
};


const UpdateOrder = () => {
  const [patientId, setPatientId] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setMessage("");
    setPrescriptions([]);
    setSelectedPrescriptionId(null);

    try {
      const snapshot = await getDocs(collection(db, "users", patientId, "prescriptions"));
      if (snapshot.empty) {
        setMessage("No prescriptions found for this patient.");
      } else {
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPrescriptions(results);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setMessage("Failed to fetch prescriptions. Please check the Patient ID.");
    }

    setLoading(false);
  };

  const selectedPrescription = prescriptions.find(p => p.id === selectedPrescriptionId);

  const handleToggleAvailability = (index) => {
    const key = `${selectedPrescriptionId}-${index}`;
    setAvailability(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleUpdate = () => {
    alert("Availability updated (in UI only).");
    setSelectedPrescriptionId(null);
    setAvailability({});
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f5fbff', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '28px', textAlign: 'center', color: '#0077aa' }}>
        Update Prescription Orders
      </h2>

      <div style={{
        maxWidth: "600px",
        margin: "30px auto",
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
      }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>
          Enter Patient ID (UID):
        </label>
        <input
          type="text"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="e.g. X9K3dD..."
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "12px"
          }}
        />
        <button
          onClick={handleSearch}
          disabled={!patientId || loading}
          style={{
            padding: "12px",
            width: "100%",
            backgroundColor: "#0077aa",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {loading ? "Searching..." : "Fetch Prescriptions"}
        </button>
        {message && <p style={{ color: "red", marginTop: "10px" }}>{message}</p>}
      </div>

      {prescriptions.length > 0 && (
        <div style={{
          maxWidth: '700px',
          margin: '30px auto',
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#0077aa' }}>Select a Prescription</h3>
          <select
            value={selectedPrescriptionId || ""}
            onChange={(e) => setSelectedPrescriptionId(e.target.value)}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              backgroundColor: '#f9f9f9'
            }}
          >
            <option value="">-- Choose Prescription --</option>
            {prescriptions.map((p, idx) => (
              <option key={p.id} value={p.id}>
                Prescription #{idx + 1} • {p.prescribedDate || "Unknown Date"}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedPrescription && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#006fa1' }}>Prescription Details</h3>

          {selectedPrescription.medications.map((med, index) => {
            const key = `${selectedPrescriptionId}-${index}`;
            return (
              <div key={index} style={{
                padding: '20px',
                marginBottom: '20px',
                backgroundColor: '#f9fcff',
                border: '1px solid #e0e0e0',
                borderRadius: '10px'
              }}>
                <p><strong>Medication:</strong> {med.medication}</p>
                <p><strong>Dosage:</strong> {med.dosage}</p>
                <p><strong>Quantity:</strong> {med.quantity}</p>
                <label style={{
                  fontWeight: 'bold',
                  color: availability[key] ? '#b30000' : '#009900'
                }}>
                  <input
                    type="checkbox"
                    checked={availability[key] || false}
                    onChange={() => handleToggleAvailability(index)}
                    style={{ marginRight: '10px' }}
                  />
                  {availability[key] ? "Not Available" : "Available"}
                </label>
              </div>
            );
          })}

          <button
            onClick={handleUpdate}
            style={{
              marginTop: '30px',
              width: '100%',
              padding: '15px',
              backgroundColor: '#0077aa',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Update Order
          </button>
        </div>
      )}
    </div>
  );
};


const NotifyPatient = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [sendingId, setSendingId] = useState(null);
  const [notifiedMap, setNotifiedMap] = useState({});

  useEffect(() => {
    const fetchPackedPrescriptions = async () => {
      const querySnapshot = await getDocs(collectionGroup(db, "prescriptions"));
      const groupedByPatient = {};

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        if (data.packed) {
          const patientId = docSnap.ref.parent.parent.id;

          if (!groupedByPatient[patientId]) {
            const userRef = doc(db, "users", patientId);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.exists() ? userDoc.data() : {};

            groupedByPatient[patientId] = {
              id: patientId,
              name: data.name,
              email: userData.email || "",
              prescriptions: [],
            };
          }

          groupedByPatient[patientId].prescriptions.push({
            ...data,
            docId: docSnap.id,
            docRef: docSnap.ref,
          });
        }
      }

      const packedPatients = Object.values(groupedByPatient);
      setPrescriptions(packedPatients);

      const newMap = {};
      packedPatients.forEach((patient) => {
        patient.prescriptions.forEach((pres) => {
          newMap[pres.docId] = pres.notified || false;
        });
      });
      setNotifiedMap(newMap);
    };

    fetchPackedPrescriptions();
  }, []);

  const handleNotify = async (patient, specificPrescription) => {
    if (!patient || !specificPrescription) return;
    setSendingId(specificPrescription.docId);

    const medList = specificPrescription.medications
      ?.map((med, idx) =>
        `Medication ${idx + 1}:
        - Name: ${med.medication}
        - Dosage: ${med.dosage}
        - Quantity: ${med.quantity}`
      )
      .join("\n\n") || "No medication details provided.";

    const templateParams = {
      to_name: patient.name,
      to_email: patient.email,
      title: "Prescription Ready for Pickup",
      message: `Hi ${patient.name},\n\nYour prescription is ready for pickup at the pharmacy. Details:\n\n${medList}\n\nPlease visit us during operating hours to collect your medication.\n\nBest regards,\nThe Kidz Klinik Team`,
    };

    try {
      await emailjs.send(
        "service_zqdhd4e",
        "template_ovx2z1a",
        templateParams,
        "Vcld9wnSGYfR9XGsl"
      );

      if (specificPrescription.docRef) {
        await updateDoc(specificPrescription.docRef, {
          notified: true,
          notifiedAt: new Date(),
        });
      }

      setNotifiedMap((prev) => ({
        ...prev,
        [specificPrescription.docId]: true,
      }));

      alert(`✅ Notification sent to ${patient.name}.`);
    } catch (error) {
      console.error("EmailJS error:", error);
      alert("❌ Failed to send notification.");
    }

    setSendingId(null);
  };

  return (
    <div style={{ padding: "40px", backgroundColor: "#f5fbff", minHeight: "100vh" }}>
      <h2 style={{ fontSize: "28px", textAlign: "center", color: "#0077aa" }}>
        Notify Patients
      </h2>
      {prescriptions.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>
          No packed prescriptions found.
        </p>
      ) : (
        prescriptions.map((patient) => (
          <div
            key={patient.id}
            style={{
              maxWidth: "800px",
              margin: "30px auto",
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ color: "#006fa1" }}>{patient.name}</h3>
            <p style={{ marginBottom: "20px" }}>Packed prescriptions:</p>
            {patient.prescriptions.map((med, index) => (
              <div
                key={index}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #eee",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "20px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p>
                    <strong>Prescription Date:</strong> {med.prescribedDate}
                  </p>
                  {med.medications &&
                    med.medications.map((item, i) => (
                      <div key={i} style={{ marginBottom: "10px" }}>
                        <p>
                          <strong>Medication:</strong> {item.medication}
                        </p>
                        <p>
                          <strong>Dosage:</strong> {item.dosage}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {item.quantity}
                        </p>
                      </div>
                    ))}
                  {notifiedMap[med.docId] && (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "5px 10px",
                        backgroundColor: "#d1f5d3",
                        color: "#2b7a2b",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        marginTop: "5px",
                      }}
                    >
                      ✅ Notified
                    </span>
                  )}
                </div>
                {!notifiedMap[med.docId] && (
                  <button
                    onClick={() => handleNotify(patient, med)}
                    disabled={sendingId === med.docId}
                    style={{
                      padding: "10px 15px",
                      backgroundColor: sendingId === med.docId ? "#ccc" : "#0077aa",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      cursor:
                        sendingId === med.docId ? "not-allowed" : "pointer",
                      minWidth: "100px",
                    }}
                  >
                    {sendingId === med.docId ? "Sending..." : "Notify"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};


const NotifyPharmacist = () => {

}

export default Pharmacist;