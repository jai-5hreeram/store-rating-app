
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const successMessage = location.state?.message;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            const role = response.data.user.role;

            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'store_owner') {
                navigate('/owner');
            } else {
                navigate('/user');
            }

        } catch (error) {
            setError(
                error.response?.data?.message || 'Unable to login. Please try again.'
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
                        <h1>StoreRate</h1>
                        <p>Rate. Review. Discover.</p>

                        <div className="brand-decoration">
                            Your opinion helps others make better choices.
                        </div>
                    </div>

                    <Link to="/" className="back-home">
                        ← Back to Home
                    </Link>
                </section>

                <section className="auth-form-panel">
                    <div className="auth-form-wrapper">
                        <h2>Welcome Back!</h2>
                        <p className="auth-subtitle">Login to continue to StoreRate</p>

                        {successMessage && (
                            <div className="success-message">
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="error-message">{error}</div>
                        )}

                        <form onSubmit={handleLogin}>
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button
                                type="submit"
                                className="primary-btn full-btn"
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Login →'}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>OR</span>
                        </div>

                        <p className="register-text">
                            Don't have an account?{' '}
                            <Link to="/register">Register here</Link>
                        </p>
                    </div>
                </section>

            </div>
        </div>
    );
}

export default Login;
