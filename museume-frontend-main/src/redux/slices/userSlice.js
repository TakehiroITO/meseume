import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerChildApi, getChildsApi, getProfileApi, getAccountInfoApi, getProfileListApi, updateProfileApi, updateAccountInfoApi, childProfileLoginApi, getAllOrganizationsApi, getOrganizationCodeApi, deleteProfileApi, deleteAccountApi } from '../../api/userApi';
import { scheduleTokenRefresh } from '../../utils/helpers';

export const registerChild = createAsyncThunk('user/registerChild', async (childData, thunkAPI) => {
  try {
    const response = await registerChildApi(childData);
    await thunkAPI.dispatch(getProfiles());
    return response;
  } catch (error) {
    console.error("Register Child Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getChilds = createAsyncThunk('user/getChilds', async (_, thunkAPI) => {
  try {
    const response = await getChildsApi();
    return response;
  } catch (error) {
    console.error("Get Childs Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getProfile = createAsyncThunk('user/getProfile', async (_, thunkAPI) => {
  try {
    const response = await getProfileApi();
    console.log("response:::::::", response)
    return response;
  } catch (error) {
    console.error("Get Profile Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const updateProfile = createAsyncThunk('user/updateProfile', async (profileData, thunkAPI) => {
  try {
    const response = await updateProfileApi(profileData);
    await thunkAPI.dispatch(getProfile());
    return response;
  } catch (error) {
    console.error("Update Profile Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const deleteProfile = createAsyncThunk('user/deleteProfile', async (profileId, thunkAPI) => {
  try {
    const response = await deleteProfileApi(profileId);
    await thunkAPI.dispatch(getProfiles());
    return response;
  } catch (error) {
    console.error("Delete Profile Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getAccountInfo = createAsyncThunk('user/getAccountInfo', async (_, thunkAPI) => {
  try {
    const response = await getAccountInfoApi();
    return response;
  } catch (error) {
    console.error("Get Account Info Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const updateAccountInfo = createAsyncThunk('user/updateAccountInfo', async (accountData, thunkAPI) => {
  try {
    const response = await updateAccountInfoApi(accountData);
    return response;
  } catch (error) {
    console.error("Update Account Info Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const deleteAccount = createAsyncThunk('user/deleteAccount', async (_, thunkAPI) => {
  try {
    const response = await deleteAccountApi();
    return response;
  } catch (error) {
    console.error("Delete Account Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getProfiles = createAsyncThunk('user/getProfiles', async (_, thunkAPI) => {
  try {
    const response = await getProfileListApi();
    return response;
  } catch (error) {
    console.error("Get Profiles Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const childProfileLogin = createAsyncThunk('user/childProfileLogin', async (loginData, thunkAPI) => {
  try {
    const response = await childProfileLoginApi(loginData);
    if (response?.access) {
      localStorage.setItem('child_token', response.access);
      localStorage.setItem('child_refresh_token', response.refresh);
      window.location.href = '/my-work'; // Navigate to My Work screen
    }
    scheduleTokenRefresh("child");
    return response;
  } catch (error) {
    console.error("Child Profile Login Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getAllOrganizations = createAsyncThunk('user/getAllOrganizations', async (_, thunkAPI) => {
  try {
    const response = await getAllOrganizationsApi();
    return response;
  } catch (error) {
    console.error("Get All Organizations Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getOrganizationCode = createAsyncThunk('user/getOrganizationCode', async (organizationCode, thunkAPI) => {
  try {
    const response = await getOrganizationCodeApi(organizationCode);
    return response;
  } catch (error) {
    console.error("Get Organization Code Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

const initialState = {
  registerChildRes: false,
  childsRes: null,
  profileRes: null,
  profileUpdateRes: null,
  accountInfoRes: null,
  accountUpdateRes: null,
  profilesRes: null,
  childProfileLoginRes: null,
  allOrganizationsRes: null,
  organizationCodeRes: null,
  deleteProfileRes: null, // Added new state for deleteProfile
  deleteAccountRes: null, // Added new state for deleteAccount
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(registerChild.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerChild.fulfilled, (state, action) => {
        state.registerChildRes = action.payload;
        state.isLoading = false;
      })
      .addCase(registerChild.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getChilds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getChilds.fulfilled, (state, action) => {
        state.childsRes = action.payload;
        state.isLoading = false;
      })
      .addCase(getChilds.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.profileRes = action.payload;
        state.isLoading = false;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileUpdateRes = action.payload;
        state.isLoading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(deleteProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state, action) => {
        state.deleteProfileRes = action.payload;
        state.isLoading = false;
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getAccountInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAccountInfo.fulfilled, (state, action) => {
        state.accountInfoRes = action.payload;
        state.isLoading = false;
      })
      .addCase(getAccountInfo.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(updateAccountInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAccountInfo.fulfilled, (state, action) => {
        state.accountUpdateRes = action.payload;
        state.isLoading = false;
      })
      .addCase(updateAccountInfo.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.deleteAccountRes = action.payload;
        state.isLoading = false;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getProfiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfiles.fulfilled, (state, action) => {
        state.profilesRes = action.payload;
        state.isLoading = false;
      })
      .addCase(getProfiles.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(childProfileLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(childProfileLogin.fulfilled, (state, action) => {
        state.childProfileLoginRes = action.payload;
        state.isLoading = false;
      })
      .addCase(childProfileLogin.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getAllOrganizations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrganizations.fulfilled, (state, action) => {
        state.allOrganizationsRes = action.payload.results;
        state.isLoading = false;
      })
      .addCase(getAllOrganizations.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getOrganizationCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrganizationCode.fulfilled, (state, action) => {
        state.organizationCodeRes = action.payload;
        state.isLoading = false;
      })
      .addCase(getOrganizationCode.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      });
  },
});

export default userSlice.reducer;
