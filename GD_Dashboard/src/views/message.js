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
import './ModalAnimations.css';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilArrowTop, cilArrowBottom } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import './CSS/style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
const Message = () => {
    const [messages, setMessages] = useState([]);
    const [groups, setGroups] = useState([]); // State for groups
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentImageIndexes, setCurrentImageIndexes] = useState({});
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(''); // State for the selected group
    const [buttonAnimation, setButtonAnimation] = useState(null);
    const [animateRow, setAnimateRow] = useState(null);
    const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
    const [newMessage, setNewMessage] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        content: null,
        file_type: '',
        selectedRooms: [],
    });
    const navigate = useNavigate();
    const filteredMessages = selectedGroupFilter
        ? messages.filter((message) => message.group_id === parseInt(selectedGroupFilter))
        : messages;
    // Methods
    const handleGroupFilterChange = (e) => {
        setSelectedGroupFilter(e.target.value);
    };

    const fetchMessages = () => {
        const token = localStorage.getItem('token');
        fetch('http://localhost:3001/messages', {
            headers: {
                Authorization: token,
            },
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    handleLogout(); // Call handleLogout if unauthorized
                    throw new Error('Unauthorized');
                }
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => {
                const updatedMessages = data.map((message, index) => ({
                    ...message,
                    displayId: index + 1,
                }));
                setMessages(updatedMessages);
            })
            .catch((error) => console.error('Error fetching message list:', error));
    };

    const fetchRooms = () => {
        const token = localStorage.getItem('token');
        fetch('http://localhost:3001/rooms', {
            headers: {
                Authorization: token,
            },
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    handleLogout(); // Call handleLogout if unauthorized
                    throw new Error('Unauthorized');
                }
                return response.json();
            })
            .then((data) => {
                const filteredRooms = data.filter((room) => room.active_status === 1);
                setAvailableRooms(filteredRooms);
            })
            .catch((error) => console.error('Error fetching rooms:', error));
    };

    const fetchGroups = () => {
        const token = localStorage.getItem('token');
        fetch('http://localhost:3001/groups', {
            headers: {
                Authorization: token,
            },
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    handleLogout(); // Call handleLogout if unauthorized
                    throw new Error('Unauthorized');
                }
                return response.json();
            })
            .then((data) => setGroups(data))
            .catch((error) => console.error('Error fetching groups:', error));
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
    const validateMessageInputs = () => {
        if (!newMessage.title || !newMessage.description || !newMessage.start_date || !newMessage.end_date) {
            toast.error('Please fill in all required fields.');
            return false; // Return false if validation fails
        }

        if (!newMessage.content || (Array.isArray(newMessage.content) && newMessage.content.length === 0)) {
            toast.error('Please upload at least one image or video.');
            return false; // Return false if no content is provided
        }

        return true; // Return true if validation passes
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

    const handleGroupChange = (e) => {
        setSelectedGroup(e.target.value);
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.error('Your session has timed out. Please log in again.', {
            onClose: () => {
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            },
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
                if (response.status === 401 || response.status === 403) {
                    handleLogout(); // Call handleLogout if unauthorized
                    throw new Error('Unauthorized');
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                fetchMessages(); // Refetch messages after deletion
                toast.error('Message deleted successfully');
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

        setSelectedGroup(message.group_id);
        setEditMode(true);
        setShowModal(true);
    };
    const handleMoveUp = (index) => {
        if (index === 0 || messages.length === 0) {
            toast.error('Cannot move the message up.'); // Toast for error condition
            return;
        }
        const newMessages = [...messages];
        [newMessages[index - 1], newMessages[index]] = [newMessages[index], newMessages[index - 1]];

        const updatedMessages = newMessages.map((message, idx) => ({
            ...message,
            displayId: idx + 1,
        }));

        setMessages(updatedMessages);
        setAnimateRow(index - 1);
        setTimeout(() => setAnimateRow(null), 500);

        toast.success('Message moved up successfully.');
    };

    const handleMoveDown = (index) => {
        if (index === messages.length - 1 || messages.length === 0) {
            toast.error('Cannot move the message down.');
            return;
        }
        const newMessages = [...messages];
        [newMessages[index + 1], newMessages[index]] = [newMessages[index], newMessages[index + 1]];

        const updatedMessages = newMessages.map((message, idx) => ({
            ...message,
            displayId: idx + 1,
        }));

        setMessages(updatedMessages);
        setAnimateRow(index + 1);
        setTimeout(() => setAnimateRow(null), 500);

        toast.success('Message moved down successfully.');
    };

    const handleAddMessage = (e) => {
        e.preventDefault();

        if (!validateMessageInputs()) return;

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('title', newMessage.title);
        formData.append('description', newMessage.description);
        formData.append('start_date', newMessage.start_date);
        formData.append('end_date', newMessage.end_date);
        formData.append('file_type', newMessage.file_type);

        if (selectedGroup) {
            formData.append('group_id', selectedGroup);
        }

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
                if (response.status === 401 || response.status === 403) {
                    handleLogout(); // Call handleLogout if unauthorized
                    throw new Error('Unauthorized');
                }
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => {
                setShowModal(false);
                setEditMode(false);
                toast.success('Message saved successfully'); // Using React Toastify's toast function
                fetchMessages(); // Optionally refresh messages
            })
            .catch((error) => console.error('Error adding message:', error));
    };

    // Initial data fetch
    useEffect(() => {
        fetchMessages();
        fetchRooms();
        fetchGroups();
    }, []);


    // Return section
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '20px' }}>
                <label style={{ marginRight: '10px' }}>Filter by Group:</label>
                <select
                    className="form-select"
                    value={selectedGroupFilter}
                    onChange={handleGroupFilterChange}
                    style={{ width: '200px' }}
                >
                    <option value="">All Groups</option>
                    {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                            {group.name}
                        </option>
                    ))}
                </select>
            </div>
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
                                <CTableHeaderCell>Order</CTableHeaderCell> {/* Changed from ID to Order */}
                                <CTableHeaderCell>Title</CTableHeaderCell>
                                <CTableHeaderCell>Description</CTableHeaderCell>
                                <CTableHeaderCell>Start Date</CTableHeaderCell>
                                <CTableHeaderCell>End Date</CTableHeaderCell>
                                <CTableHeaderCell>File Type</CTableHeaderCell>
                                <CTableHeaderCell>Content</CTableHeaderCell>
                                <CTableHeaderCell>Selected Rooms</CTableHeaderCell>
                                <CTableHeaderCell>Group</CTableHeaderCell>
                                <CTableHeaderCell>Actions</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            <TransitionGroup component={null}>
                                {filteredMessages.map((message, index) => (
                                    <CSSTransition key={message.id} timeout={300} classNames="message">
                                        <CTableRow>
                                            <CTableDataCell>{message.displayId}</CTableDataCell> {/* Use displayId here */}
                                            <CTableDataCell>{message.title}</CTableDataCell>
                                            <CTableDataCell>{message.description}</CTableDataCell>
                                            <CTableDataCell>{format(new Date(message.start_date), 'dd/MM/yyyy hh:mm a')}</CTableDataCell>
                                            <CTableDataCell>{format(new Date(message.end_date), 'dd/MM/yyyy hh:mm a')}</CTableDataCell>
                                            <CTableDataCell>{message.file_type}</CTableDataCell>
                                            <CTableDataCell>
                                                {message.file_type === 'image' && Array.isArray(message.content) ? (
                                                    <div>
                                                        {message.content.map((img, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={`http://localhost:3001/uploads/${img}`}
                                                                alt={message.title}
                                                                style={{ width: '100px', cursor: 'pointer', marginRight: '5px' }}
                                                                onClick={() => handleImageClick(img)}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span>Unsupported file type</span>
                                                )}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                {message.selected_rooms && message.selected_rooms.length > 0 ? (
                                                    message.selected_rooms.map((roomId, idx) => (
                                                        <Chip key={idx} label={roomId} style={{ margin: '0 5px' }} />
                                                    ))
                                                ) : (
                                                    <span>No rooms selected</span>
                                                )}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                {groups.find((group) => group.id === message.group_id)?.name || 'No Group'}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <Tooltip title="Edit" arrow>
                                                    <CButton color="success" size="sm" className="m-1" onClick={() => handleEdit(message)}>
                                                        <CIcon icon={cilPencil} />
                                                    </CButton>
                                                </Tooltip>
                                                <Tooltip title="Delete" arrow>
                                                    <CButton color="danger" size="sm" className="m-1" onClick={() => handleDelete(message.id)}>
                                                        <CIcon icon={cilTrash} />
                                                    </CButton>
                                                </Tooltip>
                                                <Tooltip title="Move Up" arrow>
                                                    <CButton color="dark" size="sm" className="m-1" onClick={() => handleMoveUp(index)}>
                                                        <CIcon icon={cilArrowTop} />
                                                    </CButton>
                                                </Tooltip>
                                                <Tooltip title="Move Down" arrow>
                                                    <CButton color="dark" size="sm" className="m-1" onClick={() => handleMoveDown(index)}>
                                                        <CIcon icon={cilArrowBottom} />
                                                    </CButton>
                                                </Tooltip>
                                            </CTableDataCell>
                                        </CTableRow>
                                    </CSSTransition>
                                ))}
                            </TransitionGroup>
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
                                placeholder="Title *"
                                value={newMessage.title || ''}
                                onChange={handleInputChange}
                                className="mb-3"
                            />

                            <CFormInput
                                type="text"
                                name="description"
                                placeholder="Description *"
                                value={newMessage.description || ''}
                                onChange={handleInputChange}
                                className="mb-3"
                            />
                            <CFormInput
                                type="datetime-local"
                                name="start_date"
                                placeholder="Start Date *"
                                value={newMessage.start_date || ''}
                                onChange={handleInputChange}
                                className="mb-3"
                            />
                            <CFormInput
                                type="datetime-local"
                                name="end_date"
                                placeholder="End Date *"
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
                            <div className="mb-3">
                                <label>Group</label>
                                <select
                                    className="form-select"
                                    value={selectedGroup}
                                    onChange={handleGroupChange}
                                >
                                    <option value="">Select a Group</option>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default Message;
