import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import PostForm from '../components/PostForm';

const CreatePost = () => {
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        try {
            const response = await api.post('/api/posts/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Post created successfully!');
            navigate(`/post/${response.data.slug}`);
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('Failed to create post.');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '2rem 1.5rem' }}>
            <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Create New Post</h1>
            <PostForm isEditMode={false} onSubmit={handleSubmit} />
        </div>
    );
};

export default CreatePost;
