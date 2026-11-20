
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="home-page">
            <header className="topbar">
                <Link to="/" className="brand">
                    <span className="brand-star">☆</span>
                    <span>Store<span className="brand-blue">Rate</span></span>
                </Link>

                <nav>
                    <Link to="/" className="active-link">Home</Link>
                    <a href="#about">About</a>
                    <Link to="/login" className="nav-login">Login</Link>
                </nav>
            </header>

            <main className="hero-section">
                <section className="hero-content">
                    <span className="eyebrow">YOUR OPINION MATTERS</span>

                    <h1>
                        Rate Stores.<br />
                        Share <span>Experiences.</span>
                    </h1>

                    <p>
                        Help others find the best stores and make
                        better choices together. Discover stores,
                        share your experience and make a difference.
                    </p>

                    <div className="hero-buttons">
                        <Link to="/login" className="primary-btn">
                            Get Started →
                        </Link>

                        <a href="#about" className="secondary-btn">
                            Learn More
                        </a>
                    </div>

                    <div className="feature-list" id="about">
                        <div className="feature">
                            <span>⌕</span>
                            <h3>Explore Stores</h3>
                            <p>Find stores and discover new places.</p>
                        </div>

                        <div className="feature">
                            <span>★</span>
                            <h3>Give Ratings</h3>
                            <p>Share your experience and opinion.</p>
                        </div>

                        <div className="feature">
                            <span>♧</span>
                            <h3>Build Community</h3>
                            <p>Help others make better choices.</p>
                        </div>
                    </div>
                </section>

                <section className="hero-visual">
                    <div className="rating-card">
                        <span className="rating-stars">★★★★★</span>
                        <span className="rating-text">Customer Reviews</span>
                    </div>

                    <div className="store-illustration">
                        <div className="store-icon">⌂</div>
                        <div className="store-awning">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className="store-body">
                            <div className="store-window"></div>
                            <div className="store-door"></div>
                            <div className="store-window"></div>
                        </div>
                    </div>

                    <div className="visual-caption">
                        <strong>Discover. Rate. Review.</strong>
                        <span>Every rating makes a difference.</span>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="brand footer-brand">
                    <span className="brand-star">☆</span>
                    <span>StoreRate</span>
                </div>
                <span>Rate. Review. Discover.</span>
                <span>© 2026 StoreRate</span>
            </footer>
        </div>
    );
}

export default Home;
