import React, { useEffect, useRef, useState, useCallback } from 'react';
import { commentsApi, type Comment } from '../api/social';
import { useAuth } from '../context/AuthContext';
import styles from './CommentsSection.module.css';

interface Props {
    postId: string;
}

export default function CommentsSection({ postId }: Props) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState('');
    const [replyTo, setReplyTo] = useState<Comment | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        try {
            const data = await commentsApi.list(postId);
            setComments(data.content);
            setTotal(data.totalElements);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [postId]);

    useEffect(() => { load(); }, [load]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || submitting) return;
        setSubmitting(true);
        try {
            const c = await commentsApi.add(postId, input.trim(), replyTo?.id);
            setComments(prev => [...prev, c]);
            setTotal(t => t + 1);
            setInput('');
            setReplyTo(null);
        } catch { /* ignore */ }
        finally { setSubmitting(false); }
    }

    async function handleDelete(commentId: string) {
        try {
            await commentsApi.delete(postId, commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
            setTotal(t => t - 1);
        } catch { /* ignore */ }
    }

    function handleReply(c: Comment) {
        setReplyTo(c);
        inputRef.current?.focus();
    }

    // Group: render top-level then replies underneath
    const topLevel = comments.filter(c => !c.parentId);
    const replies = (parentId: string) => comments.filter(c => c.parentId === parentId);

    if (loading) return <div className={styles.loading}>Loading comments…</div>;

    return (
        <div className={styles.root}>
            <h3 className={styles.heading}>💬 Comments ({total})</h3>

            {/* Input */}
            {user && (
                <form className={styles.form} onSubmit={handleSubmit}>
                    {replyTo && (
                        <div className={styles.replyBanner}>
                            Replying to <strong>@{replyTo.authorUsername}</strong>
                            <button type="button" className={styles.cancelReply} onClick={() => setReplyTo(null)}>✕</button>
                        </div>
                    )}
                    <div className={styles.inputRow}>
                        {user.avatarUrl
                            ? <img className={styles.ownAvatar} src={user.avatarUrl} alt={user.displayName} />
                            : <div className={styles.ownAvatarInitial}>{user.displayName?.[0]?.toUpperCase()}</div>}
                        <input
                            ref={inputRef}
                            className={styles.input}
                            placeholder={replyTo ? `Reply to @${replyTo.authorUsername}…` : 'Add a comment…'}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            disabled={submitting}
                        />
                        <button className={styles.submitBtn} type="submit" disabled={submitting || !input.trim()}>
                            {submitting ? '…' : 'Post'}
                        </button>
                    </div>
                </form>
            )}

            {/* Comments list */}
            <div className={styles.list}>
                {topLevel.length === 0 && (
                    <div className={styles.empty}>Be the first to comment!</div>
                )}
                {topLevel.map(c => (
                    <div key={c.id} className={styles.commentBlock}>
                        <CommentItem
                            comment={c}
                            currentUserId={user?.id}
                            onReply={() => handleReply(c)}
                            onDelete={() => handleDelete(c.id)}
                        />
                        {replies(c.id).map(r => (
                            <div key={r.id} className={styles.reply}>
                                <CommentItem
                                    comment={r}
                                    currentUserId={user?.id}
                                    onReply={() => handleReply(r)}
                                    onDelete={() => handleDelete(r.id)}
                                    isReply
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function CommentItem({
    comment, currentUserId, onReply, onDelete, isReply = false
}: {
    comment: Comment;
    currentUserId?: string;
    onReply: () => void;
    onDelete: () => void;
    isReply?: boolean;
}) {
    const isOwn = currentUserId === comment.authorId;
    return (
        <div className={`${styles.comment} ${isReply ? styles.commentReply : ''}`}>
            {comment.authorAvatarUrl
                ? <img className={styles.avatar} src={comment.authorAvatarUrl} alt={comment.authorDisplayName} />
                : <div className={styles.avatarInitial}>{comment.authorDisplayName?.[0]?.toUpperCase()}</div>}
            <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                    <span className={styles.authorName}>{comment.authorDisplayName}</span>
                    <span className={styles.authorHandle}>@{comment.authorUsername}</span>
                    <span className={styles.time}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <div className={styles.commentText}>{comment.body}</div>
                <div className={styles.commentActions}>
                    {currentUserId && (
                        <button className={styles.replyBtn} onClick={onReply}>↩ Reply</button>
                    )}
                    {isOwn && (
                        <button className={styles.deleteBtn} onClick={onDelete}>Delete</button>
                    )}
                </div>
            </div>
        </div>
    );
}
