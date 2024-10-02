import React, { useState, useEffect } from 'react';
import {
  CCard, CCardBody, CCardHeader, CButton, CTable, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell, CTableHead,
  CForm, CFormInput, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle,
} from '@coreui/react';
import { TextField, Button, Grid, InputLabel } from '@mui/material';

const LiveTVPage = () => {
  const [channels, setChannels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newChannel, setNewChannel] = useState({
    channelId: '', name: '', image: '', url: '', port: ''
  });

  useEffect(() => {
    fetch('http://localhost:3001/channels')  // Fetch channels data from your API
      .then((response) => response.json())
      .then((data) => setChannels(data.channels))
      .catch((error) => console.error('Error fetching channels:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChannel({ ...newChannel, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewChannel({ ...newChannel, image: file });
  };

  const handleAddChannel = () => {
    const formData = new FormData();
    formData.append('channelId', newChannel.channelId);
    formData.append('name', newChannel.name);
    formData.append('url', newChannel.url);
    formData.append('port', newChannel.port);
    formData.append('image', newChannel.image);

    fetch('http://localhost:3001/channels/add', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setChannels([...channels, data.channel]);
        setShowModal(false);
      })
      .catch((error) => console.error('Error adding channel:', error));
  };

  return (
    <CCard>
      <CCardHeader>
        Live TV Channels
        <Button variant="contained" color="primary" onClick={() => setShowModal(true)} style={{ float: 'right' }}>
          Add Channel
        </Button>
      </CCardHeader>
      <CCardBody>
        <CTable striped hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Channel ID</CTableHeaderCell>
              <CTableHeaderCell>Ch Name</CTableHeaderCell>
              <CTableHeaderCell>Ch Logo</CTableHeaderCell>
              <CTableHeaderCell>URL</CTableHeaderCell>
              <CTableHeaderCell>Port</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {channels.map((channel, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{channel.channelId}</CTableDataCell>
                <CTableDataCell>{channel.name}</CTableDataCell>
                <CTableDataCell><img src={channel.image} alt={channel.name} style={{ width: '100px' }} /></CTableDataCell>
                <CTableDataCell>{channel.url}</CTableDataCell>
                <CTableDataCell>{channel.port}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>

      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader onClose={() => setShowModal(false)}>
          <CModalTitle>Add New Channel</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="Channel ID" name="channelId" onChange={handleInputChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Channel Name" name="name" onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Channel Logo</InputLabel>
                <TextField fullWidth type="file" name="image" onChange={handleFileChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="URL" name="url" onChange={handleInputChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Port" name="port" onChange={handleInputChange} />
              </Grid>
            </Grid>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <Button variant="outlined" color="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAddChannel}>Save</Button>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default LiveTVPage;
