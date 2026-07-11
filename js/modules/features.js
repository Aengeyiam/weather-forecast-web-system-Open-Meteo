/**
 * 增强功能模块：收藏城市、预警、生活指数、趋势图、地图天气、出行助手
 */
const Features = {
    _bound: false,
    _loaded: false,
    favorites: [],
    preferences: {
        profile_type: 'student',
        alerts_enabled: true,
        high_temp: 35,
        low_temp: 5,
        rain_prob: 50,
        wind_speed: 30,
        uv_index: 8
    },
    mapCities: [
        { name: '北京', x: 72, y: 30 }, { name: '上海', x: 81, y: 55 }, { name: '广州', x: 66, y: 78 },
        { name: '成都', x: 45, y: 59 }, { name: '武汉', x: 63, y: 58 }, { name: '西安', x: 55, y: 45 },
        { name: '哈尔滨', x: 85, y: 13 }, { name: '乌鲁木齐', x: 18, y: 25 }, { name: '昆明', x: 42, y: 78 },
        { name: '杭州', x: 78, y: 58 }, { name: '重庆', x: 49, y: 63 }, { name: '拉萨', x: 27, y: 63 }
    ],

    async init() {
        this.bindEvents();
        this.setTripDateDefault();
        this.renderMapPins();
        await this.loadPreferences();
        this.applyPreferenceToUI();
        this.renderFavorites();
        this._loaded = true;
    },

    reset() {
        this._loaded = false;
        this.favorites = [];
        document.getElementById('favoriteContainer').innerHTML = '<p class="muted-text">暂无收藏城市，搜索后点击“收藏当前城市”。</p>';
        ['alertSection','lifeSection','chartSection'].forEach(id => document.getElementById(id)?.classList.add('hidden'));
        document.getElementById('currentCityHint').textContent = '先搜索城市，再收藏或设置默认城市';
        document.getElementById('addFavoriteBtn').disabled = true;
        document.getElementById('setDefaultBtn').disabled = true;
    },

    bindEvents() {
        if (this._bound) return;
        this._bound = true;

        document.getElementById('addFavoriteBtn')?.addEventListener('click', () => this.addCurrentFavorite());
        document.getElementById('setDefaultBtn')?.addEventListener('click', () => this.setDefaultCurrentCity());
        document.getElementById('saveAlertBtn')?.addEventListener('click', () => this.savePreferencesFromUI());
        document.getElementById('saveProfileBtn')?.addEventListener('click', () => this.saveProfileFromUI());
        document.getElementById('profileSelect')?.addEventListener('change', () => this.updateProfileTip());
        document.getElementById('planTripBtn')?.addEventListener('click', () => this.planTrip());
        document.getElementById('clearHistoryBtn')?.addEventListener('click', async () => {
            if (!confirm('确定清空全部查询历史吗？')) return;
            const res = await History.clearQueryRecords();
            this.toast(res.success ? '历史记录已清空' : (res.message || '清空失败'));
            if (typeof refreshHistory === 'function') await refreshHistory();
        });
    },

    async loadPreferences() {
        try {
            const response = await fetch('api/preferences.php?action=all');
            const data = await response.json();
            if (data.success) {
                this.favorites = data.favorites || [];
                this.preferences = { ...this.preferences, ...(data.preferences || {}) };
                this.preferences.alerts_enabled = Number(this.preferences.alerts_enabled) === 1 || this.preferences.alerts_enabled === true;
                return;
            }
        } catch (e) {
            console.warn('读取偏好接口失败，使用浏览器本地存储:', e);
        }
        const local = JSON.parse(localStorage.getItem(this.localKey()) || '{}');
        this.favorites = local.favorites || [];
        this.preferences = { ...this.preferences, ...(local.preferences || {}) };
    },

    async savePreferences() {
        localStorage.setItem(this.localKey(), JSON.stringify({ favorites: this.favorites, preferences: this.preferences }));
        try {
            await fetch('api/preferences.php?action=update_preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.preferences)
            });
        } catch (e) {}
    },

    localKey() {
        return `weather_enhanced_${CONFIG.APP_STATE.username || 'guest'}`;
    },

    applyPreferenceToUI() {
        const p = this.preferences;
        document.getElementById('profileSelect').value = p.profile_type || 'student';
        document.getElementById('alertHighTemp').value = p.high_temp;
        document.getElementById('alertLowTemp').value = p.low_temp;
        document.getElementById('alertRainProb').value = p.rain_prob;
        document.getElementById('alertWindSpeed').value = p.wind_speed;
        document.getElementById('alertUvIndex').value = p.uv_index;
        document.getElementById('alertsEnabled').checked = !!p.alerts_enabled;
        this.updateProfileTip();
    },

    updateProfileTip() {
        const map = {
            student: '学生模式：重点提醒上学、军训、户外活动和带伞。',
            worker: '上班族模式：重点提醒通勤、穿衣、堵车天气风险。',
            elder: '老人模式：重点提醒温差、风寒、感冒和高温风险。',
            outdoor: '户外运动者模式：重点提醒紫外线、降雨、风速和运动时段。',
            driver: '司机模式：重点提醒降雨、雾、强风和洗车适宜度。'
        };
        const v = document.getElementById('profileSelect').value;
        document.getElementById('profileTip').textContent = map[v] || map.student;
    },

    async saveProfileFromUI() {
        this.preferences.profile_type = document.getElementById('profileSelect').value;
        await this.savePreferences();
        this.updateProfileTip();
        if (CONFIG.APP_STATE.lastWeatherData) this.renderLifeAdvice(CONFIG.APP_STATE.lastWeatherData);
        this.toast('身份偏好已保存');
    },

    async savePreferencesFromUI() {
        this.preferences = {
            ...this.preferences,
            alerts_enabled: document.getElementById('alertsEnabled').checked,
            high_temp: Number(document.getElementById('alertHighTemp').value || 35),
            low_temp: Number(document.getElementById('alertLowTemp').value || 5),
            rain_prob: Number(document.getElementById('alertRainProb').value || 50),
            wind_speed: Number(document.getElementById('alertWindSpeed').value || 30),
            uv_index: Number(document.getElementById('alertUvIndex').value || 8)
        };
        await this.savePreferences();
        if (CONFIG.APP_STATE.lastWeatherData && CONFIG.APP_STATE.lastCityInfo) {
            this.renderAlerts(CONFIG.APP_STATE.lastWeatherData, CONFIG.APP_STATE.lastCityInfo.name);
        }
        this.toast('预警规则已保存');
    },

    async addCurrentFavorite() {
        const info = CONFIG.APP_STATE.lastCityInfo;
        if (!info) return this.toast('请先搜索城市');
        await this.addFavorite(info.name, info.lat, info.lon, false);
    },

    async setDefaultCurrentCity() {
        const info = CONFIG.APP_STATE.lastCityInfo;
        if (!info) return this.toast('请先搜索城市');
        await this.addFavorite(info.name, info.lat, info.lon, true);
    },

    async addFavorite(city, lat, lon, isDefault = false) {
        const exists = this.favorites.find(f => f.city_name === city);
        if (exists) {
            if (isDefault) await this.setDefaultFavorite(city);
            else this.toast('该城市已在收藏列表中');
            return;
        }
        const item = { favorite_id: `local_${Date.now()}`, city_name: city, lat, lon, is_default: isDefault ? 1 : 0 };
        if (isDefault) this.favorites.forEach(f => f.is_default = 0);
        this.favorites.unshift(item);
        localStorage.setItem(this.localKey(), JSON.stringify({ favorites: this.favorites, preferences: this.preferences }));
        try {
            const response = await fetch('api/preferences.php?action=add_favorite', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city_name: city, lat, lon, is_default: isDefault ? 1 : 0 })
            });
            const data = await response.json();
            if (data.success) {
                this.favorites = data.favorites || this.favorites;
            }
        } catch (e) {}
        this.renderFavorites();
        this.toast(isDefault ? '已收藏并设为默认城市' : '已收藏当前城市');
    },

    async removeFavorite(city) {
        this.favorites = this.favorites.filter(f => f.city_name !== city);
        localStorage.setItem(this.localKey(), JSON.stringify({ favorites: this.favorites, preferences: this.preferences }));
        try {
            const response = await fetch('api/preferences.php?action=remove_favorite', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city_name: city })
            });
            const data = await response.json();
            if (data.success) this.favorites = data.favorites || this.favorites;
        } catch (e) {}
        this.renderFavorites();
        this.toast('已取消收藏');
    },

    async setDefaultFavorite(city) {
        this.favorites.forEach(f => f.is_default = f.city_name === city ? 1 : 0);
        localStorage.setItem(this.localKey(), JSON.stringify({ favorites: this.favorites, preferences: this.preferences }));
        try {
            const response = await fetch('api/preferences.php?action=set_default', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city_name: city })
            });
            const data = await response.json();
            if (data.success) this.favorites = data.favorites || this.favorites;
        } catch (e) {}
        this.renderFavorites();
        this.toast('默认城市已更新');
    },

    renderFavorites() {
        const box = document.getElementById('favoriteContainer');
        if (!this.favorites.length) {
            box.innerHTML = '<p class="muted-text">暂无收藏城市，搜索后点击“收藏当前城市”。</p>';
            return;
        }
        box.innerHTML = this.favorites.map(f => {
            const city = Utils.escapeHtml(f.city_name);
            const isDefault = Number(f.is_default) === 1;
            return `<div class="favorite-chip ${isDefault ? 'is-default' : ''}">
                <button class="favorite-name" data-city="${city}">${isDefault ? '🏠 ' : '📍 '}${city}</button>
                <button class="favorite-default" data-city="${city}" title="设为默认">默认</button>
                <button class="favorite-remove" data-city="${city}" title="取消收藏">×</button>
            </div>`;
        }).join('');

        box.querySelectorAll('.favorite-name').forEach(btn => btn.addEventListener('click', () => {
            document.getElementById('cityInput').value = btn.dataset.city;
            triggerSearch(btn.dataset.city);
        }));
        box.querySelectorAll('.favorite-default').forEach(btn => btn.addEventListener('click', () => this.setDefaultFavorite(btn.dataset.city)));
        box.querySelectorAll('.favorite-remove').forEach(btn => btn.addEventListener('click', () => this.removeFavorite(btn.dataset.city)));
    },

    getDefaultCity() {
        return this.favorites.find(f => Number(f.is_default) === 1);
    },

    afterWeatherLoaded(data, cityInfo) {
        CONFIG.APP_STATE.lastWeatherData = data;
        CONFIG.APP_STATE.lastCityInfo = cityInfo;
        document.getElementById('addFavoriteBtn').disabled = false;
        document.getElementById('setDefaultBtn').disabled = false;
        document.getElementById('currentCityHint').textContent = `当前城市：${cityInfo.name}`;
        this.renderAlerts(data, cityInfo.name);
        this.renderLifeAdvice(data);
        this.renderCharts(data);
        this.renderMapResult(cityInfo.name, data);
    },

    renderAlerts(data, cityName) {
        const section = document.getElementById('alertSection');
        const box = document.getElementById('alertContainer');
        section.classList.remove('hidden');
        if (!this.preferences.alerts_enabled) {
            box.innerHTML = '<div class="alert-card safe">✅ 已关闭预警提醒，可在上方规则设置中开启。</div>';
            return;
        }
        const d = data.daily || {};
        const c = data.current || {};
        const p = this.preferences;
        const alerts = [];
        const maxTemp = Utils.safeNumber(d.temperature_2m_max?.[0], c.temperature_2m);
        const minTemp = Utils.safeNumber(d.temperature_2m_min?.[0], c.temperature_2m);
        const rain = Utils.safeNumber(d.precipitation_probability_max?.[0], 0);
        const wind = Utils.safeNumber(d.wind_speed_10m_max?.[0], c.wind_speed_10m);
        const uv = Utils.safeNumber(d.uv_index_max?.[0], 0);
        const w = Utils.getWeatherDesc(c.weather_code);
        if (maxTemp >= p.high_temp) alerts.push({ level:'danger', icon:'🌡️', title:'高温预警', text:`${cityName} 今日最高温约 ${Math.round(maxTemp)}℃，建议减少午后户外活动。` });
        if (minTemp <= p.low_temp) alerts.push({ level:'info', icon:'🧥', title:'低温提醒', text:`今日最低温约 ${Math.round(minTemp)}℃，注意添衣保暖。` });
        if (rain >= p.rain_prob || Utils.isRainCode(c.weather_code)) alerts.push({ level:'warning', icon:'☔', title:'降雨提醒', text:`今日降雨概率约 ${Math.round(rain)}%，建议携带雨具。` });
        if (wind >= p.wind_speed) alerts.push({ level:'warning', icon:'🌬️', title:'大风提醒', text:`今日最大风速约 ${Math.round(wind)} km/h，骑行和户外活动需注意安全。` });
        if (uv >= p.uv_index) alerts.push({ level:'danger', icon:'☀️', title:'紫外线提醒', text:`今日紫外线指数约 ${uv.toFixed(1)}，建议做好防晒。` });
        if (['雾','雾凇'].includes(w.text)) alerts.push({ level:'warning', icon:'🌫️', title:'能见度提醒', text:'当前有雾，驾驶出行请控制车速。' });

        if (!alerts.length) {
            box.innerHTML = '<div class="alert-card safe">✅ 当前没有触发预警，天气风险较低。</div>';
        } else {
            box.innerHTML = alerts.map(a => `<div class="alert-card ${a.level}"><strong>${a.icon} ${a.title}</strong><p>${a.text}</p></div>`).join('');
            this.toast(`已触发 ${alerts.length} 条天气预警`);
        }
    },

    renderLifeAdvice(data) {
        const section = document.getElementById('lifeSection');
        const box = document.getElementById('lifeContainer');
        section.classList.remove('hidden');
        const c = data.current || {};
        const d = data.daily || {};
        const temp = Utils.safeNumber(c.apparent_temperature, c.temperature_2m);
        const humidity = Utils.safeNumber(c.relative_humidity_2m, 50);
        const rain = Utils.safeNumber(d.precipitation_probability_max?.[0], 0);
        const wind = Utils.safeNumber(d.wind_speed_10m_max?.[0], c.wind_speed_10m);
        const uv = Utils.safeNumber(d.uv_index_max?.[0], 0);
        const profile = this.preferences.profile_type || 'student';
        const rainRisk = rain >= 45 || Utils.isRainCode(c.weather_code);
        let dress = temp >= 30 ? '炎热：短袖、薄衫，注意补水' : temp >= 22 ? '舒适：衬衫或薄外套' : temp >= 12 ? '偏凉：建议外套' : '寒冷：厚外套/羽绒服';
        let sport = (!rainRisk && wind < 30 && temp >= 12 && temp <= 30) ? '较适宜：可安排户外运动' : '不太适宜：建议改为室内活动';
        let sunscreen = uv >= 8 ? '极强：防晒霜、帽子、遮阳伞' : uv >= 5 ? '较强：建议基础防晒' : '较弱：常规防护即可';
        let cold = (temp < 12 || wind > 35 || humidity > 85) ? '较高：注意温差和保暖' : '较低：正常防护即可';
        let car = rainRisk ? '不适宜：近期有雨，洗车易白洗' : '较适宜：短期降雨风险较低';
        let umbrella = rainRisk ? '建议携带：降雨概率较高' : '可不带：降雨概率较低';
        const profileExtra = {
            student: rainRisk ? '学生提醒：上学路上提前出门，书包注意防水。' : '学生提醒：适合正常上学和户外课。',
            worker: rainRisk ? '通勤提醒：雨天可能影响通勤时间。' : '通勤提醒：上下班天气影响较小。',
            elder: temp >= 32 ? '老人提醒：高温时段减少外出。' : '老人提醒：早晚注意温差。',
            outdoor: uv >= 8 ? '户外提醒：避开正午强紫外线时段。' : '户外提醒：可选择早晚运动。',
            driver: rainRisk ? '司机提醒：雨天路滑，注意车距。' : '司机提醒：能见度和路面条件较好。'
        }[profile];
        const items = [
            { icon:'👕', title:'穿衣', level: temp >= 30 ? '炎热' : '舒适', text:dress },
            { icon:'☔', title:'雨伞', level: rainRisk ? '建议带伞' : '不必带伞', text:umbrella },
            { icon:'🤧', title:'感冒', level: cold.startsWith('较高') ? '较高' : '少发', text:cold },
            { icon:'🚗', title:'洗车', level: rainRisk ? '不适宜' : '较适宜', text:car },
            { icon:'🏀', title:'运动', level: sport.startsWith('较适宜') ? '较适宜' : '不建议', text:sport },
            { icon:'☀️', title:'防晒', level: uv >= 8 ? '极强' : (uv >= 5 ? '较强' : '一般'), text:sunscreen }
        ];
        box.innerHTML = items.map(it => `<div class="life-card"><div class="life-icon">${it.icon}</div><strong>${it.title} ${it.level}</strong><p>${it.text}</p></div>`).join('') +
            `<div class="life-card profile-advice"><div class="life-icon">🎯</div><strong>身份建议</strong><p>${profileExtra}</p></div>`;
    },

    renderCharts(data) {
        const section = document.getElementById('chartSection');
        const box = document.getElementById('chartContainer');
        section.classList.remove('hidden');
        const daily = data.daily || {};
        const hourly = data.hourly || {};
        const high = (daily.temperature_2m_max || []).slice(0,7).map(Number);
        const low = (daily.temperature_2m_min || []).slice(0,7).map(Number);
        const labels = (daily.time || []).slice(0,7).map(Utils.formatDate);
        const hTemp = (hourly.temperature_2m || []).slice(0,24).map(Number);
        const hRain = (hourly.precipitation_probability || []).slice(0,24).map(v => Utils.safeNumber(v, 0));
        box.innerHTML = `
            <div class="chart-card"><h4>7天最高/最低温</h4>${this.lineChart([high, low], labels, ['最高温','最低温'], '℃')}</div>
            <div class="chart-card"><h4>未来24小时温度</h4>${this.lineChart([hTemp], hTemp.map((_,i)=>`${i}h`), ['温度'], '℃')}</div>
            <div class="chart-card"><h4>未来24小时降雨概率</h4>${this.barChart(hRain, hRain.map((_,i)=>`${i}h`), '%')}</div>
        `;
    },

    lineChart(series, labels, names, unit) {
        const width = 520, height = 230, pad = 34;
        const values = series.flat().filter(Number.isFinite);
        if (!values.length) return '<p class="muted-text">暂无图表数据</p>';
        const min = Math.floor(Math.min(...values) - 2), max = Math.ceil(Math.max(...values) + 2);
        const x = i => pad + (width - pad*2) * (i / Math.max(1, (series[0].length - 1)));
        const y = v => height - pad - (v - min) / Math.max(1, max - min) * (height - pad*2);
        const paths = series.map((arr, si) => {
            const d = arr.map((v,i) => `${i?'L':'M'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
            const cls = si === 0 ? 'chart-line primary-line' : 'chart-line secondary-line';
            const pts = arr.map((v,i) => `<circle class="chart-dot dot-${si}" cx="${x(i)}" cy="${y(v)}" r="3"><title>${labels[i] || ''} ${names[si]} ${Math.round(v)}${unit}</title></circle>`).join('');
            return `<path class="${cls}" d="${d}"/>${pts}`;
        }).join('');
        const labelText = labels.map((l,i) => i % Math.ceil(labels.length/6 || 1) === 0 ? `<text x="${x(i)}" y="${height-8}" text-anchor="middle" class="chart-label">${l}</text>` : '').join('');
        return `<svg class="simple-chart" viewBox="0 0 ${width} ${height}" role="img">
            <line class="chart-axis" x1="${pad}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}"/>
            <line class="chart-axis" x1="${pad}" y1="${pad}" x2="${pad}" y2="${height-pad}"/>
            <text x="8" y="${pad+4}" class="chart-label">${max}${unit}</text>
            <text x="8" y="${height-pad}" class="chart-label">${min}${unit}</text>
            ${paths}${labelText}
            <text x="${width-pad}" y="20" text-anchor="end" class="chart-label">${names.join(' / ')}</text>
        </svg>`;
    },

    barChart(values, labels, unit) {
        const width = 520, height = 230, pad = 34;
        if (!values.length) return '<p class="muted-text">暂无图表数据</p>';
        const max = Math.max(100, Math.ceil(Math.max(...values)));
        const bw = (width - pad*2) / values.length * 0.72;
        const bars = values.map((v,i) => {
            const x = pad + (width - pad*2) * i / values.length + bw*0.2;
            const h = (height - pad*2) * (v / max);
            const y = height - pad - h;
            return `<rect class="chart-bar" x="${x}" y="${y}" width="${bw}" height="${h}"><title>${labels[i]} ${Math.round(v)}${unit}</title></rect>`;
        }).join('');
        const labelText = labels.map((l,i) => i % 4 === 0 ? `<text x="${pad + (width - pad*2) * (i+0.5) / values.length}" y="${height-8}" text-anchor="middle" class="chart-label">${l}</text>` : '').join('');
        return `<svg class="simple-chart" viewBox="0 0 ${width} ${height}" role="img">
            <line class="chart-axis" x1="${pad}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}"/>
            <line class="chart-axis" x1="${pad}" y1="${pad}" x2="${pad}" y2="${height-pad}"/>
            <text x="8" y="${pad+4}" class="chart-label">${max}${unit}</text>
            <text x="8" y="${height-pad}" class="chart-label">0${unit}</text>
            ${bars}${labelText}
        </svg>`;
    },

    renderMapPins() {
        const panel = document.getElementById('mapPanel');
        panel.innerHTML = '<div class="china-map-bg">中国城市天气点位图</div>' + this.mapCities.map(c =>
            `<button class="map-pin" style="left:${c.x}%;top:${c.y}%;" data-city="${c.name}" title="${c.name}"><span></span>${c.name}</button>`
        ).join('');
        panel.querySelectorAll('.map-pin').forEach(pin => pin.addEventListener('click', () => {
            document.getElementById('cityInput').value = pin.dataset.city;
            triggerSearch(pin.dataset.city);
        }));
    },

    renderMapResult(cityName, data) {
        const c = data.current || {};
        const w = Utils.getWeatherDesc(c.weather_code);
        document.getElementById('mapResult').innerHTML = `地图天气：<strong>${Utils.escapeHtml(cityName)}</strong> ${w.icon} ${w.text}，${Math.round(Utils.safeNumber(c.temperature_2m))}℃，风速 ${Math.round(Utils.safeNumber(c.wind_speed_10m))} km/h`;
    },

    setTripDateDefault() {
        const input = document.getElementById('tripDateInput');
        if (!input) return;
        const today = new Date();
        const max = new Date(); max.setDate(today.getDate() + 6);
        const toISO = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        input.value = toISO(today);
        input.min = toISO(today);
        input.max = toISO(max);
    },

    async planTrip() {
        const city = document.getElementById('tripCityInput').value.trim() || CONFIG.APP_STATE.currentCity;
        const date = document.getElementById('tripDateInput').value;
        const type = document.getElementById('tripTypeSelect').value;
        const result = document.getElementById('tripResult');
        if (!city) { result.innerHTML = '<span class="warn-text">请输入目的城市，或先搜索一个城市。</span>'; return; }
        if (!date) { result.innerHTML = '<span class="warn-text">请选择出行日期。</span>'; return; }
        result.innerHTML = '<span class="spinner small-spinner"></span> 正在生成出行建议...';
        try {
            const info = await Weather.searchCity(city);
            if (!info) { result.innerHTML = '<span class="warn-text">未找到该城市。</span>'; return; }
            const data = await Weather.fetchCurrentWeather(info.lat, info.lon);
            const idx = (data.daily?.time || []).findIndex(t => t === date);
            if (idx < 0) { result.innerHTML = '<span class="warn-text">目前仅支持未来7天内的出行建议。</span>'; return; }
            const day = this.evaluateTripDay(data, idx, type);
            result.innerHTML = `<div class="trip-score ${day.level}"><strong>${day.score}分</strong><span>${day.title}</span></div>
                <p>${Utils.escapeHtml(info.name)} · ${Utils.getWeekday(date)} ${Utils.formatDate(date)} · ${day.weather}</p>
                <p>${day.message}</p>
                <p class="trip-reason">依据：最高 ${day.maxTemp}℃、最低 ${day.minTemp}℃、降雨概率 ${day.rain}%、最大风速 ${day.wind}km/h、紫外线 ${day.uv}。</p>`;
        } catch (e) {
            result.innerHTML = '<span class="warn-text">生成失败，请检查网络或稍后重试。</span>';
        }
    },

    evaluateTripDay(data, idx, type) {
        const d = data.daily;
        const maxTemp = Math.round(Utils.safeNumber(d.temperature_2m_max?.[idx]));
        const minTemp = Math.round(Utils.safeNumber(d.temperature_2m_min?.[idx]));
        const rain = Math.round(Utils.safeNumber(d.precipitation_probability_max?.[idx], 0));
        const wind = Math.round(Utils.safeNumber(d.wind_speed_10m_max?.[idx], 0));
        const uv = Number(Utils.safeNumber(d.uv_index_max?.[idx], 0).toFixed(1));
        const w = Utils.getWeatherDesc(d.weather_code?.[idx]);
        let score = 100;
        if (rain >= 70 || Utils.isRainCode(d.weather_code?.[idx])) score -= 30;
        else if (rain >= 40) score -= 15;
        if (wind >= 40) score -= 20; else if (wind >= 28) score -= 10;
        if (maxTemp >= 35 || minTemp <= 0) score -= 20;
        else if (maxTemp >= 32 || minTemp <= 8) score -= 10;
        if (uv >= 9) score -= 8;
        const typePenalty = {
            tour: rain >= 50 ? 8 : 0,
            sport: (rain >= 40 || wind >= 30 || maxTemp >= 32) ? 15 : 0,
            commute: rain >= 60 ? 8 : 0,
            carwash: rain >= 30 ? 35 : 0,
            camping: (rain >= 30 || wind >= 28 || minTemp <= 10) ? 25 : 0
        }[type] || 0;
        score = Utils.clamp(score - typePenalty, 0, 100);
        const level = score >= 80 ? 'good' : score >= 60 ? 'normal' : 'bad';
        const title = score >= 80 ? '适宜出行' : score >= 60 ? '可出行但需准备' : '不太建议安排';
        const messages = {
            good: '整体天气条件较好，可以按计划安排活动。',
            normal: '天气存在一定影响，建议准备雨具、防晒或调整活动时间。',
            bad: '天气风险较高，建议改期或选择室内活动。'
        };
        return { score, level, title, message: messages[level], weather: `${w.icon} ${w.text}`, maxTemp, minTemp, rain, wind, uv };
    },

    toast(message) {
        const t = document.getElementById('toast');
        if (!t) return;
        t.textContent = message;
        t.classList.remove('hidden');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => t.classList.add('hidden'), 2400);
    }
};
