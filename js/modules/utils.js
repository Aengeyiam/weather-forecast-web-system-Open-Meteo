/**
 * 天气预报网页系统 - 工具函数（Open-Meteo WMO天气码）
 */
const Utils = {
    getWeatherDesc(code) {
        const m = {
            0:{icon:'☀️',text:'晴'}, 1:{icon:'🌤️',text:'大部晴朗'}, 2:{icon:'⛅',text:'多云'}, 3:{icon:'☁️',text:'阴'},
            45:{icon:'🌫️',text:'雾'}, 48:{icon:'🌫️',text:'雾凇'},
            51:{icon:'🌦️',text:'小毛毛雨'}, 53:{icon:'🌦️',text:'中毛毛雨'}, 55:{icon:'🌧️',text:'大毛毛雨'},
            56:{icon:'🌧️',text:'冻毛毛雨'}, 57:{icon:'🌧️',text:'强冻毛毛雨'},
            61:{icon:'🌧️',text:'小雨'}, 63:{icon:'🌧️',text:'中雨'}, 65:{icon:'🌧️',text:'大雨'},
            66:{icon:'🌧️',text:'冻雨'}, 67:{icon:'🌧️',text:'强冻雨'},
            71:{icon:'🌨️',text:'小雪'}, 73:{icon:'🌨️',text:'中雪'}, 75:{icon:'🌨️',text:'大雪'}, 77:{icon:'🌨️',text:'雪粒'},
            80:{icon:'🌦️',text:'阵雨'}, 81:{icon:'🌧️',text:'中阵雨'}, 82:{icon:'⛈️',text:'强阵雨'},
            85:{icon:'🌨️',text:'小阵雪'}, 86:{icon:'🌨️',text:'大阵雪'},
            95:{icon:'⛈️',text:'雷暴'}, 96:{icon:'⛈️',text:'雷暴+冰雹'}, 99:{icon:'⛈️',text:'强雷暴'}
        };
        return m[Number(code)] || { icon: '🌈', text: '未知' };
    },
    isRainCode(code) {
        return [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(Number(code));
    },
    isSnowCode(code) {
        return [71,73,75,77,85,86].includes(Number(code));
    },
    windDir(d) {
        if (d === null || d === undefined || Number.isNaN(Number(d))) return '--';
        return ['北','东北','东','东南','南','西南','西','西北'][Math.round(Number(d)/45)%8];
    },
    windLevel(speed) {
        const s = Number(speed || 0);
        if (s < 1) return '0级';
        if (s < 6) return '1级';
        if (s < 12) return '2级';
        if (s < 20) return '3级';
        if (s < 29) return '4级';
        if (s < 39) return '5级';
        if (s < 50) return '6级';
        if (s < 62) return '7级';
        return '8级以上';
    },
    formatDate(s) {
        if(!s) return '';
        const d = new Date(s);
        return `${d.getMonth()+1}/${d.getDate()}`;
    },
    formatDateTime(s) {
        if(!s) return '';
        const d = new Date(String(s).replace(' ', 'T'));
        if (Number.isNaN(d.getTime())) return s;
        return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    },
    getWeekday(s) {
        const d = new Date(s);
        const arr = ['周日','周一','周二','周三','周四','周五','周六'];
        return arr[d.getDay()] || '';
    },
    getCurrentTime() {
        const n = new Date();
        return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
    },
    clamp(v, min, max) {
        const n = Number(v);
        if (Number.isNaN(n)) return min;
        return Math.max(min, Math.min(max, n));
    },
    safeNumber(v, fallback = 0) {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    },
    average(arr) {
        const vals = (arr || []).map(Number).filter(Number.isFinite);
        return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
    },
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    },
    daysBetween(a, b) {
        const d1 = new Date(a); d1.setHours(0,0,0,0);
        const d2 = new Date(b); d2.setHours(0,0,0,0);
        return Math.round((d2 - d1) / 86400000);
    },
    todayISO() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
};
