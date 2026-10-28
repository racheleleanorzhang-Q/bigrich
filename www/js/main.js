// ===== 主题切换 =====
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

if (themeToggle && themeIcon) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// ===== 移动端菜单 =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const siteNav = document.querySelector('.site-nav');

if (mobileMenuBtn && siteNav) {
    mobileMenuBtn.addEventListener('click', () => {
        siteNav.classList.toggle('mobile-active');
        mobileMenuBtn.classList.toggle('active');
    });
    siteNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            siteNav.classList.remove('mobile-active');
            mobileMenuBtn.classList.remove('active');
        });
    });
}

// ===== 导航栏滚动高亮 =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.site-nav a');

function highlightNavLink() {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 120;
        const sectionId = section.getAttribute('id');
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}
window.addEventListener('scroll', highlightNavLink);

// ===== 平滑滚动 =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        // Only intercept internal page anchors (e.g., #projects, #contact)
        // Don't intercept external links that happen to contain # (e.g., GitHub URLs with anchors)
        const href = this.getAttribute('href');
        if (!href || href.indexOf('://') !== -1) return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== 滚动入场动画 =====
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.card, .blog-card, .section-header').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.5s ease ' + (i * 0.05) + 's, transform 0.5s ease ' + (i * 0.05) + 's';
    observer.observe(el);
});

// ===== Header 滚动阴影 =====
const siteHeader = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 10) {
        siteHeader && siteHeader.classList.add('scrolled');
    } else {
        siteHeader && siteHeader.classList.remove('scrolled');
    }
});

console.log('BigRich Personal Website V1.8 Loaded');

// ===== Blog Carousel =====
(function() {
    const track = document.getElementById('blogTrack');
    const dotsContainer = document.getElementById('blogDots');
    const carousel = document.getElementById('blogCarousel');
    if (!track || !dotsContainer) return;

    const pages = track.querySelectorAll('.blog-page');
    const totalPages = pages.length;
    let currentPage = 0;
    let autoPlayTimer = null;
    const AUTO_PLAY_INTERVAL = 5000; // 5 seconds

    // Build dots
    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'blog-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', '第' + (i + 1) + '页');
        dot.addEventListener('click', function() {
            goToPage(i);
        });
        dotsContainer.appendChild(dot);
    }

    function goToPage(index) {
        if (index < 0) index = totalPages - 1;
        if (index >= totalPages) index = 0;
        currentPage = index;
        track.style.transform = 'translateX(-' + (currentPage * 100) + '%)';
        // Update dots
        dotsContainer.querySelectorAll('.blog-dot').forEach(function(dot, i) {
            dot.classList.toggle('active', i === currentPage);
        });
    }

    // Prev/Next buttons
    const prevBtn = carousel.querySelector('.blog-nav-prev');
    const nextBtn = carousel.querySelector('.blog-nav-next');
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            goToPage(currentPage - 1);
            resetAutoPlay();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            goToPage(currentPage + 1);
            resetAutoPlay();
        });
    }

    // Auto play
    function startAutoPlay() {
        autoPlayTimer = setInterval(function() {
            goToPage(currentPage + 1);
        }, AUTO_PLAY_INTERVAL);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    }

    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // Start auto play only if more than 1 page
    if (totalPages > 1) {
        startAutoPlay();
    }
})();

// ===== GitHub Trending Tab 切换 =====
function showGtmTab(idx) {
    document.querySelectorAll(".github-trending-module .gtm-tab").forEach(function(t, i) {
        t.classList.toggle("active", i === idx);
    });
    document.querySelectorAll(".github-trending-module .gtm-panel").forEach(function(p, i) {
        p.classList.toggle("active", i === idx);
    });
}
