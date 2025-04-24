import { debounce, throttle, isInViewport, smoothScrollTo, getDeviceType } from './utils.js';

// 移动端菜单控制
const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('nav');
const menuItems = document.querySelectorAll('.main-menu > li');
const hasSubmenu = document.querySelectorAll('.has-submenu');
const body = document.body;

// 导航菜单
class Navigation {
    constructor() {
        // 等待DOM加载完成后再初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.nav = document.querySelector('nav');
        this.menuToggle = document.querySelector('.mobile-menu-toggle');
        this.mainMenu = document.querySelector('.main-menu');
        
        if (this.nav && this.menuToggle && this.mainMenu) {
            this.init();
        } else {
            console.warn('Some navigation elements are missing');
        }
    }

    init() {
        this.setupEventListeners();
        this.handleScroll();
    }

    setupEventListeners() {
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleMenu());
        }
        
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
        window.addEventListener('resize', debounce(() => this.handleResize(), 250));
    }

    toggleMenu() {
        if (!this.menuToggle || !this.mainMenu) return;
        
        this.menuToggle.classList.toggle('active');
        this.mainMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }

    handleScroll() {
        if (!this.nav) return;
        
        const scrollPosition = window.scrollY;
        if (scrollPosition > 100) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }
    }

    handleResize() {
        if (!this.menuToggle || !this.mainMenu) return;
        
        if (window.innerWidth > 768) {
            this.menuToggle.classList.remove('active');
            this.mainMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    }
}

// 产品规格模态框
class ProductSpecs {
    constructor() {
        // 只在存在产品规格按钮的页面初始化
        if (document.querySelector('.spec-btn')) {
            this.initialize();
        }
    }

    initialize() {
        this.modal = document.getElementById('spec-modal-new');
        this.specTables = document.querySelectorAll('.spec-table');
        this.closeBtn = document.querySelector('.close-btn');
        
        if (this.modal && this.closeBtn) {
            this.init();
        } else {
            console.warn('Product specs modal elements not found');
        }
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 确保所有需要的元素都存在
        if (!this.modal || !this.closeBtn) return;

        this.closeBtn.addEventListener('click', () => this.closeModal());
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // 获取所有规格按钮并添加事件监听
        const specButtons = document.querySelectorAll('.spec-btn');
        if (specButtons.length > 0) {
            specButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.target.dataset.product;
                    if (productId) {
                        this.showSpecifications(productId);
                    }
                });
            });
        }
    }

    showSpecifications(productId) {
        if (!this.modal || !this.specTables) return;
        
        this.modal.style.display = 'block';
        this.specTables.forEach(table => {
            if (table.id === `spec-${productId}`) {
                table.style.display = 'table';
            } else {
                table.style.display = 'none';
            }
        });
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.style.display = 'none';
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const navigation = new Navigation();
    // 只在需要的页面初始化产品规格
    if (document.querySelector('.spec-btn')) {
        const productSpecs = new ProductSpecs();
    }
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

// 动画效果
class Animations {
    constructor() {
        this.animatedElements = document.querySelectorAll('.animate');
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        this.animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
}

// 语言切换
class LanguageSwitcher {
    constructor() {
        this.buttons = document.querySelectorAll('.lang-btn');
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.buttons.forEach(button => {
            button.addEventListener('click', () => this.switchLanguage(button.dataset.lang));
        });
    }

    switchLanguage(lang) {
        // 这里可以调用i18n管理器的切换语言方法
        console.log(`Switching to ${lang}`);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new Animations();
    new LanguageSwitcher();
});