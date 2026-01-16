import { toast } from 'react-toastify';
import { fetchData } from './fetchHelpers';
import { BASE_URL } from '../constants';

const WORK_URL = `${BASE_URL}`;

export const addWorkApi = async (workData) => {
  try {
    const response = await fetchData({
      apiUrl: `${WORK_URL}/artworks/`,
      method: 'POST',
      formData: workData,
    });
    toast.success(response?.message || '作品が追加されました', { className: 'toast-success', autoClose: 3000 });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getMyWorksApi = async ({ page = 1, search = '', category = '', tags = '' }) => {
  try {
    const response = await fetchData({
      apiUrl: `${WORK_URL}/artworks/my?page=${page}&search=${search}&category=${category}&tags=${tags}`,
      method: 'GET'
    });
    return response;
  } catch (error) {
    //toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getTagsApi = async () => {
  try {
    const response = await fetchData({
      apiUrl: `${WORK_URL}/artworks/tags`,
      method: 'GET'
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getCategoriesApi = async () => {
  try {
    const response = await fetchData({
      apiUrl: `${WORK_URL}/artworks/categories`,
      method: 'GET'
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getPublicWorksApi = async ({ page = 1, search = '', category = '', tags = '' }) => {
  try {
    const response = await fetchData({
      apiUrl: `${WORK_URL}/artworks/?page=${page}&search=${search}&category=${category}&tags=${tags}`,
      method: 'GET'
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getMyCollectionApi = async ({ page = 1, search = '', category = '', tags = '' }) => {
  try {
    const response = await fetchData({
      apiUrl: `${WORK_URL}/artworks/my-collection/?page=${page}&search=${search}&category=${category}&tags=${tags}`,
      method: 'GET'
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getMemberWorkApi = async ({id, page = 1, search = '', category = '', tags = '' }) => {
  try {
    const response = await fetchData({
      apiUrl: `${WORK_URL}/artworks/member/${id}?page=${page}&search=${search}&category=${category}&tags=${tags}`,
      method: 'GET'
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const likeWorkApi = async (id) => {
  try {
    const response = await fetchData({
      apiUrl: `${WORK_URL}/artworks/${id}/like/`,
      method: 'POST'
    });
    return { success: true, ...response };
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    return { success: false, ...error };
  }
};

export const unlikeWorkApi = async (id) => {
  try {
    const response = await fetchData({
      apiUrl: `${WORK_URL}/artworks/${id}/unlike/`,
      method: 'POST'
    });
    return { success: true, ...response };
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    return { success: false, ...error };
  }
};

export const getWorkDetailApi = async (workId) => {
  try {
    const response = await fetchData({
      apiUrl: `${WORK_URL}/artworks/${workId}`,
      method: 'GET'
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getFamilyGalleryApi = async ({ page = 1, search = '', category = '', tags = '' }) => {
  try {
    const response = await fetchData({
      apiUrl: `${WORK_URL}/artworks/family-gallery/?page=${page}&search=${search}&category=${category}&tags=${tags}`,
      method: 'GET'
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const updateWorkApi = async (id, workData) => {
  try {
    const response = await fetchData({
      apiUrl: `${WORK_URL}/artworks/${id}/update/`,
      method: 'POST',
      formData: workData,
    });
    toast.success(response?.message || 'Work updated successfully', { className: 'toast-success', autoClose: 3000 });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const deleteWorkApi = async (id) => {
  try {
    const response = await fetchData({
      apiUrl: `${WORK_URL}/artworks/${id}/delete/`,
      method: 'DELETE'
    });
    toast.success(response?.message || 'Work deleted successfully', { className: 'toast-success', autoClose: 3000 });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};
