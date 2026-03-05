import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { messagesApi, type MessageItem, type ConversationSummary } from '../api/social';
import { useAuth } from '../context/AuthContext';
import styles from './ChatPage.module.css';

export default function ChatPage() {
    const { convId } = useParams<{ convId: string }>();
    const { user } = useAuth();
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [conv, setConv] = useState<ConversationSummary | null>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const loadMessages = useCallback(async () => {
        if (!convId) return;
        try {
            const data = await messagesApi.getMessages(convId);
            setMessages(data.content);
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch { /* ignore */ }
    }, [convId]);

    const loadConv = useCallback(async () => {
        if (!convId) return;
        try {
            const all = await messagesApi.listConversations();
            const found = all.content.find(c => c.id === convId);
            if (found) setConv(found);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [convId]);

    useEffect(() => {
        loadConv();
        loadMessages();
        // Poll for new messages every 5 seconds
        pollRef.current = setInterval(loadMessages, 5000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [loadConv, loadMessages]);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || !convId || sending) return;
        setSending(true);
        try {
            const msg = await messagesApi.send(convId, input.trim());
            setMessages(prev => [...prev, msg]);
            setInput('');
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch { /* ignore */ }
        finally { setSending(false); }
    }

    if (loading) return <div className={styles.loading}>Loading chat…</div>;
    if (!conv) return (
        <div className={styles.loading}>
            Conversation not found. <Link to="/messages">← Back to messages</Link>
        </div>
    );

    const isPending = conv.status === 'PENDING';
    const isDeclined = conv.status === 'DECLINED';

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <Link to="/messages" className={styles.backBtn}>←</Link>
                <div className={styles.headerInfo}>
                    {conv.otherAvatarUrl
                        ? <img className={styles.avatar} src={conv.otherAvatarUrl} alt={conv.otherDisplayName} />
                        : <div className={styles.avatarInitial}>{conv.otherDisplayName[0]?.toUpperCase()}</div>}
                    <div>
                        <div className={styles.name}>{conv.otherDisplayName}</div>
                        <div className={styles.handle}>@{conv.otherUsername}</div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
                {isPending && (
                    <div className={styles.pendingBanner}>
                        {conv.isRequester
                            ? '⏳ Waiting for them to accept your message request…'
                            : `📬 ${conv.otherDisplayName} wants to chat with you.`}
                    </div>
                )}
                {isDeclined && (
                    <div className={styles.declinedBanner}>
                        This conversation was declined.
                    </div>
                )}
                {messages.length === 0 && !isPending && (
                    <div className={styles.emptyChat}>Start the conversation! 👋</div>
                )}
                {messages.map(msg => {
                    const isMe = msg.senderId === user?.id;
                    return (
                        <div key={msg.id} className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                            <div className={styles.bubbleBody}>{msg.body}</div>
                            <div className={styles.bubbleTime}>
                                {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            {!isPending && !isDeclined && (
                <form className={styles.inputBar} onSubmit={handleSend}>
                    <input
                        className={styles.inputField}
                        placeholder="Type a message…"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={sending}
                    />
                    <button className={styles.sendBtn} type="submit" disabled={sending || !input.trim()}>
                        {sending ? '…' : '➤'}
                    </button>
                </form>
            )}
        </div>
    );
}
