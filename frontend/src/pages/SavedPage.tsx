import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockPosts } from '../data/mockData';
import { TypeBadge } from '../components/TypeBadge';
import { StarRating } from '../components/StarRating';
import styles from './SavedPage.module.css';

const SUB_TABS = ['All', 'Itineraries', 'Restaurants', 'Experiences'];

export function SavedPage() {
    const [tab, setTab] = useState('All');
    const saved = mockPosts.filter(p => p.saved || p.type === 'restaurant');

    const filtered = tab === 'All' ? saved
        : tab === 'Itineraries' ? saved.filter(p => p.type === 'itinerary')
            : tab === 'Restaurants' ? saved.filter(p => p.type === 'restaurant')
                : saved.filter(p => p.type === 'experience');

    const itineraries = filtered.filter(p => p.type === 'itinerary');
    const restaurants = filtered.filter(p => p.type === 'restaurant');

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                {/* Left sidebar area */}
                <aside className={styles.sidebar}>
                    <div className={styles.sideCard}>
                        <h3 className={styles.sideTitle}>📍 Quick Navigation</h3>
                        <nav className={styles.sideNav}>
                            <a href="#itineraries" className={styles.sideNavItem}>
                                <span>🗺️</span> Itineraries
                            </a>
                            <a href="#restaurants" className={styles.sideNavItem}>
                                <span>🍜</span> Restaurants
                            </a>
                        </nav>
                        <Link to="/map" className={styles.viewMapBtn}>
                            📍 View all on Map
                        </Link>
                    </div>
                </aside>

                {/* Main content */}
                <div className={styles.main}>
                    <div className={styles.header}>
                        <h1 className="text-h1">Saved Places</h1>
                        <p className="text-sm">Your bookmarked itineraries and favorite restaurants.</p>
                    </div>

                    {/* Sub-tabs */}
                    <div className={styles.subTabs}>
                        {SUB_TABS.map(t => (
                            <button
                                key={t}
                                className={`${styles.subTab} ${tab === t ? styles.subTabActive : ''}`}
                                onClick={() => setTab(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            {/* Itineraries Section */}
                            {itineraries.length > 0 && (
                                <section id="itineraries" className={styles.section}>
                                    <h2 className={`text-h2 ${styles.sectionTitle}`}>Saved Itineraries</h2>
                                    <div className={styles.itineraryGrid}>
                                        {itineraries.map(post => (
                                            <Link key={post.id} to={`/itinerary/${post.id}`} className={styles.itineraryCard}>
                                                <div className={styles.itineraryCoverWrap}>
                                                    <img src={post.coverImage} alt={post.title} className={styles.itineraryCover} />
                                                    <div className={styles.itineraryOverlay}>
                                                        <TypeBadge type={post.type as 'itinerary'} />
                                                        {post.daysCount && (
                                                            <span className={`${styles.daysTag} mono`}>{post.daysCount} Days</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        className={styles.unsaveBtn}
                                                        onClick={e => e.preventDefault()}
                                                        title="Remove from saved"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-primary)" stroke="var(--accent-primary)" strokeWidth="2">
                                                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className={styles.itineraryInfo}>
                                                    <p className={styles.itineraryTitle}>{post.title}</p>
                                                    <div className={styles.itineraryMeta}>
                                                        <img src={post.author.avatar} className={styles.miniAvatar} alt="" />
                                                        <span>{post.author.displayName}</span>
                                                        <span className={styles.destPill}>{post.destination}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Restaurants Section */}
                            {restaurants.length > 0 && (
                                <section id="restaurants" className={styles.section}>
                                    <h2 className={`text-h2 ${styles.sectionTitle}`}>Saved Restaurants</h2>
                                    <div className={styles.restaurantList}>
                                        {restaurants.map(post => (
                                            <Link key={post.id} to={`/review/${post.id}`} className={styles.restaurantRow}>
                                                <img src={post.coverImage} alt={post.title} className={styles.restaurantImg} />
                                                <div className={styles.restaurantInfo}>
                                                    <p className={styles.restaurantName}>{post.title}</p>
                                                    <div style={{ marginBottom: 4 }}>
                                                        {post.rating && <StarRating rating={post.rating} size="sm" />}
                                                    </div>
                                                    <p className={styles.restaurantMeta}>{post.destination} · {(post as { priceRange?: string }).priceRange || '$$'}</p>
                                                </div>
                                                <div className={styles.restaurantRight}>
                                                    <Link to="/map" className={styles.onMapLink}>📍 On map</Link>
                                                    <button className={styles.unsaveBtn2} onClick={e => e.preventDefault()}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-primary)" stroke="var(--accent-primary)" strokeWidth="2">
                                                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="38" stroke="var(--border-default)" strokeWidth="2" />
                    <path d="M40 20 L43 30 L54 31 L46 38 L48 49 L40 44 L32 49 L34 38 L26 31 L37 30 Z" stroke="var(--text-secondary)" strokeWidth="1.5" fill="none" />
                    <line x1="40" y1="10" x2="40" y2="15" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="40" y1="65" x2="40" y2="70" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="10" y1="40" x2="15" y2="40" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="65" y1="40" x2="70" y2="40" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>
            <h2 className="text-h3">Nothing saved yet</h2>
            <p className="text-sm">Start exploring to save places and itineraries.</p>
            <Link to="/explore" className={styles.exploreBtn}>Go Explore</Link>
        </div>
    );
}
