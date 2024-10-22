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
import './CSS/STYLE.CSS'; // Import custom CSS for animation

const ChannelPage = () => {
    const [channels, setChannels] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newChannel, setNewChannel] = useState({
        name: '',
        image: '',
        url: '',
        port: '',
        content: null
    });
    const [imageModal, setImageModal] = useState({ visible: false, imageUrl: '' });

    useEffect(() => {
        fetchChannels();
    }, []);

    // Fetch channels when component mounts
    const fetchChannels = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('No authentication token found. Please log in.');
            return;
        }
        fetch('http://localhost:3001/channels', {
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
                setChannels(data);
            })
            .catch((error) => {
                console.error('Error fetching channels:', error);
                toast.error('Failed to fetch channels. Please try again later.');
            }).catch((error) => {
                console.error('Error fetching channels:', error);
                toast.error('Failed to fetch channels. Please try again later.');
            });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setNewChannel({
            ...newChannel,
            content: file,
        });
    };

    const handleAddChannel = () => {
        if (!newChannel.name || !newChannel.url || !newChannel.port || !newChannel.content) {
            toast.error('Please fill in all required fields, including an image.');
            return;
            toast.error('Please fill in all required fields, including an image.');
            toast.error('Please fill in all required fields.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('No authentication token found. Please log in.');
            return;
        }
        const formData = new FormData();
        formData.append('name', newChannel.name);
        formData.append('url', newChannel.url);
        formData.append('port', newChannel.port);
        if (newChannel.content) {
            formData.append('image', newChannel.content);
        }

        const url = editMode ? `http://localhost:3001/channels/${newChannel.id}` : 'http://localhost:3001/channels/add';
        const method = editMode ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                Authorization: token,
            },
            body: formData
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
                setNewChannel({
                    name: '',
                    image: '',
                    url: '',
                    port: '',
                    content: null
                });
                toast.success('Channel saved successfully');
                fetchChannels(); // Refresh the channel list
            })
            .catch((error) => {
                console.error('Error saving channel:', error);
            });
    };

    const handleEdit = (channel) => {
        if (!channel) {
            toast.error('Invalid channel data. Please try again.');
            return;
        }
        setNewChannel(channel);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (!id) {
            toast.error('Invalid channel ID. Please try again.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('No authentication token found. Please log in.');
            return;
        }
        fetch(`http://localhost:3001/channels/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: token,
            },
        })
            .then((response) => {
                if (response.ok) {
                    toast.success('Channel deleted successfully');
                    fetchChannels(); // Refresh the channel list after deletion
                } else {
                    throw new Error('Failed to delete channel');
                }
            })
            .catch((error) => console.error('Error deleting channel:', error));
    };

    const handleImageClick = (imageUrl) => {
        if (!imageUrl) {
            toast.error('Invalid image URL.');
            return;
        }
        setImageModal({ visible: true, imageUrl });
    };

    const moveUp = (index) => {
        if (index === 0 || !channels || channels.length === 0) {
            toast.error('Cannot move the channel up.');
            return;
        }
        const newChannels = [...channels];
        [newChannels[index - 1], newChannels[index]] = [newChannels[index], newChannels[index - 1]];
        setChannels(newChannels);
        toast.info('Channel moved up successfully');
        triggerAnimation(index - 1);
    };

    const moveDown = (index) => {
        if (index === channels.length - 1 || !channels || channels.length === 0) {
            toast.error('Cannot move the channel down.');
            return;
        }
        const newChannels = [...channels];
        [newChannels[index + 1], newChannels[index]] = [newChannels[index], newChannels[index + 1]];
        setChannels(newChannels);
        toast.info('Channel moved down successfully');
        triggerAnimation(index + 1);
    };

    const triggerAnimation = (index) => {
        const row = document.querySelector(`#channel-row-${index}`);
        if (row) {
            row.classList.add('move-animation');
            setTimeout(() => {
                row.classList.remove('move-animation');
            }, 500);
        }
    };

    return (
        <>
            <CCard>
                <CCardHeader>
                    Channel List
                    <div className="float-end">
                        <CButton color="primary" onClick={() => setShowModal(true)}>+ New Channel</CButton>
                    </div>
                </CCardHeader>
                <CCardBody>
                    <CTable striped hover>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>Order</CTableHeaderCell>
                                <CTableHeaderCell>Channel Name</CTableHeaderCell>
                                <CTableHeaderCell>Image</CTableHeaderCell>
                                <CTableHeaderCell>URL</CTableHeaderCell>
                                <CTableHeaderCell>Port</CTableHeaderCell>
                                <CTableHeaderCell>Actions</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {channels && channels.length > 0 && channels.map((channel, index) => (
                                channel && channel.name ? (
                                    <CTableRow key={index} id={`channel-row-${index}`} className="channel-row">
                                        <CTableDataCell>{index + 1}</CTableDataCell>
                                        <CTableDataCell>{channel.name}</CTableDataCell>
                                        <CTableDataCell>
                                            {channel.image && (
                                                <img
                                                    src={`http://localhost:3001/TVLauncher/livetv/${channel.image}`}
                                                    alt={channel.name}
                                                    style={{ width: '100px', cursor: 'pointer' }}
                                                    onClick={() => handleImageClick(`http://localhost:3001/TVLauncher/livetv/${channel.image}`)}
                                                />
                                            )}
                                        </CTableDataCell>
                                        <CTableDataCell>{channel.url}</CTableDataCell>
                                        <CTableDataCell>{channel.port}</CTableDataCell>
                                        <CTableDataCell>
                                            <CButton color="secondary" size="sm" onClick={() => moveUp(index)}>
                                                <CIcon icon={cilArrowTop} />
                                            </CButton>{' '}
                                            <CButton color="secondary" size="sm" onClick={() => moveDown(index)}>
                                                <CIcon icon={cilArrowBottom} />
                                            </CButton>{' '}
                                            <CButton color="info" size="sm" onClick={() => handleEdit(channel)}>
                                                <CIcon icon={cilPencil} />
                                            </CButton>{' '}
                                            <CButton color="danger" size="sm" onClick={() => handleDelete(channel.id)}>
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
                    <CModalTitle>{editMode ? 'Edit Channel' : 'Add Channel'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CFormInput
                            type="text"
                            placeholder="Channel Name"
                            value={newChannel.name}
                            onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                            className="mb-3"
                        />
                        <CFormInput type="file" accept="image/*" onChange={handleFileUpload} className="mb-3" />
{!newChannel.content && <small className="text-danger">Image is required</small>}
                        <CFormInput
                            type="text"
                            placeholder="Stream URL"
                            value={newChannel.url}
                            onChange={(e) => setNewChannel({ ...newChannel, url: e.target.value })}
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            placeholder="Port"
                            value={newChannel.port}
                            onChange={(e) => setNewChannel({ ...newChannel, port: e.target.value })}
                            className="mb-3"
                        />
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </CButton>
                    <CButton color="success" onClick={handleAddChannel}>
                        {editMode ? 'Update Channel' : 'Add Channel'}
                    </CButton>
                </CModalFooter>
            </CModal>

            <CModal visible={imageModal.visible} onClose={() => setImageModal({ visible: false, imageUrl: '' })}>
                <CModalBody className="text-center">
                    <img
                        src={imageModal.imageUrl}
                        alt="Enlarged Channel"
                        style={{ width: '100%', height: 'auto' }}
                    />
                </CModalBody>
            </CModal>

            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default ChannelPage;
