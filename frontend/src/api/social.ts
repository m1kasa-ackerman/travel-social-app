import api from './axios';

// =================== Comments ===================
export interface Comment {
    id: string;
    body: string;
    authorId: string;
    authorUsername: string;
    authorDisplayName: string;
    authorAvatarUrl?: string;
    parentId?: string;
    createdAt: string;
}

export const commentsApi = {
    async list(postId: string, page = 0): Promise<{ content: Comment[]; totalElements: number }> {
        const res = await api.get(`/api/posts/${postId}/comments?page=${page}&size=20&sort=createdAt,asc`);
        return res.data;
    },

    async add(postId: string, body: string, parentId?: string): Promise<Comment> {
        const res = await api.post(`/api/posts/${postId}/comments`, { body, parentId });
        return res.data;
    },

    async delete(postId: string, commentId: string): Promise<void> {
        await api.delete(`/api/posts/${postId}/comments/${commentId}`);
    },
};

// =================== Messages / DMs ===================
export interface ConversationSummary {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
    otherUserId: string;
    otherUsername: string;
    otherDisplayName: string;
    otherAvatarUrl?: string;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
    isRequester: boolean;
}

export interface MessageItem {
    id: string;
    body: string;
    senderId: string;
    senderUsername: string;
    sentAt: string;
    readByMe: boolean;
}

export const messagesApi = {
    async listConversations(page = 0): Promise<{ content: ConversationSummary[]; totalElements: number }> {
        const res = await api.get(`/api/messages?page=${page}&size=20`);
        return res.data;
    },

    async start(username: string): Promise<ConversationSummary> {
        const res = await api.post('/api/messages/start', { username });
        return res.data;
    },

    async respond(convId: string, accept: boolean): Promise<ConversationSummary> {
        const res = await api.post(`/api/messages/${convId}/respond`, { accept });
        return res.data;
    },

    async getMessages(convId: string, page = 0): Promise<{ content: MessageItem[]; totalElements: number }> {
        const res = await api.get(`/api/messages/${convId}/messages?page=${page}&size=30&sort=sentAt,asc`);
        return res.data;
    },

    async send(convId: string, body: string): Promise<MessageItem> {
        const res = await api.post(`/api/messages/${convId}/messages`, { body });
        return res.data;
    },
};

// =================== Saved Places ===================
export interface SavedPlace {
    id: string;
    name: string;
    address?: string;
    lat?: number;
    lng?: number;
    type?: string;
    notes?: string;
    savedAt: string;
}

export const placesApi = {
    async list(): Promise<SavedPlace[]> {
        const res = await api.get('/api/places');
        return res.data;
    },

    async save(data: Omit<SavedPlace, 'id' | 'savedAt'>): Promise<SavedPlace> {
        const res = await api.post('/api/places', data);
        return res.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/api/places/${id}`);
    },
};
