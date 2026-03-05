import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsApi, usersApi } from '../api/posts';
import type { Post } from '../api/posts';
import { PostCard, PostCardSkeleton } from '../components/PostCard';
import { mockTrendingTags, mockUsers } from '../data/mockData';
import styles from './HomePage.module.css';

const FEED_TABS = ['✨ For You', '👥 Following', '🔥 Trending'];
const FILTER_MAP: ('forYou' | 'following' | 'trending')[] = ['forYou', 'following', 'trending'];

export function HomePage() {
    const { user } = useAuth();
    const [feedTab, setFeedTab] = useState(0);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [followStates, setFollowStates] = useState<Record<string, boolean>>({});

    const loadFeed = useCallback(async (tab: number) => {
        setLoading(true);
        try {
            const res = await postsApi.getFeed(FILTER_MAP[tab]);
            setPosts(res.content);
        } catch {
            // If API fails (e.g., empty DB), show empty state
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFeed(feedTab);
    }, [feedTab, loadFeed]);

    async function handleSave(postId: string) {
        try {
            await postsApi.toggleSave(postId);
        } catch { /* optimistic UI already updated */ }
    }

    async function handleFollow(username: string) {
        try {
            const res = await usersApi.toggleFollow(username);
            setFollowStates(prev => ({ ...prev, [username]: res.following }));
        } catch { /* ignore */ }
    }

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                {/* Left Sidebar */}
                <aside className={styles.sidebar}>
                    {/* Profile Quickview */}
                    {user && (
                        <div className={styles.sideCard}>
                            <Link to={`/profile/${user.username}`} className={styles.profileQuick}>
                                <div className={styles.sideAvatarPlaceholder}>
                                    {user.displayName?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <p className={styles.sideDisplayName}>{user.displayName}</p>
                                    <p className={styles.sideHandle}>@{user.username}</p>
                                </div>
                            </Link>
                            <div className={styles.statsRow}>
                                <div className={styles.stat}>
                                    <span className={`${styles.statNum} mono`}>{user.postsCount ?? 0}</span>
                                    <span className={styles.statLabel}>Posts</span>
                                </div>
                                <div className={styles.statDiv} />
                                <div className={styles.stat}>
                                    <span className={`${styles.statNum} mono`}>
                                        {user.followersCount ?? 0}
                                    </span>
                                    <span className={styles.statLabel}>Followers</span>
                                </div>
                                <div className={styles.statDiv} />
                                <div className={styles.stat}>
                                    <span className={`${styles.statNum} mono`}>{user.followingCount ?? 0}</span>
                                    <span className={styles.statLabel}>Following</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trending Tags */}
                    <div className={styles.sideCard}>
                        <h3 className={`${styles.sideHeader} text-xs`}>🌍 Popular Destinations</h3>
                        <div className={styles.tagCloud}>
                            {mockTrendingTags.map(tag => (
                                <Link key={tag} to={`/explore?q=${tag}`} className={styles.tagPill}>
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Top Explorers */}
                    <div className={styles.sideCard}>
                        <h3 className={`${styles.sideHeader} text-xs`}>🏆 Top Explorers This Week</h3>
                        <div className={styles.explorersList}>
                            {mockUsers.slice(1, 6).map(u => (
                                <div key={u.id} className={styles.explorerRow}>
                                    <Link to={`/profile/${u.username}`} className={styles.explorerLeft}>
                                        <img src={u.avatar} alt={u.displayName} className={styles.explorerAvatar} />
                                        <div>
                                            <p className={styles.explorerName}>{u.displayName}</p>
                                            <p className={styles.explorerHandle}>@{u.username}</p>
                                        </div>
                                    </Link>
                                    <button
                                        className={`${styles.followBtn} ${followStates[u.username] ? styles.followBtnFollowing : ''}`}
                                        onClick={() => handleFollow(u.username)}
                                    >
                                        {followStates[u.username] ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Feed */}
                <section className={styles.feed}>
                    {/* Feed Selector */}
                    <div className={styles.feedTabs}>
                        {FEED_TABS.map((tab, i) => (
                            <button
                                key={tab}
                                className={`${styles.feedTab} ${feedTab === i ? styles.feedTabActive : ''}`}
                                onClick={() => setFeedTab(i)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Posts */}
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
                    ) : posts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>✈️</div>
                            <h3 className={styles.emptyTitle}>No posts yet</h3>
                            <p className={styles.emptyDesc}>
                                {feedTab === 1
                                    ? 'Follow some travellers to see their posts here!'
                                    : 'Be the first to share a travel story!'}
                            </p>
                            <Link to="/create" className={styles.emptyCreateBtn}>
                                + Create First Post
                            </Link>
                        </div>
                    ) : (
                        posts.map((post, i) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                cardIndex={i}
                                onSave={handleSave}
                                onFollow={handleFollow}
                            />
                        ))
                    )}
                </section>
            </div>
        </div>
    );
}
