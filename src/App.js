import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Signup from "./pages/signup"; 
import Login from "./pages/login";
import Home from "./pages/home";
import PrescriptionForm from "./pages/PrescriptionForm";
import Patienthome from "./pages/patienthome";
import Pharmacist from "./pages/pharmacist";
import Contact from "./pages/Contact";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        console.log(currentUser.uid)
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          console.log("data = "+userDoc.data().role)
          setRole(userDoc.data().role);
          console.log("role = "+role)
        }
      }
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, [role]);

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <Routes>
      {user ? (
          role === "patient" ? (
            <Route path="/" element={<Navigate to="/patientHome" />} />
          ) : role === "pharmacist" ? (
            <Route path="/" element={<Navigate to="/pharmacist" />} />
          ) : (
            <Route path="/" element={<Home />} />
          )
        ) : (
          <Route path="/" element={<Navigate to="/login" />} />
        )}

        <Route path="/patientHome" element={<Patienthome/>}/>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/prescription" element={<PrescriptionForm />} />
        <Route path = "/pharmacist" element={<Pharmacist/>}/> 
        <Route path="/contact" element={<Contact />} />

      </Routes>
    </Router>
  );
}

export default App;