import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { messagesApi, type ConversationSummary } from '../api/social';
import { useAuth } from '../context/AuthContext';
import styles from './MessagesPage.module.css';

export default function MessagesPage() {
    useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [newDmUsername, setNewDmUsername] = useState('');
    const [sendingDm, setSendingDm] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            const data = await messagesApi.listConversations();
            setConversations(data.content);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function handleAccept(convId: string, accept: boolean) {
        try {
            await messagesApi.respond(convId, accept);
            load();
        } catch { /* ignore */ }
    }

    async function handleStartDm(e: React.FormEvent) {
        e.preventDefault();
        if (!newDmUsername.trim()) return;
        setSendingDm(true);
        setError('');
        try {
            const conv = await messagesApi.start(newDmUsername.trim());
            setNewDmUsername('');
            navigate(`/messages/${conv.id}`);
        } catch {
            setError('User not found or error starting conversation.');
        } finally {
            setSendingDm(false);
        }
    }

    const requests = conversations.filter(c => c.status === 'PENDING' && !c.isRequester);
    const accepted = conversations.filter(c => c.status === 'ACCEPTED');
    const sent = conversations.filter(c => c.status === 'PENDING' && c.isRequester);

    if (loading) return <div className={styles.loading}>Loading messages…</div>;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>💬 Messages</h1>
                    <form className={styles.newDmForm} onSubmit={handleStartDm}>
                        <input
                            className={styles.newDmInput}
                            placeholder="Send DM to @username…"
                            value={newDmUsername}
                            onChange={e => setNewDmUsername(e.target.value)}
                        />
                        <button className={styles.newDmBtn} disabled={sendingDm} type="submit">
                            {sendingDm ? '…' : 'Start chat'}
                        </button>
                    </form>
                    {error && <p className={styles.error}>{error}</p>}
                </div>

                {/* DM Requests */}
                {requests.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>📬 Message Requests ({requests.length})</h2>
                        {requests.map(c => (
                            <div className={styles.requestCard} key={c.id}>
                                <div className={styles.convLeft}>
                                    {c.otherAvatarUrl
                                        ? <img className={styles.avatar} src={c.otherAvatarUrl} alt={c.otherDisplayName} />
                                        : <div className={styles.avatarInitial}>{c.otherDisplayName[0]?.toUpperCase()}</div>}
                                    <div>
                                        <div className={styles.convName}>{c.otherDisplayName}</div>
                                        <div className={styles.convHandle}>@{c.otherUsername}</div>
                                        <div className={styles.convSub}>Wants to send you a message</div>
                                    </div>
                                </div>
                                <div className={styles.requestBtns}>
                                    <button className={styles.acceptBtn} onClick={() => handleAccept(c.id, true)}>Accept</button>
                                    <button className={styles.declineBtn} onClick={() => handleAccept(c.id, false)}>Decline</button>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Active conversations */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Conversations</h2>
                    {accepted.length === 0 && sent.length === 0 && (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>💬</div>
                            <p>No conversations yet. Start by sending a DM above!</p>
                        </div>
                    )}
                    {accepted.map(c => (
                        <Link className={styles.convCard} key={c.id} to={`/messages/${c.id}`}>
                            <div className={styles.convLeft}>
                                {c.otherAvatarUrl
                                    ? <img className={styles.avatar} src={c.otherAvatarUrl} alt={c.otherDisplayName} />
                                    : <div className={styles.avatarInitial}>{c.otherDisplayName[0]?.toUpperCase()}</div>}
                                <div>
                                    <div className={styles.convName}>{c.otherDisplayName}</div>
                                    <div className={styles.convHandle}>@{c.otherUsername}</div>
                                    {c.lastMessage && <div className={styles.convPreview}>{c.lastMessage}</div>}
                                </div>
                            </div>
                            {c.unreadCount > 0 && <span className={styles.badge}>{c.unreadCount}</span>}
                        </Link>
                    ))}
                    {sent.map(c => (
                        <div className={styles.convCard} key={c.id} style={{ opacity: 0.6 }}>
                            <div className={styles.convLeft}>
                                {c.otherAvatarUrl
                                    ? <img className={styles.avatar} src={c.otherAvatarUrl} alt={c.otherDisplayName} />
                                    : <div className={styles.avatarInitial}>{c.otherDisplayName[0]?.toUpperCase()}</div>}
                                <div>
                                    <div className={styles.convName}>{c.otherDisplayName}</div>
                                    <div className={styles.convHandle}>@{c.otherUsername}</div>
                                    <div className={styles.convSub}>Request pending…</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}
