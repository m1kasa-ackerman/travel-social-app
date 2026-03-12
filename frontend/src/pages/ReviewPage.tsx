import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockPosts, mockComments, mockCurrentUser } from '../data/mockData';
import { StarRating } from '../components/StarRating';
import styles from './ReviewPage.module.css';

export function ReviewPage() {
    const { id } = useParams();
    const post = mockPosts.find(p => p.id === id && p.type === 'restaurant') || mockPosts.find(p => p.type === 'restaurant')!;
    const r = post as typeof post & { rating: number; recommend: boolean; priceRange: string };
    const [photoIdx, setPhotoIdx] = useState(0);
    const [saved, setSaved] = useState(false);

    const photos = [post.coverImage, post.coverImage, post.coverImage];

    const relatedPosts = mockPosts.filter(p => p.type === 'restaurant' && p.id !== post.id);

    return (
        <div className={styles.page}>
            <div className={styles.layout}>
                <article className={styles.main}>
                    {/* Photo Carousel */}
                    <div className={styles.carousel}>
                        <img src={photos[photoIdx]} alt={post.title} className={styles.carouselImg} />
                        <button className={`${styles.carouselArrow} ${styles.carouselPrev}`} onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}>‹</button>
                        <button className={`${styles.carouselArrow} ${styles.carouselNext}`} onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}>›</button>
                        <div className={styles.carouselDots}>
                            {photos.map((_, i) => (
                                <button key={i} className={`${styles.dot} ${i === photoIdx ? styles.dotActive : ''}`} onClick={() => setPhotoIdx(i)} />
                            ))}
                        </div>
                    </div>

                    {/* Header */}
                    <div className={styles.header}>
                        <h1 className="text-h1">{post.title}</h1>
                        <div className={styles.pillRow}>
                            <span className={styles.cuisineTag}>🍽️ Fine Dining</span>
                            <span className={styles.cuisineTag}>🌍 {post.destination}</span>
                            {r.priceRange && <span className={`${styles.priceTag} mono`}>{r.priceRange}</span>}
                        </div>

                        <div className={styles.ratingRow}>
                            <StarRating rating={r.rating || 5} size="lg" />
                            <span className={`${styles.ratingCount} mono`}>{post.savesCount} ratings</span>
                        </div>

                        {/* Author */}
                        <Link to={`/profile/${post.author.username}`} className={styles.authorCard}>
                            <img src={post.author.avatar} alt={post.author.displayName} className={styles.authorAvatar} />
                            <div>
                                <p className={styles.authorName}>{post.author.displayName}</p>
                                <p className={styles.authorHandle}>@{post.author.username}</p>
                            </div>
                            <button className={styles.followAuthorBtn}>Follow</button>
                        </Link>
                    </div>

                    {/* Review Body */}
                    <div className={styles.reviewBody}>
                        <p>{post.preview}</p>
                        <p>The tasting menu changes seasonally, celebrating Japan's connection to the earth and sea. Each course is a masterwork of restraint and precision. The "Satoyama Scenery" — a tribute to Japanese rural landscapes — arrives as a forest of edible moss, mushrooms, and soil-earth flavors that somehow transport you to the mountains.</p>
                        <p>The sake pairing was exceptional. The sommelier walked us through each selection with warmth and depth of knowledge. Service matched a three-star experience in every way.</p>
                    </div>

                    {/* Metadata */}
                    <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Would recommend</span>
                            <span className={styles.metaValue}>{r.recommend ? '✅ Yes' : '❌ No'}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Visited</span>
                            <span className={styles.metaValue}>March 2025</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Price range</span>
                            <span className={`${styles.metaValue} mono`}>{r.priceRange || '$$$$'}</span>
                        </div>
                    </div>

                    {/* Map Embed placeholder */}
                    <div className={styles.mapEmbed}>
                        <div className={styles.mapPlaceholder}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{post.title}, {post.destination}</span>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className={styles.comments}>
                        <h2 className="text-h2" style={{ marginBottom: 'var(--space-4)' }}>Comments</h2>
                        <div className={styles.addComment}>
                            <img src={mockCurrentUser.avatar} alt="" className={styles.commentAvatar} />
                            <input className={styles.commentInput} placeholder="Add a comment…" />
                        </div>
                        {mockComments.slice(0, 2).map(comment => (
                            <div key={comment.id} className={styles.commentRow}>
                                <img src={comment.author.avatar} alt="" className={styles.commentAvatar} />
                                <div>
                                    <div className={styles.commentMeta}>
                                        <span className={styles.commentAuthor}>{comment.author.displayName}</span>
                                        <span className={styles.commentTime}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className={styles.commentText}>{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* More Reviews */}
                    {relatedPosts.length > 0 && (
                        <div className={styles.moreReviews}>
                            <h2 className="text-h2" style={{ marginBottom: 'var(--space-4)' }}>More Restaurant Reviews</h2>
                            <div className={styles.moreGrid}>
                                {relatedPosts.slice(0, 2).map((p) => (
                                    <Link key={p.id} to={`/review/${p.id}`} className={styles.moreCard}>
                                        <img src={p.coverImage} alt={p.title} className={styles.moreImg} />
                                        <div className={styles.moreInfo}>
                                            <p className={styles.moreTitle}>{p.title}</p>
                                            <p className={styles.moreDest}>{p.destination}</p>
                                            {p.rating && <StarRating rating={p.rating} size="sm" />}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </article>

                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sideCard}>
                        <button
                            className={`${styles.wishlistBtn} ${saved ? styles.wishlistSaved : ''}`}
                            onClick={() => setSaved(s => !s)}
                        >
                            {saved ? '🔖 Saved to Wishlist' : '🔖 Add to Wishlist'}
                        </button>
                        <div className={styles.restaurantDetails}>
                            <p className={styles.detailLabel}>Location</p>
                            <p className={styles.detailValue}>{post.destination}</p>
                            <p className={styles.detailLabel}>Cuisine</p>
                            <p className={styles.detailValue}>Fine Dining · Japanese</p>
                            <p className={styles.detailLabel}>Price Range</p>
                            <p className={`${styles.detailValue} mono`}>{r.priceRange || '$$$$'}</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
