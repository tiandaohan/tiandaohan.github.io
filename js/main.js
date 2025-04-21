// 移动端菜单控制
const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('nav');
const menuItems = document.querySelectorAll('.main-menu > li');
const hasSubmenu = document.querySelectorAll('.has-submenu');
const body = document.body;

// 初始化移动端菜单
function initMobileMenu() {
    if (!mobileMenuBtn || !nav) return;

    // 移动端菜单按钮点击事件
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        body.classList.toggle('menu-open');
        mobileMenuBtn.classList.toggle('active');
    });

    // 处理子菜单
    hasSubmenu.forEach(item => {
        const link = item.querySelector('a');
        
        if (link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    item.classList.toggle('active');
                    
                    // 关闭其他打开的子菜单
                    hasSubmenu.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                        }
                    });
                }
            });
        }
    });

    // 点击页面其他区域关闭菜单
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
            const isClickInside = nav.contains(e.target) || mobileMenuBtn.contains(e.target);
            
            if (!isClickInside && nav.classList.contains('active')) {
                nav.classList.remove('active');
                body.classList.remove('menu-open');
                mobileMenuBtn.classList.remove('active');
            }
        }
    });

    // 窗口大小改变时重置菜单状态
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            nav.classList.remove('active');
            body.classList.remove('menu-open');
            mobileMenuBtn.classList.remove('active');
            menuItems.forEach(item => item.classList.remove('active'));
        }
    });
}

// 产品规格模态框控制
const specModal = document.getElementById('spec-modal-new');
const specTables = document.querySelectorAll('.spec-table');
const closeBtn = document.querySelector('.close-btn');

// 显示指定产品的规格
function showSpecifications(productId) {
    if (!specModal) return;
    
    specModal.style.display = 'block';
    
    // 隐藏所有规格表
    specTables.forEach(table => {
        table.style.display = 'none';
    });
    
    // 显示对应产品的规格表
    const targetTable = document.getElementById(`spec-${productId}`);
    if (targetTable) {
        targetTable.style.display = 'table';
    }
}

// 初始化规格模态框
function initSpecModal() {
    if (!specModal || !closeBtn) return;

    // 关闭按钮点击事件
    closeBtn.addEventListener('click', () => {
        specModal.style.display = 'none';
    });

    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === specModal) {
            specModal.style.display = 'none';
        }
    });

    // 为所有规格按钮添加点击事件
    document.querySelectorAll('.spec-btn').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-product');
            if (productId) {
                showSpecifications(productId);
            }
        });
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSpecModal();
});

// 复制主菜单到移动端菜单
const mainMenu = document.querySelector('.main-menu');
const mobileMainMenu = document.querySelector('.mobile-main-menu');
if (mainMenu && mobileMainMenu) {
    mobileMainMenu.innerHTML = mainMenu.innerHTML;
}

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
                    mobileMenuBtn.classList.remove('active');
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