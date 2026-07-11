/**
 * 天气预报网页系统 - 天气模块（Open-Meteo 免费版）
 */
const Weather = {
    async searchCity(cityName) {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=zh&format=json`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('NETWORK_ERROR');
            const data = await res.json();
            if (data.results?.length > 0) {
                const r = data.results[0];
                return {
                    name: [r.country, r.admin1, r.name].filter(Boolean).join(' '),
                    displayName: r.name || cityName,
                    country: r.country || '',
                    admin1: r.admin1 || '',
                    lat: r.latitude,
                    lon: r.longitude
                };
            }
            return null;
        } catch (e) {
            throw new Error('NETWORK_ERROR');
        }
    },

    async fetchCurrentWeather(lat, lon) {
        const current = 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m';
        const hourly = 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m';
        const daily = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset';
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${current}&hourly=${hourly}&daily=${daily}&timezone=auto&forecast_days=7`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('NETWORK_ERROR');
            return await res.json();
        } catch (e) {
            throw new Error('NETWORK_ERROR');
        }
    },

    renderCurrentWeather(data, cityName) {
        const c = data.current || {};
        const d = data.daily || {};
        const w = Utils.getWeatherDesc(c.weather_code);
        const card = document.getElementById('currentWeather');
        card.classList.remove('hidden');
        document.getElementById('weatherCity').textContent = cityName;
        document.getElementById('weatherIcon').textContent = w.icon;
        document.getElementById('weatherTemp').textContent = `${Math.round(Utils.safeNumber(c.temperature_2m))}°`;
        document.getElementById('weatherDesc').textContent = w.text;
        document.getElementById('feelsLike').textContent = `${Math.round(Utils.safeNumber(c.apparent_temperature))}°`;
        document.getElementById('windDir').textContent = Utils.windDir(c.wind_direction_10m);
        document.getElementById('windScale').textContent = `${Math.round(Utils.safeNumber(c.wind_speed_10m))} km/h（${Utils.windLevel(c.wind_speed_10m)}）`;
        document.getElementById('humidity').textContent = `${Math.round(Utils.safeNumber(c.relative_humidity_2m))}%`;
        document.getElementById('rainProbability').textContent = `${Math.round(Utils.safeNumber(d.precipitation_probability_max?.[0], 0))}%`;
        document.getElementById('uvIndex').textContent = d.uv_index_max?.[0] !== undefined ? Number(d.uv_index_max[0]).toFixed(1) : '--';
        document.getElementById('weatherUpdateTime').textContent = `更新于 ${Utils.getCurrentTime()}`;
    },

    renderForecast(data) {
        const d = data.daily || {};
        const s = document.getElementById('forecastSection');
        const c = document.getElementById('forecastContainer');
        if (!d.time || !d.time.length) return;
        s.classList.remove('hidden');
        c.innerHTML = d.time.slice(0, 7).map((t, i) => {
            const w = Utils.getWeatherDesc(d.weather_code[i]);
            const rain = Utils.safeNumber(d.precipitation_probability_max?.[i], 0);
            const wind = Utils.safeNumber(d.wind_speed_10m_max?.[i], 0);
            return `<div class="forecast-card">
                <div class="forecast-date">${i === 0 ? '今天' : Utils.getWeekday(t)} ${Utils.formatDate(t)}</div>
                <div class="forecast-icon">${w.icon}</div>
                <div class="forecast-desc">${w.text}</div>
                <div class="forecast-temp-range">
                    <span class="forecast-temp-high">${Math.round(d.temperature_2m_max[i])}°</span> /
                    <span class="forecast-temp-low">${Math.round(d.temperature_2m_min[i])}°</span>
                </div>
                <div class="forecast-extra">雨 ${Math.round(rain)}% · 风 ${Math.round(wind)}km/h</div>
            </div>`;
        }).join('');
    },

    showError(m) {
        const e = document.getElementById('searchError');
        e.textContent = m;
        e.classList.remove('hidden');
        clearTimeout(this._t);
        this._t = setTimeout(() => e.classList.add('hidden'), 5000);
    },
    hideError() { document.getElementById('searchError').classList.add('hidden'); },
    showLoading() { document.getElementById('searchLoading').classList.remove('hidden'); },
    hideLoading() { document.getElementById('searchLoading').classList.add('hidden'); },
    setButtonLoading(v) {
        const b = document.getElementById('searchBtn');
        b.disabled = v;
        b.querySelector('.btn-text').classList.toggle('hidden', v);
        b.querySelector('.btn-loading').classList.toggle('hidden', !v);
    }
};
