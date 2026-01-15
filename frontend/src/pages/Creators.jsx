import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Creators = () => {
    const [creators, setCreators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchCreators = async () => {
            try {
                const response = await api.get('/api/creators/');
                setCreators(response.data);
            } catch (err) {
                console.error('Error fetching creators:', err);
                setError('Failed to load creators.');
            } finally {
                setLoading(false);
            }
        };

        fetchCreators();
    }, []);

    const handleFollowUser = async (e, creator) => {
        e.preventDefault(); // Prevent navigation
        if (!user) {
            toast.error('Please login to follow users');
            return;
        }

        // Optimistic update
        const updatedCreators = creators.map(c =>
            c.id === creator.id ? { ...c, is_followed: !c.is_followed } : c
        );
        setCreators(updatedCreators);

        try {
            await api.post(`/api/profiles/${creator.user}/follow/`);
        } catch (error) {
            console.error('Error following user:', error);
            toast.error('Failed to update follow status');
            // Revert
            setCreators(creators);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'red' }}>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '2rem 1.5rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Creators</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                Meet the talented writers sharing their stories on Blogify.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {creators.map((creator) => (
                    <Link
                        key={creator.id}
                        to={`/profile/${creator.user}`}
                        className="card"
                        style={{
                            padding: '1.5rem',
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '';
                        }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: creator.avatar ? 'transparent' : 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            overflow: 'hidden'
                        }}>
                            {creator.avatar ? (
                                <img
                                    src={creator.avatar.startsWith('http') ? creator.avatar : `http://localhost:8000${creator.avatar}`}
                                    alt={creator.user}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                creator.user?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{creator.user}</h3>
                        {creator.bio && (
                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem',
                                margin: 0,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {creator.bio}
                            </p>
                        )}
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <div>
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{creator.posts_count}</span> Posts
                            </div>
                            <div>
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{creator.followers_count || 0}</span> Followers
                            </div>
                        </div>

                        {user && user.username !== creator.user && (
                            <button
                                onClick={(e) => handleFollowUser(e, creator)}
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.4rem 1.2rem',
                                    borderRadius: '999px',
                                    border: creator.is_followed ? '1px solid var(--primary)' : '1px solid var(--border)',
                                    backgroundColor: creator.is_followed ? 'var(--primary)' : 'white',
                                    color: creator.is_followed ? 'white' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s',
                                    zIndex: 2
                                }}
                            >
                                {creator.is_followed ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </Link>
                ))}
            </div>

            {creators.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <p>No creators found yet.</p>
                </div>
            )}
        </div>
    );
};

export default Creators;
