import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePost = ({ post: initialPost }) => {
    const { user } = useAuth();
    const [post, setPost] = useState(initialPost);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    const handleLike = async () => {
        if (!user) {
            toast.error('Please login to like posts');
            return;
        }

        const originalPost = { ...post };
        const newIsLiked = !post.is_liked;
        const newLikesCount = newIsLiked ? post.likes_count + 1 : post.likes_count - 1;

        setPost({ ...post, is_liked: newIsLiked, likes_count: newLikesCount });

        try {
            await api.post(`/api/posts/${post.slug}/like/`);
        } catch (error) {
            console.error('Error liking post:', error);
            setPost(originalPost);
            toast.error('Failed to update like status');
        }
    };

    const toggleComments = async () => {
        if (!showComments && comments.length === 0) {
            setLoadingComments(true);
            try {
                const response = await api.get(`/api/posts/${post.slug}/comments/`);
                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
                toast.error('Failed to load comments');
            } finally {
                setLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await api.post(`/api/posts/${post.slug}/add_comment/`, { body: newComment });
            setComments([...comments, response.data]);
            setPost({ ...post, comments_count: (post.comments_count || 0) + 1 });
            setNewComment('');
            toast.success('Comment added!');
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
        }
    };

    return (
        <div className="card" style={{ padding: '1.5rem', textAlign: 'left', marginBottom: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <Link to={`/post/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', fontWeight: 700 }}>{post.title}</h3>
                </Link>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {new Date(post.created_at).toLocaleDateString()}
                </div>
                <div style={{ lineHeight: '1.6', color: 'var(--text-main)' }}>
                    {post.thumbnail && (
                        <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                            <img
                                src={post.thumbnail.startsWith('http') ? post.thumbnail : `http://localhost:8000${post.thumbnail}`}
                                alt={post.title}
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>
                    )}
                    {post.content}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button
                    onClick={handleLike}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: post.is_liked ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: '1rem'
                    }}
                >
                    <span>{post.is_liked ? '❤️' : '🤍'}</span>
                    <span>{post.likes_count}</span>
                </button>

                <button
                    onClick={toggleComments}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-muted)',
                        fontSize: '1rem'
                    }}
                >
                    <span>💬</span>
                    <span>{post.comments_count || 0} Comments</span>
                </button>
            </div>

            {showComments && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    {loadingComments ? (
                        <div className="spinner" style={{ margin: '1rem auto' }}></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            {comments.length > 0 ? (
                                comments.map(comment => (
                                    <div key={comment.id} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.9rem' }}>{comment.author}</div>
                                        <div style={{ fontSize: '0.95rem' }}>{comment.body}</div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No comments yet.</p>
                            )}
                        </div>
                    )}

                    {user && (
                        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="input-field"
                                style={{ flex: 1 }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                Post
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

const Profile = () => {
    const { username } = useParams();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/api/profiles/${username}/`);
                setProfile(response.data);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };

        const fetchUserPosts = async () => {
            try {
                const response = await api.get('/api/posts/');
                // Filter posts by this user
                const userPosts = response.data.filter(post => post.author?.username === username);
                setPosts(userPosts);
            } catch (err) {
                console.error('Error fetching posts:', err);
            }
        };

        fetchProfile();
        fetchUserPosts();
    }, [username]);

    useEffect(() => {
        if (profile) {
            setBioText(profile.bio || '');
        }
    }, [profile]);

    const handleUpdateBio = async () => {
        try {
            const response = await api.patch(`/api/profiles/${username}/`, { bio: bioText });
            setProfile(response.data);
            setIsEditingBio(false);
            toast.success('Bio updated successfully!');
        } catch (error) {
            console.error('Error updating bio:', error);
            toast.error('Failed to update bio');
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await api.patch(`/api/profiles/${username}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setProfile(response.data);
            toast.success('Avatar updated successfully!');
        } catch (error) {
            console.error('Error updating avatar:', error);
            toast.error('Failed to update avatar');
        }
    };

    const handleFollowUser = async () => {
        if (!user) {
            toast.error('Please login to follow users');
            return;
        }

        // Optimistic update
        const isFollowing = profile.is_followed;
        setProfile(prev => ({
            ...prev,
            is_followed: !isFollowing,
            followers_count: isFollowing ? prev.followers_count - 1 : prev.followers_count + 1
        }));

        try {
            const response = await api.post(`/api/profiles/${username}/follow/`);
            setProfile(prev => ({
                ...prev,
                is_followed: response.data.is_followed
            }));
        } catch (error) {
            console.error('Error following user:', error);
            toast.error('Failed to update follow status');
            // Revert
            setProfile(prev => ({
                ...prev,
                is_followed: isFollowing,
                followers_count: isFollowing ? prev.followers_count + 1 : prev.followers_count - 1
            }));
        }
    };

    const isOwnProfile = user && user.username === username;

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Profile not found</h2>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '2rem 1.5rem' }}>
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                />

                {/* Avatar with upload button */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        backgroundColor: profile.avatar ? 'transparent' : 'var(--primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        overflow: 'hidden'
                    }}>
                        {profile.avatar ? (
                            <img
                                src={profile.avatar.startsWith('http') ? profile.avatar : `http://localhost:8000${profile.avatar}`}
                                alt={profile.user}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            profile.user?.[0]?.toUpperCase() || 'U'
                        )}
                    </div>

                    {/* Upload button - only show on own profile */}
                    {isOwnProfile && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: '3px solid white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                        </button>
                    )}
                </div>

                <h1 style={{ margin: '0 0 0.5rem 0' }}>{profile.user}</h1>

                {/* Follow Button */}
                {!isOwnProfile && user && (
                    <button
                        onClick={handleFollowUser}
                        className="btn"
                        style={{
                            marginBottom: '1.5rem',
                            padding: '0.5rem 1.5rem',
                            backgroundColor: profile.is_followed ? 'white' : 'var(--primary)',
                            color: profile.is_followed ? 'var(--text-main)' : 'white',
                            border: profile.is_followed ? '1px solid var(--border)' : 'none',
                            fontWeight: 600
                        }}
                    >
                        {profile.is_followed ? 'Following' : 'Follow'}
                    </button>
                )}

                {/* Bio Section */}
                <div style={{ maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
                    {!isEditingBio ? (
                        <>
                            {profile.bio && <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{profile.bio}</p>}
                            {isOwnProfile && (
                                <button
                                    onClick={() => setIsEditingBio(true)}
                                    className="btn"
                                    style={{
                                        marginTop: '0.5rem',
                                        padding: '0.4rem 1rem',
                                        border: '1px solid var(--border)',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {profile.bio ? 'Edit Bio' : 'Add Bio'}
                                </button>
                            )}
                        </>
                    ) : (
                        <div>
                            <textarea
                                value={bioText}
                                onChange={(e) => setBioText(e.target.value)}
                                placeholder="Tell us about yourself..."
                                className="input-field"
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    resize: 'vertical',
                                    marginBottom: '0.5rem'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                <button
                                    onClick={handleUpdateBio}
                                    className="btn btn-primary"
                                    style={{ padding: '0.5rem 1.5rem' }}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingBio(false);
                                        setBioText(profile.bio || '');
                                    }}
                                    className="btn"
                                    style={{ padding: '0.5rem 1.5rem', border: '1px solid var(--border)' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{profile.posts_count || 0}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Posts</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{profile.followers_count || 0}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Followers</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{profile.following_count || 0}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Following</div>
                    </div>
                </div>

                {/* Posts Section */}
                {posts.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Posts by {profile.user}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {posts.map((post) => (
                                <ProfilePost key={post.slug} post={post} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
