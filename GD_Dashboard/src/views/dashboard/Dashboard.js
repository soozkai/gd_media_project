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
  CFormCheck,
  CAlert,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilArrowTop, cilArrowBottom } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Chip } from '@mui/material';
import '../CSS/style.css';
const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newRoom, setNewRoom] = useState({
    room_number: '',
    device_ip: '',
    mac_address: '',
    j_version: '',
    active_status: false,
    group_id: '', // Add group_id to the newRoom state
  });
  const [groups, setGroups] = useState([]); // New state for groups
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, addToast] = useState([]);
  const navigate = useNavigate();
  const [animateRow, setAnimateRow] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:3001/rooms', {
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
      .then((data) => setRooms(data))
      .catch((error) => console.error('Error fetching room list:', error));

    fetch('http://localhost:3001/groups', {
      headers: {
        Authorization: token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setGroups(data))
      .catch((error) => console.error('Error fetching groups:', error));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    addToast(createToast('Your session has timed out. Please log in again.', 'danger'));
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom({
      ...newRoom,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddRoom = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const url = editMode ? `http://localhost:3001/rooms/${newRoom.id}` : 'http://localhost:3001/rooms/add';
    const method = editMode ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(newRoom),
    })
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          throw new Error('Unauthorized');
        }
        if (response.status === 409) {
          setErrorMessage('Room number already exists.');
          addToast(createToast('Room number already exists', 'danger'));
          return;
        }
        if (!response.ok) {
          addToast(createToast('Error saving room', 'danger'));
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          const updatedRooms = editMode
            ? rooms.map((room) => (room.id === newRoom.id ? { ...room, ...newRoom } : room))
            : [...rooms, data.room];
          setRooms(updatedRooms);
          setNewRoom({
            room_number: '',
            device_ip: '',
            mac_address: '',
            j_version: '',
            active_status: false,
            group_id: '', // Reset group_id
          });
          setShowModal(false);
          setEditMode(false);
          addToast(createToast('Room saved successfully', 'success'));
        }
      })
      .catch((error) => console.error('Error adding room:', error));
};

  const handleEdit = (room) => {
    setNewRoom(room);
    setShowModal(true);
    setEditMode(true);
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:3001/rooms/${id}`, {
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
        setRooms(rooms.filter((room) => room.id !== id));
        addToast(createToast('Room deleted successfully', 'success'));
      })
      .catch((error) => console.error('Error deleting room:', error));
  };

  const createToast = (message, color) => (
    <CToast autohide={true} delay={3000} color={color}>
      <CToastHeader closeButton>{message}</CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  );

  const handleSelectRoom = (roomId) => {
    setSelectedRooms((prevSelected) =>
      prevSelected.includes(roomId)
        ? prevSelected.filter((id) => id !== roomId)
        : [...prevSelected, roomId]
    );
  };

  // Apply filtering based on search term, active status, and group
  const filteredRooms = rooms.filter((room) =>
    room.room_number.toString().includes(searchTerm) &&
    (activeFilter === '' || room.active_status.toString() === activeFilter) &&
    (groupFilter === '' || room.group_id === groupFilter)
  );

  const moveUp = (index) => {
    if (index === 0 || !rooms || rooms.length === 0) {
      addToast(createToast('Cannot move the room up.', 'warning'));
      return;
    }
    const newRooms = [...rooms];
    [newRooms[index - 1], newRooms[index]] = [newRooms[index], newRooms[index - 1]];
    setRooms(newRooms);
    setAnimateRow(index - 1);
    setTimeout(() => setAnimateRow(null), 500);
    addToast(createToast('Room moved up successfully', 'info'));
  };

  const moveDown = (index) => {
    if (index === rooms.length - 1 || !rooms || rooms.length === 0) {
      addToast(createToast('Cannot move the room down.', 'warning'));
      return;
    }
    const newRooms = [...rooms];
    [newRooms[index + 1], newRooms[index]] = [newRooms[index], newRooms[index + 1]];
    setRooms(newRooms);
    setAnimateRow(index + 1);
    setTimeout(() => setAnimateRow(null), 500);
    addToast(createToast('Room moved down successfully', 'info'));
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '20px' }}>
        <select
          className="form-select mb-3"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
        >
          <option value="">Filter by Active Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          className="form-select mb-3"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option value="">Filter by Group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
      <CCard>
        <CCardHeader>
          Hotel Room List
          <CButton color="warning" className="float-end" onClick={() => setShowModal(!showModal)}>
            {showModal ? 'Cancel' : 'Add Room'}
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CFormInput
            type="text"
            placeholder="Search by Room Number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
          />
          <CTable striped hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell></CTableHeaderCell>
                <CTableHeaderCell>Room Number</CTableHeaderCell>
                <CTableHeaderCell>IP Address</CTableHeaderCell>
                <CTableHeaderCell>MAC Address</CTableHeaderCell>
                <CTableHeaderCell>Active</CTableHeaderCell>
                <CTableHeaderCell>Group</CTableHeaderCell> {/* New column for Group */}
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredRooms.map((room, index) => (
                <CTableRow key={index} className={animateRow === index ? 'move-animation' : ''}>
                  <CTableDataCell>
                    <CFormCheck
                      type="checkbox"
                      checked={selectedRooms.includes(room.id)}
                      onChange={() => handleSelectRoom(room.id)}
                    />
                  </CTableDataCell>
                  <CTableDataCell>{room.room_number}</CTableDataCell>
                  <CTableDataCell>{room.device_ip}</CTableDataCell>
                  <CTableDataCell>{room.mac_address}</CTableDataCell>
                  <CTableDataCell>{room.active_status ? 'Yes' : 'No'}</CTableDataCell>
                  <CTableDataCell>{room.group_id ? groups.find(group => group.id === room.group_id)?.name || 'No Group' : 'No Group'}</CTableDataCell> {/* Display group */}
                  <CTableDataCell>
                    <Tooltip title="Edit" arrow>
                      <CButton color="success" size="sm" className="m-1" onClick={() => handleEdit(room)}>
                        <CIcon icon={cilPencil} />
                      </CButton>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                      <CButton color="danger" size="sm" className="m-1" onClick={() => handleDelete(room.id)}>
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </Tooltip>
                    <Tooltip title="Move Up" arrow>
                      <CButton color="dark" size="sm" className="m-1" onClick={() => moveUp(index)}>
                        <CIcon icon={cilArrowTop} />
                      </CButton>
                    </Tooltip>
                    <Tooltip title="Move Down" arrow>
                      <CButton color="dark" size="sm" className="m-1" onClick={() => moveDown(index)}>
                        <CIcon icon={cilArrowBottom} />
                      </CButton>
                    </Tooltip>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
        <CToaster position="top-right">{toast}</CToaster>

        <CModal visible={showModal} onClose={() => setShowModal(false)}>
          <CModalHeader onClose={() => setShowModal(false)}>
            <CModalTitle>{editMode ? 'Edit Room' : 'Add Room'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                name="room_number"
                placeholder="Room Number"
                value={newRoom.room_number}
                onChange={handleInputChange}
                className="mb-3"
              />
              <CFormInput
                type="text"
                name="device_ip"
                placeholder="IP Address"
                value={newRoom.device_ip}
                onChange={handleInputChange}
                className="mb-3"
              />
              <CFormInput
                type="text"
                name="mac_address"
                placeholder="MAC Address"
                value={newRoom.mac_address}
                onChange={handleInputChange}
                className="mb-3"
              />
              <CFormInput
                type="text"
                name="j_version"
                placeholder="J Version"
                value={newRoom.j_version}
                onChange={handleInputChange}
                className="mb-3"
              />
              <CFormCheck
                type="checkbox"
                name="active_status"
                label="Active"
                checked={newRoom.active_status}
                onChange={handleInputChange}
                className="mb-3"
              />
              <select
                className="form-select mb-3"
                name="group_id" // Add the group_id to the form
                value={newRoom.group_id}
                onChange={handleInputChange}
              >
                <option value="">Select Group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              {errorMessage && <CAlert color="danger">{errorMessage}</CAlert>}
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </CButton>
            <CButton color="success" onClick={handleAddRoom}>
              Save Room
            </CButton>
          </CModalFooter>
        </CModal>
      </CCard>
    </>
  );
};

export default RoomList;
