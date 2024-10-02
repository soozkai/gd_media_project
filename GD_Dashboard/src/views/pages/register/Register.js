import React, { useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import logo from 'src/assets/brand/GD Strem Logo.png';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== repeatPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      toast.error('Invalid email format!');
      return;
    }

    // Create user object
    const user = { username, email, password };
    console.log("Form data:", user);

    try {
      // Send POST request to backend
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        // Show success toast and navigate to login page after user acknowledges
        toast.success('User registered successfully!', {
          onClose: () => navigate('/login'),
        });
      } else if (response.status === 409) {
        // Handle duplicate user error
        toast.error('Username or email already exists!');
      } else {
        // Handle other registration failures
        console.error('Failed to register user');
        toast.error('Failed to register user');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      toast.error('Error registering user');
    }
  };

  return (
    <div className="register-page">
      <div className="register-form">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={9} lg={7} xl={6}>
              <CCard className="mx-4">
                <CCardBody className="p-4">
                  <div className="text-center mb-4">
                    <img src={logo} alt="GD Strem Logo" height="100" />
                  </div>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Register</h1>
                    <p className="text-body-secondary">Create your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>@</CInputGroupText>
                      <CFormInput
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <div className="d-grid">
                      <CButton type="submit" color="success">
                        Create Account
                      </CButton>
                    </div>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CContainer>
      </div>
      <div className="register-image"></div>
      <ToastContainer />
    </div>
  );
};

export default Register;
