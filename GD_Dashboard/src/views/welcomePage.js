import React, { useState, useEffect } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CButton,
    CForm,
    CFormInput,
    CToaster,
    CToast,
    CToastBody,
    CToastHeader,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react';
import { TextField, Button, Grid, InputLabel, Typography, Box } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const WelcomePage = () => {
    const [uploads, setUploads] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newUpload, setNewUpload] = useState({
        title: '',
        logo: null,
        image: null,
        video: null,
        additionalText: '',
        start_date: new Date(),
        end_date: new Date(),
    });

    const [toast, addToast] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');

        fetch('http://localhost:3001/uploads', {
            headers: {
                Authorization: token,
            },
        })
            .then((response) => response.json())
            .then((data) => setUploads(data))
            .catch((error) => console.error('Error fetching uploads:', error));
    }, []);

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setNewUpload({
            ...newUpload,
            [name]: files[0], // Single file selection per type
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUpload({
            ...newUpload,
            [name]: value,
        });
    };

    const handleStartDateChange = (date) => {
        setNewUpload({
            ...newUpload,
            start_date: date,
        });
    };

    const handleEndDateChange = (date) => {
        setNewUpload({
            ...newUpload,
            end_date: date,
        });
    };

    const handleAddUpload = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('title', newUpload.title);
        formData.append('logo', newUpload.logo);
        formData.append('image', newUpload.image);
        formData.append('video', newUpload.video);
        formData.append('additionalText', newUpload.additionalText);
        formData.append('start_date', newUpload.start_date.toISOString());
        formData.append('end_date', newUpload.end_date.toISOString());

        fetch('http://localhost:3001/uploads/add', {
            method: 'POST',
            headers: {
                Authorization: token,
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                setUploads([...uploads, data.upload]);
                setShowModal(false);
                addToast(createToast('Upload successful', 'success'));
            })
            .catch((error) => console.error('Error uploading files:', error));
    };

    const createToast = (message, color) => (
        <CToast autohide={true} delay={3000} color={color}>
            <CToastHeader closeButton>{message}</CToastHeader>
            <CToastBody>{message}</CToastBody>
        </CToast>
    );

    return (
        <CCard>
            <CCardHeader>
                <Typography variant="h5" component="div">
                    Upload Your Files
                </Typography>
                <Button variant="contained" color="primary" style={{ float: 'right' }} onClick={() => setShowModal(true)}>
                    Upload Files
                </Button>
            </CCardHeader>
            <CCardBody>
                {/* Table content omitted for brevity */}
            </CCardBody>

            <CToaster position="top-right">{toast}</CToaster>

            <CModal visible={showModal} onClose={() => setShowModal(false)}>
                <CModalHeader onClose={() => setShowModal(false)}>
                    <CModalTitle>Upload New Files</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <Box component="div" sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        name="title"
                                        placeholder="Enter Title"
                                        value={newUpload.title || ''}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <InputLabel>Upload Logo</InputLabel>
                                    <TextField
                                        fullWidth
                                        type="file"
                                        name="logo"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <InputLabel>Upload Image</InputLabel>
                                    <TextField
                                        fullWidth
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <InputLabel>Upload Video</InputLabel>
                                    <TextField
                                        fullWidth
                                        type="file"
                                        name="video"
                                        accept="video/*"
                                        onChange={handleFileChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Additional Text"
                                        name="additionalText"
                                        placeholder="Enter additional text"
                                        value={newUpload.additionalText || ''}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <InputLabel>Start Date & Time</InputLabel>
                                    <DatePicker
                                        selected={newUpload.start_date}
                                        onChange={handleStartDateChange}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className="form-control"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <InputLabel>End Date & Time</InputLabel>
                                    <DatePicker
                                        selected={newUpload.end_date}
                                        onChange={handleEndDateChange}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className="form-control"
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <Button variant="outlined" color="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleAddUpload}>
                        Save Upload
                    </Button>
                </CModalFooter>
            </CModal>
        </CCard>
    );
};

export default WelcomePage;
