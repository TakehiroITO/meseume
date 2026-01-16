import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addWorkApi, getMyWorksApi, getTagsApi, getCategoriesApi, getPublicWorksApi, getMyCollectionApi, getMemberWorkApi, likeWorkApi, unlikeWorkApi, getWorkDetailApi, getFamilyGalleryApi, deleteWorkApi, updateWorkApi } from '../../api/workApi';

export const addWork = createAsyncThunk('work/addWork', async (workData, thunkAPI) => {
  try {
    const response = await addWorkApi(workData);
    return response;
  } catch (error) {
    console.error("Add Work Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getMyWorks = createAsyncThunk('work/getMyWorks', async ({ page = 1, search = '', category = '', tags = ''}, thunkAPI) => {
  try {
    const response = await getMyWorksApi({ page, search, category, tags });
    return { data: response, page, search, category, tags };
  } catch (error) {
    console.error("Get Works Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getTags = createAsyncThunk('work/getTags', async (_, thunkAPI) => {
  try {
    const response = await getTagsApi();
    return response;
  } catch (error) {
    console.error("Get Tags Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getCategories = createAsyncThunk('work/getCategories', async (_, thunkAPI) => {
  try {
    const response = await getCategoriesApi();
    return response;
  } catch (error) {
    console.error("Get Categories Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getPublicWorks = createAsyncThunk('work/getPublicWorks', async ({ page = 1, search = '', category = '', tags = '', isLike = false }, thunkAPI) => {
  try {
    const response = await getPublicWorksApi({ page, search, category, tags });
    return { data: response, isLike, page, search, category, tags };
  } catch (error) {
    console.error("Get Public Works Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getMyCollection = createAsyncThunk('work/getMyCollection', async ({ page = 1, search = '', category = '', tags = '' }, thunkAPI) => {
  try {
    const response = await getMyCollectionApi({ page, search, category, tags });
    return { data: response, page, search, category, tags };
  } catch (error) {
    console.error("Get My Collection Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getMemberWork = createAsyncThunk('work/getMemberWork', async ({id,  page = 1, search = '', category = '', tags = ''}, thunkAPI) => {
  try {
    const response = await getMemberWorkApi({id,  page, search, category, tags});
    return response;
  } catch (error) {
    console.error("Get Member Work Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const likeWork = createAsyncThunk('work/likeWork', async (id, thunkAPI) => {
  try {
    const response = await likeWorkApi(id);
    return response;
  } catch (error) {
    console.error("Like Work Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const unlikeWork = createAsyncThunk('work/unlikeWork', async (id, thunkAPI) => {
  try {
    const response = await unlikeWorkApi(id);
    return response;
  } catch (error) {
    console.error("Unlike Work Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getWorkDetail = createAsyncThunk('work/workDetail', async (id, thunkAPI) => {
  try {
    const response = await getWorkDetailApi(id);
    return response;
  } catch (error) {
    console.error("Work detail Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getFamilyGallery = createAsyncThunk('work/getFamilyGallery', async ({ page = 1, search = '', category = '', tags = '', isLike = false }, thunkAPI) => {
  try {
    const response = await getFamilyGalleryApi({ page, search, category, tags });
    return { data: response, isLike, page, search, category, tags };
  } catch (error) {
    console.error("Get Family Gallery Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const deleteWork = createAsyncThunk('work/deleteWork', async (id, thunkAPI) => {
  try {
    const response = await deleteWorkApi(id);
    return response;
  } catch (error) {
    console.error("Delete Work Thunk error:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const updateWork = createAsyncThunk(
  'work/updateWork',
  async ({id, formData}, thunkAPI) => {
    try {
      const response = await updateWorkApi(id, formData);
      return response;
    } catch (error) {
      console.error("Update Work Thunk error:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = {
  addWorkRes: null,
  publicWorks: null,
  familyGallery: null,
  works: [],
  tags: [],
  categories: [],
  myCollection: [],
  memberWork: null,
  workDetail: null,
  isLoading: false,
  error: null,
  deleteWorkRes: false,
  editRes: false,
};

const workSlice = createSlice({
  name: 'work',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(addWork.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addWork.fulfilled, (state, action) => {
        state.addWorkRes = action.payload;
        state.isLoading = false;
      })
      .addCase(addWork.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getMyWorks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyWorks.fulfilled, (state, action) => {
        if (action.payload.page === 1 ) {
          state.works = action.payload.data;
        } else {
          state.works = {
            ...state.works,
            results: [...state.works.results, ...action.payload.data.results],
            next: action.payload.data.next,
            search: action.payload.search,
            category: action.payload.category,
            tags: action.payload.tags,
          };
        }
        state.isLoading = false;
      })
      .addCase(getMyWorks.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getTags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTags.fulfilled, (state, action) => {
        state.tags = action.payload;
        state.isLoading = false;
      })
      .addCase(getTags.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.isLoading = false;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getPublicWorks.pending, (state, action) => {
        state.isLoading = action.meta.arg.isLike ? false : true;
        state.error = null;
      })
      .addCase(getPublicWorks.fulfilled, (state, action) => {
        if (action.payload.isLike || action.payload.page === 1) {
          console.log("action.payload pgae", action.payload.page)
          state.publicWorks = action.payload.data;
        } else {
          state.publicWorks = {
            ...state.publicWorks,
            results: [...state.publicWorks.results, ...action.payload.data.results],
            next: action.payload.data.next,
            search: action.payload.search,
            category: action.payload.category,
            tags: action.payload.tags,
          };
        }
        state.isLoading = false;
      })
      .addCase(getPublicWorks.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getMyCollection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyCollection.fulfilled, (state, action) => {
        if (action.payload.page === 1 ) {
          state.myCollection = action.payload.data;
        } else {
          state.myCollection = {
            ...state.myCollection,
            results: [...state.myCollection.results, ...action.payload.data.results],
            next: action.payload.data.next,
            search: action.payload.search,
            category: action.payload.category,
            tags: action.payload.tags,
          };
        }
        state.isLoading = false;
      })
      .addCase(getMyCollection.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getMemberWork.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMemberWork.fulfilled, (state, action) => {
        state.memberWork = action.payload;
        state.isLoading = false;
      })
      .addCase(getMemberWork.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(likeWork.pending, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(likeWork.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(likeWork.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(unlikeWork.pending, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(unlikeWork.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(unlikeWork.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getWorkDetail.pending, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getWorkDetail.fulfilled, (state, action) => {
        console.log("action.payeload", action.payload)
        state.isLoading = false;
        state.workDetail = action.payload;
      })
      .addCase(getWorkDetail.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(getFamilyGallery.pending, (state, action) => {
        state.isLoading = action.meta.arg.isLike ? false : true;
        state.error = null;
      })
      .addCase(getFamilyGallery.fulfilled, (state, action) => {
        if (action.payload.isLike || action.payload.page === 1) {
          state.familyGallery = action.payload.data;
        } else {
          state.familyGallery = {
            ...state.familyGallery,
            results: [...state.familyGallery.results, ...action.payload.data.results],
            next: action.payload.data.next,
            search: action.payload.search,
            category: action.payload.category,
            tags: action.payload.tags,
          };
        }
        state.isLoading = false;
      })
      .addCase(getFamilyGallery.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(deleteWork.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWork.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deleteWorkRes = true;
        
        // Remove deleted work from works list
        const deletedId = action.meta.arg;
        if (state.works?.results) {
          state.works.results = state.works.results.filter(work => work.id !== deletedId);
        }
        if (state.familyGallery?.results) {
          state.familyGallery.results = state.familyGallery.results.filter(work => work.id !== deletedId);
        }
      })
      .addCase(deleteWork.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      .addCase(updateWork.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWork.fulfilled, (state, action) => {
        state.editRes = true;
        state.isLoading = false;
      })
      .addCase(updateWork.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      });
  },
  reducers: {
    resetWorkState: (state) => {
      state.deleteWorkRes = false;
      state.editRes = false;
      state.error = null;
    },
  },
});

export const { resetWorkState } = workSlice.actions;
export default workSlice.reducer;
