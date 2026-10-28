// ===== Slash Blog (V2.0) =====
// Blog stored in localStorage — works on static sites

(function() {
    const STORAGE_KEY = 'slash_blog_posts';
    const MAX_EXCERPT = 80;

    // DOM refs
    const blogList = document.getElementById('blogList');
    const blogEmpty = document.getElementById('blogEmpty');
    const blogWriteBtn = document.getElementById('blogWriteBtn');
    const blogModal = document.getElementById('blogModal');
    const blogModalClose = document.getElementById('blogModalClose');
    const blogCancelBtn = document.getElementById('blogCancelBtn');
    const blogSaveBtn = document.getElementById('blogSaveBtn');
    const blogTitleInput = document.getElementById('blogTitleInput');
    const blogTagInput = document.getElementById('blogTagInput');
    const blogContentInput = document.getElementById('blogContentInput');

    // View modal refs
    const blogViewModal = document.getElementById('blogViewModal');
    const blogViewClose = document.getElementById('blogViewClose');
    const blogViewTitle = document.getElementById('blogViewTitle');
    const blogViewMeta = document.getElementById('blogViewMeta');
    const blogViewContent = document.getElementById('blogViewContent');
    const blogDeleteBtn = document.getElementById('blogDeleteBtn');

    let currentViewId = null;

    // ===== Storage =====
    function getPosts() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function savePosts(posts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }

    // ===== Helpers =====
    function formatDate(dateStr) {
        const d = new Date(dateStr);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + day;
    }

    function getExcerpt(text) {
        if (!text) return '';
        const cleaned = text.replace(/\n/g, ' ').trim();
        if (cleaned.length <= MAX_EXCERPT) return cleaned;
        return cleaned.substring(0, MAX_EXCERPT) + '...';
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    }

    // ===== Render =====
    function renderBlogList() {
        const posts = getPosts();
        // Sort by date descending
        posts.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        if (posts.length === 0) {
            blogList.innerHTML = '';
            blogEmpty.style.display = 'block';
            return;
        }

        blogEmpty.style.display = 'none';
        blogList.innerHTML = '';

        posts.forEach(function(post) {
            const item = document.createElement('div');
            item.className = 'blog-list-item';
            item.setAttribute('data-id', post.id);

            item.innerHTML =
                '<div class="blog-list-date">' + formatDate(post.date) + '</div>' +
                '<div class="blog-list-info">' +
                    '<div class="blog-list-title">' + escapeHtml(post.title) + '</div>' +
                    '<div class="blog-list-excerpt">' + escapeHtml(getExcerpt(post.content)) + '</div>' +
                '</div>' +
                (post.tag ? '<div class="blog-list-tag">' + escapeHtml(post.tag) + '</div>' : '');

            item.addEventListener('click', function() {
                openViewModal(post);
            });

            blogList.appendChild(item);
        });
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== Write Modal =====
    function openWriteModal() {
        blogTitleInput.value = '';
        blogTagInput.value = '';
        blogContentInput.value = '';
        blogModal.classList.add('active');
        blogTitleInput.focus();
    }

    function closeWriteModal() {
        blogModal.classList.remove('active');
    }

    function savePost() {
        var title = blogTitleInput.value.trim();
        var tag = blogTagInput.value.trim();
        var content = blogContentInput.value.trim();

        if (!title) {
            blogTitleInput.focus();
            blogTitleInput.style.borderColor = '#f87171';
            setTimeout(function() {
                blogTitleInput.style.borderColor = '';
            }, 1500);
            return;
        }

        if (!content) {
            blogContentInput.focus();
            blogContentInput.style.borderColor = '#f87171';
            setTimeout(function() {
                blogContentInput.style.borderColor = '';
            }, 1500);
            return;
        }

        var posts = getPosts();
        var newPost = {
            id: generateId(),
            title: title,
            tag: tag,
            content: content,
            date: new Date().toISOString()
        };

        posts.push(newPost);
        savePosts(posts);
        closeWriteModal();
        renderBlogList();
    }

    // ===== View Modal =====
    function openViewModal(post) {
        currentViewId = post.id;
        blogViewTitle.textContent = post.title;
        blogViewMeta.innerHTML =
            '<span class="blog-list-tag">' + escapeHtml(post.tag || '随想') + '</span>' +
            '<span class="blog-view-date">' + formatDate(post.date) + '</span>';
        blogViewContent.textContent = post.content;
        blogViewModal.classList.add('active');
    }

    function closeViewModal() {
        blogViewModal.classList.remove('active');
        currentViewId = null;
    }

    function deletePost() {
        if (!currentViewId) return;
        if (!confirm('确定删除这篇文章？')) return;

        var posts = getPosts();
        posts = posts.filter(function(p) { return p.id !== currentViewId; });
        savePosts(posts);
        closeViewModal();
        renderBlogList();
    }

    // ===== Event Listeners =====
    blogWriteBtn.addEventListener('click', openWriteModal);
    blogModalClose.addEventListener('click', closeWriteModal);
    blogCancelBtn.addEventListener('click', closeWriteModal);
    blogSaveBtn.addEventListener('click', savePost);

    blogViewClose.addEventListener('click', closeViewModal);
    blogDeleteBtn.addEventListener('click', deletePost);

    // Close modals on overlay click
    blogModal.addEventListener('click', function(e) {
        if (e.target === blogModal) closeWriteModal();
    });
    blogViewModal.addEventListener('click', function(e) {
        if (e.target === blogViewModal) closeViewModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (blogViewModal.classList.contains('active')) {
                closeViewModal();
            } else if (blogModal.classList.contains('active')) {
                closeWriteModal();
            }
        }
    });

    // ===== Init =====
    renderBlogList();
})();
