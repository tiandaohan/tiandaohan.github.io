document.addEventListener('DOMContentLoaded', function() {
    // 获取必要的DOM元素
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const submenuItems = document.querySelectorAll('.mobile-menu > li.has-submenu');
    let isAnimating = false;

    // 切换菜单按钮和导航菜单的状态
    menuBtn.addEventListener('click', function() {
        if (isAnimating) return;
        isAnimating = true;
        
        this.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        setTimeout(() => {
            isAnimating = false;
        }, 300);
    });

    // 处理子菜单的展开/收起
    submenuItems.forEach(item => {
        const link = item.querySelector('a');
        const submenu = item.querySelector('.mobile-submenu');
        let isSubmenuAnimating = false;

        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (isSubmenuAnimating) return;
            isSubmenuAnimating = true;
            
            // 关闭其他打开的子菜单
            submenuItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherSubmenu = otherItem.querySelector('.mobile-submenu');
                    if (otherSubmenu) {
                        otherSubmenu.classList.remove('active');
                        otherSubmenu.style.maxHeight = null;
                    }
                }
            });

            // 切换当前子菜单
            item.classList.toggle('active');
            if (submenu) {
                submenu.classList.toggle('active');
                if (submenu.classList.contains('active')) {
                    submenu.style.maxHeight = submenu.scrollHeight + "px";
                } else {
                    submenu.style.maxHeight = null;
                }
            }
            
            setTimeout(() => {
                isSubmenuAnimating = false;
            }, 300);
        });
    });

    // 点击导航链接时关闭菜单
    const menuLinks = document.querySelectorAll('.mobile-menu a:not(.has-submenu)');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isAnimating) return;
            isAnimating = true;
            
            menuBtn.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.classList.remove('menu-open');
            
            setTimeout(() => {
                isAnimating = false;
            }, 300);
        });
    });

    // 处理页面滚动时的导航栏行为
    let lastScrollTop = 0;
    let isScrolling = false;
    
    window.addEventListener('scroll', () => {
        if (isScrolling) return;
        isScrolling = true;
        
        requestAnimationFrame(() => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            const header = document.querySelector('.header');
            
            if (currentScroll > lastScrollTop && currentScroll > 60) {
                // 向下滚动
                header.style.transform = 'translateY(-100%)';
            } else {
                // 向上滚动
                header.style.transform = 'translateY(0)';
            }
            lastScrollTop = currentScroll;
            
            isScrolling = false;
        });
    });
}); 