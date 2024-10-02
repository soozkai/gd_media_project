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
import { Tooltip, Chip } from '@mui/material';
import { CSSTransition } from 'react-transition-group';
import './ModalAnimations.css';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const Message = () => {
    const [messages, setMessages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentImageIndexes, setCurrentImageIndexes] = useState({});
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [newMessage, setNewMessage] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        content: null,
        file_type: '',
        selectedRooms: [],
    });

    const [toast, addToast] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        // Fetch messages
        fetch('http://localhost:3001/messages', {
            headers: {
                Authorization: token,
            },
        })
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => setMessages(data))
            .catch((error) => console.error('Error fetching message list:', error));

        // Fetch available rooms for the current user with active_status = 1
        fetch('http://localhost:3001/rooms', {
            headers: {
                Authorization: token,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                const filteredRooms = data.filter((room) => room.active_status === 1);
                setAvailableRooms(filteredRooms);
            })
            .catch((error) => console.error('Error fetching rooms:', error));
    }, []);

    const handleDotClick = (messageId, index) => {
        setCurrentImageIndexes((prevIndexes) => ({
            ...prevIndexes,
            [messageId]: index,
        }));
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setShowImageModal(true);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const file_type = files[0]?.type.startsWith('image/') ? 'image' : files[0]?.type.startsWith('video/') ? 'video' : '';
        setNewMessage({
            ...newMessage,
            content: files,
            file_type,
        });
    };

    const handleRoomSelect = (room) => {
        setSelectedRooms([...selectedRooms, room]);
        setAvailableRooms(availableRooms.filter((r) => r.id !== room.id));
    };

    const handleRoomRemove = (room) => {
        setAvailableRooms([...availableRooms, room]);
        setSelectedRooms(selectedRooms.filter((r) => r.id !== room.id));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMessage({
            ...newMessage,
            [name]: value,
        });
    };

    const handleDelete = (id) => {
        const token = localStorage.getItem('token');

        fetch(`http://localhost:3001/messages/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: token,
            },
        })
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(() => {
                setMessages(messages.filter((message) => message.id !== id));
                addToast(createToast('Message deleted successfully', 'danger'));
            })
            .catch((error) => console.error('Error deleting message:', error));
    };

    const handleEdit = (message) => {
        const content = Array.isArray(message.content) ? message.content : message.content ? JSON.parse(message.content) : [];

        setNewMessage({
            id: message.id,
            title: message.title,
            description: message.description,
            start_date: format(new Date(message.start_date), "yyyy-MM-dd'T'HH:mm"),
            end_date: format(new Date(message.end_date), "yyyy-MM-dd'T'HH:mm"),
            content: content,
            file_type: message.file_type,
            selectedRooms: message.selected_rooms,
        });
        setEditMode(true);
        setShowModal(true);
    };

    const handleAddMessage = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        setNewMessage({
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            content: null,
            file_type: '',
            selectedRooms: [],
        });
        setSelectedRooms([]);

        const formData = new FormData();
        formData.append('title', newMessage.title);
        formData.append('description', newMessage.description);
        formData.append('start_date', newMessage.start_date);
        formData.append('end_date', newMessage.end_date);
        formData.append('file_type', newMessage.file_type);

        formData.append('selectedRooms', JSON.stringify(selectedRooms.map((r) => r.id)));

        let content = [];
        try {
            content = Array.isArray(newMessage.content) ? newMessage.content : JSON.parse(`[${newMessage.content}]`);
        } catch (error) {
            console.error('Error parsing content:', error);
        }

        content.forEach((file) => formData.append('content', file));

        const url = editMode ? `http://localhost:3001/messages/${newMessage.id}` : 'http://localhost:3001/messages/add';
        const method = editMode ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                Authorization: token,
            },
            body: formData,
        })
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => {
                const updatedMessages = editMode
                    ? messages.map((message) => (message.id === newMessage.id ? { ...message, ...newMessage } : message))
                    : [...messages, data.message];
                setMessages(updatedMessages);
                setShowModal(false);
                setEditMode(false);
                addToast(createToast('Message saved successfully', 'success'));
            })
            .catch((error) => console.error('Error adding message:', error));
    };

    const createToast = (message, color) => (
        <CToast autohide={true} delay={3000} color={color}>
            <CToastHeader closeButton>{message}</CToastHeader>
            <CToastBody>{message}</CToastBody>
        </CToast>
    );

    return (
        <CCard>
            <CModal visible={showImageModal} onClose={() => setShowImageModal(false)} size="lg">
                <CModalBody className="text-center">
                    <img src={`http://localhost:3001/uploads/${selectedImage}`} alt="Enlarged" style={{ width: '100%' }} />
                </CModalBody>
            </CModal>
            <CCardHeader>
                Message List
                <CButton color="primary" className="float-end" onClick={() => setShowModal(!showModal)}>
                    {showModal ? 'Cancel' : 'Add Message'}
                </CButton>
            </CCardHeader>
            <CCardBody>
                <CTable striped hover>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>ID</CTableHeaderCell>
                            <CTableHeaderCell>Title</CTableHeaderCell>
                            <CTableHeaderCell>Description</CTableHeaderCell>
                            <CTableHeaderCell>Start Date</CTableHeaderCell>
                            <CTableHeaderCell>End Date</CTableHeaderCell>
                            <CTableHeaderCell>File Type</CTableHeaderCell>
                            <CTableHeaderCell>Content</CTableHeaderCell>
                            <CTableHeaderCell>Selected Rooms</CTableHeaderCell>
                            <CTableHeaderCell>Actions</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {messages.map((message, index) => (
                            <CTableRow key={index}>
                                <CTableDataCell>{message.id}</CTableDataCell>
                                <CTableDataCell>{message.title}</CTableDataCell>
                                <CTableDataCell>{message.description}</CTableDataCell>
                                <CTableDataCell>{format(new Date(message.start_date), 'dd/MM/yyyy hh:mm a')}</CTableDataCell>
                                <CTableDataCell>{format(new Date(message.end_date), 'dd/MM/yyyy hh:mm a')}</CTableDataCell>
                                <CTableDataCell>{message.file_type}</CTableDataCell>
                                <CTableDataCell>
                                    {message.file_type === 'image' && Array.isArray(message.content) ? (
                                        <div>
                                            <img
                                                src={`http://localhost:3001/uploads/${message.content[currentImageIndexes[message.id] || 0]}`}
                                                alt={message.title}
                                                style={{ width: '100px', cursor: 'pointer' }}
                                                onClick={() => handleImageClick(message.content[currentImageIndexes[message.id] || 0])}
                                            />
                                            <div className="dots-container">
                                                {message.content.map((_, imgIndex) => (
                                                    <span
                                                        key={imgIndex}
                                                        className={`dot ${imgIndex === (currentImageIndexes[message.id] || 0) ? 'active' : ''}`}
                                                        onClick={() => handleDotClick(message.id, imgIndex)}
                                                        style={{
                                                            height: '10px',
                                                            width: '10px',
                                                            margin: '0 5px',
                                                            backgroundColor: imgIndex === (currentImageIndexes[message.id] || 0) ? '#000' : '#bbb',
                                                            borderRadius: '50%',
                                                            display: 'inline-block',
                                                            cursor: 'pointer',
                                                        }}
                                                    ></span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <span>Unsupported file type</span>
                                    )}
                                </CTableDataCell>
                                <CTableDataCell>
                                    {message.room_numbers ? (
                                        message.room_numbers.split(',').map((roomNumber, index) => (
                                            <Chip key={index} label={roomNumber} style={{ margin: '0 5px 5px 0' }} />
                                        ))
                                    ) : (
                                        <span>No rooms selected</span>
                                    )}
                                </CTableDataCell>
                                <CTableDataCell>
                                    <CButton color="info" size="sm" onClick={() => handleEdit(message)}>
                                        <CIcon icon={cilPencil} />
                                    </CButton>{' '}
                                    <CButton color="danger" size="sm" onClick={() => handleDelete(message.id)}>
                                        <CIcon icon={cilTrash} />
                                    </CButton>
                                </CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            </CCardBody>
            <CToaster position="top-right">{toast}</CToaster>

            <CModal visible={showModal} onClose={() => setShowModal(false)}>
                <CModalHeader onClose={() => setShowModal(false)}>
                    <CModalTitle>{editMode ? 'Edit Message' : 'Add Message'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CFormInput
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={newMessage.title || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={newMessage.description || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="datetime-local"
                            name="start_date"
                            placeholder="Start Date"
                            value={newMessage.start_date || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="datetime-local"
                            name="end_date"
                            placeholder="End Date"
                            value={newMessage.end_date || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="file"
                            name="content"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            multiple
                            className="mb-3"
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ flex: 1, marginRight: '20px' }}>
                                <h6>Available Rooms</h6>
                                <select
                                    multiple
                                    size={10}
                                    style={{ width: '100%', height: '200px' }}
                                >
                                    {availableRooms.map((room) => (
                                        <option
                                            key={room.id}
                                            value={room.id}
                                            onClick={() => handleRoomSelect(room)}>
                                            {room.room_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ flex: 1 }}>
                                <h6>Selected Rooms</h6>
                                <select
                                    multiple
                                    size={10}
                                    style={{ width: '100%', height: '200px' }}
                                >
                                    {selectedRooms.map((room) => (
                                        <option
                                            key={room.id}
                                            value={room.id}
                                            onClick={() => handleRoomRemove(room)}>
                                            {room.room_number}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </CButton>
                    <CButton color="success" onClick={handleAddMessage}>
                        Save Message
                    </CButton>
                </CModalFooter>
            </CModal>
        </CCard>
    );
};

export default Message;