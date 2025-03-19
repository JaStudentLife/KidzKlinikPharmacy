import React from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import './App.css';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login"); 
  };

  return (
    <div>
      <h2>Welcome to Kidz Klinik Pharmacy</h2>
      <p>You are logged in!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;