import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../config/supabase';
import debounce from 'lodash/debounce'; // You'll need to install lodash: npm install lodash
import {
  Container,
  Box,
  Typography,
  TextField,
  Link,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  FormControl,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  CircularProgress
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { 
  Visibility, 
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon 
} from '@mui/icons-material';

function Signup() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation states
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    number: false,
    uppercase: false,
    special: false
  });

  // Add these new state variables
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState('');

  const validatePassword = (password: string) => {
    setPasswordErrors({
      length: password.length >= 8,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  // Username validation function
  const validateUsername = (username: string) => {
    // Basic validation rules
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setIsUsernameAvailable(null);
      return false;
    }
    if (username.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      setIsUsernameAvailable(null);
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      setIsUsernameAvailable(null);
      return false;
    }
    return true;
  };

  // Debounced function to check username availability
  const checkUsernameAvailability = useCallback(
    debounce(async (username: string) => {
      setIsCheckingUsername(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw error;
        }

        setIsUsernameAvailable(!data);
        setUsernameError(data ? 'Username is already taken' : '');
      } catch (err) {
        console.error('Error checking username:', err);
        setUsernameError('Error checking username availability');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500), // Wait 500ms after last keystroke before checking
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      validatePassword(value);
    } else if (name === 'username') {
      if (validateUsername(value)) {
        checkUsernameAvailability(value);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          }
        }
      });

      if (error) throw error;

      // Create a profile in the profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username: formData.username,
              email: formData.email,
            }
          ]);

        if (profileError) throw profileError;
      }

      // After successful signup
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = () => {
    return Object.values(passwordErrors).every(Boolean);
  };

  // Username input end adornment
  const getUsernameAdornment = () => {
    if (!formData.username) return null;
    
    if (isCheckingUsername) {
      return (
        <InputAdornment position="end">
          <CircularProgress size={20} />
        </InputAdornment>
      );
    }

    if (isUsernameAvailable === true) {
      return (
        <InputAdornment position="end">
          <CheckCircleIcon color="success" />
        </InputAdornment>
      );
    }

    if (isUsernameAvailable === false || usernameError) {
      return (
        <InputAdornment position="end">
          <CancelIcon color="error" />
        </InputAdornment>
      );
    }

    return null;
  };

  // Update the isFormValid check
  const isFormValid = () => {
    return (
      isPasswordValid() &&
      formData.email &&
      formData.username &&
      isUsernameAvailable &&
      !isCheckingUsername &&
      !usernameError
    );
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2
          }}
        >
          <Typography 
            component="h1" 
            variant="h5" 
            align="center" 
            gutterBottom
            sx={{ mb: 3 }}
          >
            Create Account
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            noValidate
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={Boolean(usernameError)}
              helperText={usernameError || (isUsernameAvailable && formData.username ? 'Username is available' : ' ')}
              InputProps={{
                endAdornment: getUsernameAdornment(),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <TextField
                required
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormHelperText>
                Password must:
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  <li style={{ color: passwordErrors.length ? 'green' : 'inherit' }}>
                    Be at least 8 characters
                  </li>
                  <li style={{ color: passwordErrors.number ? 'green' : 'inherit' }}>
                    Include a number
                  </li>
                  <li style={{ color: passwordErrors.uppercase ? 'green' : 'inherit' }}>
                    Include an uppercase letter
                  </li>
                  <li style={{ color: passwordErrors.special ? 'green' : 'inherit' }}>
                    Include a special character
                  </li>
                </Box>
              </FormHelperText>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              loading={loading}
              disabled={!isFormValid()}
              sx={{ 
                mt: 2, 
                mb: 3,
                py: 1.5,
                fontSize: '1rem'
              }}
            >
              Create Account
            </LoadingButton>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?
              </Typography>
              <Link 
                component={RouterLink} 
                to="/login" 
                variant="body2"
                sx={{ fontWeight: 500 }}
              >
                Log In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Signup; 