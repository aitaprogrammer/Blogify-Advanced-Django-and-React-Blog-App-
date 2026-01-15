import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            username: Yup.string().min(3, 'Must be at least 3 characters').required('Required'),
            email: Yup.string().email('Invalid email address').required('Required'),
            password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Required'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            // The backend expects 'password_confirm' to match the serializer field
            const data = {
                username: values.username,
                email: values.email,
                password: values.password,
                password_confirm: values.confirmPassword
            };
            const success = await register(data);
            if (success) {
                navigate('/login');
            }
            setSubmitting(false);
        },
    });

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>

                <form onSubmit={formik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Username</label>
                        <input
                            id="username"
                            type="text"
                            className="input-field"
                            style={{ width: '100%' }}
                            {...formik.getFieldProps('username')}
                        />
                        {formik.touched.username && formik.errors.username ? (
                            <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>{formik.errors.username}</div>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="input-field"
                            style={{ width: '100%' }}
                            {...formik.getFieldProps('email')}
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>{formik.errors.email}</div>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input-field"
                            style={{ width: '100%' }}
                            {...formik.getFieldProps('password')}
                        />
                        {formik.touched.password && formik.errors.password ? (
                            <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>{formik.errors.password}</div>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="input-field"
                            style={{ width: '100%' }}
                            {...formik.getFieldProps('confirmPassword')}
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                            <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>{formik.errors.confirmPassword}</div>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', width: '100%' }}
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
