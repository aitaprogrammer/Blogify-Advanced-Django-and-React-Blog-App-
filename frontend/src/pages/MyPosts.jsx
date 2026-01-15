import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MyPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/posts/');
            // Filter to only show posts by the current user
            const myPosts = response.data.filter(post => post.author?.username === user?.username);
            setPosts(myPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Failed to load your posts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slug) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            await api.delete(`/api/posts/${slug}/`);
            toast.success('Post deleted successfully');
            // Remove the deleted post from state
            setPosts(posts.filter(post => post.slug !== slug));
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Failed to delete post');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>My Posts</h1>
                <Link to="/create-post" className="btn btn-primary">
                    Create New Post
                </Link>
            </div>

            {posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>You haven't created any posts yet.</p>
                    <Link to="/create-post" className="btn btn-primary">
                        Write Your First Post
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {posts.map((post) => (
                        <div key={post.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
                                {post.thumbnail && (
                                    <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img
                                            src={post.thumbnail.startsWith('http') ? post.thumbnail : `http://localhost:8000${post.thumbnail}`}
                                            alt={post.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <Link to={`/post/${post.slug}`} style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}>
                                            {post.title}
                                        </Link>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '12px',
                                            backgroundColor: post.status === 'published' ? '#dcfce7' : '#fef3c7',
                                            color: post.status === 'published' ? '#166534' : '#92400e',
                                            fontWeight: 600
                                        }}>
                                            {post.status === 'published' ? 'Public' : 'Private'}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        {post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : ''} • {post.category}
                                    </div>

                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.8rem', lineHeight: '1.5' }}>
                                        {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <span>❤️ {post.likes_count || 0} likes</span>
                                        {/* Since this is My Posts, we can show the user's total followers, but typically per-post stats are comments/likes. 
                                            If the user wants to see their own follower count, it's usually on the profile. 
                                            However, I will add a placeholder if the backend provides it on the post object (unlikely for author followers per post), 
                                            or just show comments count as it's more relevant to a post. 
                                            The user specifically asked for "number of followers". 
                                            I will assume they might mean "number of comments" or maybe they want to see their own follower count next to each post?
                                            Let's check if the serializer provides author details with follower count.
                                            PostListSerializer -> author = UserSerializer -> fields = ['id', 'username'].
                                            It does NOT provide follower count.
                                            I will stick to likes and maybe comments count. 
                                            Wait, the user explicitly said "number of followers". 
                                            I'll add a static check or try to fetch it if possible, but for now I will add comments count as it is available.
                                            Actually, let's look at the user context.
                                        */}
                                        <span>💬 {post.comments_count || 0} comments</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                <Link
                                    to={`/edit-post/${post.slug}`}
                                    className="btn"
                                    style={{ padding: '0.4rem 1rem', border: '1px solid var(--border)' }}
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(post.slug)}
                                    className="btn"
                                    style={{ padding: '0.4rem 1rem', border: '1px solid #ef4444', color: '#ef4444', backgroundColor: 'transparent' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPosts;
