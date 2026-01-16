// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, signupApi, resetPasswordApi, resetPasswordConfirmApi, emailVerificationApi } from '../../api/authApi'; // Import forgotPasswordApi and signupApi
import { scheduleTokenRefresh } from '../../utils/helpers';

// Define the async thunk for login
export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const response = await loginApi(credentials); 
    if (response?.access) { // Assuming response has a success property
      localStorage.setItem('token', response.access); // Save email in localStorage
      localStorage.setItem('refreshToken', response.refresh)
    }
    scheduleTokenRefresh("parent");
    return response; 
  } catch (error) {
    console.error("Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message); // Handle errors
  }
});

// Define the async thunk for reset password
export const resetPassword = createAsyncThunk('auth/resetPassword', async (email, thunkAPI) => {
  try {
    const response = await resetPasswordApi(email);
    if (response) { // Assuming response has a success property
      localStorage.setItem('email', email); // Save email in localStorage
    }
    return response;
  } catch (error) {
    console.error("Reset Password Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message); // Handle errors
  }
});

// Define the async thunk for reset password confirmation
export const resetPasswordConfirm = createAsyncThunk('auth/resetPasswordConfirm', async (credentials, thunkAPI) => {
  try {
    const response = await resetPasswordConfirmApi(credentials);
    // if (response) { // Assuming response has a success property
    //   localStorage.setItem('email', credentials.email); // Save email in localStorage
    // }
    return response;
  } catch (error) {
    console.error("Reset Password Confirm Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message); // Handle errors
  }
});

export const emailVerification = createAsyncThunk('auth/emailVerification', async (credentials, thunkAPI) => {
  try {
    const response = await emailVerificationApi(credentials);
    return response;
  } catch (error) {
    console.error("Reset Password Confirm Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message); // Handle errors
  }
});

// Define the async thunk for signup
export const signup = createAsyncThunk('auth/signup', async (userData, thunkAPI) => {
  try {
    const response = await signupApi(userData);
    if (response && response.success) { // Assuming response has a success property
      localStorage.setItem('email', userData.email); // Save email in localStorage
    }
    return response;
  } catch (error) {
    console.error("Signup Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message); // Handle errors
  }
});

const initialState = {
  loginRes: null,
  resetPasswordRes: false,
  signupRes: false,
  isLoading: false,
  error: null,
};

// Create the slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('token'); // Remove token from localStorage on logout
      localStorage.removeItem('userData'); // Remove userData from localStorage on logout
      window.location.href = '/login';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginRes = action.payload;
        state.isLoading = false;
      })
      .addCase(login.rejected, (state, action) => {
        console.error("Action rejected:", action.payload);
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetPasswordRes = action.payload;
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        console.error("Reset Password Action rejected:", action.payload);
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(resetPasswordConfirm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordConfirm.fulfilled, (state, action) => {
        state.resetPasswordRes = action.payload.success;
        state.isLoading = false;
      })
      .addCase(resetPasswordConfirm.rejected, (state, action) => {
        console.error("Reset Password Confirm Action rejected:", action.payload);
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.signupRes = action.payload;
        state.isLoading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        console.error("Signup Action rejected:", action.payload);
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
