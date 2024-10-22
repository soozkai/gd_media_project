import React, { useState, useEffect } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
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
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilArrowTop, cilArrowBottom } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import './CSS/style.css'; // Import the CSS for animations

const Facility = () => {
    const [facilities, setFacilities] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newFacility, setNewFacility] = useState({
        category: '',
        title: '',
        language: '',
        file_type: '',
        content: null,
    });

    const [toast, addToast] = useState([]);
    const [animateRow, setAnimateRow] = useState(null); // Track which row to animate
    const navigate = useNavigate();

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = () => {
        const token = localStorage.getItem('token');

        fetch('http://localhost:3001/facilities', {
            headers: {
                Authorization: token,
            },
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    handleLogout();
                    throw new Error('Unauthorized');
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setFacilities(data); // Set facilities in state
            })
            .catch((error) => console.error('Error fetching facility list:', error));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        addToast(createToast('Your session has timed out. Please log in again.', 'danger'));
        setTimeout(() => {
            navigate('/login');
        }, 3000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const file_type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : '';
        setNewFacility({
            ...newFacility,
            content: file,
            file_type,
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewFacility({
            ...newFacility,
            [name]: value,
        });
    };

    const handleAddFacility = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Create a new FormData object
        const formData = new FormData();
        formData.append('category', newFacility.category);
        formData.append('title', newFacility.title);
        formData.append('language', newFacility.language);
        formData.append('file_type', newFacility.file_type);
        if (newFacility.content) {
            formData.append('content', newFacility.content); // Append the file
        }

        const url = editMode ? `http://localhost:3001/facilities/${newFacility.id}` : 'http://localhost:3001/facilities/add';
        const method = editMode ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                Authorization: token,
            },
            body: formData, // Send the FormData object as the request body
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    handleLogout();
                    throw new Error('Unauthorized');
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                if (data) {
                    addToast(createToast('Facility saved successfully', 'success'));
                    fetchFacilities(); // Re-fetch the facility list without a full page reload
                    setShowModal(false); // Close modal after saving
                }
            })
            .catch((error) => console.error('Error adding facility:', error));
    };

    const handleEdit = (facility) => {
        setNewFacility(facility);
        setShowModal(true);
        setEditMode(true);
    };

    const handleDelete = (id) => {
        const token = localStorage.getItem('token');

        fetch(`http://localhost:3001/facilities/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: token,
            },
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    handleLogout();
                    throw new Error('Unauthorized');
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                // Filter out the deleted facility from the state
                setFacilities(facilities.filter((facility) => facility.id !== id));
                addToast(createToast('Facility deleted successfully', 'success'));
            })
            .catch((error) => console.error('Error deleting facility:', error));
    };

    const resetForm = () => {
        setNewFacility({
            category: '',
            title: '',
            language: '',
            file_type: '',
            content: null,
        });
        setEditMode(false);
    };

    const moveUp = (index) => {
        if (index === 0 || !facilities || facilities.length === 0) {
            addToast(createToast('Cannot move the facility up.', 'warning'));
            return;
        }
        const newFacilities = [...facilities];
        [newFacilities[index - 1], newFacilities[index]] = [newFacilities[index], newFacilities[index - 1]];
        setFacilities(newFacilities);
        setAnimateRow(index - 1); // Set the index to animate the moved row
        setTimeout(() => setAnimateRow(null), 500); // Remove animation after 0.5s
        addToast(createToast('Facility moved up successfully', 'info'));
    };

    const moveDown = (index) => {
        if (index === facilities.length - 1 || !facilities || facilities.length === 0) {
            addToast(createToast('Cannot move the facility down.', 'warning'));
            return;
        }
        const newFacilities = [...facilities];
        [newFacilities[index + 1], newFacilities[index]] = [newFacilities[index], newFacilities[index + 1]];
        setFacilities(newFacilities);
        setAnimateRow(index + 1); // Set the index to animate the moved row
        setTimeout(() => setAnimateRow(null), 500); // Remove animation after 0.5s
        addToast(createToast('Facility moved down successfully', 'info'));
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
                Hotel Facility List
                <CButton color="primary" className="float-end" onClick={() => setShowModal(!showModal)}>
                    {showModal ? 'Cancel' : 'Add Facility'}
                </CButton>
            </CCardHeader>
            <CCardBody>
                <CTable striped hover>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>ID</CTableHeaderCell>
                            <CTableHeaderCell>Category</CTableHeaderCell>
                            <CTableHeaderCell>Title</CTableHeaderCell>
                            <CTableHeaderCell>Language</CTableHeaderCell>
                            <CTableHeaderCell>File Type</CTableHeaderCell>
                            <CTableHeaderCell>Content</CTableHeaderCell>
                            <CTableHeaderCell>Actions</CTableHeaderCell>
                            <CTableHeaderCell>Created at</CTableHeaderCell>
                            <CTableHeaderCell>Updated at</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {facilities.map((facility, index) => (
                            <CTableRow key={index} className={animateRow === index ? 'move-animation' : ''}>
                                <CTableDataCell>{facility.id}</CTableDataCell>
                                <CTableDataCell>{facility.category}</CTableDataCell>
                                <CTableDataCell>{facility.title}</CTableDataCell>
                                <CTableDataCell>{facility.language}</CTableDataCell>
                                <CTableDataCell>{facility.file_type}</CTableDataCell>
                                <CTableDataCell>
                                    {facility.file_type === 'image' ? (
                                        <img src={`http://localhost:3001/uploads/${facility.content}`} alt={facility.title} style={{ width: '100px' }} />
                                    ) : facility.file_type === 'video' ? (
                                        <video src={`http://localhost:3001/uploads/${facility.content}`} controls style={{ width: '100px' }} />
                                    ) : (
                                        <span>Unsupported file type</span>
                                    )}
                                </CTableDataCell>
                                <CTableDataCell>
                                    <CButton color="info" size="sm" onClick={() => handleEdit(facility)}>
                                        <CIcon icon={cilPencil} />
                                    </CButton>{' '}
                                    <CButton color="danger" size="sm" onClick={() => handleDelete(facility.id)}>
                                        <CIcon icon={cilTrash} />
                                    </CButton>{' '}
                                    <CButton color="secondary" size="sm" onClick={() => moveUp(index)}>
                                        <CIcon icon={cilArrowTop} />
                                    </CButton>{' '}
                                    <CButton color="secondary" size="sm" onClick={() => moveDown(index)}>
                                        <CIcon icon={cilArrowBottom} />
                                    </CButton>
                                </CTableDataCell>
                                <CTableDataCell>{new Date(facility.created_at).toLocaleString()}</CTableDataCell>
                                <CTableDataCell>{new Date(facility.updated_at).toLocaleString()}</CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            </CCardBody>
            <CToaster position="top-right">{toast}</CToaster>

            <CModal visible={showModal} onClose={() => setShowModal(false)}>
                <CModalHeader onClose={() => setShowModal(false)}>
                    <CModalTitle>{editMode ? 'Edit Facility' : 'Add Facility'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CFormInput
                            type="text"
                            name="category"
                            placeholder="Category"
                            value={newFacility.category || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={newFacility.title || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            name="language"
                            placeholder="Language"
                            value={newFacility.language || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="file"
                            name="content"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            name="file_type"
                            placeholder="File Type"
                            value={newFacility.file_type || ''}
                            readOnly
                            className="mb-3"
                        />
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </CButton>
                    <CButton color="success" onClick={handleAddFacility}>
                        Save Facility
                    </CButton>
                </CModalFooter>
            </CModal>
        </CCard>
    );
};
export default Facility;
