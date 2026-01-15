import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/categories/');
                setCategories(response.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
                toast.error('Failed to load categories');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            const response = await api.post('/api/categories/', { name: newCategoryName });
            setCategories([...categories, response.data]);
            setNewCategoryName('');
            setIsAdding(false);
            toast.success('Category added successfully!');
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error('Failed to add category');
        }
    };

    const handleFollowCategory = async (e, category) => {
        e.preventDefault(); // Prevent navigation
        if (!user) {
            toast.error('Please login to follow categories');
            return;
        }

        // Optimistic update
        const updatedCategories = categories.map(c =>
            c.id === category.id ? { ...c, is_followed: !c.is_followed } : c
        );
        setCategories(updatedCategories);

        try {
            await api.post(`/api/categories/${category.slug}/follow/`);
        } catch (error) {
            console.error('Error following category:', error);
            toast.error('Failed to update follow status');
            // Revert
            setCategories(categories);
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
        <div className="container" style={{ maxWidth: '800px', padding: '2rem 1.5rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Categories</h1>



            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        to={`/?category=${category.id}`}
                        className="card"
                        style={{
                            padding: '1.5rem',
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '';
                        }}
                    >
                        <span style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{category.name}</span>
                        {user && (
                            <button
                                onClick={(e) => handleFollowCategory(e, category)}
                                style={{
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '999px',
                                    border: category.is_followed ? '1px solid var(--primary)' : '1px solid var(--border)',
                                    backgroundColor: category.is_followed ? 'var(--primary)' : 'white',
                                    color: category.is_followed ? 'white' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {category.is_followed ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </Link>
                ))}
            </div>

            {user && (
                <div style={{ marginTop: '2rem' }}>
                    {!isAdding ? (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                        >
                            + Add New Category
                        </button>
                    ) : (
                        <div className="card" style={{ padding: '1.5rem', maxWidth: '500px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.2rem' }}>Add New Category</h3>
                            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Category name..."
                                    className="input-field"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    style={{ flex: 1 }}
                                    autoFocus
                                />
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="btn"
                                    style={{
                                        padding: '0.4rem 1rem',
                                        backgroundColor: 'transparent',
                                        border: '1px solid var(--border)',
                                        color: 'inherit',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Categories;
