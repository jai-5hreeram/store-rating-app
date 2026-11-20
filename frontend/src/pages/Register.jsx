
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.name.trim().length < 20 ||
            formData.name.trim().length > 60) {
            setError('Name must be between 20 and 60 characters.');
            return;
        }

        if (formData.address.trim().length > 400) {
            setError('Address cannot exceed 400 characters.');
            return;
        }

        const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordPattern.test(formData.password)) {
            setError('Password must be 8-16 characters with an uppercase letter and a special character.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/register', formData);

            navigate('/login', {
                state: {
                    message: 'Registration successful! Please login.'
                }
            });

        } catch (error) {
            setError(
                error.response?.data?.message || 'Registration failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">

                <section className="auth-brand-panel">
                    <Link to="/" className="auth-logo">
                        ☆ StoreRate
                    </Link>

                    <div className="auth-brand-content">
                        <span className="large-star">☆</span>
                        <h1>Join StoreRate</h1>
                        <p>Your experience can help someone.</p>

                        <div className="brand-decoration">
                            Discover stores and become part of our rating community.
                        </div>
                    </div>

                    <Link to="/" className="back-home">
                        ← Back to Home
                    </Link>
                </section>

                <section className="auth-form-panel">
                    <div className="auth-form-wrapper">
                        <h2>Create Account</h2>
                        <p className="auth-subtitle">Register as a normal user</p>

                        {error && (
                            <div className="error-message">{error}</div>
                        )}

                        <form onSubmit={handleRegister}>
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                minLength="20"
                                maxLength="60"
                                required
                            />

                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <label>Address</label>
                            <textarea
                                name="address"
                                placeholder="Enter your address"
                                value={formData.address}
                                onChange={handleChange}
                                maxLength="400"
                                required
                            />

                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            <small className="form-hint">
                                8-16 characters, at least one uppercase letter
                                and one special character.
                            </small>

                            <button
                                type="submit"
                                className="primary-btn full-btn"
                                disabled={loading}
                            >
                                {loading ? 'Creating account...' : 'Create Account →'}
                            </button>
                        </form>

                        <p className="register-text">
                            Already have an account?{' '}
                            <Link to="/login">Login here</Link>
                        </p>
                    </div>
                </section>

            </div>
        </div>
    );
}

export default Register;
