import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "/Users/shavarmorgan/kidz-klinik-pharmacy/src/pages/App.css"

const AccessRecords = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingRecord, setEditingRecord] = useState(null);
    const [editedRecord, setEditedRecord] = useState({});

    // Mock data for patient records (replace with API call in a real application)
    useEffect(() => {
        const mockRecords = [
            {
                id: 1,
                patientId: "PAT12345",
                patientName: "John Doe",
                patientEmail: "john.doe@example.com",
                medicalHistory: "Allergies: Penicillin, Asthma",
                prescriptions: ["Amoxicillin 500mg", "Albuterol Inhaler"],
            },
            {
                id: 2,
                patientId: "PAT67890",
                patientName: "Jane Smith",
                patientEmail: "jane.smith@example.com",
                medicalHistory: "Hypertension, Type 2 Diabetes",
                prescriptions: ["Lisinopril 10mg", "Metformin 1000mg"],
            },
            {
                id: 3,
                patientId: "PAT54321",
                patientName: "Alice Johnson",
                patientEmail: "alice.johnson@example.com",
                medicalHistory: "None",
                prescriptions: ["Ibuprofen 400mg"],
            },
        ];
        setRecords(mockRecords);
    }, []);

    // Filter records based on search term
    const filteredRecords = records.filter(
        (record) =>
            record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBack = () => {
        navigate("/home");
    };

    const handleEdit = (record) => {
        setEditingRecord(record.id);
        setEditedRecord({ ...record });
    };

    const handleSave = () => {
        setRecords((prevRecords) =>
            prevRecords.map((record) =>
                record.id === editingRecord ? editedRecord : record
            )
        );
        setEditingRecord(null);
    };

    const handleDelete = (id) => {
        setRecords((prevRecords) => prevRecords.filter((record) => record.id !== id));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedRecord((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="access-records-container">
            <h2>Access Patient Records</h2>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by patient name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <table className="records-table">
                <thead>
                    <tr>
                        <th>Patient Details</th>
                        <th>Medical History</th>
                        <th>Prescriptions</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRecords.map((record) => (
                        <tr key={record.id}>
                            <td>
                                {editingRecord === record.id ? (
                                    <>
                                        <input
                                            type="text"
                                            name="patientId"
                                            value={editedRecord.patientId}
                                            onChange={handleChange}
                                        />
                                        <input
                                            type="text"
                                            name="patientName"
                                            value={editedRecord.patientName}
                                            onChange={handleChange}
                                        />
                                        <input
                                            type="text"
                                            name="patientEmail"
                                            value={editedRecord.patientEmail}
                                            onChange={handleChange}
                                        />
                                    </>
                                ) : (
                                    <div className="patient-details">
                                        <div>
                                            <strong>ID:</strong> {record.patientId}
                                        </div>
                                        <div>
                                            <strong>Name:</strong> {record.patientName}
                                        </div>
                                        <div>
                                            <strong>Email:</strong> {record.patientEmail}
                                        </div>
                                    </div>
                                )}
                            </td>
                            <td>
                                {editingRecord === record.id ? (
                                    <input
                                        type="text"
                                        name="medicalHistory"
                                        value={editedRecord.medicalHistory}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    record.medicalHistory
                                )}
                            </td>
                            <td>
                                {editingRecord === record.id ? (
                                    <input
                                        type="text"
                                        name="prescriptions"
                                        value={editedRecord.prescriptions.join(", ")}
                                        onChange={(e) =>
                                            setEditedRecord((prev) => ({
                                                ...prev,
                                                prescriptions: e.target.value.split(",").map((p) => p.trim()),
                                            }))
                                        }
                                    />
                                ) : (
                                    <ul>
                                        {record.prescriptions.map((prescription, index) => (
                                            <li key={index}>{prescription}</li>
                                        ))}
                                    </ul>
                                )}
                            </td>
                            <td>
                                {editingRecord === record.id ? (
                                    <>
                                        <button onClick={handleSave}>Save</button>
                                        <button onClick={() => setEditingRecord(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(record)}>Edit</button>
                                        <button onClick={() => handleDelete(record.id)}>Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <a href="/" className="back-button">
                Back to Home
            </a>
        </div>
    );
};

export default AccessRecords;