/**
 * 天气主页入口：只负责天气系统功能。
 * 登录和注册页面已经拆分到 login.html / register.html。
 */
const DOM = {
    displayUsername: document.getElementById('displayUsername'),
    logoutBtn: document.getElementById('logoutBtn'),
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn')
};

async function initMainPageData() {
    DOM.displayUsername.textContent = CONFIG.APP_STATE.username || '用户';
    await Features.init();
    await refreshHistory();

    const defaultCity = Features.getDefaultCity();
    if (defaultCity && !CONFIG.APP_STATE.currentCity) {
        DOM.cityInput.value = defaultCity.city_name;
        triggerSearch(defaultCity.city_name);
    }
}

async function handleLogout() {
    await Auth.logout();
    window.location.href = 'login.html';
}

async function triggerSearch(cityName) {
    const city = (cityName || DOM.cityInput.value).trim();

    if (!city) {
        Weather.showError('请输入城市名称');
        return;
    }

    Weather.hideError();
    Weather.showLoading();
    Weather.setButtonLoading(true);

    try {
        const info = await Weather.searchCity(city);

        if (!info) {
            Weather.showError('未找到该城市，请重新输入');
            return;
        }

        const data = await Weather.fetchCurrentWeather(info.lat, info.lon);

        Weather.renderCurrentWeather(data, info.name);
        Weather.renderForecast(data);

        CONFIG.APP_STATE.currentCity = info.name;
        CONFIG.APP_STATE.lastCityInfo = info;
        CONFIG.APP_STATE.lastWeatherData = data;

        Features.afterWeatherLoaded(data, info);

        await History.saveQueryRecord(info.name);
        await refreshHistory();
    } catch (error) {
        Weather.showError(error.message === 'NETWORK_ERROR' ? '网络异常，请稍后重试' : '天气数据获取失败，请稍后重试');
    } finally {
        Weather.hideLoading();
        Weather.setButtonLoading(false);
    }
}

async function refreshHistory() {
    const records = await History.getUserHistory();
    History.renderHistoryList(records);
}

async function initMainPage() {
    Auth._init();

    const loggedIn = await Auth.restoreSession();
    if (!loggedIn) {
        window.location.replace('login.html');
        return;
    }

    DOM.logoutBtn.addEventListener('click', handleLogout);
    DOM.searchBtn.addEventListener('click', () => triggerSearch());
    DOM.cityInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') triggerSearch();
    });

    await initMainPageData();
}

document.addEventListener('DOMContentLoaded', initMainPage);
