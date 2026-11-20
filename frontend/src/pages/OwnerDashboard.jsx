
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function OwnerDashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [dashboard, setDashboard] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [ratingSort, setRatingSort] = useState({
        sortBy: 'name',
        order: 'asc'
    });

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: ''
    });

    // Load Store Owner Dashboard
    const loadDashboard = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/owner/dashboard');
            setDashboard(response.data);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load dashboard information.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/owner/dashboard');

            if (isMounted) {
                setDashboard(response.data);
                setError('');
            }

        } catch (err) {
            if (isMounted) {
                setError(
                    err.response?.data?.message ||
                    'Unable to load dashboard information.'
                );
            }

        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    fetchDashboard();

    return () => {
        isMounted = false;
    };
    }, []);

    // Change Password
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await api.put(
                '/auth/change-password',
                passwordForm
            );

            setMessage(response.data.message);

            setPasswordForm({
                oldPassword: '',
                newPassword: ''
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to change password.'
            );
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const sortedRatings = [...(dashboard?.ratings || [])].sort((a, b) => {
        const first = a[ratingSort.sortBy];
        const second = b[ratingSort.sortBy];

        let result;

        if (ratingSort.sortBy === 'rating') {
            result = Number(first) - Number(second);
        } else if (ratingSort.sortBy === 'updated_at') {
            result = new Date(first) - new Date(second);
        } else {
            result = String(first || '').localeCompare(String(second || ''));
        }

        return ratingSort.order === 'asc' ? result : -result;
    });

    const changeRatingSort = (column) => {
        setRatingSort((current) => ({
            sortBy: column,
            order: current.sortBy === column && current.order === 'asc'
                ? 'desc'
                : 'asc'
        }));
    };

    return (
        <div className="owner-layout">

            {/* Sidebar */}
            <aside className="owner-sidebar">
                <div className="owner-logo">
                    <span>☆</span> StoreRate
                </div>

                <p className="sidebar-label">MAIN MENU</p>

                <button
                    className={
                        activeTab === 'dashboard'
                            ? 'sidebar-link active'
                            : 'sidebar-link'
                    }
                    onClick={() => {
                        setActiveTab('dashboard');
                        setMessage('');
                        setError('');
                    }}
                >
                    <span>⌂</span> Dashboard
                </button>

                <button
                    className={
                        activeTab === 'password'
                            ? 'sidebar-link active'
                            : 'sidebar-link'
                    }
                    onClick={() => {
                        setActiveTab('password');
                        setMessage('');
                        setError('');
                    }}
                >
                    <span>⚙</span> Change Password
                </button>

                <div className="sidebar-bottom">
                    <button className="sidebar-link" onClick={handleLogout}>
                        <span>⇥</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="owner-main">

                <header className="owner-topbar">
                    <div>
                        <h2>
                            {activeTab === 'dashboard'
                                ? 'Store Owner Dashboard'
                                : 'Account Settings'}
                        </h2>

                        <p>Welcome back, {user.name || 'Store Owner'}</p>
                    </div>

                    <div className="admin-profile">
                        <span className="profile-avatar">
                            {(user.name || 'O').charAt(0).toUpperCase()}
                        </span>
                        <span>Store Owner</span>
                    </div>
                </header>

                <div className="owner-content">

                    {message && (
                        <div className="success-message">{message}</div>
                    )}

                    {error && (
                        <div className="error-message">{error}</div>
                    )}

                    {/* Dashboard */}
                    {activeTab === 'dashboard' && (
                        <>
                            {loading ? (
                                <p className="loading-text">
                                    Loading dashboard...
                                </p>
                            ) : dashboard ? (
                                <>
                                    <div className="owner-heading">
                                        <div>
                                            <span className="eyebrow">
                                                STORE OVERVIEW
                                            </span>
                                            <h1>
                                                {dashboard.store.name}
                                            </h1>
                                            <p>
                                                {dashboard.store.address}
                                            </p>
                                        </div>

                                        <button
                                            className="secondary-btn"
                                            onClick={loadDashboard}
                                        >
                                            ↻ Refresh
                                        </button>
                                    </div>

                                    <div className="owner-stats-grid">
                                        <div className="owner-stat-card">
                                            <div className="owner-stat-icon blue-stat">
                                                ▣
                                            </div>
                                            <div>
                                                <p>Average Rating</p>
                                                <h2>
                                                    {Number(
                                                        dashboard.averageRating
                                                    ).toFixed(1)}
                                                    <span className="gold-star">
                                                        ★
                                                    </span>
                                                </h2>
                                            </div>
                                        </div>

                                        <div className="owner-stat-card">
                                            <div className="owner-stat-icon orange-stat">
                                                ★
                                            </div>
                                            <div>
                                                <p>Total Ratings</p>
                                                <h2>
                                                    {dashboard.totalRatings}
                                                </h2>
                                            </div>
                                        </div>
                                    </div>

                                    <section className="admin-panel owner-rating-panel">
                                        <div className="panel-heading">
                                            <div>
                                                <h3>Customer Ratings</h3>
                                                <p>
                                                    Users who have submitted
                                                    ratings for your store.
                                                </p>
                                            </div>
                                            <span className="rating-count">
                                                {dashboard.ratings.length} Ratings
                                            </span>
                                        </div>

                                        <div className="table-wrapper">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th onClick={() => changeRatingSort('name')}>User Name ↕</th>
                                                        <th onClick={() => changeRatingSort('email')}>Email ↕</th>
                                                        <th onClick={() => changeRatingSort('rating')}>Rating ↕</th>
                                                        <th onClick={() => changeRatingSort('updated_at')}>Last Updated ↕</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {sortedRatings.map((rating) => (
                                                        <tr key={rating.userId}>
                                                            <td>{rating.name}</td>
                                                            <td>{rating.email}</td>
                                                            <td>
                                                                <span className="owner-rating-value">
                                                                    ★ {rating.rating}/5
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {new Date(
                                                                    rating.updated_at
                                                                ).toLocaleDateString('en-IN')}
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {dashboard.ratings.length === 0 && (
                                                        <tr>
                                                            <td
                                                                colSpan="4"
                                                                className="empty-state"
                                                            >
                                                                No ratings have been
                                                                submitted yet.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                </>
                            ) : (
                                <div className="admin-panel">
                                    <h3>Dashboard unavailable</h3>
                                    <p>
                                        Your account does not have an assigned
                                        store yet.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Change Password */}
                    {activeTab === 'password' && (
                        <section className="password-panel">
                            <span className="eyebrow">ACCOUNT SETTINGS</span>

                            <h1>Change Password</h1>

                            <p>
                                Update your account password securely.
                            </p>

                            <form onSubmit={handlePasswordChange}>
                                <label>Current Password</label>

                                <input
                                    type="password"
                                    value={passwordForm.oldPassword}
                                    onChange={(e) => setPasswordForm({
                                        ...passwordForm,
                                        oldPassword: e.target.value
                                    })}
                                    required
                                />

                                <label>New Password</label>

                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({
                                        ...passwordForm,
                                        newPassword: e.target.value
                                    })}
                                    required
                                />

                                <small>
                                    8–16 characters, including an uppercase
                                    letter and a special character.
                                </small>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                >
                                    Update Password
                                </button>
                            </form>
                        </section>
                    )}

                </div>
            </main>
        </div>
    );
}

export default OwnerDashboard;
