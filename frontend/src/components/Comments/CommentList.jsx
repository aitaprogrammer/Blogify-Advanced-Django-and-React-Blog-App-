import React, { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import CommentForm from './CommentForm';

const CommentList = ({ slug }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchComments = useCallback(async () => {
        try {
            const response = await api.get(`/api/posts/${slug}/comments/`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleLikeComment = async (commentId) => {
        if (!user) {
            toast.error('Please login to like comments');
            return;
        }

        const commentIndex = comments.findIndex(c => c.id === commentId);
        if (commentIndex === -1) return;
        const comment = comments[commentIndex];

        // Optimistic update
        const newComments = [...comments];
        const isLiked = comment.is_liked;
        newComments[commentIndex] = {
            ...comment,
            is_liked: !isLiked,
            likes_count: isLiked ? comment.likes_count - 1 : comment.likes_count + 1
        };
        setComments(newComments);

        try {
            const response = await api.post(`/api/comments/${commentId}/like/`);
            const updatedComments = [...comments];
            updatedComments[commentIndex] = {
                ...comment,
                is_liked: response.data.is_liked,
                likes_count: response.data.likes_count
            };
            setComments(updatedComments);
        } catch (error) {
            console.error('Error liking comment:', error);
            // Revert
            const revertedComments = [...comments];
            revertedComments[commentIndex] = comment;
            setComments(revertedComments);
        }
    };

    return (
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                Comments ({comments.length})
            </h3>

            {user ? (
                <CommentForm slug={slug} onCommentAdded={fetchComments} />
            ) : (
                <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                        Please <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>login</Link> to leave a comment.
                    </p>
                </div>
            )}

            {loading ? (
                <div className="spinner"></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {comments.map((comment) => (
                        <div key={comment.id} style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                color: '#64748b',
                                flexShrink: 0
                            }}>
                                {comment.author?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: 600 }}>{comment.author}</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {comment.created_at ? format(new Date(comment.created_at), 'MMM d, yyyy') : ''}
                                    </span>
                                </div>
                                <p style={{ margin: 0, lineHeight: 1.5, color: 'var(--text-main)' }}>{comment.body}</p>

                                <button
                                    onClick={() => handleLikeComment(comment.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        color: comment.is_liked ? '#ef4444' : 'var(--text-muted)',
                                        marginTop: '0.5rem',
                                        fontSize: '0.85rem',
                                        padding: 0
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill={comment.is_liked ? "currentColor" : "none"}
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                    {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                                </button>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && !loading && (
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No comments yet. Be the first to share your thoughts!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentList;
