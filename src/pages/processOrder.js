import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "/Users/shavarmorgan/kidz-klinik-pharmacy/src/pages/App.css"

const ViewPrescriptions = () => {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Mock data for prescriptions (replace with API call in a real application)
    useEffect(() => {
        const mockPrescriptions = [
            {
                id: 1,
                patientId: "PAT12345",
                patientName: "John Doe",
                patientEmail: "john.doe@example.com",
                medication: "Amoxicillin 500mg",
                dosage: "1 tablet every 8 hours",
                status: "Pending",
                date: "2023-10-01",
                stock: "Low Stock",
            },
            {
                id: 2,
                patientId: "PAT67890",
                patientName: "Jane Smith",
                patientEmail: "jane.smith@example.com",
                medication: "Lisinopril 10mg",
                dosage: "1 tablet daily",
                status: "Filled",
                date: "2023-10-02",
                stock: "In Stock",
            },
            {
                id: 3,
                patientId: "PAT54321",
                patientName: "Alice Johnson",
                patientEmail: "alice.johnson@example.com",
                medication: "Metformin 1000mg",
                dosage: "1 tablet twice daily",
                status: "Pending",
                date: "2023-10-03",
                stock: "Out of Stock",
            },
        ];
        setPrescriptions(mockPrescriptions);
    }, []);

    // Filter prescriptions based on search term
    const filteredPrescriptions = prescriptions.filter((prescription) =>
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medication.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBack = () => {
        navigate("/");
    };

    const handleAddPrescription = () => {
        const newPrescription = {
            id: prescriptions.length + 1,
            patientId: "PAT" + Math.floor(Math.random() * 100000),
            patientName: "New Patient",
            patientEmail: "new.patient@example.com",
            medication: "New Medication",
            dosage: "Dosage Info",
            status: "Pending",
            date: new Date().toISOString().split("T")[0],
            stock: "In Stock",
        };
        setPrescriptions([...prescriptions, newPrescription]);
    };

    const handleEditPrescription = (id) => {
        const updatedPrescriptions = prescriptions.map((prescription) =>
            prescription.id === id
                ? { ...prescription, status: "Filled", stock: "Updated Stock" }
                : prescription
        );
        setPrescriptions(updatedPrescriptions);
    };

    const handleDeletePrescription = (id) => {
        const updatedPrescriptions = prescriptions.filter(
            (prescription) => prescription.id !== id
        );
        setPrescriptions(updatedPrescriptions);
    };

    const handleProcessPrescription = (id) => {
        const updatedPrescriptions = prescriptions.map((prescription) =>
            prescription.id === id
                ? { ...prescription, status: "Processed" }
                : prescription
        );
        setPrescriptions(updatedPrescriptions);
    };

    return (
        <div className="prescriptions-container">
            <h2>View Prescriptions</h2>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by patient name or medication..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="actions">
                <button onClick={handleAddPrescription}>Add Prescription</button>
            </div>
            <table className="prescriptions-table">
                <thead>
                    <tr>
                        <th>Patient Details</th>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Status</th>
                        <th>Stock</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPrescriptions.map((prescription) => (
                        <tr key={prescription.id}>
                            <td>
                                <div className="patient-details">
                                    <div><strong>ID:</strong> {prescription.patientId}</div>
                                    <div><strong>Name:</strong> {prescription.patientName}</div>
                                    <div><strong>Email:</strong> {prescription.patientEmail}</div>
                                </div>
                            </td>
                            <td>{prescription.medication}</td>
                            <td>{prescription.dosage}</td>
                            <td>
                                <span className={`status ${prescription.status.toLowerCase()}`}>
                                    {prescription.status}
                                </span>
                            </td>
                            <td>
                                <span className={`stock ${prescription.stock.toLowerCase().replace(" ", "-")}`}>
                                    {prescription.stock}
                                </span>
                            </td>
                            <td>{prescription.date}</td>
                            <td>
                                <button onClick={() => handleProcessPrescription(prescription.id)}>Process</button>
                                <button onClick={() => handleEditPrescription(prescription.id)}>Edit</button>
                                <button onClick={() => handleDeletePrescription(prescription.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="back-button" onClick={handleBack}>
                Back to Home
            </button>
        </div>
    );
};

export default ViewPrescriptions;