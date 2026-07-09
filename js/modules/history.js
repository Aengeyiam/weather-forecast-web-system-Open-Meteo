/**
 * 天气预报网页系统 - 历史记录模块（Python 后端版）
 */

const History = {
    /**
     * 获取当前用户的历史查询记录
     */
    async getUserHistory() {
        try {
            const userId = Auth.getCurrentUserId();
            const res = await fetch(`${CONFIG.API_BASE}/history?userId=${userId}`);
            const data = await res.json();
            return data.records || [];
        } catch (e) {
            return [];
        }
    },

    /**
     * 保存一条查询记录
     */
    async saveQueryRecord(city) {
        try {
            const userId = Auth.getCurrentUserId();
            await fetch(`${CONFIG.API_BASE}/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, city })
            });
            return { success: true };
        } catch (e) {
            return { success: false };
        }
    },

    /**
     * 渲染历史记录列表到 DOM
     */
    renderHistoryList(records) {
        const container = document.getElementById('historyContainer');
        if (!records || records.length === 0) {
            container.innerHTML = '<p class="history-empty">暂无查询记录</p>';
            return;
        }

        const listHtml = records.map(r => {
            const time = Utils.formatDateTime(r.queryTime);
            const city = r.queryCity.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `
                <li class="history-item" data-city="${city}">
                    <span class="history-city">📍 ${city}</span>
                    <span class="history-time">${time}</span>
                </li>`;
        }).join('');

        container.innerHTML = `<ul class="history-list">${listHtml}</ul>`;
        container.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const city = item.getAttribute('data-city');
                if (city && typeof triggerSearch === 'function') {
                    document.getElementById('cityInput').value = city;
                    triggerSearch(city);
                }
            });
        });
    }
};
