import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = {};
                const search = searchParams.get('search');
                const category = searchParams.get('category');

                if (search) params.search = search;
                if (category) params.category = category;

                const response = await api.get('/api/posts/', { params });
                setPosts(response.data);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Failed to load posts. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [searchParams]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/categories/');
                setCategories(response.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryFilter = (categoryId) => {
        if (categoryId) {
            setSearchParams({ category: categoryId });
        } else {
            setSearchParams({});
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
        <div className="container">
            <div style={{ padding: '2rem 0', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>
                            {searchParams.get('search')
                                ? `Search results for "${searchParams.get('search')}"`
                                : 'Latest Stories'
                            }
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                            Discover the latest updates, tutorials, and stories from our community.
                        </p>
                    </div>
                    {searchParams.get('search') && (
                        <Link
                            to="/"
                            className="btn"
                            style={{
                                padding: '0.5rem 1.2rem',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            ← Back to Home
                        </Link>
                    )}
                </div>
            </div>

            {user && !searchParams.get('search') && (
                <div style={{
                    marginBottom: '2rem',
                    padding: '2rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'white'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Share Your Story
                        </h2>
                        <p style={{ margin: 0, opacity: 0.9 }}>
                            Got something on your mind? Write it down and share it with the world.
                        </p>
                    </div>
                    <Link
                        to="/create-post"
                        className="btn"
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: 'white',
                            color: '#667eea',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: 'none',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Write a Blog
                    </Link>
                </div>
            )}

            {/* Category Filter Dropdown */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <select
                    value={searchParams.get('category') || ''}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                    className="input-field"
                    style={{ width: '200px' }}
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <h3>No posts found.</h3>
                    <p>Try adjusting your search or check back later.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {posts.map((post) => (
                        <PostCard key={post.slug} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
