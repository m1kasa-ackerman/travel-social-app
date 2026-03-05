import { useParams, Link } from 'react-router-dom';
import { mockPosts, mockComments, mockItinerarySteps, mockCurrentUser } from '../data/mockData';
import styles from './ItineraryPage.module.css';

export function ItineraryPage() {
    const { id } = useParams();
    const post = mockPosts.find(p => p.id === id && p.type === 'itinerary') || mockPosts.find(p => p.type === 'itinerary')!;

    return (
        <div className={styles.page}>
            <div className={styles.layout}>
                <article className={styles.main}>
                    {/* Hero Image */}
                    <div className={styles.heroWrap}>
                        <img src={post.coverImage} alt={post.title} className={styles.heroImg} />
                    </div>

                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.badges}>
                            <span className={styles.typeBadge}>🗺️ Itinerary</span>
                            {post.daysCount && <span className={`${styles.daysBadge} mono`}>{post.daysCount} Days</span>}
                        </div>
                        <h1 className={`text-hero ${styles.title}`}>{post.title}</h1>
                        <div className={styles.meta}>
                            <Link to={`/profile/${post.author.username}`} className={styles.authorLink}>
                                <img src={post.author.avatar} alt={post.author.displayName} className={styles.authorAvatar} />
                                <span>{post.author.displayName}</span>
                            </Link>
                            <span className={styles.metaSep}>·</span>
                            <span>{post.destination}</span>
                            <span className={styles.metaSep}>·</span>
                            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className={styles.tags}>
                            {post.tags.map(tag => (
                                <Link key={tag} to={`/explore?q=${encodeURIComponent(tag)}`} className={styles.tag}>#{tag}</Link>
                            ))}
                        </div>
                    </div>

                    {/* Day-by-Day Timeline */}
                    <div className={styles.timeline}>
                        {mockItinerarySteps.map((day, di) => (
                            <div key={di} className={styles.dayGroup}>
                                <div className={styles.dayHeaderCard}>
                                    <div className={styles.dayCircle}>{di + 1}</div>
                                    <span className={styles.dayLabel}>Day {di + 1} — {day.city}</span>
                                </div>
                                <div className={styles.stopsGroup}>
                                    {day.stops.map((stop, si) => (
                                        <div key={stop.id} className={`${styles.stopCard} card-stagger`} style={{ '--card-index': si } as React.CSSProperties}>
                                            <div className={styles.stopHeader}>
                                                <span className={styles.stopName}>{stop.name}</span>
                                                <span className={`${styles.stopType} ${styles[`stopType_${stop.type}`]}`}>{stop.type}</span>
                                            </div>
                                            <p className={styles.stopNote}>{stop.note}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Comments */}
                    <div className={styles.comments}>
                        <h2 className={`text-h2 ${styles.commentsTitle}`}>Comments ({mockComments.length})</h2>

                        {/* Add comment */}
                        <div className={styles.addComment}>
                            <img src={mockCurrentUser.avatar} alt="" className={styles.commentAvatar} />
                            <input className={styles.commentInput} placeholder="Add a comment…" />
                        </div>

                        {mockComments.map(comment => (
                            <div key={comment.id} className={styles.commentRow}>
                                <img src={comment.author.avatar} alt={comment.author.displayName} className={styles.commentAvatar} />
                                <div className={styles.commentBody}>
                                    <div className={styles.commentMeta}>
                                        <span className={styles.commentAuthor}>{comment.author.displayName}</span>
                                        <span className={styles.commentTime}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className={styles.commentText}>{comment.text}</p>
                                    <div className={styles.commentActions}>
                                        <button className={styles.commentAction}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                            </svg>
                                            {comment.likes}
                                        </button>
                                        <button className={styles.commentAction}>Reply</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                {/* Sticky Action Panel */}
                <aside className={styles.actionPanel}>
                    <div className={styles.actionCard}>
                        <button className={styles.actionPrimary}>🔖 Save Itinerary</button>
                        <button className={styles.actionSecondary}>Follow Author</button>
                        <Link to="/map" className={styles.actionSecondary}>📍 View all stops on Map</Link>
                        <button className={styles.actionGhost}>↗ Share</button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
