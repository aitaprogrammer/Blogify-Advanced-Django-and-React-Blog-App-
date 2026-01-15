import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import PostForm from '../components/PostForm';

const EditPost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [initialValues, setInitialValues] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/api/posts/${slug}/`);
                const post = response.data;
                // Transform data to match form structure if needed
                setInitialValues({
                    title: post.title,
                    category: post.category_id || post.category?.id || '', // Handle different serializer outputs
                    content: post.content,
                    status: post.status,
                    thumbnail: post.thumbnail, // URL for preview
                });
            } catch (error) {
                console.error('Error fetching post:', error);
                toast.error('Failed to load post details');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug, navigate]);

    const handleSubmit = async (formData) => {
        try {
            const response = await api.put(`/api/posts/${slug}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Post updated successfully!');
            navigate(`/post/${response.data.slug}`);
        } catch (error) {
            console.error('Error updating post:', error);
            toast.error('Failed to update post.');
        }
    };

    if (loading) return <div className="spinner" style={{ margin: '4rem auto' }}></div>;

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '2rem 1.5rem' }}>
            <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Edit Post</h1>
            <PostForm
                initialValues={initialValues}
                isEditMode={true}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default EditPost;
