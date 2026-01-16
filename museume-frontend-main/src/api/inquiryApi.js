import { toast } from 'react-toastify';
import { fetchData } from './fetchHelpers';
import { BASE_URL } from '../constants';

const AUTH_URL = `${BASE_URL}`;
export const inquiryApi = async (values) => {
  try {
    const response = await fetchData({
      apiUrl: `${AUTH_URL}/inquiry/`,
      method: 'POST',
      formData: values,
    });
    toast.success(response?.message || 'お問い合わせが送信されました', { className: 'toast-success', autoClose: 3000 });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};
