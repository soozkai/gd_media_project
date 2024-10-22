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
import { cilPencil, cilTrash } from '@coreui/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GroupPage = () => {
    const [groups, setGroups] = useState([]);
    const [newGroup, setNewGroup] = useState({
        id: '',
        name: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editGroupId, setEditGroupId] = useState(null);
    const token = localStorage.getItem('token');
    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = () => {
        const token = localStorage.getItem('token');
        fetch('http://localhost:3001/groups', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })
            .then((response) => response.json())
            .then((data) => setGroups(data))
            .catch((error) => console.error('Error fetching groups:', error));
    };

    const handleAddGroup = () => {
        const token = localStorage.getItem('token');
        const url = editMode
        ? `http://localhost:3001/groups/${editGroupId}` // PUT for editing group
        : 'http://localhost:3001/groups';
    
        const method = editMode ? 'PUT' : 'POST';
    
        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify({ name: newGroup.name }),
        })
            .then((response) => response.json())
            .then((data) => {
                setShowModal(false);
                setNewGroup({ id: '', name: '' });
                setEditMode(false);
                fetchGroups();
                toast.success('Group saved successfully');
            })
            .catch((error) => console.error('Error adding/updating group:', error));
    };

    const handleEditGroup = (group) => {
        setNewGroup(group);
        setEditGroupId(group.id);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDeleteGroup = (groupId) => {
        const token = localStorage.getItem('token');
        fetch(`http://localhost:3001/groups/${groupId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })
            .then(() => {
                fetchGroups();
                toast.success('Group deleted successfully');
            })
            .catch((error) => console.error('Error deleting group:', error));
    };

    return (
        <>
            <CCard>
                <CCardHeader>
                    Group List
                    <div className="float-end">
                        <CButton color="primary" onClick={() => setShowModal(true)}>+ New Group</CButton>
                    </div>
                </CCardHeader>
                <CCardBody>
                    <CTable striped hover>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>ID</CTableHeaderCell>
                                <CTableHeaderCell>Order</CTableHeaderCell>
                                <CTableHeaderCell>Group Name</CTableHeaderCell>
                                <CTableHeaderCell>Actions</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {groups.map((group, index) => (
                                <CTableRow key={group.id}>
                                    <CTableDataCell>{group.id}</CTableDataCell>
                                    <CTableDataCell>{index + 1}</CTableDataCell>
                                    <CTableDataCell>{group.name}</CTableDataCell>
                                    <CTableDataCell>
                                        <CButton color="info" size="sm" onClick={() => handleEditGroup(group)}>
                                            <CIcon icon={cilPencil} />
                                        </CButton>{' '}
                                        <CButton color="danger" size="sm" onClick={() => handleDeleteGroup(group.id)}>
                                            <CIcon icon={cilTrash} />
                                        </CButton>
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>
                </CCardBody>
            </CCard>

            <CModal visible={showModal} onClose={() => setShowModal(false)}>
                <CModalHeader onClose={() => setShowModal(false)}>
                    <CModalTitle>{editMode ? 'Edit Group' : 'Add Group'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CFormInput
                            type="text"
                            label="Group ID"
                            value={newGroup.id}
                            disabled
                            className="mb-3"
                            style={{ borderRadius: '8px', padding: '10px' }}
                        />
                        <CFormInput
                            type="text"
                            placeholder="Group Name"
                            value={newGroup.name}
                            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                            className="mb-3"
                            style={{ borderRadius: '8px', padding: '10px' }}
                        />
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </CButton>
                    <CButton color="success" onClick={handleAddGroup}>
                        {editMode ? 'Update Group' : 'Create Group'}
                    </CButton>
                </CModalFooter>
            </CModal>

            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default GroupPage;
