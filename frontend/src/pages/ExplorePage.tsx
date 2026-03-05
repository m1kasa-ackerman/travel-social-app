import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PostCard } from '../components/PostCard';
import { TypeBadge } from '../components/TypeBadge';
import { mockPosts, mockDestinations, mockUsers } from '../data/mockData';
import styles from './ExplorePage.module.css';

export function ExplorePage() {
    const [params] = useSearchParams();
    const [search, setSearch] = useState(params.get('q') || '');

    const itineraries = mockPosts.filter(p => p.type === 'itinerary');
    const restaurants = mockPosts.filter(p => p.type === 'restaurant');

    return (
        <div className={styles.page}>
            {/* Hero */}
            <div className={styles.hero} style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80)' }}>
                <div className={styles.heroOverlay}>
                    <h1 className={`${styles.heroTitle} text-hero`}>Discover the World Through Those Who've Lived It</h1>
                    <p className={styles.heroSub}>Find itineraries, restaurants, and hidden gems shared by real travelers.</p>
                    <form className={styles.heroSearch} onSubmit={e => { e.preventDefault(); }}>
                        <input
                            type="text"
                            className={styles.heroInput}
                            placeholder="Where do you want to go?"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button type="submit" className={styles.heroSearchBtn}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>

            <div className={styles.content}>
                {/* Trending Destinations */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className="text-h2">Trending Destinations</h2>
                        <a href="#" className={styles.seeAll}>See all →</a>
                    </div>
                    <div className={`scroll-row ${styles.destRow}`}>
                        {mockDestinations.map(dest => (
                            <Link key={dest.id} to={`/explore?q=${encodeURIComponent(dest.name)}`} className={styles.destCard}>
                                <div className={styles.destImageWrap}>
                                    <img src={dest.image} alt={dest.name} className={styles.destImage} />
                                    <div className={styles.destOverlay}>
                                        <p className={styles.destName}>{dest.name}</p>
                                        <p className={styles.destCount} style={{ fontFamily: 'var(--font-mono)' }}>{dest.postsCount.toLocaleString()} posts</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Featured Itineraries */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className="text-h2">Featured Itineraries</h2>
                    </div>
                    <div className={styles.threeGrid}>
                        {itineraries.slice(0, 3).map((post, i) => (
                            <PostCard key={post.id} post={post as Parameters<typeof PostCard>[0]['post']} compact cardIndex={i} />
                        ))}
                    </div>
                </section>

                {/* Top Reviewers */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className="text-h2">Top Reviewers</h2>
                    </div>
                    <div className={`scroll-row ${styles.reviewerRow}`}>
                        {mockUsers.map(u => (
                            <div key={u.id} className={styles.reviewerCard}>
                                <img src={u.avatar} alt={u.displayName} className={styles.reviewerAvatar} />
                                <p className={styles.reviewerName}>{u.displayName}</p>
                                <p className={styles.reviewerSub}>{u.postsCount} posts</p>
                                <button className={styles.reviewerFollowBtn}>Follow</button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Restaurant Reviews */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className="text-h2">Recent Restaurant Reviews</h2>
                    </div>
                    <div className={styles.twoGrid}>
                        {restaurants.map((post, i) => (
                            <PostCard key={post.id} post={post as Parameters<typeof PostCard>[0]['post']} cardIndex={i} />
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
                        <button className={styles.loadMoreBtn}>Load more</button>
                    </div>
                </section>
            </div>
        </div>
    );
}
