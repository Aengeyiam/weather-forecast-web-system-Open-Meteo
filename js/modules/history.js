/**
 * 天气预报网页系统 - 历史记录模块（增强版）
 */
const History = {
    async getUserHistory() {
        try {
            const response = await fetch('api/history.php?action=list', { method: 'GET' });
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('获取历史记录失败:', error);
            return [];
        }
    },

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

    async deleteQueryRecord(recordId) {
        try {
            const response = await fetch(`api/history.php?action=delete&id=${encodeURIComponent(recordId)}`, { method: 'DELETE' });
            return await response.json();
        } catch (error) {
            return { success: false, message: '删除失败' };
        }
    },

    async clearQueryRecords() {
        try {
            const response = await fetch('api/history.php?action=clear', { method: 'DELETE' });
            return await response.json();
        } catch (error) {
            return { success: false, message: '清空失败' };
        }
    },

    renderHistoryStats(records) {
        const box = document.getElementById('historyStats');
        if (!box) return;
        if (!records || !records.length) {
            box.innerHTML = '<div class="stat-card"><strong>0</strong><span>本账号暂无查询数据</span></div>';
            return;
        }
        const counter = {};
        records.forEach(r => { counter[r.query_city] = (counter[r.query_city] || 0) + 1; });
        const top = Object.entries(counter).sort((a,b)=>b[1]-a[1])[0];
        const last = records[0];
        box.innerHTML = `
            <div class="stat-card"><strong>${records.length}</strong><span>最近记录数</span></div>
            <div class="stat-card"><strong>${Utils.escapeHtml(top[0])}</strong><span>最常查询 · ${top[1]}次</span></div>
            <div class="stat-card"><strong>${Utils.escapeHtml(last.query_city)}</strong><span>最近查询 · ${Utils.formatDateTime(last.query_time)}</span></div>
        `;
    },

    renderHistoryList(records) {
        const container = document.getElementById('historyContainer');
        this.renderHistoryStats(records);

        if (!records || records.length === 0) {
            container.innerHTML = '<p class="history-empty">暂无查询记录</p>';
            return;
        }

        const listHtml = records.map(record => {
            const time = Utils.formatDateTime(record.query_time);
            const city = Utils.escapeHtml(record.query_city);
            return `
                <li class="history-item" data-city="${city}" title="点击城市再次查询">
                    <span class="history-city">📍 ${city}</span>
                    <span class="history-time">${time}</span>
                    <button class="history-delete" data-id="${record.record_id}" title="删除该记录">删除</button>
                </li>
            `;
        }).join('');

        container.innerHTML = `<ul class="history-list">${listHtml}</ul>`;

        container.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('history-delete')) return;
                const city = item.getAttribute('data-city');
                if (city && typeof triggerSearch === 'function') {
                    document.getElementById('cityInput').value = city;
                    triggerSearch(city);
                }
            });
        });

        container.querySelectorAll('.history-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const result = await this.deleteQueryRecord(id);
                if (result.success) {
                    Features?.toast('已删除该条历史记录');
                    if (typeof refreshHistory === 'function') await refreshHistory();
                } else {
                    Features?.toast(result.message || '删除失败');
                }
            });
        });
    }
};
