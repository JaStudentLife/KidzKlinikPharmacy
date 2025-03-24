import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; 
import { doc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "/Users/shavarmorgan/kidz-klinik-pharmacy/src/pages/App.css"
import PrescriptionForm from "./PrescriptionForm";

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
                  <button onClick={() => setActiveTab("update")} className={`tab-button ${activeTab === "update" ? "active" : ""}`}>Update Order</button>
                  <button onClick={() => setActiveTab("notify")} className={`tab-button ${activeTab === "notify" ? "active" : ""}`}>Notify Patient</button>
        </div>
     
      </div>
  
  {activeTab === "home"  &&  <div className="pharmacist-content">
        <h2>Welcome, Pharmacist!</h2>
        <p>Select a task from the navigation bar above.</p>
      </div> }

      {activeTab === "verify" && (<PrescriptionForm/>)}
      {activeTab === "prepare" && (
 <PreparePrescription setActiveTab={setActiveTab}/>
)}

     
    </div>
  );
};

const PreparePrescription = ({ setActiveTab }) => {
  const [prescriptions] = useState([
    {
      id: "1",
      name: "Lola Morgan",
      prescriptions: [
        { medication: "Amoxicillin", dosage: "250mg", quantity: 30 },
        { medication: "Ibuprofen", dosage: "200mg", quantity: 15 },
      ],
      signature: "Dr. Smith"
    },
    {
      id: "2",
      name: "Jake Brown",
      prescriptions: [
        { medication: "Paracetamol", dosage: "500mg", quantity: 10 }
      ],
      signature: "Dr. Taylor"
    }
  ]);

  const [selectedId, setSelectedId] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  const handleCheckboxChange = (prescriptionId, index, field) => {
    const key = `${prescriptionId}-${index}-${field}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedPrescription = prescriptions.find(p => p.id === selectedId);

  return (
    <div style={{ padding: '40px', backgroundColor: '#f2f6fa', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ fontSize: '30px', color: '#0082b5', marginBottom: '30px', textAlign: 'center' }}>Prepare a Prescription</h2>

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
          Select Patient:
        </label>
        <select
          value={selectedId || ""}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            borderRadius: '10px',
            border: '1px solid #ccc',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}
        >
          <option value="">-- Select a Patient --</option>
          {prescriptions.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {selectedPrescription && (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: '15px', padding: '30px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '24px', color: '#006fa1', marginBottom: '10px' }}>{selectedPrescription.name}</h3>
          <p style={{ fontSize: '16px', marginBottom: '25px', color: '#333' }}><strong>Prescribed by:</strong> {selectedPrescription.signature}</p>

          {selectedPrescription.prescriptions.map((item, index) => (
            <div key={index} style={{
              padding: '20px',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              marginBottom: '25px',
              backgroundColor: '#fafcff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}><strong>Medication:</strong> {item.medication}</p>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', fontSize: '15px', color: '#444' }}>
                <input
                  type="checkbox"
                  checked={checkedItems[`${selectedId}-${index}-medication`] || false}
                  onChange={() => handleCheckboxChange(selectedId, index, "medication")}
                  style={{ marginRight: '10px', width: '18px', height: '18px', accentColor: '#0082b5' }}
                /> Confirm Medication Retrieved
              </label>

              <p style={{ fontSize: '16px', marginBottom: '8px' }}><strong>Dosage:</strong> {item.dosage}</p>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', fontSize: '15px', color: '#444' }}>
                <input
                  type="checkbox"
                  checked={checkedItems[`${selectedId}-${index}-dosage`] || false}
                  onChange={() => handleCheckboxChange(selectedId, index, "dosage")}
                  style={{ marginRight: '10px', width: '18px', height: '18px', accentColor: '#0082b5' }}
                /> Confirm Dosage
              </label>

              <p style={{ fontSize: '16px', marginBottom: '8px' }}><strong>Quantity:</strong> {item.quantity}</p>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: '#444' }}>
                <input
                  type="checkbox"
                  checked={checkedItems[`${selectedId}-${index}-quantity`] || false}
                  onChange={() => handleCheckboxChange(selectedId, index, "quantity")}
                  style={{ marginRight: '10px', width: '18px', height: '18px', accentColor: '#0082b5' }}
                /> Confirm Quantity Counted
              </label>
            </div>
          ))}

          <button
            onClick={() => {
              alert('Packaging confirmed!');
              setSelectedId(null);
              setActiveTab('home');
            }}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '15px',
              fontSize: '16px',
              backgroundColor: '#0082b5',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ✅ Finish Packaging
          </button>
        </div>
      )}
    </div>
  );
};

export default Pharmacist;