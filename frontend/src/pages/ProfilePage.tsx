import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockUsers, mockPosts } from '../data/mockData';
import { PostCard } from '../components/PostCard';
import styles from './ProfilePage.module.css';

const TABS = ['Posts', 'Itineraries', 'Reviews', 'Saved'];

export function ProfilePage() {
    const { username } = useParams();
    const profile = mockUsers.find(u => u.username === username) || mockUsers[0];
    const [tab, setTab] = useState('Posts');
    const [following, setFollowing] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const isOwn = username === mockUsers[0].username || !username;

    const posts = mockPosts.filter(p => p.author.username === profile.username);
    const itineraries = posts.filter(p => p.type === 'itinerary');
    const reviews = posts.filter(p => p.type === 'restaurant');

    const displayPosts = tab === 'Posts' ? posts : tab === 'Itineraries' ? itineraries : tab === 'Reviews' ? reviews : posts;

    function formatCount(n: number) {
        return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
    }

    return (
        <div className={styles.page}>
            {/* Banner */}
            <div className={styles.banner} style={{ backgroundImage: `url(${profile.coverPhoto})` }}>
                {isOwn && (
                    <button className={styles.editCoverBtn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Profile Info */}
            <div className={styles.profileSection}>
                <div className={styles.profileContent}>
                    <div className={styles.avatarWrap}>
                        <img src={profile.avatar} alt={profile.displayName} className={styles.avatar} />
                    </div>
                    <div className={styles.profileInfo}>
                        <div className={styles.profileTop}>
                            <div>
                                <h1 className={styles.displayName}>{profile.displayName}</h1>
                                <p className={styles.handle}>@{profile.username}</p>
                            </div>
                            <div className={styles.profileActions}>
                                {isOwn ? (
                                    <button className={styles.editBtn} onClick={() => setEditOpen(true)}>Edit Profile</button>
                                ) : (
                                    <>
                                        <button
                                            className={following ? styles.followingBtn : styles.followBtn}
                                            onClick={() => setFollowing(f => !f)}
                                        >
                                            {following ? '✓ Following' : 'Follow'}
                                        </button>
                                        <button className={styles.messageBtn}>Message</button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={styles.statsRow}>
                            <div className={styles.stat}>
                                <span className={`${styles.statNum} mono`}>{profile.postsCount}</span>
                                <span className={styles.statLabel}>Posts</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={`${styles.statNum} mono`}>{formatCount(profile.followersCount)}</span>
                                <span className={styles.statLabel}>Followers</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={`${styles.statNum} mono`}>{profile.followingCount}</span>
                                <span className={styles.statLabel}>Following</span>
                            </div>
                        </div>
                        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
                        {profile.location && (
                            <p className={styles.location}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                </svg>
                                {profile.location}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabsBar}>
                <div className={styles.tabsInner}>
                    {TABS.filter(t => isOwn || t !== 'Saved').map(t => (
                        <button
                            key={t}
                            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                            onClick={() => setTab(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Grid */}
            <div className={styles.postsSection}>
                {displayPosts.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No posts yet.</p>
                        {isOwn && <Link to="/create" className={styles.createLink}>Create your first post →</Link>}
                    </div>
                ) : (
                    tab === 'Reviews' ? (
                        <div className={styles.postsList}>
                            {displayPosts.map((p, i) => (
                                <PostCard key={p.id} post={p as Parameters<typeof PostCard>[0]['post']} cardIndex={i} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.postsGrid}>
                            {displayPosts.map((p, i) => (
                                <PostCard key={p.id} post={p as Parameters<typeof PostCard>[0]['post']} compact cardIndex={i} />
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Edit Profile Modal */}
            {editOpen && (
                <div className={styles.modalOverlay} onClick={() => setEditOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Edit Profile</h2>
                            <button className={styles.modalClose} onClick={() => setEditOpen(false)}>✕</button>
                        </div>
                        <div className={styles.modalForm}>
                            <div className={styles.avatarUpload}>
                                <img src={profile.avatar} alt="" className={styles.editAvatar} />
                                <button className={styles.changeAvatarBtn}>Change Avatar</button>
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Display Name</label>
                                <input className={styles.formInput} defaultValue={profile.displayName} />
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Username</label>
                                <input className={styles.formInput} defaultValue={`@${profile.username}`} />
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Bio</label>
                                <textarea className={styles.formTextarea} defaultValue={profile.bio} maxLength={160} rows={3} />
                                <span className={styles.charCount}>{profile.bio?.length || 0}/160</span>
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Location</label>
                                <input className={styles.formInput} defaultValue={profile.location} />
                            </div>
                            <button className={styles.saveBtn} onClick={() => setEditOpen(false)}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
