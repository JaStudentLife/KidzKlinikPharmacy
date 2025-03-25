import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const ManageInventory = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [newMedication, setNewMedication] = useState({
    name: "",
    quantity: 0,
    threshold: 10, 
  });
  const [editMedication, setEditMedication] = useState(null);

  useEffect(() => {
    const mockInventory = [
      {
        id: 1,
        name: "Amoxicillin 500mg",
        quantity: 15,
        threshold: 10,
      },
      {
        id: 2,
        name: "Lisinopril 10mg",
        quantity: 5,
        threshold: 10,
      },
      {
        id: 3,
        name: "Metformin 1000mg",
        quantity: 20,
        threshold: 10,
      },
    ];
    setInventory(mockInventory);
  }, []);

  const handleAddMedication = (e) => {
    e.preventDefault();
    const newId = inventory.length + 1;
    setInventory([...inventory, { id: newId, ...newMedication }]);
    setNewMedication({ name: "", quantity: 0, threshold: 10 });
  };

  const handleUpdateMedication = (e) => {
    e.preventDefault();
    const updatedInventory = inventory.map((item) =>
      item.id === editMedication.id ? { ...item, quantity: editMedication.quantity } : item
    );
    setInventory(updatedInventory);
    setEditMedication(null);
  };

  const handleDeleteMedication = (id) => {
    const updatedInventory = inventory.filter((item) => item.id !== id);
    setInventory(updatedInventory);
  };

  const handleBack = () => {
    navigate("/home");
  };

  return (
    <div className="inventory-container">
      <h2>Manage Inventory</h2>
      <div className="inventory-actions">
        <h3>Add New Medication</h3>
        <form onSubmit={handleAddMedication}>
          <input
            type="text"
            placeholder="Medication Name"
            value={newMedication.name}
            onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newMedication.quantity}
            onChange={(e) => setNewMedication({ ...newMedication, quantity: parseInt(e.target.value) })}
            required
          />
          <input
            type="number"
            placeholder="Low Stock Threshold"
            value={newMedication.threshold}
            onChange={(e) => setNewMedication({ ...newMedication, threshold: parseInt(e.target.value) })}
            required
          />
          <a href="/add_Medication" type="submit">Add Medication</a>
        </form>
      </div>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Medication</th>
            <th>Quantity</th>
            <th>Low Stock Threshold</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                {editMedication?.id === item.id ? (
                  <input
                    type="number"
                    value={editMedication.quantity}
                    onChange={(e) =>
                      setEditMedication({ ...editMedication, quantity: parseInt(e.target.value) })
                    }
                  />
                ) : (
                  item.quantity
                )}
              </td>
              <td>{item.threshold}</td>
              <td>
                <span className={`stock-status ${item.quantity <= item.threshold ? "low-stock" : "in-stock"}`}>
                  {item.quantity <= item.threshold ? "Low Stock" : "In Stock"}
                </span>
              </td>
              <td>
                {editMedication?.id === item.id ? (
                  <button onClick={handleUpdateMedication}>Save</button>
                ) : (
                  <button onClick={() => setEditMedication(item)}>Edit</button>
                )}
                <button onClick={() => handleDeleteMedication(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="/" className="back-button" >
        Back to Home
      </a>
    </div>
  );
};


export default ManageInventory;