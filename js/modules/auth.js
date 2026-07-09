/**
 * 天气预报网页系统 - 认证模块（Part A：数据层）
 * 作者：熊倡
 * 功能：用户登录、退出、注册、登录态管理
 * 
 * 依赖：api/login.php, api/logout.php, api/register.php
 */

const API_BASE = 'api';

const Auth = {
    /**
     * 用户登录
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise<{success: boolean, message: string}>}
     */
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
            return {
                success: false,
                message: '网络异常，请稍后重试'
            };
        }
    },

    /**
     * 用户注册
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise<{success: boolean, message: string}>}
     */
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
            return {
                success: false,
                message: '网络异常，请稍后重试'
            };
        }
    },

    /**
     * 退出登录
     * @returns {Promise<{success: boolean}>}
     */
    async logout() {
        try {
            await fetch(`${API_BASE}/logout.php`, { method: 'POST' });
        } catch (e) {
        }

        CONFIG.APP_STATE.isLoggedIn = false;
        CONFIG.APP_STATE.userId = null;
        CONFIG.APP_STATE.username = '';
        CONFIG.APP_STATE.currentCity = '';
    },

    /**
     * 获取当前登录用户 ID（共享接口1）
     * 调用方：吴裕勇 — weather.js 中查询成功后获取 userId
     * @returns {number|null}
     */
    getCurrentUserId() {
        return CONFIG.APP_STATE.userId;
    },

    _init() {
    },

    restoreSession() {
        return false;
    }
};
