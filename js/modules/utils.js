/**
 * 天气预报网页系统 - 工具函数（Open-Meteo WMO天气码）
 */
const Utils = {
    getWeatherDesc(code) {
        const m = {
            0:{icon:'\u2600\ufe0f',text:'\u6674'}, 1:{icon:'\U0001f324\ufe0f',text:'\u5927\u90e8\u6674'},
            2:{icon:'\u26c5',text:'\u591a\u4e91'}, 3:{icon:'\u2601\ufe0f',text:'\u9634'},
            45:{icon:'\U0001f32b\ufe0f',text:'\u96fe'}, 48:{icon:'\U0001f32b\ufe0f',text:'\u96fe\u51a5'},
            51:{icon:'\U0001f326\ufe0f',text:'\u5c0f\u6bdb\u6bdb\u96e8'}, 53:{icon:'\U0001f326\ufe0f',text:'\u4e2d\u6bdb\u6bdb\u96e8'},
            55:{icon:'\U0001f327\ufe0f',text:'\u5927\u6bdb\u6bdb\u96e8'},
            61:{icon:'\U0001f327\ufe0f',text:'\u5c0f\u96e8'}, 63:{icon:'\U0001f327\ufe0f',text:'\u4e2d\u96e8'},
            65:{icon:'\U0001f327\ufe0f',text:'\u5927\u96e8'},
            71:{icon:'\U0001f328\ufe0f',text:'\u5c0f\u96ea'}, 73:{icon:'\U0001f328\ufe0f',text:'\u4e2d\u96ea'},
            75:{icon:'\U0001f328\ufe0f',text:'\u5927\u96ea'},
            80:{icon:'\U0001f326\ufe0f',text:'\u9635\u96e8'}, 81:{icon:'\U0001f327\ufe0f',text:'\u4e2d\u9635\u96e8'},
            82:{icon:'\u26c8\ufe0f',text:'\u5927\u9635\u96e8'},
            85:{icon:'\U0001f328\ufe0f',text:'\u5c0f\u9635\u96ea'}, 86:{icon:'\U0001f328\ufe0f',text:'\u5927\u9635\u96ea'},
            95:{icon:'\u26c8\ufe0f',text:'\u96f7\u66b4'}, 96:{icon:'\u26c8\ufe0f',text:'\u96f7\u66b4+\u51b0\u96f9'},
            99:{icon:'\u26c8\ufe0f',text:'\u5f3a\u96f7\u66b4'}
        };
        return m[code] || { icon: '\U0001f308', text: '\u672a\u77e5' };
    },
    windDir(d) { return ['\u5317','\u4e1c\u5317','\u4e1c','\u4e1c\u5357','\u5357','\u897f\u5357','\u897f','\u897f\u5317'][Math.round(d/45)%8]; },
    formatDate(s) { if(!s)return''; const d=new Date(s); return `${d.getMonth()+1}/${d.getDate()}`; },
    getCurrentTime() { const n=new Date(); return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`; },
    formatDateTime(s) { if(!s)return''; const d=new Date(s); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
};
