import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CommentForm = ({ slug, onCommentAdded }) => {
    const formik = useFormik({
        initialValues: {
            body: '',
        },
        validationSchema: Yup.object({
            body: Yup.string().required('Required').min(3, 'Too short'),
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                await api.post(`/api/posts/${slug}/add_comment/`, { body: values.body });
                toast.success('Comment added!');
                resetForm();
                if (onCommentAdded) onCommentAdded();
            } catch (error) {
                console.error('Error adding comment:', error);
                toast.error('Failed to add comment.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <textarea
                    name="body"
                    placeholder="Write a comment..."
                    rows="3"
                    className="input-field"
                    style={{ width: '100%', resize: 'vertical' }}
                    {...formik.getFieldProps('body')}
                />
                {formik.touched.body && formik.errors.body ? (
                    <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>{formik.errors.body}</div>
                ) : null}
            </div>
            <button
                type="submit"
                className="btn btn-primary"
                disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
            >
                {formik.isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
        </form>
    );
};

export default CommentForm;
