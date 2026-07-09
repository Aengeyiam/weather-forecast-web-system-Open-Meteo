/**
 * 天气预报网页系统 - 认证模块（localStorage 版 + 注册）
 */
const AUTH_KEY = 'weather_auth';
const USERS_KEY = 'weather_users';
const SESSION_KEY = 'weather_session';

const Auth = {
    _init() {
        if (!localStorage.getItem(USERS_KEY)) {
            const users = {
                zhangsan: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
                lisi:     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
                wangwu:   '14f8f4bb8c0e79a02670a5fea5682da717a5b3d3dc7b1706f7a4bab9afae18c2'
            };
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
    },

    async login(username, password) {
        if (!username || !password) return { success: false, message: '请输入用户名和密码' };
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
        if (!users[username]) return { success: false, message: '用户名或密码错误' };
        const h = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',
            new TextEncoder().encode(password)))).map(b => b.toString(16).padStart(2,'0')).join('');
        if (h !== users[username]) return { success: false, message: '用户名或密码错误' };
        localStorage.setItem(SESSION_KEY, JSON.stringify({ username, userId: username }));
        CONFIG.APP_STATE.isLoggedIn = true;
        CONFIG.APP_STATE.userId = username;
        CONFIG.APP_STATE.username = username;
        return { success: true, userId: username, username };
    },

    async register(username, password) {
        if (!username || !password) return { success: false, message: '用户名和密码不能为空' };
        if (username.length < 2 || username.length > 50) return { success: false, message: '用户名长度需2-50字符' };
        if (password.length < 6) return { success: false, message: '密码至少6位' };
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
        if (users[username]) return { success: false, message: '用户名已存在' };
        const h = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',
            new TextEncoder().encode(password)))).map(b => b.toString(16).padStart(2,'0')).join('');
        users[username] = h;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return { success: true, userId: username, username, message: '注册成功，请登录' };
    },

    logout() {
        localStorage.removeItem(SESSION_KEY);
        CONFIG.APP_STATE.isLoggedIn = false;
        CONFIG.APP_STATE.userId = null;
        CONFIG.APP_STATE.username = '';
    },

    getCurrentUserId() { return CONFIG.APP_STATE.userId; },

    restoreSession() {
        const s = localStorage.getItem(SESSION_KEY);
        if (s) {
            try {
                const d = JSON.parse(s);
                CONFIG.APP_STATE.isLoggedIn = true;
                CONFIG.APP_STATE.userId = d.userId;
                CONFIG.APP_STATE.username = d.username;
                return true;
            } catch(e) {}
        }
        return false;
    }
};
