import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; 
import { doc, setDoc,getDocs,collection,updateDoc,collectionGroup } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./App.css";
import PrescriptionForm from "./PrescriptionForm";
import AddMedication from "./addmedication";
import InventoryDashboard from "./InventoryDashboard";
import VerifyPrescription from "./VerifyPrescription";
import emailjs from '@emailjs/browser';

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
                  <button onClick={() => setActiveTab("addMed")} className={`tab-button ${activeTab === "addMed" ? "active" : ""}`}>Manage Mediccine Inventory</button>

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

     
    </div>
  );
};

const PreparePrescription = ({ setActiveTab }) => {
  const [patientId, setPatientId] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [notAvailable, setNotAvailable] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFetchPrescriptions = async () => {
    setLoading(true);
    setMessage("");
    setPrescriptions([]);
    setSelectedPrescriptionId(null);

    try {
      const snapshot = await getDocs(collection(db, "users", patientId, "prescriptions"));
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

  const selectedPrescription = prescriptions.find(p => p.id === selectedPrescriptionId);

  const handleCheckboxChange = (index, field) => {
    const key = `${index}-${field}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotAvailableChange = (index) => {
    const key = `${index}`;
    setNotAvailable(prev => ({ ...prev, [key]: !prev[key] }));

    if (!notAvailable[key]) {
      setCheckedItems(prev => {
        const newChecked = { ...prev };
        ["medication", "dosage", "quantity"].forEach(field => {
          const subKey = `${index}-${field}`;
          delete newChecked[subKey];
        });
        return newChecked;
      });
    }
  };

  const isFinishDisabled = () => {
    if (!selectedPrescription) return true;
    return selectedPrescription.medications.some((_, index) => {
      const naKey = `${index}`;
      if (notAvailable[naKey]) return false;

      return !["medication", "dosage", "quantity"].every(field =>
        checkedItems[`${index}-${field}`]
      );
    });
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f2f6fa', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '30px', color: '#0077aa' }}>Prepare Prescription</h2>

      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <label style={{ fontWeight: "bold" }}>Enter Patient ID (UID):</label>
        <input
          type="text"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="e.g. zUc12p...x9A"
          style={{
            width: "100%",
            padding: "12px",
            margin: "10px 0",
            border: "1px solid #ccc",
            borderRadius: "6px"
          }}
        />
        <button
          onClick={handleFetchPrescriptions}
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
          {loading ? "Loading..." : "Get Prescriptions"}
        </button>
        {message && <p style={{ color: "red", marginTop: "10px" }}>{message}</p>}
      </div>
      {prescriptions.length > 0 && (
  <div style={{
    maxWidth: '700px',
    margin: '30px auto',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    borderLeft: '5px solid #0077aa'
  }}>
    <h3 style={{
      fontSize: '20px',
      marginBottom: '12px',
      color: '#0077aa'
    }}>
      📋 Select a Prescription to Prepare
    </h3>

    <select
      value={selectedPrescriptionId || ""}
      onChange={(e) => setSelectedPrescriptionId(e.target.value)}
      style={{
        width: '100%',
        padding: '14px',
        fontSize: '16px',
        borderRadius: '10px',
        border: '1px solid #ccc',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
        backgroundColor: '#f9f9f9',
        color: '#333'
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
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#fff",
          padding: "25px",
          borderRadius: "15px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          marginTop: "20px"
        }}>
          <h3 style={{ fontSize: "22px", marginBottom: "10px" }}>{selectedPrescription.name}</h3>
          <p><strong>DOB:</strong> {selectedPrescription.dob}</p>
          <p><strong>Signature:</strong> {selectedPrescription.signature}</p>

          {selectedPrescription.medications.map((item, index) => {
            const naKey = `${index}`;
            const isNA = notAvailable[naKey];

            return (
              <div key={index} style={{
                marginTop: "20px",
                padding: "20px",
                background: "#f9fcff",
                borderRadius: "10px",
                border: "1px solid #e0e0e0"
              }}>
                <p><strong>Medication:</strong> {item.medication}</p>
                <label>
                  <input
                    type="checkbox"
                    checked={checkedItems[`${index}-medication`] || false}
                    onChange={() => handleCheckboxChange(index, "medication")}
                    disabled={isNA}
                    style={{ marginRight: "10px" }}
                  />
                  Confirm Medication Retrieved
                </label>

                <p style={{ marginTop: "10px" }}><strong>Dosage:</strong> {item.dosage}</p>
                <label>
                  <input
                    type="checkbox"
                    checked={checkedItems[`${index}-dosage`] || false}
                    onChange={() => handleCheckboxChange(index, "dosage")}
                    disabled={isNA}
                    style={{ marginRight: "10px" }}
                  />
                  Confirm Dosage
                </label>

                <p style={{ marginTop: "10px" }}><strong>Quantity:</strong> {item.quantity}</p>
                <label>
                  <input
                    type="checkbox"
                    checked={checkedItems[`${index}-quantity`] || false}
                    onChange={() => handleCheckboxChange(index, "quantity")}
                    disabled={isNA}
                    style={{ marginRight: "10px" }}
                  />
                  Confirm Quantity Counted
                </label>

                <div style={{ marginTop: "10px" }}>
                  <label style={{ color: "#c00" }}>
                    <input
                      type="checkbox"
                      checked={isNA}
                      onChange={() => handleNotAvailableChange(index)}
                      style={{ marginRight: "10px" }}
                    />
                    Mark as Not Available
                  </label>
                </div>
              </div>
            );
          })}

          <button
            disabled={isFinishDisabled()}
            onClick={async () => {
              try {
                const docRef = doc(db, "users", patientId, "prescriptions", selectedPrescriptionId);
                await updateDoc(docRef, { packed: true });
                alert("Prescription prepared and marked as packed!");
              } catch (err) {
                console.error("Failed to update prescription status:", err);
                alert("Error updating prescription status.");
              }
            
              setSelectedPrescriptionId(null);
              setCheckedItems({});
              setNotAvailable({});
              setActiveTab("home");
            }}
            style={{
              marginTop: '30px',
              width: '100%',
              padding: '15px',
              backgroundColor: isFinishDisabled() ? '#ccc' : '#0082b5',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: isFinishDisabled() ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            Finish Packaging
          </button>
        </div>
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

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.packed) {
          const patientId = doc.ref.parent.parent.id;
          if (!groupedByPatient[patientId]) {
            groupedByPatient[patientId] = {
              id: patientId,
              name: data.name,
              email: data.email,
              prescriptions: []
            };
          }

          groupedByPatient[patientId].prescriptions.push({ 
            ...data, 
            docId: doc.id,
            docRef: doc.ref
          });
        }
      });

      const packedPatients = Object.values(groupedByPatient);
      setPrescriptions(packedPatients);

      const newMap = {};
      packedPatients.forEach(patient => {
        patient.prescriptions.forEach(pres => {
          newMap[pres.docId] = pres.notified || false;
        });
      });
      setNotifiedMap(newMap);
    };

    fetchPackedPrescriptions();
  }, []);

  const handleNotify = async (patient, specificPrescription) => {
    if (!patient || !specificPrescription) return;
    setSendingId(patient.id);

    const templateParams = {
      to_name: patient.name,
      to_email: patient.email,
      title: "Prescription Ready for pickup",
      message: `Hi ${patient.name}, your prescription for ${specificPrescription.medications?.[0]?.medication || 'your medication'} is ready for pickup at the pharmacy.`,
    };

    try {
      await emailjs.send(
        'service_zqdhd4e',
        'template_ovx2z1a',
        templateParams,
        'Vcld9wnSGYfR9XGsl'
      );

      if (specificPrescription.docRef) {
        await updateDoc(specificPrescription.docRef, { 
          notified: true,
          notifiedAt: new Date() 
        });
      }

      setNotifiedMap(prev => ({
        ...prev,
        [specificPrescription.docId]: true
      }));

      alert(`Prescription for ${specificPrescription.name} has been notified.`);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send notification or update prescription.");
    }

    setSendingId(null);
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f5fbff', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '28px', textAlign: 'center', color: '#0077aa' }}>Notify Patients</h2>
      {prescriptions.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>No packed prescriptions found.</p>
      ) : (
        prescriptions.map((patient) => (
          <div key={patient.id} style={{
            maxWidth: '800px',
            margin: '30px auto',
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#006fa1' }}>{patient.name}</h3>
            <p style={{ marginBottom: '20px' }}>Packed prescriptions:</p>
            {patient.prescriptions.map((med, index) => (
              <div key={index} style={{ 
                padding: '10px 0', 
                borderBottom: '1px solid #eee',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p><strong>Prescription Date:</strong> {med.prescribedDate}</p>
                  {med.medications && med.medications.map((item, i) => (
                    <div key={i} style={{ marginBottom: '10px' }}>
                      <p><strong>Medication:</strong> {item.medication}</p>
                      <p><strong>Dosage:</strong> {item.dosage}</p>
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                    </div>
                  ))}
                  {notifiedMap[med.docId] && (
                    <span style={{
                      display: 'inline-block',
                      padding: '5px 10px',
                      backgroundColor: '#d1f5d3',
                      color: '#2b7a2b',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      marginTop: '5px'
                    }}>
                      Notified
                    </span>
                  )}
                </div>
                {!notifiedMap[med.docId] && (
                  <button
                    onClick={() => handleNotify(patient, med)}
                    disabled={sendingId === patient.id}
                    style={{
                      padding: '10px 15px',
                      backgroundColor: sendingId === patient.id ? '#ccc' : '#0077aa',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: sendingId === patient.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {sendingId === patient.id ? "Sending..." : "Notify"}
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