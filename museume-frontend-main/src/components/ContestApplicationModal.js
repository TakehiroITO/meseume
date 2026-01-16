import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, X } from 'lucide-react';
import { addWork, getMyWorks } from '../redux/slices/workSlice';
import { getContestDetail, submitContestWork } from '../redux/slices/contestSlice';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

const ContestApplyModal = ({ isOpen, onClose, contestId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, tags, addWorkRes } = useSelector((state) => state.work);
  const [images, setImages] = useState([]);

  // Validation Schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required(t('Title is required')),
    comments: Yup.string()
      .required(t('Comments are required')),
    category: Yup.array()
      .min(1, t('Category is required'))
      .required(t('Category is required')),
    tags: Yup.array()
      .min(0, t('At least one tag is required'))
      .required(t('Tag is required')),
    images: Yup.array()
      .min(1, t('At least one image is required'))
      .max(5, t('Maximum 5 images are allowed'))
      .required(t('Image is required')),
  });

  const formik = useFormik({
    initialValues: {
      images: [],
      title: '',
      comments: '',
      category: [],
      tags: [],
      isPublished: false
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      values.images.forEach((image) => formData.append('images', image));
      formData.append('title', values.title);
      formData.append('description', values.comments);
      values.category.forEach((categoryId) => {
        formData.append('category', categoryId);
      });
      values.tags.forEach((tag) => {
        formData.append('tags', tag);
      });
      formData.append('is_public', values.isPublished);

      await dispatch(addWork(formData)).then(async (action) => {
        if (action.payload) {
          const workId = action.payload.id; // Assuming the response contains the work ID
          if (!workId) {
            console.error('Work ID not found in response');
            return;
          }
          await dispatch(submitContestWork({
            contest: contestId,
            work: workId
          })).unwrap();
          console.log(t('Work submitted successfully and contest submission successful'));
          navigate('/my-contests');
          // // Reset form and images state
          // formik.resetForm();
          // setImages([]);
          // onClose();
          // // Call API to fetch latest contest details
          // dispatch(getContestDetail(contestId));
        }
      });

    },
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert(t('You can only upload up to 5 images'));
      return;
    }

    // If current images plus new files would exceed 5
    if (images.length + files.length > 5) {
      alert(t('Total number of images cannot exceed 5'));
      return;
    }

    setImages([...images, ...files].slice(0, 5));
    formik.setFieldValue('images', [...images, ...files].slice(0, 5));
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    formik.setFieldValue('images', newImages);
  };

  const handleTagSelect = (e) => {
    const tagId = e.target.value;
    if (tagId && !formik.values.tags.includes(tagId)) {
      const newTags = [...formik.values.tags, tagId];
      formik.setFieldValue('tags', newTags);
    }
  };

  const removeTag = (tagId) => {
    const newTags = formik.values.tags.filter(tag => tag !== tagId);
    formik.setFieldValue('tags', newTags);
  };

  if (!isOpen) return null;

  return (
    <div className="apply-contest-modal">
      <div className="apply-contest-modal-content">
        <div className="apply-contest-modal-header">
          <h2 className="apply-contest-modal-title">{t('Upload and enter this contest')}</h2>
          <button className="apply-contest-close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="apply-contest-modal-body">
          <form onSubmit={formik.handleSubmit}>
            <div className="apply-contest-form-group">
              <label className="apply-contest-form-label">{t('Image of the work')}</label>
              <div className="apply-contest-upload-area">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload"
                  disabled={images.length >= 5}
                />
                <label htmlFor="image-upload">
                  <Upload className="apply-contest-upload-icon" />
                  <div className="apply-contest-upload-text">{t('Upload Image')}</div>
                  <div className="apply-contest-upload-limit">{t('up to a maximum of 5 pieces')}</div>
                </label>
              </div>

              <div className="uploaded-images">
                {images.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img 
                      src={URL.createObjectURL(image)} 
                      alt={`preview-${index}`} 
                      className="image-thumbnail" 
                    />
                    <button 
                      type="button" 
                      className="image-remove" 
                      onClick={() => handleRemoveImage(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {formik.touched.images && formik.errors.images && (
                <div className="error-message">{formik.errors.images}</div>
              )}
            </div>

            <div className="apply-contest-form-group">
              <label className="apply-contest-form-label">{t('Title')}</label>
              <input
                type="text"
                className={`apply-contest-form-input ${formik.touched.title && formik.errors.title ? 'error-input' : ''}`}
                placeholder={t('Title of work')}
                {...formik.getFieldProps('title')}
              />
              {formik.touched.title && formik.errors.title && (
                <div className="error-message">{formik.errors.title}</div>
              )}
            </div>

            <div className="apply-contest-form-group">
              <label className="apply-contest-form-label">{t('Comments on the work')}</label>
              <textarea
                className={`apply-contest-form-textarea ${formik.touched.comments && formik.errors.comments ? 'error-input' : ''}`}
                placeholder={t('Please write your comments on the artwork.')}
                {...formik.getFieldProps('comments')}
              />
              {formik.touched.comments && formik.errors.comments && (
                <div className="error-message">{formik.errors.comments}</div>
              )}
            </div>

            <div className="apply-contest-form-group">
              <label className="apply-contest-form-label">{t('publish settings')}</label>
              <label className="apply-contest-toggle-switch">
                <input
                  type="checkbox"
                  {...formik.getFieldProps('isPublished')}
                />
                <span className="apply-contest-toggle-slider"></span>
              </label>
            </div>

            <div className="apply-contest-form-group">
              <label className="apply-contest-form-label">{t('Category Settings')}</label>
              <select
                className={`apply-contest-form-select ${formik.touched.category && formik.errors.category ? 'error-input' : ''}`}
                value={formik.values.category[0] || ''}
                onChange={(e) => formik.setFieldValue('category', [e.target.value])}
              >
                <option value="">{t('Select a category')}</option>
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

            {/* <div className="apply-contest-form-group">
              <label className="apply-contest-form-label">{t('Select a tag')}</label>
              <div className={`tags-input-container ${formik.touched.tags && formik.errors.tags ? 'error' : ''}`}>
                <div className="tags-list">
                  {formik.values.tags.map((tagId) => {
                    const tag = tags.find(t => t.id === +tagId);
                    return (
                      <span key={tagId} className="tag-badge">
                        {tag?.name}
                        <button
                          type="button"
                          className="tag-remove-btn"
                          onClick={() => removeTag(tagId)}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
                <select
                  value=""
                  onChange={handleTagSelect}
                  className="tags-dropdown"
                >
                  <option value="">{t('Select Tag')}</option>
                  {tags
                    .filter(tag => !formik.values.tags.includes(tag.id))
                    .map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                </select>
              </div>
              {formik.touched.tags && formik.errors.tags && (
                <div className="error-message">{formik.errors.tags}</div>
              )}
            </div> */}

            <button type="submit" className="apply-contest-button apply-contest-button-primary">
              {t('Submit a work with this content')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContestApplyModal;