import React from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./App.css";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login"); 
  };

  const navigateToManagePrescriptions = () => {
    navigate("/view_prescription");
  };

  const navigateToInventory = () => {
    navigate("/inventory");
  };

  const navigateToPatientRecords = () => {
    navigate("/records");
  };

  return (
    <div className="home-container">
      <h2>Welcome to Kidz Klinik Pharmacy</h2>
      <p>You are logged in as a Pharmacist!</p>
      <div className="button-container">
        <button className="home-button" onClick={navigateToManagePrescriptions}>
          Manage Prescriptions
        </button>
        <button className="home-button" onClick={navigateToInventory}>
          Manage Inventory
        </button>
        <button className="home-button" onClick={navigateToPatientRecords}>
          Access Patient Records
        </button>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Home;
