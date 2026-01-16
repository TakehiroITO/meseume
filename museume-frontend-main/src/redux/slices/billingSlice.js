import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBillingPlansApi, createCheckoutSessionApi, getSubscriptionStatusApi, cancelSubscriptionApi, getAdvertisementApi } from '../../api/billingApi';

export const getBillingPlans = createAsyncThunk('billing/getBillingPlans', async (_, thunkAPI) => {
  try {
    const response = await getBillingPlansApi();
    return response;
  } catch (error) {
    console.error("Get Billing Plans Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const createCheckoutSession = createAsyncThunk('billing/createCheckoutSession', async (planId, thunkAPI) => {
  try {
    const response = await createCheckoutSessionApi(planId);
    return response;
  } catch (error) {
    console.error("Create Checkout Session Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getSubscriptionStatus = createAsyncThunk('billing/getSubscriptionStatus', async (_, thunkAPI) => {
  try {
    const response = await getSubscriptionStatusApi();
    return response;
  } catch (error) {
    console.error("Get Subscription Status Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const cancelSubscription = createAsyncThunk('billing/cancelSubscription', async (_, thunkAPI) => {
  try {
    const response = await cancelSubscriptionApi();
    return response;
  } catch (error) {
    console.error("Cancel Subscription Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getAdvertisement = createAsyncThunk('billing/getAdvertisement', async (_, thunkAPI) => {
  try {
    const response = await getAdvertisementApi();
    return response;
  } catch (error) {
    console.error("Get Advertisement Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

const initialState = {
  plans: null,
  checkoutSession: null,
  subscriptionStatus: null,
  advertisements: null,
  isLoading: false,
  error: null,
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getBillingPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBillingPlans.fulfilled, (state, action) => {
        state.plans = action.payload;
        state.isLoading = false;
      })
      .addCase(getBillingPlans.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(createCheckoutSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state, action) => {
        state.checkoutSession = action.payload;
        state.isLoading = false;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getSubscriptionStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubscriptionStatus.fulfilled, (state, action) => {
        state.subscriptionStatus = action.payload;
        state.isLoading = false;
      })
      .addCase(getSubscriptionStatus.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(cancelSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getAdvertisement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdvertisement.fulfilled, (state, action) => {
        state.advertisements = action.payload;
        state.isLoading = false;
      })
      .addCase(getAdvertisement.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      });
  },
});

export default billingSlice.reducer;
