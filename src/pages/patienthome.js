import React, { useState } from "react";
import { auth, db } from "../firebase"; 
import { doc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "/Users/shavarmorgan/kidz-klinik-pharmacy/src/pages/App.css"
import PrescriptionForm from "./PrescriptionForm";
import { useEffect } from "react";
const PatientHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("");
  const [hasInsurance, setHasInsurance] = useState("");
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

  const [orders, setOrders] = useState([
    { id: "1", medication: "Amoxicillin", quantity: 2, unitPrice: 15 },
    { id: "2", medication: "Ibuprofen", quantity: 1, unitPrice: 10 },
    { id: "3", medication: "Paracetamol", quantity: 3, unitPrice: 8 }
  ]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
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
{       /* <button onClick={() => setActiveTab("payment")} className={`tab-button ${activeTab === "payment" ? "active" : ""}`}>Select Payment Method</button>
*/}        <button onClick={() => setActiveTab("pickup")} className={`tab-button ${activeTab === "pickup" ? "active" : ""}`}>Pickup Order</button>
        <button onClick={() => setActiveTab("payments")} className={`tab-button ${activeTab === "payments" ? "active" : ""}`}>Pay for an Order</button>

      </div>

      <div >
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
          <input
            type="radio"
            name="hasInsurance"
            value="yes"
            onChange={() => setHasInsurance("yes")}
          /> Yes
        </label>
        <label>
          <input
            type="radio"
            name="hasInsurance"
            value="no"
            onChange={() => setHasInsurance("no")}
          /> No
        </label>
      </div>
    </div>

    {hasInsurance === "yes" && (
      <div className="form-group">
        <label htmlFor="insurance-carrier">Insurance Carrier:</label>
        <input
          type="text"
          id="insurance-carrier"
          placeholder="e.g., Sagicor, Guardian Life"
          className="insurance-input"
        />
      </div>
    )}
  </div>
)}
     {activeTab === "pickup" && (
  <div className="pickup-container">
    <h2 className="pickup-title">Pickup Order</h2>

    <div className="form-group">
      <label htmlFor="pickup-date">Pickup Date:</label>
      <input type="date" id="pickup-date" className="pickup-input" />
    </div>

    <div className="form-group">
      <label htmlFor="pickup-time">Pickup Time:</label>
      <input type="time" id="pickup-time" className="pickup-input" />
    </div>

    <button className="confirm-button">
      Confirm Pickup
    </button>
  </div>
)}
{activeTab === "payments" && (
  <div className="payment-container">
    <h2 className="payment-title">Select Payment Method</h2>

    <div className="form-group">
      <label htmlFor="order-select">Choose Your Prescription:</label>
      <select
        id="order-select"
        className="payment-select"
        value={selectedOrderId}
        onChange={(e) => {
          const selected = orders.find(order => order.id === e.target.value);
          setSelectedOrderId(e.target.value);
          setSelectedOrder(selected);
        }}
      >
        <option value="">-- Select an Order --</option>
        {orders.map(order => (
          <option key={order.id} value={order.id}>
            {order.medication} (Qty: {order.quantity})
          </option>
        ))}
      </select>
    </div>

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
          <input
            type="radio"
            name="hasInsurance"
            value="yes"
            onChange={() => setHasInsurance("yes")}
          /> Yes
        </label>
        <label>
          <input
            type="radio"
            name="hasInsurance"
            value="no"
            onChange={() => setHasInsurance("no")}
          /> No
        </label>
      </div>
    </div>

    {/* Insurance Carrier Input */}
    {hasInsurance === "yes" && (
      <div className="form-group">
        <label htmlFor="insurance-carrier">Insurance Carrier:</label>
        <input
          type="text"
          id="insurance-carrier"
          placeholder="e.g., Sagicor, Guardian Life"
          className="insurance-input"
        />
      </div>
    )}

    {selectedOrder && (
      <div className="checkout-box">
        <h3>Order Summary</h3>
        <p><strong>Medication:</strong> {selectedOrder.medication}</p>
        <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
        <p><strong>Price per unit:</strong> ${selectedOrder.unitPrice}</p>
        <p><strong>Total:</strong> ${selectedOrder.quantity * selectedOrder.unitPrice}</p>
        <button className="confirm-button">Checkout</button>
      </div>
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default PatientHome;