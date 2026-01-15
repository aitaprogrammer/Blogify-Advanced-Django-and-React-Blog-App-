import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
    const { user } = useAuth();
    const [liked, setLiked] = useState(post.is_liked || false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    const handleLike = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please login to like posts');
            return;
        }

        if (liked) {
            return;
        }

        setLiked(true);
        setLikesCount(likesCount + 1);

        try {
            await api.post(`/api/posts/${post.slug}/like/`);
        } catch (error) {
            console.error('Error liking post:', error);
            toast.error('Failed to like post');
            setLiked(false);
            setLikesCount(likesCount);
        }
    };

    return (
        <article className="card" style={{
            padding: 0,
            overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
            }}
        >
            <Link to={`/post/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    {post.thumbnail && (
                        <div style={{
                            width: '200px',
                            height: '200px',
                            flexShrink: 0,
                            overflow: 'hidden',
                            backgroundColor: '#f1f5f9'
                        }}>
                            <img
                                src={getImageUrl(post.thumbnail)}
                                alt={post.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                    )}

                    <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                {post.category && (
                                    <span style={{
                                        backgroundColor: '#e0f2fe',
                                        color: '#0369a1',
                                        padding: '0.2rem 0.8rem',
                                        borderRadius: '999px',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {post.category}
                                    </span>
                                )}
                                {post.status === 'draft' && (
                                    <span style={{
                                        backgroundColor: '#fef3c7',
                                        color: '#92400e',
                                        padding: '0.2rem 0.8rem',
                                        borderRadius: '999px',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase'
                                    }}>
                                        Private
                                    </span>
                                )}
                            </div>

                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                margin: '0 0 0.5rem 0',
                                lineHeight: 1.3,
                                color: 'var(--text-main)'
                            }}>
                                {post.title}
                            </h2>

                            {post.content && (
                                <p style={{
                                    color: 'var(--text-muted)',
                                    margin: 0,
                                    lineHeight: 1.6,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                </p>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid var(--border)'
                        }}>
                            <Link
                                to={`/profile/${post.author?.username}`}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            >
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem'
                                }}>
                                    {post.author?.username?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                        {post.author?.username || 'Anonymous'}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : ''}
                                    </div>
                                </div>
                            </Link>

                            <button
                                onClick={handleLike}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: liked ? '#fef2f2' : 'transparent',
                                    border: `1px solid ${liked ? '#ef4444' : 'var(--border)'}`,
                                    borderRadius: '999px',
                                    cursor: liked ? 'default' : 'pointer',
                                    color: liked ? '#ef4444' : 'var(--text-muted)',
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (!liked) {
                                        e.currentTarget.style.borderColor = '#ef4444';
                                        e.currentTarget.style.color = '#ef4444';
                                        e.currentTarget.style.background = '#fef2f2';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!liked) {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.color = 'var(--text-muted)';
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill={liked ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                {likesCount}
                            </button>
                        </div>

                        {post.first_comment && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                borderLeft: '3px solid var(--primary)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                        {post.first_comment.author}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {post.first_comment.created_at ? format(new Date(post.first_comment.created_at), 'MMM d') : ''}
                                    </span>
                                </div>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.9rem',
                                    color: 'var(--text-muted)',
                                    lineHeight: 1.5
                                }}>
                                    {post.first_comment.body}
                                </p>
                                {post.comments_count > 1 && (
                                    <Link
                                        to={`/post/${post.slug}`}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            display: 'inline-block',
                                            marginTop: '0.5rem',
                                            fontSize: '0.85rem',
                                            color: 'var(--primary)',
                                            fontWeight: 500,
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Load all {post.comments_count} comments →
                                    </Link>
                                )}
                            </div>
                        )}

                        {!post.first_comment && post.comments_count === 0 && (
                            <Link
                                to={`/post/${post.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    display: 'block',
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    textAlign: 'center',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-muted)',
                                    textDecoration: 'none',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            >
                                Be the first to comment
                            </Link>
                        )}
                    </div>
                </div>
            </Link>
        </article>
    );
};

export default PostCard;
