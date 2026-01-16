// src/api/authApi.js
import { toast } from 'react-toastify';
import { fetchData } from './fetchHelpers';
import { BASE_URL } from '../constants';

const AUTH_URL = `${BASE_URL}`;

export const loginApi = async (credentials) => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/login/`,
      method: 'POST',
      body: credentials,
    });
    toast.success(response.message, { className: 'toast-success', autoClose: 3000 });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const signupApi = async (userData) => {
try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/signup/`,
      method: 'POST',
      body: userData,
    });
    if (response.email) {
      toast.success('User registered successfully', { className: 'toast-success', autoClose: 3000 });
    } else {
      toast.success('ユーザー登録が完了しました', { className: 'toast-success', autoClose: 3000 });
    }
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const resetPasswordApi = async (email) => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/password-reset/`,
      method: 'POST',
      body: { email },
    });
    toast.success(response.message, { className: 'toast-success', autoClose: 3000 });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const resetPasswordConfirmApi = async (credentials) => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/password-reset-confirm/${credentials.uid}/${credentials.token}`,
      method: 'POST',
      body:  { "new_password": credentials.password, 'confirm_password': credentials.confirm_password },
    });
    toast.success(response.detail, { className: 'toast-success', autoClose: 3000 });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const emailVerificationApi = async (credentials) => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/verify-email/${credentials.uid}/${credentials.token}`,
      method: 'GET',
      body:  { },
    });
    toast.success(response.detail, { className: 'toast-success', autoClose: 3000 });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};
