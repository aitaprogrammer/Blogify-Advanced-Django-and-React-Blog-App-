import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import CommentList from '../components/Comments/CommentList';

const PostDetail = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Like State
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/posts/${slug}/`);
                setPost(response.data);
                setLikesCount(response.data.likes_count || 0);
                setLiked(response.data.is_liked || false);
            } catch (err) {
                console.error('Error fetching post:', err);
                setError('Failed to load post.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug]);

    const handleLike = async () => {
        if (!user) {
            toast.error('Please login to like posts');
            return;
        }

        if (liked) {
            return; // Already liked, do nothing
        }

        // Optimistic Update
        setLiked(true);
        setLikesCount(likesCount + 1);

        try {
            const response = await api.post(`/api/posts/${slug}/like/`);
            // Ensure state matches server response
            setLiked(response.data.is_liked);
            setLikesCount(response.data.likes_count);
        } catch (error) {
            console.error('Error liking post:', error);
            toast.error('Failed to like post');
            // Revert on error
            setLiked(false);
            setLikesCount(likesCount);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Post not found</h2>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Home</Link>
            </div>
        );
    }

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '2rem 1.5rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                ← Back to Home
            </Link>

            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    {post.category && (
                        <span style={{
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            padding: '0.2rem 0.8rem',
                            borderRadius: '999px',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}>
                            {post.category.name || post.category}
                        </span>
                    )}
                </div>

                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
                    {post.title}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to={`/profile/${post.author?.username}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {post.author?.username?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{post.author?.username || 'Anonymous'}</div>
                                <div style={{ fontSize: '0.85rem' }}>
                                    {post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : ''}
                                </div>
                            </div>
                        </Link>
                    </div>

                    <button
                        onClick={handleLike}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'none',
                            border: 'none',
                            cursor: liked ? 'default' : 'pointer',
                            color: liked ? '#ef4444' : 'var(--text-muted)',
                            transition: 'transform 0.2s',
                            fontSize: '1rem',
                            fontWeight: 500,
                            opacity: liked ? 1 : 0.8
                        }}
                        onMouseDown={(e) => !liked && (e.currentTarget.style.transform = 'scale(0.9)')}
                        onMouseUp={(e) => !liked && (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill={liked ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span>{likesCount} Likes</span>
                    </button>
                </div>
            </header>

            {post.thumbnail && (
                <div style={{ marginBottom: '3rem', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <img
                        src={getImageUrl(post.thumbnail)}
                        alt={post.title}
                        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                    />
                </div>
            )}

            <div
                className="post-content"
                style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-main)' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {post.tags && post.tags.length > 0 && (
                <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 1rem 0' }}>Tags</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {post.tags.map(tag => (
                            <span key={tag.name || tag} style={{
                                backgroundColor: '#f1f5f9',
                                padding: '0.3rem 0.8rem',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                color: 'var(--text-muted)'
                            }}>
                                #{tag.name || tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <CommentList slug={slug} />
        </div>
    );
};

export default PostDetail;
