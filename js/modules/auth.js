/**
 * 天气预报网页系统 - 认证模块
 */
const API_BASE = 'api';

const Auth = {
    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE}/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (data.success) {
                CONFIG.APP_STATE.isLoggedIn = true;
                CONFIG.APP_STATE.userId = data.user_id;
                CONFIG.APP_STATE.username = data.username;
            }
            return data;
        } catch (error) {
            console.error('登录请求失败:', error);
            return { success: false, message: '网络异常，请稍后重试' };
        }
    },

    async register(username, password) {
        try {
            const response = await fetch(`${API_BASE}/register.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await response.json();
        } catch (error) {
            console.error('注册请求失败:', error);
            return { success: false, message: '网络异常，请稍后重试' };
        }
    },

    async logout() {
        try { await fetch(`${API_BASE}/logout.php`, { method: 'POST' }); } catch (e) {}
        CONFIG.APP_STATE.isLoggedIn = false;
        CONFIG.APP_STATE.userId = null;
        CONFIG.APP_STATE.username = '';
        CONFIG.APP_STATE.currentCity = '';
        CONFIG.APP_STATE.lastCityInfo = null;
        CONFIG.APP_STATE.lastWeatherData = null;
    },

    getCurrentUserId() { return CONFIG.APP_STATE.userId; },

    _init() {},

    async restoreSession() {
        try {
            const response = await fetch(`${API_BASE}/session.php`, { method: 'GET' });
            const data = await response.json();
            if (data.success && data.logged_in) {
                CONFIG.APP_STATE.isLoggedIn = true;
                CONFIG.APP_STATE.userId = data.user_id;
                CONFIG.APP_STATE.username = data.username;
                return true;
            }
        } catch (error) {
            console.warn('恢复登录态失败:', error);
        }
        return false;
    }
};
