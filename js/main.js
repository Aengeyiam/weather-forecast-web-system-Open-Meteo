/**
 * 天气预报网页系统 - 主入口
 */
const DOM = {
    loginPage: document.getElementById('loginPage'),
    weatherPage: document.getElementById('weatherPage'),
    loginForm: document.getElementById('loginForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    loginError: document.getElementById('loginError'),
    loginBtn: document.getElementById('loginBtn'),
    registerForm: document.getElementById('registerForm'),
    regUsername: document.getElementById('regUsername'),
    regPassword: document.getElementById('regPassword'),
    regPassword2: document.getElementById('regPassword2'),
    regError: document.getElementById('regError'),
    regSuccess: document.getElementById('regSuccess'),
    regBtn: document.getElementById('regBtn'),
    regHint: document.getElementById('regHint'),
    displayUsername: document.getElementById('displayUsername'),
    logoutBtn: document.getElementById('logoutBtn'),
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn')
};

function showLoginPage() {
    DOM.loginPage.classList.add('active');
    DOM.weatherPage.classList.remove('active');
}

function showWeatherPage() {
    DOM.loginPage.classList.remove('active');
    DOM.weatherPage.classList.add('active');
    DOM.displayUsername.textContent = CONFIG.APP_STATE.username;
    refreshHistory();
}

// ========== 登录 ==========
async function handleLogin(e) {
    e.preventDefault();
    const username = DOM.loginUsername.value.trim();
    const password = DOM.loginPassword.value;
    if (!username || !password) { showLoginError('请输入用户名和密码'); return; }
    setLoginButtonLoading(true); hideLoginError();
    const r = await Auth.login(username, password);
    setLoginButtonLoading(false);
    if (r.success) { showWeatherPage(); } else { showLoginError(r.message); }
}

function showLoginError(msg) { DOM.loginError.textContent = msg; DOM.loginError.classList.remove('hidden'); }
function hideLoginError() { DOM.loginError.classList.add('hidden'); }
function setLoginButtonLoading(v) {
    DOM.loginBtn.disabled = v;
    DOM.loginBtn.querySelector('.btn-text').classList.toggle('hidden', v);
    DOM.loginBtn.querySelector('.btn-loading').classList.toggle('hidden', !v);
}

// ========== 注册 ==========
async function handleRegister(e) {
    e.preventDefault();
    const u = DOM.regUsername.value.trim();
    const p = DOM.regPassword.value;
    const p2 = DOM.regPassword2.value;
    DOM.regError.classList.add('hidden');
    DOM.regSuccess.classList.add('hidden');

    if (!u || !p) { DOM.regError.textContent = '请填写所有字段'; DOM.regError.classList.remove('hidden'); return; }
    if (p !== p2) { DOM.regError.textContent = '两次密码不一致'; DOM.regError.classList.remove('hidden'); return; }
    if (u.length < 2) { DOM.regError.textContent = '用户名至少2个字符'; DOM.regError.classList.remove('hidden'); return; }
    if (p.length < 6) { DOM.regError.textContent = '密码至少6位'; DOM.regError.classList.remove('hidden'); return; }

    setRegButtonLoading(true);
    const r = await Auth.register(u, p);
    setRegButtonLoading(false);
    if (r.success) {
        DOM.regSuccess.textContent = r.message;
        DOM.regSuccess.classList.remove('hidden');
        DOM.regForm.reset();
        setTimeout(() => showLoginForm(), 1500);
    } else {
        DOM.regError.textContent = r.message;
        DOM.regError.classList.remove('hidden');
    }
}

function setRegButtonLoading(v) {
    DOM.regBtn.disabled = v;
    DOM.regBtn.querySelector('.btn-text').classList.toggle('hidden', v);
    DOM.regBtn.querySelector('.btn-loading').classList.toggle('hidden', !v);
}

function showRegisterForm() {
    DOM.loginForm.classList.add('hidden');
    DOM.registerForm.classList.remove('hidden');
    document.querySelector('.login-hint').classList.add('hidden');
    DOM.regHint.classList.remove('hidden');
    DOM.regError.classList.add('hidden');
    DOM.regSuccess.classList.add('hidden');
}

function showLoginForm() {
    DOM.loginForm.classList.remove('hidden');
    DOM.registerForm.classList.add('hidden');
    document.querySelector('.login-hint').classList.remove('hidden');
    DOM.regHint.classList.add('hidden');
}

// ========== 退出 ==========
function handleLogout() {
    Auth.logout();
    showLoginPage();
    document.getElementById('currentWeather').classList.add('hidden');
    document.getElementById('forecastSection').classList.add('hidden');
    DOM.cityInput.value = '';
}

// ========== 天气 ==========
async function triggerSearch(cityName) {
    const city = (cityName || DOM.cityInput.value).trim();
    if (!city) { Weather.showError('请输入城市名称'); return; }
    Weather.hideError(); Weather.showLoading(); Weather.setButtonLoading(true);
    try {
        const info = await Weather.searchCity(city);
        if (!info) { Weather.showError('未找到该城市，请重新输入'); return; }
        const data = await Weather.fetchCurrentWeather(info.lat, info.lon);
        Weather.renderCurrentWeather(data, info.name);
        Weather.renderForecast(data);
        CONFIG.APP_STATE.currentCity = info.name;
        await History.saveQueryRecord(info.name);
        await refreshHistory();
    } catch (e) {
        Weather.showError(e.message === 'NETWORK_ERROR' ? '网络异常，请稍后重试' : '天气数据获取失败，请稍后重试');
    } finally {
        Weather.hideLoading(); Weather.setButtonLoading(false);
    }
}

async function refreshHistory() {
    const records = await History.getUserHistory();
    History.renderHistoryList(records);
}

// ========== 初始化 ==========
function init() {
    Auth._init();
    // 恢复登录态
    if (Auth.restoreSession()) {
        showWeatherPage();
    } else {
        showLoginPage();
    }
    DOM.loginForm.addEventListener('submit', handleLogin);
    DOM.registerForm.addEventListener('submit', handleRegister);
    DOM.logoutBtn.addEventListener('click', handleLogout);
    DOM.searchBtn.addEventListener('click', () => triggerSearch());
    DOM.cityInput.addEventListener('keydown', e => { if (e.key === 'Enter') triggerSearch(); });
    document.getElementById('showRegister').addEventListener('click', e => { e.preventDefault(); showRegisterForm(); });
    document.getElementById('showLogin').addEventListener('click', e => { e.preventDefault(); showLoginForm(); });
}

document.addEventListener('DOMContentLoaded', init);
