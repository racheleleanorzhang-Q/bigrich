/**
 * Analytics Dashboard - 前端逻辑
 * 从 /api/stats 获取数据并渲染图表
 */
(function() {
    'use strict';

    // ========== 配置 ==========
    var CONFIG = {
        apiBase: '/api/stats',
        refreshInterval: 60000, // 1分钟自动刷新
    };

    // ========== 状态 ==========
    var currentDays = 7;
    var charts = {}; // 存储 Chart.js 实例
    var lastData = null; // 存储最近一次获取的数据

    // ========== 工具函数 ==========

    function formatNumber(n) {
        if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
        return n.toLocaleString();
    }

    function formatTime(isoStr) {
        var d = new Date(isoStr);
        var month = ('0' + (d.getMonth() + 1)).slice(-2);
        var day = ('0' + d.getDate()).slice(-2);
        var hour = ('0' + d.getHours()).slice(-2);
        var min = ('0' + d.getMinutes()).slice(-2);
        return month + '-' + day + ' ' + hour + ':' + min;
    }

    function getShortUrl(url) {
        return url.replace('https://', '').replace('http://', '');
    }

    // URL → 板块映射
    function mapToSection(url) {
        if (!url) return 'other';
        // 移除协议和域名
        var path = url.replace(/^https?:\/\/[^\/]+/, '').replace(/\/$/, '') || '/';

        if (path === '/' || path === '' || path === '/index.html') return 'home';
        if (path.indexOf('/#projects') !== -1 || path.indexOf('/#project') !== -1) return 'projects';
        if (path.indexOf('/#insight') !== -1 || path.indexOf('/#thought') !== -1) return 'thoughts';
        if (path.indexOf('/blog') !== -1) return 'blog';
        if (path.indexOf('/projects') !== -1) return 'tools';
        if (path.indexOf('/slash') !== -1) return 'slash';
        if (path.indexOf('/analytics') !== -1) return 'analytics';
        if (path.indexOf('/github-trending') !== -1) return 'tools';
        if (path.indexOf('/AI-Strategy') !== -1) return 'tools';
        return 'other';
    }

    function getSectionName(key) {
        var names = {
            home: '首页',
            projects: 'Selected Work',
            thoughts: 'Thoughts',
            blog: 'Blog',
            tools: 'Tools',
            slash: 'Slash',
            analytics: 'Analytics',
            other: 'Other'
        };
        return names[key] || key;
    }

    function getSectionIcon(key) {
        var icons = {
            home: '🏠',
            projects: '💼',
            thoughts: '💡',
            blog: '📝',
            tools: '🔧',
            slash: '🎭',
            analytics: '📊',
            other: '📄'
        };
        return icons[key] || '📄';
    }

    // ========== 数据获取 ==========

    function fetchStats(days) {
        var url = CONFIG.apiBase + '?days=' + days;
        return fetch(url)
            .then(function(r) { return r.json(); })
            .catch(function(e) {
                console.error('Failed to fetch stats:', e);
                return null;
            });
    }

    // ========== 渲染函数 ==========

    function renderMetrics(data) {
        // 累计访问量
        document.getElementById('totalViews').textContent = formatNumber(data.totalViews);
        // 独立访客
        document.getElementById('uniqueVisitors').textContent = formatNumber(data.uniqueVisitors);

        // 今日数据
        var todayViews = 0;
        var todayVisitors = 0;
        if (data.daily && data.daily.length > 0) {
            var today = data.daily[0]; // 最近的一天
            todayViews = today.views || 0;
            todayVisitors = today.visitors || 0;
        }
        document.getElementById('todayViews').textContent = formatNumber(todayViews);
        document.getElementById('todayVisitors').textContent = formatNumber(todayVisitors);
    }

    function renderHotSections(data) {
        if (!data.pages) return;

        // 按板块聚合
        var sections = {};
        data.pages.forEach(function(page) {
            var section = mapToSection(page.page_url);
            if (!sections[section]) {
                sections[section] = { views: 0, visitors: 0 };
            }
            sections[section].views += page.views;
            sections[section].visitors += (page.visitors || 0);
        });

        // 找出最大值用于进度条
        var maxViews = 0;
        Object.keys(sections).forEach(function(key) {
            if (sections[key].views > maxViews) maxViews = sections[key].views;
        });

        // 渲染
        var sectionKeys = ['home', 'projects', 'thoughts', 'blog', 'tools', 'slash'];
        sectionKeys.forEach(function(key) {
            var valEl = document.getElementById('hot' + capitalize(key));
            var barEl = document.getElementById('hot' + capitalize(key) + 'Bar');
            if (valEl && sections[key]) {
                valEl.textContent = sections[key].views;
            }
            if (barEl && maxViews > 0) {
                var pct = sections[key] ? (sections[key].views / maxViews * 100) : 0;
                barEl.style.width = Math.max(pct, 5) + '%';
            }
        });
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function renderDailyChart(data) {
        var ctx = document.getElementById('dailyChart');
        if (!ctx) return;

        // 销毁旧图表
        if (charts.daily) charts.daily.destroy();

        if (!data.daily || data.daily.length === 0) {
            ctx.parentNode.innerHTML = '<div class="no-data">暂无数据</div>';
            return;
        }

        // 按日期升序排列
        var sorted = data.daily.slice().reverse();
        var labels = sorted.map(function(d) { return d.date; });
        var viewsData = sorted.map(function(d) { return d.views; });
        var visitorsData = sorted.map(function(d) { return d.visitors; });

        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        var gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
        var textColor = isDark ? '#94a3b8' : '#6b7280';

        charts.daily = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'PV',
                        data: viewsData,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: '#2563eb',
                    },
                    {
                        label: 'UV',
                        data: visitorsData,
                        borderColor: '#d97706',
                        backgroundColor: 'rgba(217, 119, 6, 0.1)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: '#d97706',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: textColor, font: { size: 12 } }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: textColor, font: { size: 11 } },
                        grid: { color: gridColor }
                    },
                    y: {
                        ticks: { color: textColor, font: { size: 11 } },
                        grid: { color: gridColor },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function renderDeviceChart(data) {
        var ctx = document.getElementById('deviceChart');
        if (!ctx) return;
        if (charts.device) charts.device.destroy();

        if (!data.devices || data.devices.length === 0) {
            ctx.parentNode.innerHTML = '<div class="no-data">暂无数据</div>';
            return;
        }

        var colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        var textColor = isDark ? '#94a3b8' : '#6b7280';

        charts.device = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.devices.map(function(d) { return d.device_type || 'Unknown'; }),
                datasets: [{
                    data: data.devices.map(function(d) { return d.views; }),
                    backgroundColor: colors.slice(0, data.devices.length),
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: textColor, font: { size: 12 }, padding: 12 }
                    }
                }
            }
        });
    }

    function renderBrowserChart(data) {
        var ctx = document.getElementById('browserChart');
        if (!ctx) return;
        if (charts.browser) charts.browser.destroy();

        if (!data.browsers || data.browsers.length === 0) {
            ctx.parentNode.innerHTML = '<div class="no-data">暂无数据</div>';
            return;
        }

        var colors = ['#2563eb', '#d97706', '#10b981', '#8b5cf6', '#ef4444'];
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        var textColor = isDark ? '#94a3b8' : '#6b7280';

        charts.browser = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.browsers.map(function(d) { return d.browser || 'Unknown'; }),
                datasets: [{
                    data: data.browsers.map(function(d) { return d.views; }),
                    backgroundColor: colors.slice(0, data.browsers.length),
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: textColor, font: { size: 12 }, padding: 12 }
                    }
                }
            }
        });
    }

    function renderSourceChart(data) {
        var ctx = document.getElementById('sourceChart');
        if (!ctx) return;
        if (charts.source) charts.source.destroy();

        // 分类来源
        var sources = { 'Direct': 0, 'External': 0 };
        if (data.referrers) {
            data.referrers.forEach(function(r) {
                if (!r.referrer || r.referrer === '' || r.referrer.indexOf('bigrich88888') !== -1) {
                    sources['Direct'] += r.views;
                } else {
                    sources['External'] += r.views;
                }
            });
        }
        // 加上没有 referrer 的（直接访问）
        var directFromPages = (data.totalViews || 0);
        var trackedReferrers = (data.referrers || []).reduce(function(sum, r) { return sum + r.views; }, 0);
        sources['Direct'] += Math.max(0, directFromPages - trackedReferrers);

        if (sources['Direct'] === 0 && sources['External'] === 0) {
            ctx.parentNode.innerHTML = '<div class="no-data">暂无数据</div>';
            return;
        }

        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        var textColor = isDark ? '#94a3b8' : '#6b7280';

        charts.source = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Direct Access', 'External Links'],
                datasets: [{
                    data: [sources['Direct'], sources['External']],
                    backgroundColor: ['#2563eb', '#d97706'],
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: textColor, font: { size: 12 }, padding: 12 }
                    }
                }
            }
        });
    }

    function renderPagesList(data) {
        var container = document.getElementById('pagesList');
        if (!container) return;

        if (!data.pages || data.pages.length === 0) {
            container.innerHTML = '<div class="no-data">暂无数据</div>';
            return;
        }

        var html = '';
        data.pages.forEach(function(page, index) {
            var rankClass = index < 3 ? 'top' : '';
            var shortUrl = getShortUrl(page.page_url);
            if (shortUrl.length > 40) shortUrl = shortUrl.substring(0, 40) + '...';

            html += '<div class="page-item">' +
                '<div class="page-rank ' + rankClass + '">' + (index + 1) + '</div>' +
                '<div class="page-info">' +
                    '<div class="page-url" title="' + page.page_url + '">' + shortUrl + '</div>' +
                    '<div class="page-title">' + (page.page_title || '') + '</div>' +
                '</div>' +
                '<div class="page-stats">' +
                    '<div class="page-views">' +
                        '<div class="page-views-num">' + page.views + '</div>' +
                        '<div class="page-views-label">Views</div>' +
                    '</div>' +
                    '<div class="page-visitors">' +
                        '<div class="page-visitors-num">' + (page.visitors || 0) + '</div>' +
                        '<div class="page-visitors-label">Visitors</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        });

        container.innerHTML = html;
    }

    function renderRecentTable(data) {
        var tbody = document.getElementById('recentTable');
        if (!tbody) return;

        if (!data.recent || data.recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="no-data">暂无数据</td></tr>';
            return;
        }

        var deviceIcons = {
            'Desktop': '🖥️',
            'Mobile': '📱',
            'Tablet': '📲'
        };

        var html = '';
        data.recent.forEach(function(row) {
            var shortUrl = getShortUrl(row.page_url);
            if (shortUrl.length > 35) shortUrl = shortUrl.substring(0, 35) + '...';
            var icon = deviceIcons[row.device_type] || '💻';
            var time = formatTime(row.created_at);

            html += '<tr>' +
                '<td class="recent-page" title="' + row.page_url + '">' + shortUrl + '</td>' +
                '<td><span class="recent-device">' + icon + ' ' + (row.device_type || '-') + '</span></td>' +
                '<td>' + (row.browser || '-') + '</td>' +
                '<td class="recent-time">' + time + '</td>' +
            '</tr>';
        });

        tbody.innerHTML = html;
    }

    // ========== 主流程 ==========

    function render(data) {
        if (!data) return;
        lastData = data; // 存储数据用于主题切换后重绘
        renderMetrics(data);
        renderHotSections(data);
        renderDailyChart(data);
        renderDeviceChart(data);
        renderBrowserChart(data);
        renderSourceChart(data);
        renderPagesList(data);
        renderRecentTable(data);
    }

    function loadData(days) {
        // days=0 表示全部（用 3650 天代替）
        var apiDays = days === 0 ? 3650 : days;
        fetchStats(apiDays).then(render);
    }

    // 初始化
    function init() {
        // 周期按钮事件
        document.querySelectorAll('.period-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.period-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                currentDays = parseInt(btn.getAttribute('data-days'));
                loadData(currentDays);
            });
        });

        // 首次加载
        loadData(currentDays);

        // 自动刷新
        setInterval(function() {
            loadData(currentDays);
        }, CONFIG.refreshInterval);

        // 监听主题切换，重新渲染图表
        var observer = new MutationObserver(function() {
            // 主题切换后重新渲染图表以更新颜色
            if (lastData) {
                renderDailyChart(lastData);
                renderDeviceChart(lastData);
                renderBrowserChart(lastData);
                renderSourceChart(lastData);
            }
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
