import api from './client';

export const socialApi = {
    // Media Validation
    validateMediaUrl: (url) => api.get(`/social/validate-url?url=${encodeURIComponent(url)}`),

    // Global Feed
    getGlobalFeed: () => api.get('/social/feed'),

    // Groups
    getGroups: () => api.get('/social/groups'),
    getGroupDetail: (slug) => api.get(`/social/groups/detail?slug=${slug}`),
    joinGroup: (groupId) => api.post('/social/groups/join', { group_id: groupId }),
    leaveGroup: (groupId) => api.post('/social/groups/leave', { group_id: groupId }),
    
    // Group Posts
    getGroupPosts: (groupId) => api.get(`/social/posts?group_id=${groupId}`),
    createPost: (data) => api.post('/social/posts', data),
    likePost: (postId) => api.post('/social/posts/like', { post_id: postId }),
    
    // Group Messages
    getGroupMessages: (groupId) => api.get(`/social/messages?group_id=${groupId}`),
    sendMessage: (data) => api.post('/social/messages', data),

    // Group Management (Manager)
    updateGroupSettings: (groupId, data) => api.post(`/social/manager/settings?group_id=${groupId}`, data),
    getPendingPosts: (groupId) => api.get(`/social/manager/pending?group_id=${groupId}`),
    moderatePost: (postId, action) => api.post('/social/manager/moderate-post', { post_id: postId, action }),
    updateMemberStatus: (groupId, userId, status) => api.post('/social/manager/member-status', { group_id: groupId, user_id: userId, status }),

    // Admin Management (Admin)
    getAdminGroups: () => api.get('/social/admin/groups'),
    createGroup: (data) => api.post('/social/admin/groups', data),
    deleteGroup: (groupId) => api.delete(`/social/admin/groups?group_id=${groupId}`),
    assignManager: (groupId, userId) => api.post('/social/admin/assign-manager', { group_id: groupId, user_id: userId }),
};

