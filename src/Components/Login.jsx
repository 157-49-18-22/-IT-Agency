import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
import { authAPI } from '../services/api';

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loginError, setLoginError] = useState('');

  const navigate = useNavigate();

  // No auto-redirect here - let ProtectedRoute handle it

  useEffect(() => {
    // Add animation class to form elements on mount
    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach((input, index) => {
      input.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s forwards`;
    });
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name] || loginError) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
      setLoginError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      setLoginError('');
      setFormErrors({});

      try {
        // Call the login API
        const response = await authAPI.login({
          email: formData.email.trim(),
          password: formData.password
        });

        console.log('Login API response:', response);

        if (response.data && response.data.user) {
          // Store token in localStorage if it exists
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }

          // Call the login function from AuthContext with complete user data
          const loginSuccess = await login({
            ...response.data.user,
            id: response.data.user.id || Date.now().toString(),
            role: response.data.user.role || 'user'
          });

          if (loginSuccess) {
            console.log('Login successful, redirecting based on role');

            // Role-based redirect
            const userRole = (response.data.user.role || '').toLowerCase();
            let redirectPath = '/dashboard'; // default

            if (userRole === 'developer') {
              redirectPath = '/developer/tasks';
            } else if (userRole === 'ui/ux' || userRole === 'designer') {
              redirectPath = '/design/wireframes';
            } else if (userRole === 'tester') {
              redirectPath = '/testing/dashboard';
            } else if (userRole === 'client') {
              redirectPath = '/client/dashboard';
            }

            console.log('Redirecting to:', redirectPath);
            // Force a full page reload to ensure all state is properly initialized
            window.location.href = redirectPath;
          } else {
            throw new Error('Failed to initialize user session');
          }
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error.response?.data?.message || 'Invalid email or password';
        setLoginError(errorMessage);
        setFormErrors({
          email: ' ', // Add empty space to maintain form layout
          password: ' '
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setFormErrors(errors);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>Welcome Back!</h2>
          <p>Sign in to your IT Agency account</p>
          {loginError && (
            <div className="alert alert-danger" role="alert">
              {loginError}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <div className="input-field">
              <span className="input-icon">
                <FaUser />
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="login-input"
                style={{ border: "none" }}
              />

            </div>
            {formErrors.email && <span className="error-message">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <div className="input-field">
              <span className="input-icon">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="login-input"
                style={{ border: "none" }}
              />

              <span
                className="password-toggle"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword(!showPassword);
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {formErrors.password && <span className="error-message">{formErrors.password}</span>}
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" name="remember" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <a href="#forgot-password" className="forgot-password">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            <span className="login-button-text">
              Sign In <FaArrowRight style={{ marginLeft: '8px' }} />
            </span>
          </button>




        </form>


      </div>
    </div>
  );
};

export default Login;