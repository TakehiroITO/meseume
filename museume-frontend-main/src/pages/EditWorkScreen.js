import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import Navigation from './Navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { getWorkDetail, updateWork, deleteWork, getCategories, getTags, resetWorkState } from '../redux/slices/workSlice';
import Loader from '../components/Loader';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const EditWorkForm = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, workDetail, updateWorkRes, deleteWorkRes, categories, tags, editRes } = useSelector((state) => state.work);
  const location = useLocation();
  const workId = location.state?.id;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getTags());
  }, [dispatch]);

  useEffect(() => {
    if (workId) {
      dispatch(getWorkDetail(workId));
    }
  }, [dispatch, workId]);

  const convertImageDataToFiles = async (imageData) => {
    if (!imageData || !Array.isArray(imageData)) return [];
    
    const filePromises = imageData.map(async (img) => {
      // Check if image is already a File object
      if (img instanceof File) return img;
      
      try {
        // Get image URL (handle both object format and string format)
        let imageUrl = img.image_url || img.url || img;
        
        // Convert HTTP to HTTPS to prevent Mixed Content errors
        if (imageUrl.startsWith('http://')) {
          imageUrl = imageUrl.replace('http://', 'https://');
        }
        
        // Fetch the image
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        // Extract filename from URL
        const fileName = imageUrl.split('/').pop() || 'image.jpg';
        
        // Create a File object
        return new File([blob], fileName, { type: blob.type });
      } catch (error) {
        console.error('Error converting image to File:', error);
        return null;
      }
    });
    
    const files = await Promise.all(filePromises);
    return files.filter(file => file !== null);
  };

  useEffect(() => {
    const initializeForm = async () => {
      if (workDetail) {
        // Convert image data to File objects for preview
        const imageFiles = await convertImageDataToFiles(workDetail.images_data);
        setImages(imageFiles);
        
        setSelectedTags(workDetail.tags.map(tag => tag.id));
        
        formik.setValues({
          title: workDetail.title || '',
          comments: workDetail.description || '',
          category: workDetail.category?.id || '',
          tags: workDetail.tags.map(tag => tag.id) || [],
          isIndicated: workDetail.is_public || false,
          images: imageFiles || []
        });
        
        // Explicitly set the isIndicated field
        formik.setFieldValue('isIndicated', Boolean(workDetail.is_public));
      }
    };
    
    initializeForm();
  }, [workDetail]);

  // Validation Schema
  const validationSchema = Yup.object({
    tags: Yup.array()
      .min(0, t('At least one tag is required'))
      .required(t('Tag is required')),
    images: Yup.array()
      .max(5, t('Maximum 5 images are allowed')),
  });

  const formik = useFormik({
    initialValues: {
      images: [],
      title: '',
      comments: '',
      category: '',
      tags: [],
      isIndicated: false,
    },
    validationSchema,
    onSubmit: (values) => {
      const formData = new FormData();
      
      // Add title and description
      formData.append('title', values.title);
      formData.append('description', values.comments);
      
      // Add category if selected
      if (values.category) {
        formData.append('category', values.category);
      }
      
      // Add is_public boolean
      formData.append('is_public', values.isIndicated);
      
      // Add tags if any
      if (values.tags && values.tags.length > 0) {
        values.tags.forEach(tag => {
          formData.append('tags', tag);
        });
      }
      
      // Add images - only include File objects
      const imageFiles = values.images.filter(img => img instanceof File);
      if (imageFiles.length > 0) {
        imageFiles.forEach(image => {
          formData.append('images', image);
        });
      }
      
      // Dispatch with correct parameter structure
      dispatch(updateWork({
        id: workDetail.id,
        formData: formData
      }));
    }
  });

  useEffect(() => {
    if (updateWorkRes?.id) {
      formik.resetForm();
      setImages([]);
      setSelectedTags([]);
      navigate('/my-work');
    }
  }, [updateWorkRes, navigate]);

  useEffect(() => {
    if (deleteWorkRes || editRes) {
      dispatch(resetWorkState());
      navigate('/my-work');
    }
  }, [deleteWorkRes, editRes, navigate, dispatch]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files?.length > 5) {
      alert(t('You can only upload up to 5 images'));
      return;
    }

    // If current images plus new files would exceed 5
    if (images?.length + files?.length > 5) {
      alert(t('Total number of images cannot exceed 5'));
      return;
    }

    setImages([...images, ...files].slice(0, 5));
    formik.setFieldValue('images', [...images, ...files].slice(0, 5));
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    formik.setFieldValue('images', newImages);
  };

  const handleTagSelect = (e) => {
    const tagId = e.target.value;
    if (tagId && !selectedTags.includes(tagId)) {
      const newTags = [...selectedTags, tagId];
      setSelectedTags(newTags);
      formik.setFieldValue('tags', newTags);
    }
  };

  const removeTag = (tagIdToRemove) => {
    const newTags = selectedTags.filter(tagId => tagId !== tagIdToRemove);
    setSelectedTags(newTags);
    formik.setFieldValue('tags', newTags);
  };

  // Helper function to safely get image URLs for preview
  const getImagePreviewUrl = (image) => {
    if (!image) return '';
    
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    
    if (typeof image === 'string') {
      return image;
    }
    
    return image.image_url || image.url || '';
  };

  if (isLoading && !workDetail) {
    return <Loader />;
  }

  return (
    <>
      <Navigation />
      <form onSubmit={formik.handleSubmit} className="register-work-container">
        <h1 className="form-title-work">{t('Edit your work')}</h1>

        <div className="form-section">
          <label className="work-labal-class">{t('Image of the work')}</label>
          <div className="upload-container">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
              id="image-upload"
              disabled={images?.length >= 5}
            />
            <label htmlFor="image-upload" className="upload-area">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Upload className="upload-icon" />
              </div>
              <span className="upload-text-work">{t('Upload Image')}</span>
              <span className="upload-limit">({t('up to a maximum of 5 pieces')})</span>
            </label>
          </div>
          {formik.touched.images && formik.errors.images && (
            <div className="error-message">{formik.errors.images}</div>
          )}
        </div>

        <div className="uploaded-images">
          {images?.map((image, index) => (
            <div key={index} className="image-preview">
              <img 
                src={getImagePreviewUrl(image)} 
                alt={`preview-${index}`} 
                className="image-thumbnail" 
              />
              <button type="button" className="image-remove" onClick={() => removeImage(index)}>
                &times;
              </button>
            </div>
          ))}
        </div>

        <div className="form-section">
          <label className="work-labal-class">{t('Title')}</label>
          <input
            type="text"
            placeholder={t('Title of work')}
            {...formik.getFieldProps('title')}
            className={`text-input ${formik.touched.title && formik.errors.title ? 'error-input' : ''}`}
          />
          {formik.touched.title && formik.errors.title && (
            <div className="error-message">{formik.errors.title}</div>
          )}
        </div>

        <div className="form-section">
          <label className="work-labal-class">{t('Comments on the work')}</label>
          <textarea
            placeholder={t('Please write your comments on the artwork.')}
            {...formik.getFieldProps('comments')}
            className={`text-area ${formik.touched.comments && formik.errors.comments ? 'error-input' : ''}`}
          />
          {formik.touched.comments && formik.errors.comments && (
            <div className="error-message">{formik.errors.comments}</div>
          )}
        </div>

        <div className="publish-settings">
          <div className="publish-settings-title">{t('publish settings')}</div>
          <div className="switches-container">
            <div className="switch-group">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={formik.values.isIndicated}
                  onChange={(e) => {
                    formik.setFieldValue('isIndicated', e.target.checked);
                  }}
                />
                <span className="slider"></span>
              </label>
              {/* <span className="switch-label">{t('Make public')}</span> */}
            </div>
          </div>
        </div>

        <div className="form-section">
          <label className="work-labal-class">{t('Category Settings')}</label>
          <select
            {...formik.getFieldProps('category')}
            className={`select-input ${formik.touched.category && formik.errors.category ? 'error-input' : ''}`}
          >
            <option value="" disabled>{t('Select a category')}</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {formik.touched.category && formik.errors.category && (
            <div className="error-message">{formik.errors.category}</div>
          )}
        </div>
        
        {/* <div className="form-section">
          <label className="work-labal-class">{t('Tags')}</label>
          <select
            onChange={handleTagSelect}
            className="select-input"
            value=""
          >
            <option value="" disabled>{t('Select tags')}</option>
            {tags?.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          
          <div className="selected-tags">
            {selectedTags.map((tagId) => {
              const tag = tags?.find(t => t.id === tagId) || { id: tagId, name: tagId };
              return (
                <div key={tagId} className="tag-item">
                  {tag.name}
                  <button type="button" onClick={() => removeTag(tagId)} className="tag-remove">
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        </div> */}

        <div className="button-group">
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? t('Updating...') : t('Update your work with this content')}
          </button>
          <button type="button" className="delete-button" onClick={() => setShowDeleteConfirm(true)} style={{
            width: '100%',
            padding: '12px',
            marginTop: '24px',
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}>
            {t('Delete your work')}
          </button>
        </div>
      </form>

      {showDeleteConfirm && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>
              <X size={18} />
            </button>
            <h3>{t('Delete Work')}</h3>
            <p>{t('Are you sure you want to delete this work?')}</p>
            
            <div className="delete-confirm-checkbox">
              <input
                type="checkbox"
                id="confirm-delete"
                checked={deleteConfirmed}
                onChange={(e) => setDeleteConfirmed(e.target.checked)}
              />
              <label htmlFor="confirm-delete">{t('I understand that this action cannot be undone')}</label>
            </div>

            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>{t('Cancel')}</button>
              <button
                className="delete-confirm"
                onClick={() => {
                  dispatch(deleteWork(workDetail.id)).then(() => {
                    navigate('/my-work');
                  });
                }}
                disabled={!deleteConfirmed}
              >
                {t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditWorkForm;