import React, { use, useState } from "react";
import { auth, db } from "../firebase"; 
import { doc, setDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./App.css";
import PrescriptionForm from "./PrescriptionForm";
import { useEffect } from "react";
import emailjs from '@emailjs/browser';
import Contact from "./Contact";

const PatientHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("");
  const [hasInsurance, setHasInsurance] = useState("");
  const [notifiedPrescriptions, setNotifiedPrescriptions] = useState([]);
  const [pickupInputs, setPickupInputs] = useState({});
  const [orders, setOrders] = useState([]); 
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [allPrescriptions, setAllPrescriptions] = useState([]);

  useEffect(() => {
    const fetchAllPrescriptions = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      const userDocRef = doc(db, "users", user.uid);
      const prescriptionsRef = collection(userDocRef, "prescriptions");
      const querySnapshot = await getDocs(prescriptionsRef);
  
      const all = [];
      querySnapshot.forEach(docSnap => {
        all.push({
          ...docSnap.data(),
          docId: docSnap.id
        });
      });
  
      setAllPrescriptions(all);
    };
  
    fetchAllPrescriptions();
  }, []);
  
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
 
  useEffect(() => {
    const fetchMedicationPrices = async () => {
      const mappedOrders = await Promise.all(
        notifiedPrescriptions
          .filter(pres => pres.pickupDate && pres.pickupTime)
          .map(async pres => {
            const medicationsWithPrices = await Promise.all(
              pres.medications.map(async (med) => {
                try {
                  const inventoryQuery = await getDocs(collection(db, "inventory"));
                  const matchingMed = inventoryQuery.docs.find(
                    doc => doc.data().name.toLowerCase() === med.medication.toLowerCase()
                  );
                  
                  const price = matchingMed ? 
                    (matchingMed.data().price || 0) : 
                    0;
                  
                  return {
                    ...med,
                    unitPrice: price
                  };
                } catch (error) {
                  console.error("Error fetching medication price:", error);
                  return {
                    ...med,
                    unitPrice: 0
                  };
                }
              })
            );

            return {
              id: pres.docId,
              name: pres.name,
              medications: medicationsWithPrices,
              pickupDate: pres.pickupDate,
              pickupTime: pres.pickupTime,
              prescribedDate: pres.prescribedDate,
              paid: pres.paid || false,
              docRef: pres.docRef,
            };
          })
      );
  
      setOrders(mappedOrders);
    };

    if (notifiedPrescriptions.length > 0) {
      fetchMedicationPrices();
    }
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
        <button 
  onClick={() => setActiveTab("history")} 
  className={`tab-button ${activeTab === "history" ? "active" : ""}`}
>
  My Prescriptions
</button>
<button
  onClick={() => setActiveTab("contact")}
  className={`tab-button ${activeTab === "contact" ? "active" : ""}`}
>
  Contact
</button>

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
        {activeTab === "history" && (
  <div className="history-container">
    <h2 className="history-title">My Prescriptions</h2>
    {allPrescriptions.length === 0 ? (
      <p>You have not submitted any prescriptions yet.</p>
    ) : (
      allPrescriptions.map((pres, index) => (
        <div key={pres.docId} className="prescription-card">
          <h3>Prescription #{index + 1}</h3>
          <p><strong>Name:</strong> {pres.name}</p>
          <p><strong>Date of Birth:</strong> {pres.dob}</p>
          <p><strong>Prescribed Date:</strong> {pres.prescribedDate}</p>
          <p><strong>Pickup Date:</strong> {pres.pickupDate || "Not set"}</p>
          <p><strong>Pickup Time:</strong> {pres.pickupTime || "Not set"}</p>
          <p><strong>Paid:</strong> {pres.paid ? "✅ Yes" : "❌ No"}</p>
          <div>
            {pres.medications?.map((med, i) => (
              <div key={i} style={{ marginLeft: "15px" }}>
                <p><strong>Medication:</strong> {med.medication}</p>
                <p><strong>Dosage:</strong> {med.dosage}</p>
                <p><strong>Quantity:</strong> {med.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      ))
    )}
  </div>
)}
{activeTab === "contact" && <Contact />}

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
                return sum + (med.unitPrice || 0) * parseInt(med.quantity);
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
                        <p><strong>Unit Price:</strong> ${(med.unitPrice || 0).toFixed(2)}</p>
                        <p><strong>Subtotal:</strong> ${((med.unitPrice || 0) * parseInt(med.quantity)).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <p><strong>Total Price:</strong> ${total.toFixed(2)}</p>
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
                          `${m.medication} (${m.dosage}) x ${m.quantity} @ $${(m.unitPrice || 0).toFixed(2)} each`
                        ).join(", ");

                        const total = order.medications.reduce((sum, med) => {
                          return sum + (med.unitPrice || 0) * parseInt(med.quantity);
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
                          total: `$${total.toFixed(2)}`,
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
