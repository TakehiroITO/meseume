// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import workReducer from './slices/workSlice';
import contestReducer from './slices/contestSlice';
import billingReducer from './slices/billingSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    work: workReducer,
    contest: contestReducer,
    billing: billingReducer
  },
});

export default store;
