import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../services/api';
import toast from 'react-hot-toast';

const PostForm = ({ initialValues, isEditMode, onSubmit }) => {
    const [categories, setCategories] = useState([]);
    const [thumbnailPreview, setThumbnailPreview] = useState(initialValues?.thumbnail || null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/categories/');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    const formik = useFormik({
        initialValues: initialValues || {
            title: '',
            category: '',
            content: '',
            status: 'draft',
            thumbnail: null,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            title: Yup.string().required('Required'),
            category: Yup.string().required('Required'),
            content: Yup.string().required('Required'),
            status: Yup.string().oneOf(['draft', 'published']).required('Required'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('category_id', values.category); // Backend expects category_id
            formData.append('content', values.content);
            formData.append('status', values.status);

            if (values.thumbnail instanceof File) {
                formData.append('thumbnail', values.thumbnail);
            }

            await onSubmit(formData);
            setSubmitting(false);
        },
    });

    const handleThumbnailChange = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            formik.setFieldValue('thumbnail', file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    return (
        <form onSubmit={formik.handleSubmit} className="card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Title</label>
                <input
                    type="text"
                    className="input-field"
                    style={{ width: '100%' }}
                    {...formik.getFieldProps('title')}
                />
                {formik.touched.title && formik.errors.title && (
                    <div style={{ color: 'red', fontSize: '0.875rem' }}>{formik.errors.title}</div>
                )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
                <select
                    className="input-field"
                    style={{ width: '100%' }}
                    {...formik.getFieldProps('category')}
                >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                {formik.touched.category && formik.errors.category && (
                    <div style={{ color: 'red', fontSize: '0.875rem' }}>{formik.errors.category}</div>
                )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Thumbnail</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    style={{ marginBottom: '0.5rem' }}
                />
                {thumbnailPreview && (
                    <div style={{ marginTop: '0.5rem', width: '200px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img
                            src={typeof thumbnailPreview === 'string' && thumbnailPreview.startsWith('http') ? thumbnailPreview : thumbnailPreview}
                            alt="Preview"
                            style={{ width: '100%', display: 'block' }}
                        />
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Content</label>
                {/* ReactQuill might be causing issues with React 19. Using textarea for now. */}
                <textarea
                    className="input-field"
                    style={{ width: '100%', height: '200px', resize: 'vertical' }}
                    {...formik.getFieldProps('content')}
                />
                {formik.touched.content && formik.errors.content && (
                    <div style={{ color: 'red', fontSize: '0.875rem' }}>{formik.errors.content}</div>
                )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Visibility</label>
                <select
                    className="input-field"
                    style={{ width: '100%' }}
                    {...formik.getFieldProps('status')}
                >
                    <option value="draft">Private (Only you can see)</option>
                    <option value="published">Public (Everyone can see)</option>
                </select>
            </div>

            <button
                type="submit"
                className="btn btn-primary"
                disabled={formik.isSubmitting}
                style={{ width: '100%' }}
            >
                {formik.isSubmitting ? 'Saving...' : (isEditMode ? 'Update Post' : 'Create Post')}
            </button>
        </form>
    );
};

export default PostForm;
