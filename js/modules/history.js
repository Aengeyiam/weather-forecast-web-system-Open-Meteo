/**
 * 天气预报网页系统 - 历史记录模块
 * 作者：熊倡（接口提供）/ 吴裕勇（调用渲染）
 * 功能：历史记录的增删查、列表渲染
 * 
 * 依赖：api/history.php
 */

const History = {
    /**
     * 获取当前用户的历史查询记录（共享接口2）
     * 调用方：吴裕勇 — main.js 页面初始化、查询成功后刷新
     * @returns {Promise<Array<{record_id, query_city, query_time}>>}
     */
    async getUserHistory() {
        try {
            const response = await fetch(
                'api/history.php?action=list',
                { method: 'GET' }
            );
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('获取历史记录失败:', error);
            return [];
        }
    },

    /**
     * 保存查询记录（共享接口3）
     * 调用方：吴裕勇 — weather.js 查询成功后自动调用
     * @param {string} city - 查询城市名称
     * @returns {Promise<{success: boolean, recordId: number|null}>}
     */
    async saveQueryRecord(city) {
        try {
            const response = await fetch('api/history.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city })
            });
            return await response.json();
        } catch (error) {
            console.error('保存历史记录失败:', error);
            return { success: false, recordId: null };
        }
    },

    /**
     * 渲染历史记录列表到 DOM
     * 调用方：吴裕勇
     * @param {Array} records - 历史记录数组
     */
    renderHistoryList(records) {
        const container = document.getElementById('historyContainer');

        if (!records || records.length === 0) {
            container.innerHTML = '<p class="history-empty">暂无查询记录</p>';
            return;
        }

        const listHtml = records.map(record => {
            const time = Utils.formatDateTime(record.query_time);
            const city = this._escapeHtml(record.query_city);
            return `
                <li class="history-item" data-city="${city}" title="点击再次查询">
                    <span class="history-city">📍 ${city}</span>
                    <span class="history-time">${time}</span>
                </li>
            `;
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
    },

    /**
     * HTML 转义，防止 XSS
     * @param {string} str
     * @returns {string}
     */
    _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
