import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CForm, CFormInput, CToaster, CToast, CToastBody, CToastHeader } from '@coreui/react';

const BackgroundSettings = () => {
    const [background, setBackground] = useState(null);
    const [category, setCategory] = useState('facility'); // Default to Facility
    const [toast, addToast] = useState([]);

    const handleFileChange = (e) => {
        setBackground(e.target.files[0]);
    };

    const handleUpload = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('background', background);
        formData.append('category', category); // Append selected category (Facility, Message, LiveTV)

        fetch('http://localhost:3001/upload-background', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                addToast(createToast('Background uploaded successfully', 'success'));
            })
            .catch((error) => console.error('Error uploading background:', error));
    };

    const createToast = (message, color) => (
        <CToast autohide={true} delay={3000} color={color}>
            <CToastHeader closeButton>{message}</CToastHeader>
            <CToastBody>{message}</CToastBody>
        </CToast>
    );

    return (
        <CCard>
            <CCardHeader>Upload Background for Facility, Message, or Live TV</CCardHeader>
            <CCardBody>
                <CForm onSubmit={handleUpload}>
                    {/* File Upload */}
                    <CFormInput
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mb-3"
                    />

                    {/* Dropdown for selecting page category */}
                    <select
                        onChange={(e) => setCategory(e.target.value)}
                        className="mb-3 form-select"
                    >
                        <option value="facility">Facility</option>
                        <option value="message">Message</option>
                        <option value="livetv">Live TV</option>
                    </select>

                    <CButton type="submit" color="primary">Upload Background</CButton>
                </CForm>
            </CCardBody>
            <CToaster position="top-right">{toast}</CToaster>
        </CCard>
    );
};

export default BackgroundSettings;
