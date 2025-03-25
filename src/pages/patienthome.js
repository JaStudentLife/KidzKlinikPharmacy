import React, { useState } from "react";
import { auth, db } from "../firebase"; 
import { doc, setDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./App.css";
import PrescriptionForm from "./PrescriptionForm";
import { useEffect } from "react";
import emailjs from '@emailjs/browser';
const PatientHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("");
  const [hasInsurance, setHasInsurance] = useState("");
  const [notifiedPrescriptions, setNotifiedPrescriptions] = useState([]);
  const [pickupInputs, setPickupInputs] = useState({});
  const [orders, setOrders] = useState([]); 
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchNotifiedPrescriptions = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);
      const prescriptionsRef = collection(userDocRef, "prescriptions");
      const querySnapshot = await getDocs(prescriptionsRef);

      const notified = [];
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.notified) {
          notified.push({
            ...data,
            docId: docSnap.id,
            docRef: docSnap.ref
          });
        }
      });

      setNotifiedPrescriptions(notified);
    };

    fetchNotifiedPrescriptions();
  }, []);

  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    const mapped = notifiedPrescriptions
      .filter(pres => pres.pickupDate && pres.pickupTime)
      .map(pres => ({
        id: pres.docId,
        name: pres.name,
        medications: pres.medications,
        pickupDate: pres.pickupDate,
        pickupTime: pres.pickupTime,
        prescribedDate: pres.prescribedDate,
        paid: pres.paid || false,
        docRef: pres.docRef,
      }));
  
    setOrders(mapped);
  }, [notifiedPrescriptions]);

  const handleInputChange = (docId, field, value) => {
    setPickupInputs(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        [field]: value
      }
    }));
  };

  const handleConfirmPickup = async (docId, docRef) => {
    const input = pickupInputs[docId];
    if (!input?.pickupDate || !input?.pickupTime) {
      alert("Please select both a date and time.");
      return;
    }

    try {
      await updateDoc(docRef, {
        pickupDate: input.pickupDate,
        pickupTime: input.pickupTime
      });
      alert("Pickup confirmed!");
    } catch (err) {
      console.error(err);
      alert("Failed to confirm pickup.");
    }
  };

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
    <div>
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
        <button onClick={() => setActiveTab("upload")} className={`tab-button ${activeTab === "upload" ? "active" : ""}`}>Upload Prescription</button>
        <button onClick={() => setActiveTab("payment")} className={`tab-button ${activeTab === "payment" ? "active" : ""}`}>Select Payment Method</button>
        <button onClick={() => setActiveTab("pickup")} className={`tab-button ${activeTab === "pickup" ? "active" : ""}`}>Pickup Order</button>
        <button onClick={() => setActiveTab("payments")} className={`tab-button ${activeTab === "payments" ? "active" : ""}`}>Pay for an Order</button>
      </div>

      <div>
        {activeTab === "upload" && (
          <div>
            <PrescriptionForm />
          </div>
        )}

        {activeTab === "payment" && (
          <div className="payment-container">
            <h2 className="payment-title">Select Payment Method</h2>
            <div className="form-group">
              <label htmlFor="payment-method">Payment Method:</label>
              <select id="payment-method" className="payment-select">
                <option value="">-- Choose an option --</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="insurance">Insurance</option>
              </select>
            </div>
            <div className="form-group">
              <label>Do you have insurance?</label>
              <div className="radio-group">
                <label>
                  <input type="radio" name="hasInsurance" value="yes" onChange={() => setHasInsurance("yes")} /> Yes
                </label>
                <label>
                  <input type="radio" name="hasInsurance" value="no" onChange={() => setHasInsurance("no")} /> No
                </label>
              </div>
            </div>
            {hasInsurance === "yes" && (
              <div className="form-group">
                <label htmlFor="insurance-carrier">Insurance Carrier:</label>
                <input type="text" id="insurance-carrier" placeholder="e.g., Sagicor, Guardian Life" className="insurance-input" />
              </div>
            )}
          </div>
        )}

        {activeTab === "pickup" && (
          <div className="pickup-container">
            <h2 className="pickup-title">Pickup Order</h2>
            {notifiedPrescriptions.length === 0 ? (
              <p>You have no prescriptions ready for pickup.</p>
            ) : (
              notifiedPrescriptions.map((prescription) => {
                const docId = prescription.docId;
                const hasPickup = prescription.pickupDate && prescription.pickupTime;

                const dateValue = pickupInputs[docId]?.pickupDate ?? prescription.pickupDate ?? "";
                const timeValue = pickupInputs[docId]?.pickupTime ?? prescription.pickupTime ?? "";

                return (
                  <div key={docId} className="pickup-card">
                    <h3>{prescription.name}</h3>
                    <p><strong>Prescribed:</strong> {prescription.prescribedDate}</p>
                    {prescription.medications.map((med, index) => (
                      <div key={index}>
                        <p><strong>Medication:</strong> {med.medication}</p>
                        <p><strong>Dosage:</strong> {med.dosage}</p>
                        <p><strong>Quantity:</strong> {med.quantity}</p>
                      </div>
                    ))}
                    <div className="form-group">
                      <label htmlFor={`date-${docId}`}>Pickup Date:</label>
                      <input
                        type="date"
                        id={`date-${docId}`}
                        className="pickup-input"
                        value={dateValue}
                        onChange={(e) => handleInputChange(docId, "pickupDate", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`time-${docId}`}>Pickup Time:</label>
                      <input
                        type="time"
                        id={`time-${docId}`}
                        className="pickup-input"
                        value={timeValue}
                        onChange={(e) => handleInputChange(docId, "pickupTime", e.target.value)}
                      />
                    </div>
                    <button className="confirm-button" onClick={() => handleConfirmPickup(docId, prescription.docRef)}>
                      {hasPickup ? "Change Pickup" : "Confirm Pickup"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="payment-container">
            <h2 className="payment-title">Pay for Your Prescriptions</h2>
            {orders.length === 0 ? (
              <p>You have no prescriptions scheduled for pickup yet.</p>
            ) : (
              orders.map((order, index) => {
                if (!Array.isArray(order.medications)) {
                  console.warn(`Skipping order ${order.id}: medications missing`);
                  return null;
                }

                const total = order.medications.reduce((sum, med) => {
                  const unitPrice = 200;
                  return sum + unitPrice * parseInt(med.quantity);
                }, 0);

                return (
                  <div key={order.id} className="checkout-box">
                    <h3>Prescription #{index + 1}</h3>
                    <p><strong>Patient:</strong> {order.name}</p>
                    <p><strong>Prescribed On:</strong> {order.prescribedDate}</p>
                    <p><strong>Pickup:</strong> {order.pickupDate} at {order.pickupTime}</p>
                    <div style={{ marginTop: '10px' }}>
                      {order.medications.map((med, i) => (
                        <div key={i}>
                          <p><strong>Medication:</strong> {med.medication}</p>
                          <p><strong>Dosage:</strong> {med.dosage}</p>
                          <p><strong>Quantity:</strong> {med.quantity}</p>
                        </div>
                      ))}
                    </div>
                    <p><strong>Total Price:</strong> ${total}</p>
                    {order.paid ? (
  <div className="paid-tag" style={{
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "8px 12px",
    borderRadius: "5px",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: "10px"
  }}>
    ✅ Paid
  </div>
) : (<>
                    <div className="form-group">
                      <label htmlFor={`payment-method-${index}`}>Payment Method:</label>
                      <select id={`payment-method-${index}`} className="payment-select">
                        <option value="">-- Choose an option --</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                      </select>
                    </div>
       
                    <div className="form-group">
                      <label>Do you have insurance?</label>
                      <div className="radio-group">
                        <label>
                          <input type="radio" name={`hasInsurance-${index}`} value="yes" onChange={() => setHasInsurance("yes")} /> Yes
                        </label>
                        <label>
                          <input type="radio" name={`hasInsurance-${index}`} value="no" onChange={() => setHasInsurance("no")} /> No
                        </label>
                      </div>
                    </div>
                    {hasInsurance === "yes" && (
                      <div className="form-group">
                        <label htmlFor={`insurance-carrier-${index}`}>Insurance Carrier:</label>
                        <input type="text" id={`insurance-carrier-${index}`} placeholder="e.g., Sagicor, Guardian Life" className="insurance-input" />
                      </div>
                    )}
                    <button className="confirm-button" onClick={async () => {
  try {
    const user = auth.currentUser;
    const email = user?.email;
console.log(email)
    const formattedMeds = order.medications.map(m => 
      `${m.medication} (${m.dosage}) x ${m.quantity}`
    ).join(", ");

    const total = order.medications.reduce((sum, med) => {
      const unitPrice = 200;
      return sum + unitPrice * parseInt(med.quantity);
    }, 0);

    await updateDoc(order.docRef, {
      paid: true,
      paidAt: new Date(),
    });

    await emailjs.send("service_zqdhd4e", "template_ovx2z1a", {
      to_email: email,
      patient_name: order.name,
      prescribed_date: order.prescribedDate,
      pickup_date: order.pickupDate,
      pickup_time: order.pickupTime,
      medications: formattedMeds,
      total: `$${total}`,
    }, "Vcld9wnSGYfR9XGsl");

    alert("Payment confirmed and receipt sent!");
  } catch (err) {
    console.error(err);
    alert("Payment failed or email not sent.");
  }
}}>
  Checkout
</button></>)}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientHome;
