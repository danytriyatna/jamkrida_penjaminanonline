import apiClient from '@/lib/axios';
import globalState from '@/helpers/globals.js';

export const refreshUserInfo = async () => {
    try {
        const response = await apiClient.get('/me');
        if (response.data.status === 1) {
            globalState.userinfo = response.data.data;
            return response.data.data;
        }
    } catch (error) {
        console.error('Failed to refresh user info:', error);
    }
    return null;
};
