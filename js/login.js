/**
 * 登录页面入口：只负责登录，不再承载天气主页逻辑。
 */
const LoginDOM = {
    form: document.getElementById('loginForm'),
    username: document.getElementById('loginUsername'),
    password: document.getElementById('loginPassword'),
    error: document.getElementById('loginError'),
    button: document.getElementById('loginBtn')
};

function showLoginError(message) {
    LoginDOM.error.textContent = message || '登录失败，请重试';
    LoginDOM.error.classList.remove('hidden');
}

function hideLoginError() {
    LoginDOM.error.classList.add('hidden');
}

function setLoginButtonLoading(loading) {
    LoginDOM.button.disabled = loading;
    LoginDOM.button.querySelector('.btn-text').classList.toggle('hidden', loading);
    LoginDOM.button.querySelector('.btn-loading').classList.toggle('hidden', !loading);
}

async function handleLoginSubmit(event) {
    event.preventDefault();

    const username = LoginDOM.username.value.trim();
    const password = LoginDOM.password.value;

    if (!username || !password) {
        showLoginError('请输入用户名和密码');
        return;
    }

    hideLoginError();
    setLoginButtonLoading(true);

    const result = await Auth.login(username, password);

    setLoginButtonLoading(false);

    if (result.success) {
        window.location.href = 'main.html';
    } else {
        showLoginError(result.message || '用户名或密码错误');
    }
}

async function initLoginPage() {
    Auth._init();

    if (await Auth.restoreSession()) {
        window.location.replace('main.html');
        return;
    }

    LoginDOM.form.addEventListener('submit', handleLoginSubmit);
}

document.addEventListener('DOMContentLoaded', initLoginPage);
