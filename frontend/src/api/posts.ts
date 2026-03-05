import api from './axios';

export interface Post {
    id: string;
    type: 'itinerary' | 'restaurant' | 'experience';
    title: string;
    body?: string;
    coverImageUrl?: string;
    destination?: string;
    visibility: string;
    status: string;
    saveCount: number;
    savedByCurrentUser: boolean;
    tags: string[];
    createdAt: string;
    authorId: string;
    authorUsername: string;
    authorDisplayName: string;
    authorAvatarUrl?: string;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export const postsApi = {
    async getFeed(filter: 'forYou' | 'following' | 'trending' = 'forYou', page = 0):
        Promise<PagedResponse<Post>> {
        const res = await api.get<PagedResponse<Post>>(
            `/api/posts/feed?filter=${filter}&page=${page}&size=10`
        );
        return res.data;
    },

    async createPost(data: {
        type: string;
        title: string;
        body?: string;
        coverImageUrl?: string;
        destination?: string;
        visibility?: string;
        status?: string;
        tags?: string[];
    }): Promise<Post> {
        const res = await api.post<Post>('/api/posts', data);
        return res.data;
    },

    async getPost(id: string): Promise<Post> {
        const res = await api.get<Post>(`/api/posts/${id}`);
        return res.data;
    },

    async deletePost(id: string): Promise<void> {
        await api.delete(`/api/posts/${id}`);
    },

    async toggleSave(id: string): Promise<{ saved: boolean }> {
        const res = await api.post<{ saved: boolean }>(`/api/posts/${id}/save`);
        return res.data;
    },

    async explore(type?: string, destination?: string, page = 0):
        Promise<PagedResponse<Post>> {
        const params = new URLSearchParams({ page: String(page), size: '12' });
        if (type) params.append('type', type);
        if (destination) params.append('destination', destination);
        const res = await api.get<PagedResponse<Post>>(
            `/api/posts/public/explore?${params}`
        );
        return res.data;
    },
};

export const usersApi = {
    async getProfile(username: string) {
        const res = await api.get(`/api/users/${username}`);
        return res.data;
    },

    async toggleFollow(username: string): Promise<{ following: boolean }> {
        const res = await api.post<{ following: boolean }>(
            `/api/users/${username}/follow`
        );
        return res.data;
    },
};
