// 移动端菜单切换
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // 复制主菜单到移动端菜单
    const mainMenu = document.querySelector('.main-menu');
    const mobileMainMenu = document.querySelector('.mobile-main-menu');
    if (mainMenu && mobileMainMenu) {
        mobileMainMenu.innerHTML = mainMenu.innerHTML;
    }

    // 处理子菜单点击
    document.querySelectorAll('.has-submenu').forEach(item => {
        const link = item.querySelector('a');
        const submenu = item.querySelector('.submenu');
        
        if (window.innerWidth <= 992) { // 移动端
            link.addEventListener('click', (e) => {
                e.preventDefault();
                submenu.classList.toggle('active');
            });
        }
    });

    // 滚动时改变导航栏样式
    let lastScroll = 0;
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (!this.classList.contains('has-submenu')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // 如果是移动端，点击后关闭菜单
                    if (window.innerWidth <= 992) {
                        mobileMenu.classList.remove('active');
                        body.style.overflow = '';
                    }
                }
            }
        });
    });

    // 表单提交处理
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // 这里添加表单提交逻辑
            alert('感谢您的留言，我们会尽快回复！');
            contactForm.reset();
        });
    }

    // 图片懒加载
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    // 添加页面加载动画
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

    // 处理图片加载错误
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            this.src = 'images/placeholder.jpg';
            this.onerror = null;
        };
    });

    // 导航菜单处理
    const menuLinks = document.querySelectorAll('.main-menu a');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // 如果是页面内锚点链接
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
            // 如果是带锚点的页面链接（例如 new-energy.html#solar）
            else if (href && href.includes('#') && !href.startsWith('#')) {
                // 使用默认行为
            }
            // 如果是普通页面链接
            else if (href && !href.startsWith('http')) {
                // 使用默认行为
            }
        });
    });

    // 子菜单处理
    const hasSubmenu = document.querySelectorAll('.has-submenu');
    
    hasSubmenu.forEach(item => {
        const link = item.querySelector('a');
        const submenu = item.querySelector('.submenu');
        
        // 移动端点击展开子菜单
        if (window.innerWidth <= 992) {
            link.addEventListener('click', (e) => {
                if (submenu) {
                    e.preventDefault();
                    submenu.classList.toggle('active');
                }
            });
        }
        
        // 桌面端鼠标悬停显示子菜单
        if (window.innerWidth > 992) {
            item.addEventListener('mouseenter', () => {
                if (submenu) {
                    submenu.style.display = 'block';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                if (submenu) {
                    submenu.style.display = 'none';
                }
            });
        }
    });

    // 标记当前活动菜单项
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            // 检查页面路径
            if (currentPath.endsWith(href.split('#')[0])) {
                const parentLi = link.closest('li');
                if (parentLi) {
                    parentLi.classList.add('active');
                }
            }
            // 检查锚点
            if (currentHash && href.endsWith(currentHash)) {
                const parentLi = link.closest('li');
                if (parentLi) {
                    parentLi.classList.add('active');
                }
            }
        }
    });
});

// 更新活动菜单项
function updateActiveMenuItem() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.main-menu a');
    
    menuLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath && currentPath.endsWith(linkPath)) {
            link.parentElement.classList.add('active');
        } else {
            link.parentElement.classList.remove('active');
        }
    });
}

// 页面加载完成后更新活动菜单项
window.addEventListener('load', updateActiveMenuItem);