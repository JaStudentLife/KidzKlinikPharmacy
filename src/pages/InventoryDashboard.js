import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { db } from "../firebase"; 
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    quantity: 0,
    threshold: 10,
    price: 0, 
  });
  const [editMedication, setEditMedication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleAddMedication = async (e) => {
    e.preventDefault();

    try {
      const docRef = await addDoc(collection(db, "inventory"), newMedication);
      const newEntry = { id: docRef.id, ...newMedication };
      setInventory([...inventory, newEntry]);

      setNewMedication({ name: "", dosage: "", quantity: 0, threshold: 10, price: 0 });
      setShowModal(false);
      console.log("Medication added with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding medication to Firebase:", error);
    }
  };

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "inventory"));
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInventory(items);
      } catch (error) {
        console.error("Error loading inventory:", error);
      }
    };

    fetchInventory();
  }, []);

  const handleUpdateMedication = async (e) => {
    e.preventDefault();

    try {
      const docRef = doc(db, "inventory", editMedication.id);
      await updateDoc(docRef, {
        quantity: editMedication.quantity,
        price: editMedication.price  
      });

      const updated = inventory.map((item) =>
        item.id === editMedication.id
          ? { ...item, quantity: editMedication.quantity, price: editMedication.price }
          : item
      );

      setInventory(updated);
      setEditMedication(null);
      console.log("Medication updated in Firebase");
    } catch (error) {
      console.error("Error updating medication:", error);
    }
  };

  const handleDeleteMedication = async (id) => {
    try {
      const docRef = doc(db, "inventory", id);
      await deleteDoc(docRef);

      const updated = inventory.filter((item) => item.id !== id);
      setInventory(updated);
      console.log("Medication deleted from Firebase");
    } catch (error) {
      console.error("Error deleting medication:", error);
    }
  };

  return (
    <div className="inventory-container">
      <h2>Medication Inventory Management</h2>

      <button className="open-modal-button" onClick={() => setShowModal(true)}>
        + Add Medication
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Medication</h3>
            <form onSubmit={handleAddMedication}>
              <div className="form-group">
                <label>Medication Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={newMedication.name}
                  onChange={(e) =>
                    setNewMedication({ ...newMedication, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Dosage</label>
                <input
                  type="text"
                  placeholder="e.g., 500mg"
                  value={newMedication.dosage}
                  onChange={(e) =>
                    setNewMedication({ ...newMedication, dosage: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  placeholder="Enter quantity"
                  value={newMedication.quantity}
                  onChange={(e) =>
                    setNewMedication({
                      ...newMedication,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Low Stock Threshold</label>
                <input
                  type="number"
                  placeholder="Enter threshold"
                  value={newMedication.threshold}
                  onChange={(e) =>
                    setNewMedication({
                      ...newMedication,
                      threshold: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              {/* New Price Input */}
              <div className="form-group">
                <label>Price per Unit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={newMedication.price}
                  onChange={(e) =>
                    setNewMedication({
                      ...newMedication,
                      price: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>

              {/* Buttons */}
              <div className="modal-actions">
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0077aa',
                    color: 'white',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    marginRight: '10px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#005f88'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#0077aa'}
                >
                  Add Medication
                </button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    backgroundColor: '#cccccc',
                    color: '#333',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#bbbbbb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#cccccc'}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <hr style={{
        marginTop: "40px",
        border: "none",
        height: "2px",
        backgroundColor: "#e0e0e0",
        borderRadius: "1px"
      }} />

      <div style={{
        marginTop: "40px",
        backgroundColor: "#f8fafd",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
      }}>
        <h3 style={{
          fontSize: "22px",
          marginBottom: "20px",
          color: "#0077aa",
          borderBottom: "1px solid #e0e0e0",
          paddingBottom: "10px"
        }}>
          📋 Current Inventory
        </h3>

        {inventory.length === 0 ? (
          <div style={{
            marginTop: "30px",
            padding: "30px",
            backgroundColor: "#fff3cd",
            color: "#856404",
            border: "1px solid #ffeeba",
            borderRadius: "12px",
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "500"
          }}>
            No medications in inventory. Click <strong>"+ Add Medication"</strong> to get started.
          </div>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Total Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.dosage}</td>
                  <td>
                    {editMedication?.id === item.id ? (
                      <input
                        type="number"
                        value={editMedication.quantity}
                        onChange={(e) =>
                          setEditMedication({
                            ...editMedication,
                            quantity: parseInt(e.target.value),
                          })
                        }
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td>
                    {editMedication?.id === item.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editMedication.price}
                        onChange={(e) =>
                          setEditMedication({
                            ...editMedication,
                            price: parseFloat(e.target.value),
                          })
                        }
                      />
                    ) : (
                      `$${item.price.toFixed(2)}`
                    )}
                  </td>
                  <td>{item.threshold}</td>
                  <td>
                    <span
                      className={`stock-status ${
                        item.quantity <= item.threshold ? "low-stock" : "in-stock"
                      }`}
                    >
                      {item.quantity <= item.threshold ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  <td>
                    ${(item.quantity * item.price).toFixed(2)}
                  </td>
                  <td>
                    {editMedication?.id === item.id ? (
                      <button
                        onClick={handleUpdateMedication}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          marginRight: '8px',
                          transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditMedication(item)}
                        style={{
                          backgroundColor: '#0077aa',
                          color: 'white',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          marginRight: '8px',
                          transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#005f88'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#0077aa'}
                      >
                        Edit
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteMedication(item.id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryDashboard;