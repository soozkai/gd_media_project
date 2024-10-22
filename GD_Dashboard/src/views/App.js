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
    CFormSelect,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilArrowTop, cilArrowBottom } from '@coreui/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CSS/style.css'; // Import custom CSS for animation

const AppPage = () => {
    const [apps, setApps] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newApp, setNewApp] = useState({
        packageName: '',
    });

    const appList = [
        { AppName: 'Netflix' },
        { AppName: 'Hotstar' },
        { AppName: 'YouTube' },
        { AppName: 'iQIYI' },
        { AppName: 'TVB Anywhere' },
        { AppName: 'Channel NewsAsia' },
        { AppName: 'Al Jazeera English' },
        { AppName: 'Bloomberg TV' },
    ];

    useEffect(() => {
        fetchApps();
    }, []);

    // Fetch apps when component mounts
    const fetchApps = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('No authentication token found. Please log in.');
            return;
        }
        fetch('http://localhost:3001/apps', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })
            .then((response) => {
                if (response.status === 403 || response.status === 401) {
                    toast.error('Unauthorized access. Please log in again.');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 3000);
                    throw new Error('Unauthorized access');
                }
                return response.json();
            })
            .then((data) => {
                if (!data) {
                    throw new Error('No data received');
                }
                setApps(data);
            })
            .catch((error) => {
                console.error('Error fetching apps:', error);
                toast.error('Failed to fetch apps. Please try again later.');
            });
    };

    const handleAddApp = () => {
        if (!newApp.packageName) {
            toast.error('Please select an app package.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('No authentication token found. Please log in.');
            return;
        }

        const url = editMode ? `http://localhost:3001/apps/${newApp.id}` : 'http://localhost:3001/apps/add';
        const method = editMode ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify(newApp),
        })
            .then((response) => {
                if (response.status === 403 || response.status === 401) {
                    toast.error('Unauthorized access. Please log in again.');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 3000);
                    throw new Error('Unauthorized access');
                }
                return response.json();
            })
            .then(() => {
                setShowModal(false);
                setNewApp({ packageName: '' });
                toast.success('App saved successfully');
                fetchApps(); // Refresh the app list
            })
            .catch((error) => {
                console.error('Error saving app:', error);
            });
    };

    const handleEdit = (app) => {
        if (!app) {
            toast.error('Invalid app data. Please try again.');
            return;
        }
        setNewApp(app);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (!id) {
            toast.error('Invalid app ID. Please try again.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('No authentication token found. Please log in.');
            return;
        }
        fetch(`http://localhost:3001/apps/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: token,
            },
        })
            .then((response) => {
                if (response.ok) {
                    toast.success('App deleted successfully');
                    fetchApps(); // Refresh the app list after deletion
                } else {
                    throw new Error('Failed to delete app');
                }
            })
            .catch((error) => console.error('Error deleting app:', error));
    };

    const moveUp = (index) => {
        if (index === 0 || !apps || apps.length === 0) {
            toast.error('Cannot move the app up.');
            return;
        }
        const newApps = [...apps];
        [newApps[index - 1], newApps[index]] = [newApps[index], newApps[index - 1]];
        setApps(newApps);
        toast.info('App moved up successfully');
    };

    const moveDown = (index) => {
        if (index === apps.length - 1 || !apps || apps.length === 0) {
            toast.error('Cannot move the app down.');
            return;
        }
        const newApps = [...apps];
        [newApps[index + 1], newApps[index]] = [newApps[index], newApps[index + 1]];
        setApps(newApps);
        toast.info('App moved down successfully');
    };

    return (
        <>
            <CCard>
                <CCardHeader>
                    App List
                    <div className="float-end">
                        <CButton color="primary" onClick={() => setShowModal(true)}>+ New App</CButton>
                    </div>
                </CCardHeader>
                <CCardBody>
                    <CTable striped hover>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>Order</CTableHeaderCell>
                                <CTableHeaderCell>Package Name</CTableHeaderCell>
                                <CTableHeaderCell>Actions</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {apps && apps.length > 0 && apps.map((app, index) => (
                                app && app.packageName ? (
                                    <CTableRow key={index}>
                                        <CTableDataCell>{index + 1}</CTableDataCell>
                                        <CTableDataCell>{app.packageName}</CTableDataCell>
                                        <CTableDataCell>
                                            <CButton color="secondary" size="sm" onClick={() => moveUp(index)}>
                                                <CIcon icon={cilArrowTop} />
                                            </CButton>{' '}
                                            <CButton color="secondary" size="sm" onClick={() => moveDown(index)}>
                                                <CIcon icon={cilArrowBottom} />
                                            </CButton>{' '}
                                            <CButton color="info" size="sm" onClick={() => handleEdit(app)}>
                                                <CIcon icon={cilPencil} />
                                            </CButton>{' '}
                                            <CButton color="danger" size="sm" onClick={() => handleDelete(app.id)}>
                                                <CIcon icon={cilTrash} />
                                            </CButton>
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : null
                            ))}
                        </CTableBody>
                    </CTable>
                </CCardBody>
            </CCard>

            <CModal visible={showModal} onClose={() => setShowModal(false)}>
                <CModalHeader onClose={() => setShowModal(false)}>
                    <CModalTitle>{editMode ? 'Edit App' : 'Add App'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CFormSelect
                            value={newApp.packageName}
                            onChange={(e) => setNewApp({ ...newApp, packageName: e.target.value })}
                            className="mb-3"
                        >
                            <option value="">Select an app package</option>
                            {appList.map((app, index) => (
                                <option key={index} value={app.AppName}>{app.AppName}</option>
                            ))}
                        </CFormSelect>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </CButton>
                    <CButton color="success" onClick={handleAddApp}>
                        {editMode ? 'Update App' : 'Add App'}
                    </CButton>
                </CModalFooter>
            </CModal>

            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default AppPage;

