import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/?search=${encodeURIComponent(search)}`);
            setSearch('');
        }
    };

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--border)',
            padding: '1rem 0'
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                    Blogify<span style={{ color: 'var(--text-main)' }}></span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search posts..."
                            className="input-field"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '250px', paddingRight: '2.5rem' }}
                        />
                        <button
                            type="submit"
                            style={{
                                position: 'absolute',
                                right: '5px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </form>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to="/" style={{ fontWeight: 500, color: 'var(--text-main)' }}>Home</Link>
                        <Link to="/categories" style={{ fontWeight: 500, color: 'var(--text-main)' }}>Categories</Link>
                        <Link to="/creators" style={{ fontWeight: 500, color: 'var(--text-main)' }}>Creators</Link>

                        {user ? (
                            <>
                                <Link to="/my-posts" style={{ fontWeight: 500, color: 'var(--text-main)' }}>My Posts</Link>
                                <Link to={`/profile/${user.username}`} style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                                    {user.username}
                                </Link>
                                <button onClick={logout} className="btn" style={{ padding: '0.4rem 1.2rem', border: '1px solid var(--border)', backgroundColor: 'transparent' }}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="btn btn-primary" style={{ padding: '0.4rem 1.2rem' }}>Login</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
