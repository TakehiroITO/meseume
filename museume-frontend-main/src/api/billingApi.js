import { toast } from 'react-toastify';
import { fetchData } from './fetchHelpers';
import { BASE_URL } from '../constants';

const BILLING_URL = `${BASE_URL}`;

export const getBillingPlansApi = async () => {
  try {
    const response = await fetchData({
      apiUrl: `${BILLING_URL}/billing/plans/`,
      method: 'GET'
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const createCheckoutSessionApi = async (planId) => {
  try {
    const response = await fetchData({
      apiUrl: `${BILLING_URL}/billing/create-checkout-session/`,
      method: 'POST',
      body: { planId }
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getSubscriptionStatusApi = async () => {
  try {
    const response = await fetchData({
      apiUrl: `${BILLING_URL}/billing/subscription-status/`,
      method: 'GET'
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};


export const cancelSubscriptionApi = async () => {
  try {
    const response = await fetchData({
      apiUrl: `${BILLING_URL}/billing/cancel-subscription/`,
      method: 'POST'
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getAdvertisementApi = async () => {
  try {
    const response = await fetchData({
      apiUrl: `${BILLING_URL}/advertisements/`,
      method: 'GET'
    });
    return response;
  } catch (error) {
    toast.error(error.message, { className: 'toast-error', autoClose: 3000 });
    throw new Error(error.message);
  }
};

export const getUserImageCountApi = async () => {
  try {
    const response = await fetchData({
      apiUrl: `${BILLING_URL}/billing/user-image-count/`,
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error('Error fetching user image count:', error.message);
    throw new Error(error.message);
  }
};
