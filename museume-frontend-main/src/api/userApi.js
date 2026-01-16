import { toast } from 'react-toastify';
import { fetchData } from './fetchHelpers';
import { BASE_URL } from '../constants';

const AUTH_URL = `${BASE_URL}`;
export const registerChildApi = async (childData) => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/register-profile/`,
      method: 'POST',
      formData: childData,
    });
    toast.success(response?.message || 'プロフィールが登録されました', { className: 'toast-success', autoClose: 3000 });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getChildsApi = async () => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/children/`,
      method: 'GET',
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getProfileApi = async () => {
  try {
    console.log("In get profile info api")
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/profile/`,
      method: 'GET',
    });
    console.log("res from api:::", response)
    return response;
  } catch (error) {
    //toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const updateProfileApi = async (profileData) => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/profile/`,
      method: 'PATCH',
      body: profileData,
    });
    toast.success(response?.message || 'プロフィールが更新されました', { className: 'toast-success', autoClose: 3000 });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const deleteProfileApi = async (profileId) => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/profiles/${profileId}/delete/`,
      method: 'DELETE',
    });
    toast.success(response?.message || 'プロフィールが削除されました', { className: 'toast-success', autoClose: 3000 });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getAccountInfoApi = async () => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/account-info/`,
      method: 'GET',
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const updateAccountInfoApi = async (accountData) => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/account-info/`,
      method: 'PATCH',
      body: accountData,
    });
    toast.success(response?.message || 'アカウント情報が更新されました', { className: 'toast-success', autoClose: 3000 });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const deleteAccountApi = async () => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/account/delete/`,
      method: 'DELETE',
    });
    toast.success(response?.message || 'アカウントが削除されました', { className: 'toast-success', autoClose: 3000 });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getProfileListApi = async () => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/profiles/`,
      method: 'GET',
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const childProfileLoginApi = async (loginData) => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/profile/login/`,
      method: 'POST',
      body: loginData,
    });
    if (response) {
      toast.success(response?.message || `${loginData.username} でログインしました`, { className: 'toast-success', autoClose: 3500 });
    }
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getAllOrganizationsApi = async () => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/organizations/`,
      method: 'GET',
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getOrganizationCodeApi = async (organizationCode) => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/organizations/${organizationCode}`,
      method: 'GET',
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};
