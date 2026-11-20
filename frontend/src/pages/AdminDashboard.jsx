
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AdminDashboard() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStores: 0,
        totalRatings: 0
    });

    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [owners, setOwners] = useState([]);

    const [userFilters, setUserFilters] = useState({
        name: '',
        email: '',
        address: '',
        role: ''
    });

    const [storeFilters, setStoreFilters] = useState({
        name: '',
        email: '',
        address: ''
    });

    const [userSort, setUserSort] = useState({
        sortBy: 'name',
        order: 'asc'
    });

    const [storeSort, setStoreSort] = useState({
        sortBy: 'name',
        order: 'asc'
    });

    const [showUserForm, setShowUserForm] = useState(false);
    const [showStoreForm, setShowStoreForm] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'user'
    });

    const [storeForm, setStoreForm] = useState({
        name: '',
        email: '',
        address: '',
        ownerId: ''
    });

    // Load initial dashboard information
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [dashboardResponse, usersResponse, storesResponse, ownersResponse] =
                    await Promise.all([
                        api.get('/admin/dashboard'),
                        api.get('/admin/users'),
                        api.get('/admin/stores'),
                        api.get('/admin/users?role=store_owner')
                    ]);

                setStats(dashboardResponse.data);
                setUsers(usersResponse.data);
                setStores(storesResponse.data);
                setOwners(ownersResponse.data);

            } catch {
                setError('Unable to load dashboard information.');
            }
        };

        loadDashboard();
    }, []);

    // Clear status messages
    const clearMessages = () => {
        setMessage('');
        setError('');
    };

    // Refresh dashboard counts
    const loadStats = async () => {
        const response = await api.get('/admin/dashboard');
        setStats(response.data);
    };

    // Load users with filters and sorting
    const loadUsers = async (filters = userFilters, sort = userSort) => {
        try {
            const params = {
                ...filters,
                ...sort
            };

            Object.keys(params).forEach((key) => {
                if (!params[key]) {
                    delete params[key];
                }
            });

            const response = await api.get('/admin/users', { params });
            setUsers(response.data);

        } catch {
            setError('Unable to load users.');
        }
    };

    // Load stores with filters and sorting
    const loadStores = async (filters = storeFilters, sort = storeSort) => {
        try {
            const params = {
                ...filters,
                ...sort
            };

            Object.keys(params).forEach((key) => {
                if (!params[key]) {
                    delete params[key];
                }
            });

            const response = await api.get('/admin/stores', { params });
            setStores(response.data);

        } catch {
            setError('Unable to load stores.');
        }
    };

    // Add a new user
    const handleAddUser = async (e) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);

        try {
            await api.post('/admin/users', userForm);

            setMessage('User created successfully!');
            setShowUserForm(false);

            setUserForm({
                name: '',
                email: '',
                password: '',
                address: '',
                role: 'user'
            });

            await loadUsers(userFilters, userSort);

            const ownersResponse = await api.get('/admin/users?role=store_owner');
            setOwners(ownersResponse.data);

            await loadStats();

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user.');
        } finally {
            setLoading(false);
        }
    };

    // Add a new store
    const handleAddStore = async (e) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);

        try {
            const data = {
                ...storeForm,
                ownerId: storeForm.ownerId || null
            };

            await api.post('/admin/stores', data);

            setMessage('Store added successfully!');
            setShowStoreForm(false);

            setStoreForm({
                name: '',
                email: '',
                address: '',
                ownerId: ''
            });

            await loadStores(storeFilters, storeSort);
            await loadStats();

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add store.');
        } finally {
            setLoading(false);
        }
    };

    // View individual user details
    const viewUserDetails = async (id) => {
        clearMessages();

        try {
            const response = await api.get(`/admin/users/${id}`);
            setSelectedUser(response.data);

        } catch  {
            setError('Unable to load user details.');
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Handle user filter changes
    const handleUserFilterChange = (e) => {
        setUserFilters({
            ...userFilters,
            [e.target.name]: e.target.value
        });
    };

    // Handle store filter changes
    const handleStoreFilterChange = (e) => {
        setStoreFilters({
            ...storeFilters,
            [e.target.name]: e.target.value
        });
    };

    // Change table sorting
    const changeUserSort = (column) => {
        const nextSort = {
            sortBy: column,
            order: userSort.sortBy === column && userSort.order === 'asc'
                ? 'desc'
                : 'asc'
        };

        setUserSort(nextSort);
        loadUsers(userFilters, nextSort);
    };

    const changeStoreSort = (column) => {
        const nextSort = {
            sortBy: column,
            order: storeSort.sortBy === column && storeSort.order === 'asc'
                ? 'desc'
                : 'asc'
        };

        setStoreSort(nextSort);
        loadStores(storeFilters, nextSort);
    };

    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="admin-layout">

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <span>☆</span> StoreRate
                </div>

                <p className="sidebar-label">MAIN MENU</p>

                <button
                    className={activeTab === 'dashboard' ? 'sidebar-link active' : 'sidebar-link'}
                    onClick={() => {
                        setActiveTab('dashboard');
                        setSelectedUser(null);
                        clearMessages();
                    }}
                >
                    <span>⌂</span> Dashboard
                </button>

                <button
                    className={activeTab === 'users' ? 'sidebar-link active' : 'sidebar-link'}
                    onClick={() => {
                        setActiveTab('users');
                        setSelectedUser(null);
                        clearMessages();
                        loadUsers();
                    }}
                >
                    <span>♙</span> Users
                </button>

                <button
                    className={activeTab === 'stores' ? 'sidebar-link active' : 'sidebar-link'}
                    onClick={() => {
                        setActiveTab('stores');
                        setSelectedUser(null);
                        clearMessages();
                        loadStores();
                    }}
                >
                    <span>▣</span> Stores
                </button>

                <div className="sidebar-bottom">
                    <button className="sidebar-link" onClick={handleLogout}>
                        <span>⇥</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="admin-main">

                <header className="admin-topbar">
                    <div>
                        <h2>
                            {activeTab === 'dashboard'
                                ? 'Admin Dashboard'
                                : activeTab === 'users'
                                    ? 'User Management'
                                    : 'Store Management'}
                        </h2>
                        <p>Welcome back, {loggedInUser.name || 'Administrator'}</p>
                    </div>

                    <div className="admin-profile">
                        <span className="profile-avatar">
                            {(loggedInUser.name || 'A').charAt(0).toUpperCase()}
                        </span>
                        <span>Admin</span>
                    </div>
                </header>

                <div className="admin-content">

                    {message && <div className="success-message">{message}</div>}
                    {error && <div className="error-message">{error}</div>}

                    {/* Dashboard overview */}
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="section-heading">
                                <div>
                                    <h1>Overview</h1>
                                    <p>Here's what's happening on your platform.</p>
                                </div>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card blue-card">
                                    <div className="stat-icon">♙</div>
                                    <div>
                                        <p>Total Users</p>
                                        <h2>{stats.totalUsers}</h2>
                                    </div>
                                </div>

                                <div className="stat-card green-card">
                                    <div className="stat-icon">▣</div>
                                    <div>
                                        <p>Total Stores</p>
                                        <h2>{stats.totalStores}</h2>
                                    </div>
                                </div>

                                <div className="stat-card orange-card">
                                    <div className="stat-icon">★</div>
                                    <div>
                                        <p>Total Ratings</p>
                                        <h2>{stats.totalRatings}</h2>
                                    </div>
                                </div>
                            </div>

                            <section className="admin-panel">
                                <div className="panel-heading">
                                    <div>
                                        <h3>Registered Stores</h3>
                                        <p>Stores currently available on StoreRate</p>
                                    </div>
                                    <button
                                        className="small-primary-btn"
                                        onClick={() => setActiveTab('stores')}
                                    >
                                        View All →
                                    </button>
                                </div>

                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Store Name</th>
                                                <th>Email</th>
                                                <th>Address</th>
                                                <th>Average Rating</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {stores.slice(0, 5).map((store) => (
                                                <tr key={store.id}>
                                                    <td>{store.name}</td>
                                                    <td>{store.email}</td>
                                                    <td>{store.address}</td>
                                                    <td>
                                                        <span className="rating-value">
                                                            ★ {Number(store.averageRating).toFixed(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}

                                            {stores.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="empty-state">
                                                        No stores have been added yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <div className="quick-actions">
                                <h3>Quick Actions</h3>
                                <button onClick={() => {
                                    setActiveTab('users');
                                    setShowUserForm(true);
                                }}>
                                    + Add New User
                                </button>
                                <button onClick={() => {
                                    setActiveTab('stores');
                                    setShowStoreForm(true);
                                }}>
                                    + Add New Store
                                </button>
                            </div>
                        </>
                    )}

                    {/* User management */}
                    {activeTab === 'users' && (
                        <>
                            <div className="section-heading">
                                <div>
                                    <h1>Users</h1>
                                    <p>View and manage registered platform users.</p>
                                </div>

                                <button
                                    className="primary-btn"
                                    onClick={() => {
                                        setShowUserForm(!showUserForm);
                                        clearMessages();
                                    }}
                                >
                                    + Add User
                                </button>
                            </div>

                            {showUserForm && (
                                <section className="admin-panel form-panel">
                                    <h3>Add New User</h3>

                                    <form onSubmit={handleAddUser} className="admin-form">
                                        <div className="form-grid">
                                            <div>
                                                <label>Full Name</label>
                                                <input
                                                    name="name"
                                                    value={userForm.name}
                                                    onChange={(e) => setUserForm({
                                                        ...userForm,
                                                        name: e.target.value
                                                    })}
                                                    minLength="20"
                                                    maxLength="60"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={userForm.email}
                                                    onChange={(e) => setUserForm({
                                                        ...userForm,
                                                        email: e.target.value
                                                    })}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label>Password</label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={userForm.password}
                                                    onChange={(e) => setUserForm({
                                                        ...userForm,
                                                        password: e.target.value
                                                    })}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label>Role</label>
                                                <select
                                                    value={userForm.role}
                                                    onChange={(e) => setUserForm({
                                                        ...userForm,
                                                        role: e.target.value
                                                    })}
                                                >
                                                    <option value="user">Normal User</option>
                                                    <option value="admin">Administrator</option>
                                                    <option value="store_owner">Store Owner</option>
                                                </select>
                                            </div>
                                        </div>

                                        <label>Address</label>
                                        <textarea
                                            value={userForm.address}
                                            onChange={(e) => setUserForm({
                                                ...userForm,
                                                address: e.target.value
                                            })}
                                            maxLength="400"
                                            required
                                        />

                                        <div className="form-actions">
                                            <button
                                                type="submit"
                                                className="primary-btn"
                                                disabled={loading}
                                            >
                                                {loading ? 'Creating...' : 'Create User'}
                                            </button>

                                            <button
                                                type="button"
                                                className="secondary-btn"
                                                onClick={() => setShowUserForm(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </section>
                            )}

                            <section className="admin-panel">
                                <h3>Search and Filter Users</h3>

                                <form
                                    className="filter-form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        loadUsers(userFilters, userSort);
                                    }}
                                >
                                    <input
                                        name="name"
                                        placeholder="Name"
                                        value={userFilters.name}
                                        onChange={handleUserFilterChange}
                                    />

                                    <input
                                        name="email"
                                        placeholder="Email"
                                        value={userFilters.email}
                                        onChange={handleUserFilterChange}
                                    />

                                    <input
                                        name="address"
                                        placeholder="Address"
                                        value={userFilters.address}
                                        onChange={handleUserFilterChange}
                                    />

                                    <select
                                        name="role"
                                        value={userFilters.role}
                                        onChange={handleUserFilterChange}
                                    >
                                        <option value="">All Roles</option>
                                        <option value="admin">Admin</option>
                                        <option value="user">Normal User</option>
                                        <option value="store_owner">Store Owner</option>
                                    </select>

                                    <button type="submit" className="primary-btn">
                                        Search
                                    </button>

                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={() => {
                                            const emptyFilters = {
                                                name: '',
                                                email: '',
                                                address: '',
                                                role: ''
                                            };

                                            setUserFilters(emptyFilters);
                                            setUserSort({ sortBy: 'name', order: 'asc' });
                                            loadUsers(emptyFilters, {
                                                sortBy: 'name',
                                                order: 'asc'
                                            });
                                        }}
                                    >
                                        Reset
                                    </button>
                                </form>
                            </section>

                            <section className="admin-panel">
                                <div className="panel-heading">
                                    <h3>All Users ({users.length})</h3>
                                </div>

                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th onClick={() => changeUserSort('name')}>Name ↕</th>
                                                <th onClick={() => changeUserSort('email')}>Email ↕</th>
                                                <th onClick={() => changeUserSort('address')}>Address ↕</th>
                                                <th onClick={() => changeUserSort('role')}>Role ↕</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.address}</td>
                                                    <td>
                                                        <span className="role-badge">
                                                            {user.role.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="text-button"
                                                            onClick={() => viewUserDetails(user.id)}
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {users.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="empty-state">
                                                        No users found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {selectedUser && (
                                <div className="detail-overlay">
                                    <div className="detail-card">
                                        <button
                                            className="close-button"
                                            onClick={() => setSelectedUser(null)}
                                        >
                                            ×
                                        </button>

                                        <h2>User Details</h2>
                                        <p><strong>Name:</strong> {selectedUser.name}</p>
                                        <p><strong>Email:</strong> {selectedUser.email}</p>
                                        <p><strong>Address:</strong> {selectedUser.address}</p>
                                        <p><strong>Role:</strong> {selectedUser.role}</p>

                                        {selectedUser.role === 'store_owner' && (
                                            <>
                                                <h3>Owned Stores</h3>

                                                {selectedUser.stores?.length > 0 ? (
                                                    selectedUser.stores.map((store) => (
                                                        <div key={store.id} className="owned-store">
                                                            <strong>{store.name}</strong>
                                                            <p>Average Rating: {store.averageRating}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p>No stores assigned.</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Store management */}
                    {activeTab === 'stores' && (
                        <>
                            <div className="section-heading">
                                <div>
                                    <h1>Stores</h1>
                                    <p>View and manage registered stores.</p>
                                </div>

                                <button
                                    className="primary-btn"
                                    onClick={() => {
                                        setShowStoreForm(!showStoreForm);
                                        clearMessages();
                                    }}
                                >
                                    + Add Store
                                </button>
                            </div>

                            {showStoreForm && (
                                <section className="admin-panel form-panel">
                                    <h3>Register New Store</h3>

                                    <form onSubmit={handleAddStore} className="admin-form">
                                        <div className="form-grid">
                                            <div>
                                                <label>Store Name</label>
                                                <input
                                                    value={storeForm.name}
                                                    onChange={(e) => setStoreForm({
                                                        ...storeForm,
                                                        name: e.target.value
                                                    })}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label>Store Email</label>
                                                <input
                                                    type="email"
                                                    value={storeForm.email}
                                                    onChange={(e) => setStoreForm({
                                                        ...storeForm,
                                                        email: e.target.value
                                                    })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <label>Store Address</label>
                                        <textarea
                                            value={storeForm.address}
                                            onChange={(e) => setStoreForm({
                                                ...storeForm,
                                                address: e.target.value
                                            })}
                                            maxLength="400"
                                            required
                                        />

                                        <label>Assign Store Owner</label>
                                        <select
                                            value={storeForm.ownerId}
                                            onChange={(e) => setStoreForm({
                                                ...storeForm,
                                                ownerId: e.target.value
                                            })}
                                        >
                                            <option value="">No owner assigned</option>

                                            {owners.map((owner) => (
                                                <option key={owner.id} value={owner.id}>
                                                    {owner.name} ({owner.email})
                                                </option>
                                            ))}
                                        </select>

                                        <div className="form-actions">
                                            <button
                                                type="submit"
                                                className="primary-btn"
                                                disabled={loading}
                                            >
                                                {loading ? 'Adding...' : 'Add Store'}
                                            </button>

                                            <button
                                                type="button"
                                                className="secondary-btn"
                                                onClick={() => setShowStoreForm(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </section>
                            )}

                            <section className="admin-panel">
                                <h3>Search Stores</h3>

                                <form
                                    className="filter-form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        loadStores(storeFilters, storeSort);
                                    }}
                                >
                                    <input
                                        name="name"
                                        placeholder="Store Name"
                                        value={storeFilters.name}
                                        onChange={handleStoreFilterChange}
                                    />

                                    <input
                                        name="email"
                                        placeholder="Store Email"
                                        value={storeFilters.email}
                                        onChange={handleStoreFilterChange}
                                    />

                                    <input
                                        name="address"
                                        placeholder="Address"
                                        value={storeFilters.address}
                                        onChange={handleStoreFilterChange}
                                    />

                                    <button type="submit" className="primary-btn">
                                        Search
                                    </button>

                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={() => {
                                            const emptyFilters = {
                                                name: '',
                                                email: '',
                                                address: ''
                                            };

                                            setStoreFilters(emptyFilters);
                                            setStoreSort({ sortBy: 'name', order: 'asc' });
                                            loadStores(emptyFilters, {
                                                sortBy: 'name',
                                                order: 'asc'
                                            });
                                        }}
                                    >
                                        Reset
                                    </button>
                                </form>
                            </section>

                            <section className="admin-panel">
                                <h3>All Stores ({stores.length})</h3>

                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th onClick={() => changeStoreSort('name')}>Store Name ↕</th>
                                                <th onClick={() => changeStoreSort('email')}>Email ↕</th>
                                                <th onClick={() => changeStoreSort('address')}>Address ↕</th>
                                                <th>Store Owner</th>
                                                <th onClick={() => changeStoreSort('averageRating')}>Rating ↕</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {stores.map((store) => (
                                                <tr key={store.id}>
                                                    <td>{store.name}</td>
                                                    <td>{store.email}</td>
                                                    <td>{store.address}</td>
                                                    <td>{store.ownerName || 'Not assigned'}</td>
                                                    <td>
                                                        <span className="rating-value">
                                                            ★ {Number(store.averageRating).toFixed(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}

                                            {stores.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="empty-state">
                                                        No stores found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
