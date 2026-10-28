/**
 * 个人网站流量埋点脚本 (analytics.js)
 * 自动采集页面访问、用户行为数据，发送到后端 API
 */
(function() {
    'use strict';

    // ========== 配置 ==========
    var CONFIG = {
        // 埋点 API 地址（同域，由 nginx 反向代理）
        apiBase: '/api/track',
        // 站点标识
        site: 'bigrich88888.xin',
        // 是否启用（开发环境可关闭）
        enabled: true,
        // 事件防抖（ms）
        debounceMs: 1000,
    };

    // ========== 工具函数 ==========

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // 获取或创建 Visitor ID（持久化）
    function getVisitorId() {
        var vid = localStorage.getItem('_analytics_vid');
        if (!vid) {
            vid = generateId();
            localStorage.setItem('_analytics_vid', vid);
        }
        return vid;
    }

    // 获取或创建 Session ID（会话级别）
    function getSessionId() {
        var sid = sessionStorage.getItem('_analytics_sid');
        if (!sid) {
            sid = generateId();
            sessionStorage.setItem('_analytics_sid', sid);
        }
        return sid;
    }

    // 解析 User-Agent
    function parseUA(ua) {
        var device = 'Desktop';
        var browser = 'Unknown';
        var os = 'Unknown';

        // 设备
        if (/Mobile|Android|iPhone|iPad|iPod|Windows Phone/i.test(ua)) {
            device = 'Mobile';
        } else if (/Tablet|iPad/i.test(ua)) {
            device = 'Tablet';
        }

        // 浏览器
        if (/Edg\//i.test(ua)) browser = 'Edge';
        else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
        else if (/Firefox\//i.test(ua)) browser = 'Firefox';
        else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
        else if (/MSIE|Trident/i.test(ua)) browser = 'IE';
        else if (/UCBrowser/i.test(ua)) browser = 'UC Browser';
        else if (/WeChat/i.test(ua)) browser = 'WeChat';
        else if (/MicroMessenger/i.test(ua)) browser = 'WeChat';

        // 操作系统
        if (/Windows NT 10/i.test(ua)) os = 'Windows 10/11';
        else if (/Windows/i.test(ua)) os = 'Windows';
        else if (/Mac OS X/i.test(ua)) os = 'macOS';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/iOS|iPhone OS/i.test(ua)) os = 'iOS';
        else if (/Linux/i.test(ua)) os = 'Linux';

        return { device: device, browser: browser, os: os };
    }

    // 发送数据（使用 beacon 保证页面关闭时也能发送）
    function send(url, data) {
        if (!CONFIG.enabled) return;
        var payload = JSON.stringify(data);
        if (navigator.sendBeacon) {
            try {
                var blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon(url, blob);
            } catch(e) {
                fallbackFetch(url, payload);
            }
        } else {
            fallbackFetch(url, payload);
        }
    }

    function fallbackFetch(url, payload) {
        if (typeof fetch !== 'undefined') {
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true,
            }).catch(function() {});
        }
    }

    // ========== 核心埋点 ==========

    var uaInfo = parseUA(navigator.userAgent);
    var visitorId = getVisitorId();
    var sessionId = getSessionId();
    var screenRes = screen.width + 'x' + screen.height;

    // 1. 页面访问埋点
    function trackPageView() {
        var data = {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            screen: screenRes,
            device: uaInfo.device,
            browser: uaInfo.browser,
            os: uaInfo.os,
            sessionId: sessionId,
            visitorId: visitorId,
        };
        send(CONFIG.apiBase + '/page', data);
    }

    // 2. 点击事件埋点（事件委托）
    var lastEventTime = 0;
    function trackClick(e) {
        var now = Date.now();
        if (now - lastEventTime < CONFIG.debounceMs) return;
        lastEventTime = now;

        var target = e.target;
        var element = '';

        // 提取点击元素信息
        if (target.tagName === 'A') {
            element = 'A:' + (target.textContent || '').trim().substring(0, 50);
        } else if (target.tagName === 'BUTTON' || target.closest('button')) {
            var btn = target.tagName === 'BUTTON' ? target : target.closest('button');
            element = 'BUTTON:' + (btn.textContent || '').trim().substring(0, 50);
        } else if (target.tagName === 'IMG') {
            element = 'IMG:' + (target.alt || '').trim().substring(0, 50);
        } else {
            var parent = target.closest('a, button, .card, .blog-card');
            if (parent) {
                element = parent.tagName + ':' + (parent.textContent || '').trim().substring(0, 50);
            } else {
                return; // 忽略无意义的点击
            }
        }

        // 判断链接类型
        var linkType = 'internal';
        if (target.tagName === 'A' && target.href) {
            if (target.href.indexOf(window.location.origin) === -1 && !target.href.startsWith('/')) {
                linkType = 'external';
            } else if (target.href.startsWith('#')) {
                linkType = 'anchor';
            } else if (target.target === '_blank') {
                linkType = 'new-tab';
            }
        }

        send(CONFIG.apiBase + '/event', {
            name: 'click',
            data: { element: element, linkType: linkType, href: target.href || '' },
            url: window.location.href,
            element: element,
            sessionId: sessionId,
            visitorId: visitorId,
        });
    }

    // 3. 页面停留时长
    var pageEnterTime = Date.now();
    function trackDuration() {
        var duration = Math.round((Date.now() - pageEnterTime) / 1000);
        if (duration > 3) { // 只记录超过3秒的
            send(CONFIG.apiBase + '/event', {
                name: 'page_duration',
                data: { duration: duration },
                url: window.location.href,
                sessionId: sessionId,
                visitorId: visitorId,
            });
        }
    }

    // ========== 事件绑定 ==========

    // 页面加载后立即发送
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageView);
    } else {
        trackPageView();
    }

    // 点击事件（事件委托）
    document.addEventListener('click', trackClick, true);

    // 页面关闭/切换时发送停留时长
    window.addEventListener('beforeunload', trackDuration);
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) trackDuration();
    });

    // 控制台标识
    console.log('%c📊 Analytics loaded', 'color: #2563eb; font-weight: bold;');

})();
