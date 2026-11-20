
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function UserDashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [stores, setStores] = useState([]);
    const [search, setSearch] = useState({
        name: '',
        address: ''
    });

    const [ratings, setRatings] = useState({});
    const [savingRating, setSavingRating] = useState(null);
    const [activeTab, setActiveTab] = useState('stores');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: ''
    });

    const loadStores = async (filters = {}) => {
        setLoading(true);

        try {
            const params = {};

            if (filters.name) params.name = filters.name;
            if (filters.address) params.address = filters.address;

            const response = await api.get('/user/stores', { params });
            setStores(response.data);

        } catch {
            setError('Unable to load stores. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    
useEffect(() => {
    let isMounted = true;

    const fetchStores = async () => {
        try {
            const response = await api.get('/user/stores');

            if (isMounted) {
                setStores(response.data);
            }

        } catch {
            if (isMounted) {
                setError('Unable to load stores. Please try again.');
            }

        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    fetchStores();

    return () => {
        isMounted = false;
    };
}, []);


    const handleSearch = (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        loadStores(search);
    };

    const handleReset = () => {
        const emptySearch = {
            name: '',
            address: ''
        };

        setSearch(emptySearch);
        setMessage('');
        setError('');
        loadStores(emptySearch);
    };

    const handleRatingChange = (storeId, rating) => {
        setRatings({
            ...ratings,
            [storeId]: rating
        });
    };

    const submitRating = async (storeId) => {
        const rating = ratings[storeId];

        if (!rating) {
            setError('Please select a rating first.');
            return;
        }

        setSavingRating(storeId);
        setMessage('');
        setError('');

        try {
            const response = await api.post(
                `/user/stores/${storeId}/rating`,
                { rating }
            );

            setMessage(response.data.message);
            await loadStores(search);

        } catch (err) {
            setError(
                err.response?.data?.message || 'Unable to submit rating.'
            );
        } finally {
            setSavingRating(null);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await api.put('/auth/change-password', passwordForm);

            setMessage('Password changed successfully.');

            setPasswordForm({
                oldPassword: '',
                newPassword: ''
            });

        } catch (err) {
            setError(
                err.response?.data?.message || 'Unable to change password.'
            );
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="user-layout">

            <header className="user-topbar">
                <div className="brand">
                    <span className="brand-star">☆</span>
                    <span>Store<span className="brand-blue">Rate</span></span>
                </div>

                <nav className="user-nav">
                    <button
                        className={activeTab === 'stores' ? 'user-nav-active' : ''}
                        onClick={() => {
                            setActiveTab('stores');
                            setMessage('');
                            setError('');
                        }}
                    >
                        Stores
                    </button>

                    <button
                        className={activeTab === 'password' ? 'user-nav-active' : ''}
                        onClick={() => {
                            setActiveTab('password');
                            setMessage('');
                            setError('');
                        }}
                    >
                        Change Password
                    </button>
                </nav>

                <div className="user-profile">
                    <span className="profile-avatar">
                        {(user.name || 'U').charAt(0).toUpperCase()}
                    </span>
                    <span>{user.name || 'User'}</span>

                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main className="user-content">

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                {activeTab === 'stores' && (
                    <>
                        <div className="user-heading">
                            <div>
                                <span className="eyebrow">STORERATE COMMUNITY</span>
                                <h1>Explore Stores</h1>
                                <p>Discover stores and share your experience.</p>
                            </div>

                            <div className="store-count">
                                <strong>{stores.length}</strong>
                                <span>Stores found</span>
                            </div>
                        </div>

                        <section className="store-search-panel">
                            <form onSubmit={handleSearch}>
                                <div className="search-field">
                                    <label>Store Name</label>
                                    <input
                                        type="text"
                                        placeholder="Search by store name"
                                        value={search.name}
                                        onChange={(e) => setSearch({
                                            ...search,
                                            name: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="search-field">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        placeholder="Search by address"
                                        value={search.address}
                                        onChange={(e) => setSearch({
                                            ...search,
                                            address: e.target.value
                                        })}
                                    />
                                </div>

                                <button type="submit" className="primary-btn">
                                    Search
                                </button>

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={handleReset}
                                >
                                    Reset
                                </button>
                            </form>
                        </section>

                        {loading ? (
                            <p className="loading-text">Loading stores...</p>
                        ) : stores.length === 0 ? (
                            <div className="no-stores">
                                <span>▣</span>
                                <h3>No stores found</h3>
                                <p>Try changing your search details.</p>
                            </div>
                        ) : (
                            <div className="store-grid">
                                {stores.map((store) => (
                                    <article className="store-card" key={store.id}>
                                        <div className="store-card-header">
                                            <div className="store-card-icon">▣</div>

                                            <div>
                                                <h3>{store.name}</h3>
                                                <p>{store.address}</p>
                                            </div>
                                        </div>

                                        <div className="store-rating-info">
                                            <div>
                                                <span className="gold-stars">★★★★★</span>
                                                <strong>
                                                    {Number(store.averageRating).toFixed(1)}
                                                </strong>
                                                <small>Overall Rating</small>
                                            </div>

                                            <div>
                                                <span className="my-rating-star">★</span>
                                                <strong>
                                                    {store.userRating ?? '—'}
                                                </strong>
                                                <small>Your Rating</small>
                                            </div>
                                        </div>

                                        <div className="rate-section">
                                            <p>
                                                {store.userRating !== null
                                                    ? 'Update your rating'
                                                    : 'Rate this store'}
                                            </p>

                                            <div className="rating-selector">
                                                {[1, 2, 3, 4, 5].map((value) => (
                                                    <button
                                                        type="button"
                                                        key={value}
                                                        className={
                                                            Number(ratings[store.id] || store.userRating) >= value
                                                                ? 'rating-star selected'
                                                                : 'rating-star'
                                                        }
                                                        onClick={() => handleRatingChange(store.id, value)}
                                                        aria-label={`Rate ${value} out of 5`}
                                                        title={`${value} star${value > 1 ? 's' : ''}`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                className="rate-submit-btn"
                                                onClick={() => submitRating(store.id)}
                                                disabled={savingRating === store.id}
                                            >
                                                {savingRating === store.id
                                                    ? 'Saving...'
                                                    : store.userRating !== null
                                                        ? 'Update Rating'
                                                        : 'Submit Rating'}
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'password' && (
                    <section className="password-panel">
                        <span className="eyebrow">ACCOUNT SETTINGS</span>
                        <h1>Change Password</h1>
                        <p>Update your account password securely.</p>

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
                                8–16 characters, including an uppercase letter
                                and a special character.
                            </small>

                            <button type="submit" className="primary-btn">
                                Update Password
                            </button>
                        </form>
                    </section>
                )}

            </main>

            <footer className="user-footer">
                <span>☆ StoreRate</span>
                <span>Rate. Review. Discover.</span>
                <span>© 2026 StoreRate</span>
            </footer>
        </div>
    );
}

export default UserDashboard;
