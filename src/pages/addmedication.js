import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "/Users/shavarmorgan/kidz-klinik-pharmacy/src/pages/App.css"
const AddMedication = () => {
  const navigate = useNavigate();
  const [medication, setMedication] = useState({
    name: "",
    quantity: 0,
    threshold: 10, // Default low stock threshold
  });

  const handleAddMedication = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to add the medication to the database
    console.log("Medication Added:", medication);
    // Redirect back to the Manage Inventory page
    navigate("/manage-inventory");
  };

  const handleBack = () => {
    navigate("/manage-inventory");
  };

  return (
    <div className="add-medication-container">
      <h2>Add New Medication</h2>
      <form onSubmit={handleAddMedication}>
        <div className="form-group">
          <label>Medication Name</label>
          <input
            type="text"
            placeholder="Enter medication name"
            value={medication.name}
            onChange={(e) => setMedication({ ...medication, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Search Medication</label>
          <input
            type="text"
            placeholder="Enter medication name to search"
            value={medication.name}
            onChange={(e) => setMedication({ ...medication, name: e.target.value })}
          />
          <button
            type="button"
            onClick={() => {
              // Here you would typically make an API call to search for the medication
              console.log("Searching for medication:", medication.name);
            }}
          >
            Search
          </button>
        </div>
        

        <div className="form-actions">
          <button type="submit">Add Medication</button>
          <a href="/inventory" type="button" onClick={handleBack}>
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
};

export default AddMedication;