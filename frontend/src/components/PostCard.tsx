import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TypeBadge } from './TypeBadge';
import { StarRating } from './StarRating';
import styles from './PostCard.module.css';
import type { Post as ApiPost } from '../api/posts';

// Accept both API shape and legacy mock shape
interface PostCardProps {
    post: ApiPost | LegacyPost;
    onSave?: (postId: string) => void;
    onFollow?: (username: string) => void;
    compact?: boolean;
    cardIndex?: number;
}

// Legacy mock post shape (still used in non-feed pages)
interface LegacyPost {
    id: string;
    type: 'itinerary' | 'restaurant' | 'experience';
    title: string;
    preview?: string;
    body?: string;
    coverImage?: string;
    coverImageUrl?: string;
    destination?: string;
    tags: string[];
    author?: {
        id: string;
        username: string;
        displayName: string;
        avatar?: string;
        avatarUrl?: string;
    };
    authorId?: string;
    authorUsername?: string;
    authorDisplayName?: string;
    authorAvatarUrl?: string;
    createdAt: string;
    savesCount?: number;
    saveCount?: number;
    savedByCurrentUser?: boolean;
    saved?: boolean;
    daysCount?: number;
    rating?: number | null;
    recommend?: boolean;
    priceRange?: string;
    stopsCount?: number;
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'today';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

// Normalise either shape into one consistent shape
function normalisePost(post: ApiPost | LegacyPost) {
    const p = post as LegacyPost & ApiPost;
    return {
        id: p.id,
        type: p.type,
        title: p.title,
        preview: p.preview ?? p.body ?? '',
        coverImage: p.coverImage ?? p.coverImageUrl ?? '',
        destination: p.destination ?? '',
        tags: p.tags ?? [],
        authorUsername: p.author?.username ?? p.authorUsername ?? '',
        authorDisplayName: p.author?.displayName ?? p.authorDisplayName ?? '',
        authorAvatar: p.author?.avatar ?? p.author?.avatarUrl ?? p.authorAvatarUrl ?? '',
        createdAt: p.createdAt,
        saveCount: p.savesCount ?? p.saveCount ?? 0,
        saved: p.saved ?? p.savedByCurrentUser ?? false,
        daysCount: p.daysCount,
        rating: p.rating,
        recommend: p.recommend,
        priceRange: p.priceRange,
    };
}

export function PostCard({ post, onSave, onFollow, compact = false, cardIndex = 0 }: PostCardProps) {
    const n = normalisePost(post);
    const [saved, setSaved] = useState(n.saved);
    const [saveCount, setSaveCount] = useState(n.saveCount);
    const [saveAnim, setSaveAnim] = useState(false);
    const [following, setFollowing] = useState(false);

    function handleSave(e: React.MouseEvent) {
        e.preventDefault();
        const newSaved = !saved;
        setSaved(newSaved);
        setSaveCount(c => newSaved ? c + 1 : c - 1);
        if (newSaved) {
            setSaveAnim(true);
            setTimeout(() => setSaveAnim(false), 300);
        }
        onSave?.(n.id);
    }

    function handleFollow(e: React.MouseEvent) {
        e.preventDefault();
        const next = !following;
        setFollowing(next);
        onFollow?.(n.authorUsername);
    }

    const postLink = n.type === 'itinerary' ? `/itinerary/${n.id}` : n.type === 'restaurant' ? `/review/${n.id}` : `/itinerary/${n.id}`;

    return (
        <article
            className={`${styles.card} card-stagger`}
            style={{ '--card-index': cardIndex } as React.CSSProperties}
        >
            {/* Cover Image */}
            <Link to={postLink}>
                <div className={styles.imageWrap}>
                    {n.coverImage ? (
                        <img src={n.coverImage} alt={n.title} className={styles.coverImg} />
                    ) : (
                        <div className={styles.coverImgPlaceholder}>
                            {n.type === 'itinerary' ? '🗺️' : n.type === 'restaurant' ? '🍜' : '✨'}
                        </div>
                    )}
                    <div className={styles.typeBadgeOverlay}>
                        <TypeBadge type={n.type} />
                    </div>
                    {n.type === 'itinerary' && n.daysCount && (
                        <div className={styles.daysBadge}>
                            <span className="mono">{n.daysCount} Days</span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className={styles.content}>
                {/* Author row */}
                <div className={styles.authorRow}>
                    <Link to={`/profile/${n.authorUsername}`} className={styles.authorLink}>
                        {n.authorAvatar ? (
                            <img src={n.authorAvatar} alt={n.authorDisplayName} className={styles.avatar} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {n.authorDisplayName?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                        <span className={styles.displayName}>{n.authorDisplayName}</span>
                        <span className={styles.handle}>@{n.authorUsername}</span>
                    </Link>
                    <span className={styles.meta}>· {timeAgo(n.createdAt)}</span>
                    {n.destination && <div className={styles.destPill}>{n.destination}</div>}
                </div>

                {/* Title */}
                <Link to={postLink} className={styles.titleLink}>
                    <h2 className={`${styles.title} ${compact ? styles.compact : ''}`}>{n.title}</h2>
                </Link>

                {/* Rating (restaurant) */}
                {n.type === 'restaurant' && n.rating !== null && n.rating !== undefined && (
                    <div className={styles.ratingRow}>
                        <StarRating rating={n.rating} size="sm" />
                        {n.priceRange && <span className={styles.priceRange}>{n.priceRange}</span>}
                    </div>
                )}

                {/* Preview text */}
                {!compact && (
                    <p className={`${styles.preview} line-clamp-3`}>{n.preview}</p>
                )}

                {/* Tags */}
                {!compact && n.tags && n.tags.length > 0 && (
                    <div className={styles.tags}>
                        {n.tags.slice(0, 4).map(tag => (
                            <span key={tag} className={styles.tag}>#{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Row */}
            <div className={styles.actions}>
                <button
                    className={`${styles.actionBtn} ${saved || saveAnim ? styles.savedActive : ''}`}
                    onClick={handleSave}
                    title="Save"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                    <span className={`${styles.actionCount} mono`}>{saveCount}</span>
                </button>

                <button
                    className={`${styles.actionBtn} ${following ? styles.followingActive : ''}`}
                    onClick={handleFollow}
                    title={following ? 'Unfollow' : 'Follow'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className={styles.actionLabel}>{following ? 'Following' : 'Follow'}</span>
                </button>

                <Link to="/map" className={styles.actionBtn} title="View on Map">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className={styles.actionLabel}>Map</span>
                </Link>

                <button className={styles.actionBtn} title="Share" onClick={() => {
                    if (navigator.share) {
                        navigator.share({ title: n.title, url: window.location.href });
                    } else {
                        navigator.clipboard.writeText(window.location.origin + postLink);
                    }
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    <span className={styles.actionLabel}>Share</span>
                </button>
            </div>
        </article>
    );
}

export function PostCardSkeleton() {
    return (
        <div className={styles.card}>
            <div className={`skeleton ${styles.skelImg}`} />
            <div className={styles.content}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    <div className="skeleton" style={{ width: 100, height: 12 }} />
                    <div className="skeleton" style={{ width: 60, height: 12 }} />
                </div>
                <div className="skeleton" style={{ width: '85%', height: 18, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '60%', height: 18, marginBottom: 12 }} />
                <div className="skeleton" style={{ width: '100%', height: 13, marginBottom: 4 }} />
                <div className="skeleton" style={{ width: '90%', height: 13, marginBottom: 4 }} />
                <div className="skeleton" style={{ width: '75%', height: 13 }} />
            </div>
            <div className={styles.actions} style={{ borderTop: '1px solid var(--border-default)', padding: '8px 12px', display: 'flex', gap: 16 }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ width: 50, height: 24 }} />)}
            </div>
        </div>
    );
}
