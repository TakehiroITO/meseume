import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getContestsApi, getContestDetailApi, getMyContestsApi, submitContestWorkApi, getArtistClassesApi, getArtistClassDetailApi, artistClassSignUpApi, getArtistClassVideoUrlApi, confirmPaymentApi, getMyArtistClassesApi } from '../../api/contestApi';

export const getContests = createAsyncThunk('contest/getContests', async ({ page = 1, search = '', filter = '' }, thunkAPI) => {
  try {
    const response = await getContestsApi({ page, search, filter });
    return { data: response, page, search, filter };
  } catch (error) {
    console.error("Get Contests Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getContestDetail = createAsyncThunk('contest/getContestDetail', async (contestId, thunkAPI) => {
  try {
    const response = await getContestDetailApi(contestId);
    return response;
  } catch (error) {
    console.error("Get Contest Detail Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getMyContests = createAsyncThunk('contest/getMyContests', async ({ page = 1, search = '', filter = '' }, thunkAPI) => {
  try {
    const response = await getMyContestsApi({ page, search, filter });
    return { data: response, page, search, filter };
  } catch (error) {
    console.error("Get My Contests Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const submitContestWork = createAsyncThunk('contest/submitContestWork', async (body, thunkAPI) => {
  try {
    const response = await submitContestWorkApi(body);
    return response;
  } catch (error) {
    console.error("Submit Contest Work Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getArtistClasses = createAsyncThunk('contest/getArtistClasses', async ({ page = 1, search = '', filter = '', is_free = undefined, class_type = '', status = '' }, thunkAPI) => {
  try {
    const response = await getArtistClassesApi({ page, search, filter, is_free, class_type, status });
    return { data: response, page, search, filter, is_free, class_type, status };
  } catch (error) {
    console.error("Get Artist Classes Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getArtistClassDetail = createAsyncThunk('contest/getArtistClassDetail', async (artistClassId, thunkAPI) => {
  try {
    const response = await getArtistClassDetailApi(artistClassId);
    return response;
  } catch (error) {
    console.error("Get Artist Class Detail Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const artistClassSignUp = createAsyncThunk('contest/artistClassSignUp', async (body, thunkAPI) => {
  try {
    const response = await artistClassSignUpApi(body);
    return response;
  } catch (error) {
    console.error("Artist Class SignUp Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getArtistClassVideoUrl = createAsyncThunk('contest/getArtistClassVideoUrl', async (classId, thunkAPI) => {
  try {
    const response = await getArtistClassVideoUrlApi(classId);
    return response;
  } catch (error) {
    console.error("Get Artist Class Video URL Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const confirmPayment = createAsyncThunk('contest/confirmPayment', async (paymentIntent, thunkAPI) => {
  try {
    const response = await confirmPaymentApi(paymentIntent);
    return response;
  } catch (error) {
    console.error("Confirm Payment Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getMyArtistClasses = createAsyncThunk('contest/getMyArtistClasses', async ({ page = 1, search = '', is_free = undefined, class_type = '', status = '' }, thunkAPI) => {
  try {
    const response = await getMyArtistClassesApi({ page, search, is_free, class_type, status });
    return { data: response, page, search, is_free, class_type, status };
  } catch (error) {
    console.error("Get My Artist Classes Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

const initialState = {
  contests: null,
  contestDetail: null,
  signupRes: null,
  myContests: null,
  artistClasses: null,
  artistDetail: null,
  artistClassVideoUrl: null, // Added artistClassVideoUrl to the state
  myArtistClasses: null, // Added myArtistClasses to the state
  isLoading: false,
  error: null,
};

const contestSlice = createSlice({
  name: 'contest',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getContests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getContests.fulfilled, (state, action) => {
        if (action.payload.page === 1) {
          state.contests = action.payload.data;
        } else {
          state.contests = {
            ...state.contests,
            results: [...state.contests.results, ...action.payload.data.results],
            next: action.payload.data.next,
            search: action.payload.search,
            filter: action.payload.filter
          };
        }
        state.isLoading = false;
      })
      .addCase(getContests.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getContestDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getContestDetail.fulfilled, (state, action) => {
        state.contestDetail = action.payload;
        state.isLoading = false;
      })
      .addCase(getContestDetail.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getMyContests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyContests.fulfilled, (state, action) => {
        if (action.payload.page === 1) {
          state.myContests = action.payload.data;
        } else {
          state.myContests = {
            ...state.myContests,
            results: [...state.myContests.results, ...action.payload.data.results],
            next: action.payload.data.next,
            search: action.payload.search,
            filter: action.payload.filter
          };
        }
        state.isLoading = false;
      })
      .addCase(getMyContests.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(submitContestWork.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitContestWork.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(submitContestWork.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getArtistClasses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getArtistClasses.fulfilled, (state, action) => {
        const isFirstPage = action.meta.arg.page === 1;
        
        state.artistClasses = isFirstPage 
          ? action.payload.data // If first page, replace everything
          : {
              ...action.payload.data,
              results: [
                ...new Map(
                  [
                    ...(state.artistClasses?.results || []),
                    ...(action.payload.data.results || [])
                  ].map(item => [item.id, item])
                ).values()
              ]
            };
        state.isLoading = false;
      })
      .addCase(getArtistClasses.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getArtistClassDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getArtistClassDetail.fulfilled, (state, action) => {
        state.artistDetail = action.payload;
        state.isLoading = false;
      })
      .addCase(getArtistClassDetail.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(artistClassSignUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(artistClassSignUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.signupRes = action.payload;
      })
      .addCase(artistClassSignUp.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getArtistClassVideoUrl.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getArtistClassVideoUrl.fulfilled, (state, action) => {
        state.artistClassVideoUrl = action.payload.url;
        state.isLoading = false;
      })
      .addCase(getArtistClassVideoUrl.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(confirmPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getMyArtistClasses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyArtistClasses.fulfilled, (state, action) => {
        const isFirstPage = action.meta.arg.page === 1;
        
        state.myArtistClasses = isFirstPage 
          ? action.payload.data // If first page, replace everything
          : {
              ...action.payload.data,
              results: [
                ...new Map(
                  [
                    ...(state.myArtistClasses?.results || []),
                    ...(action.payload.data.results || [])
                  ].map(item => [item.id, item])
                ).values()
              ]
            };
        state.isLoading = false;
      })
      .addCase(getMyArtistClasses.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      });
  },
});

export default contestSlice.reducer;
