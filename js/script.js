document.addEventListener('DOMContentLoaded', function () {

    // 移动菜单按钮点击事件
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    mobileMenuBtn.addEventListener('click', function () {
        mobileMenu.classList.toggle('active');
    });

    // 移动端子菜单切换
    document.querySelectorAll('.mobile-menu .has-submenu > a').forEach(item => {
        const toggle = document.createElement('div');
        toggle.className = 'mobile-submenu-toggle';
        toggle.innerHTML = '<i class="fas fa-chevron-down"></i>';
        item.parentNode.appendChild(toggle);

        item.addEventListener('click', function (e) {
            if (window.innerWidth <= 992) { // 只在移动端生效
                e.preventDefault();
                const submenu = this.parentNode.querySelector('.submenu');
                submenu.classList.toggle('active');
                this.classList.toggle('active');
            }
        });

        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const link = this.parentNode.querySelector('> a');
            link.click(); // 触发上面的点击事件
        });
    });

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // 如果是移动菜单中的链接，关闭菜单
            if (this.closest('.mobile-menu')) {
                mobileMenu.classList.remove('active');
            }

            // 平滑滚动逻辑
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 等待i18n初始化完成
    if (!window.i18n?.initialized) {
        window.addEventListener('i18nInitialized', initApp);
    } else {
        initApp();
    }
});

function initApp() {

    // 语言切换按钮事件 - 简化版本
    document.addEventListener('click', function (e) {
        // 检查点击的是否是语言切换按钮
        const langBtn = e.target.closest('.lang-btn');
        if (langBtn) {
            e.preventDefault();
            const lang = langBtn.dataset.lang;
            i18n.changeLanguage(lang);

            // 如果是移动菜单中的按钮，关闭菜单
            if (langBtn.closest('.mobile-menu')) {
                document.querySelector('.mobile-menu').classList.remove('active');
            }
        }
    });

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });

                // 关闭移动菜单
                document.querySelector('.mobile-menu').classList.remove('active');
            }
        });
    });

    // 导航栏滚动效果
    window.addEventListener('scroll', function () {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 移动菜单切换
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    mobileMenuBtn.addEventListener('click', function () {
        mobileMenu.classList.toggle('active');
    });

    // 语言切换按钮事件
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const lang = this.dataset.lang;
            i18n.changeLanguage(lang);

            // 如果是移动菜单中的按钮，关闭菜单
            if (this.closest('.mobile-menu')) {
                mobileMenu.classList.remove('active');
            }
        });
    });

    // 监听语言变化事件，确保按钮状态同步
    window.addEventListener('languageChanged', (e) => {
        // 这个事件处理现在可以移除了，因为状态更新已经在i18n.changeLanguage中处理
        // 保留它以防其他组件需要响应语言变化
    });

    // 产品分类切换
    const categoryBtns = document.querySelectorAll('.category-btn');
    const productLists = {
        ac: document.querySelector('.ac-products'),
        dc: document.querySelector('.dc-products')
    };

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const category = this.dataset.category;

            // 更新按钮状态
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 显示对应的产品列表
            Object.keys(productLists).forEach(key => {
                if (key === category) {
                    productLists[key].style.display = 'grid';
                } else {
                    productLists[key].style.display = 'none';
                }
            });
        });
    });

    // 产品规格模态框
    const modal = document.getElementById('spec-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');
    const specBtns = document.querySelectorAll('.spec-btn');

    // 产品规格数据
    const productSpecs = {
        'ac-portable': {
            title: 'AC Portable Charger 3.5kW',
            specs: {
                'Item Number': ['3KW (EU)', '3KW (US)'],
                'AC input': {
                    'Input rating': ['230Vac/ Single Phase', '230Vac/ Single Phase'],
                    'Connection': ['L,N, PE', 'L,N, PE'],
                    'Frequency (Hz)': ['50/60', '50/60']
                },
                'Power output': {
                    'Output power': ['3.5kW', '3.5kW'],
                    'Output Current(A)': ['13A/16A', '13A/16A']
                },
                'User interface': {
                    'LED Indicator': ['4 indicators', '4 indicators'],
                    'Housing Material': ['Aluminum profile + Plastic PC940', 'Aluminum profile + Plastic PC940']
                },
                'Environmental': {
                    'Operating': ['minus 30°C to +55°C', 'minus 30°C to +55°C'],
                    'Storage temperature': ['-40 °Cto+70°C', '-40 °Cto+70°C'],
                    'Humidity': ['< 95% relative humidity', '< 95% relative humidity'],
                    'Altitude': ['Up to 2000 m (6000 feet)', 'Up to 2000 m (6000 feet)']
                },
                'Mechanical': {
                    'Ingress protection': ['IP54', 'IP54'],
                    'Cooling': ['Natural cooling', 'Natural cooling'],
                    'Cable length': ['4.2m', '4.2m'],
                    'Dimension (W*D*H)': ['240*85*44MM', '240*85*44MM'],
                    'Weight': ['<2.8kg', '<2.8kg']
                },
                'Protection': {
                    'Protection': ['Over current, Under voltage, Over voltage, Residual current, Surge protection, Short circuit, Over temperature, Ground fault']
                },
                'Regulation': {
                    'Certificate': ['IEC61851-1:2017', 'refer UL2594,UL2231-1/-2'],
                    'Safety': ['CE', 'CE/FCC (Option)'],
                    'Charging interface 1': ['IEC62196-2:2016 Type 2 Plug', 'SAEJ1772 Type 1 Socket']
                }
            }
        },
        'ac-7kw': {
            title: 'AC Charger 7kW',
            specs: {
                'Item Number': ['7.2KW (EU)', '7.2KW (US)'],
                'AC input': {
                    'Input rating': ['230Vac/ Single Phase', '230Vac/ Single Phase'],
                    'Connection': ['L,N, PE', 'L,N, PE'],
                    'Frequency (Hz)': ['50/60', '50/60']
                },
                'Power output': {
                    'Output power': ['7.2kW', '7.2kW'],
                    'Output Current(A)': ['32A', '32A']
                },
                'User interface': {
                    'Display': ['4.3" screen', '4.3" screen'],
                    'Support language': ['English', 'English']
                },
                'Environmental': {
                    'Operating': ['minus 30℃ to +55℃', 'minus 30℃ to +55℃'],
                    'Storage temperature': ['-40 ℃to+70℃', '-40 ℃to+70℃'],
                    'Humidity': ['< 95% relative humidity', '< 95% relative humidity'],
                    'Altitude': ['Up to 2000 m (6000 feet)', 'Up to 2000 m (6000 feet)']
                },
                'Mechanical': {
                    'Ingress protection': ['IP54', 'IP54'],
                    'Cooling': ['Natural cooling', 'Natural cooling'],
                    'Cable length': ['4.5m', '4.5m'],
                    'Dimension (W*D*H)': ['211*122*345mm', '211*122*345mm'],
                    'Weight': ['<4.8kg', '<4.8kg']
                },
                'Protection': {
                    'Protection': ['Over current, Under voltage, Over voltage, Residual current, Surge protection, Short circuit, Over temperature, Ground fault']
                },
                'Regulation': {
                    'Certificate': ['IEC61851-1:2017', 'refer UL2594,UL2231-1/-2'],
                    'Safety': ['CE', 'CE/FCC (Option)'],
                    'Charging interface 1': ['IEC62196-2-2016 Type 2 Plug', 'SAEJ1772 Type 1 Plug'],
                    'Charging interface 2': ['IEC62196-2-2016 Type 2 Socket', '']
                }
            }
        },
        'ac-22kw': {
            title: 'AC Charger 11kW/22kW',
            specs: {
                'Item Number': ['11KW (EU)', '22KW (EU)'],
                'AC input': {
                    'Input rating': ['400Vac/ Single Phase', '400Vac/ Single Phase'],
                    'Connection': ['L1,L2,L3,N, PE', 'L1,L2,L3,N, PE'],
                    'Frequency (Hz)': ['50/60', '50/60']
                },
                'Power output': {
                    'Output power': ['22kW', '22kW'],
                    'Output Current(A)': ['32A', '32A']
                },
                'User interface': {
                    'Display': ['LCD option', 'LCD option'],
                    'Support language': ['English', 'English']
                },
                'Environmental': {
                    'Operating': ['minus 30℃ to +55℃', 'minus 30℃ to +55℃'],
                    'Storage temperature': ['-40 ℃to+70℃', '-40 ℃to+70℃'],
                    'Humidity': ['< 95% relative humidity', '< 95% relative humidity'],
                    'Altitude': ['Up to 2000 m (6000 feet)', 'Up to 2000 m (6000 feet)']
                },
                'Mechanical': {
                    'Ingress protection': ['IP54', 'IP54'],
                    'Cooling': ['Natural cooling', 'Natural cooling'],
                    'Cable length': ['4.2m', '4.2m'],
                    'Dimension (W*D*H)': ['230*215*149mm (L*W*H)', '230*215*149mm (L*W*H)'],
                    'Weight': ['4.6kg', '5.2kg']
                },
                'Protection': {
                    'Protection': ['Over current, Under voltage, Over voltage, Residual current, Surge protection, Short circuit, Over temperature, Ground fault']
                },
                'Regulation': {
                    'Certificate': ['IEC61851-1:2017', 'IEC61851-1:2017'],
                    'Safety': ['CE', 'CE'],
                    'Charging interface 1': ['IEC62196-2-2016', 'IEC62196-2-2016']
                }
            }
        },
        'dc-40kw': {
            title: 'DC Charger 20kW-40kW',
            specs: {
                'Item Number': ['20KW', '30kW-40kW'],
                'AC input': {
                    'Input rating': ['AC400V 3ph', 'AC400V 3ph'],
                    'phase / wire': ['3ph / L1, L2, L3,N, PE', '3ph / L1, L2, L3, N,PE'],
                    'Frequency (Hz)': ['50/60', '50/60']
                },
                'Power output': {
                    'Output power': ['68A/100A MAX', '133A MAX'],
                    'Output rating': ['IEC 62196-3(CCS Combo 2)×1', 'IEC 62196-3(CCS Combo 2)×1']
                },
                'User interface': {
                    'Display': ['5"TFT Color touch screen', '5"TFT Color touch screen'],
                    'Support language': ['English', 'English']
                },
                'Environmental': {
                    'Operating temperature': ['minus 30℃ to +50℃ (derating when over 55℃)', 'minus 30℃ to +50℃ (derating when over 55℃)'],
                    'Storage temperature': ['-40 ℃to+70℃', '-40 ℃to+70℃'],
                    'Humidity': ['< 95% relative humidity, non-condensing', '< 95% relative humidity, non-condensing'],
                    'Altitude': ['Up to 2000m (6000 feet)', 'Up to 2000m (6000 feet)']
                },
                'Mechanical': {
                    'Ingress protection': ['IP54', 'IP54'],
                    'Cooling': ['forced air cooling', 'forced air cooling'],
                    'Charging cable length': ['5m', '5m'],
                    'Weight': ['<48kg', '<58kg']
                },
                'Protection': {
                    'Protection': ['Over current, Under voltage, Over voltage, Residual current, Surge protection, Short circuit, Over temperature, Ground fault']
                },
                'Regulation': {
                    'Safety': ['CE', 'CE'],
                    'Communication Protocols': ['OCPP1.6 (Option)', 'OCPP1.6 (Option)']
                }
            }
        },
        'dc-120kw': {
            title: 'DC Charger 60kW-120kW',
            specs: {
                'Item Number': ['60KW', '120kW'],
                'AC input': {
                    'Input rating': ['AC400V 3ph', 'AC400V 3ph'],
                    'Number of phase / wire': ['3ph / L1, L2, L3, N, PE', '3ph / L1, L2, L3, N, PE'],
                    'Frequency (Hz)': ['50/60', '50/60']
                },
                'Power output': {
                    'Output power': ['200A*2', '250A*2'],
                    'Output rating': ['IEC 62196-3(CCS Combo 2)×2 GB\\T 20234 Option', 'IEC 62196-3(CCS Combo 2)×2 GB\\T 20234 Option']
                },
                'User interface': {
                    'Display': ['7"TFT Color touch screen', '7"TFT Color touch screen'],
                    'Support language': ['English', 'English']
                },
                'Environmental': {
                    'Operating temperature': ['minus 20℃ to +60℃ (derating when over 55℃)', 'minus 20℃ to +60℃ (derating when over 55℃)'],
                    'Storage temperature': ['-40 ℃to+70℃', '-40 ℃to+70℃'],
                    'Humidity': ['< 95% relative humidity, non-condensing', '< 95% relative humidity, non-condensing'],
                    'Altitude': ['Up to 2000 m (6000 feet)', 'Up to 2000 m (6000 feet)']
                },
                'Mechanical': {
                    'Ingress protection': ['IP54', 'IP54'],
                    'Cooling': ['forced air cooling', 'forced air cooling'],
                    'Charging cable length': ['5m', '5m'],
                    'Weight': ['<238kg', '<258kg']
                },
                'Protection': {
                    'Protection': ['Over current, Under voltage, Over voltage, Residual current, Surge protection, Short circuit, Over temperature, Ground fault']
                },
                'Regulation': {
                    'Safety': ['CE', 'CE'],
                    'Communication Protocols': ['OCPP1.6', 'OCPP1.6']
                }
            }
        },
        'dc-240kw': {
            title: 'DC Charger 120kW-240kW',
            specs: {
                'Item Number': ['120kW', '240kW'],
                'AC input': {
                    'Input rating': ['AC400V 3ph', 'AC400V 3ph'],
                    'Number of phase / wire': ['3ph / L1, L2, L3, N, PE', '3ph / L1, L2, L3, N, PE'],
                    'Frequency (Hz)': ['50/60', '50/60']
                },
                'Power output': {
                    'Output power': ['250A*2', '250A*2'],
                    'Output rating': ['IEC 62196-3(CCS Combo 2)×2', 'IEC 62196-3(CCS Combo 2)×2']
                },
                'User interface': {
                    'Display': ['7"TFT Color touch screen', '7"TFT Color touch screen'],
                    'Support language': ['English', 'English']
                },
                'Environmental': {
                    "Operating temperature": ["minus 20℃ to +60℃ (derating when over 55℃)", "minus 20℃ to +60℃ (derating when over 55℃)"],
                    "Storage temperature": ["-40 ℃to+70℃", "-40 ℃to+70℃"],
                    "Humidity": ["< 95% relative humidity, non-condensing", "< 95% relative humidity, non-condensing"],
                    "Altitude": ["Up to 2000 m (6000 feet)", "Up to 2000 m (6000 feet)"]
                },
                "Mechanical": {
                    "Ingress protection": ["IP54", "IP54"],
                    "Cooling": ["forced air cooling", "forced air cooling"],
                    "Charging cable length": ["5m", "5m"],
                    "Dimension (W*D*H) mm": ["720mm*450mm*1830mm", "720mm*450mm*1830mm"],
                    "Weight": ["<210kg", "<250kg"]
                },
                "Protection": {
                    "Protection": ["Over current, Under voltage, Over voltage, Residual current, Surge protection, Short circuit, Over temperature, Ground fault"]
                },
                "Regulation": {
                    "Safety": ["CE", "CE"],
                    "Communication Protocols": ["OCPP1.6", "OCPP1.6"]
                }
            }
        }
    };

    // 打开模态框
    specBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const productId = this.dataset.product;
            const product = productSpecs[productId];

            modalTitle.textContent = product.title;

            // 构建规格表格
            let tableHTML = '<table>';

            Object.keys(product.specs).forEach(section => {
                if (typeof product.specs[section] === 'object' && !Array.isArray(product.specs[section])) {
                    // 有子项的规格部分
                    tableHTML += `<tr><th colspan="3">${section}</th></tr>`;

                    Object.keys(product.specs[section]).forEach(subItem => {
                        const values = product.specs[section][subItem];

                        if (Array.isArray(values)) {
                            tableHTML += `<tr>
                                <td>${subItem}</td>
                                <td>${values[0]}</td>
                                <td>${values[1] || ''}</td>
                            </tr>`;
                        } else {
                            tableHTML += `<tr>
                                <td>${subItem}</td>
                                <td colspan="2">${values}</td>
                            </tr>`;
                        }
                    });
                } else {
                    // 无子项的规格部分
                    const values = product.specs[section];

                    if (Array.isArray(values)) {
                        tableHTML += `<tr>
                            <th>${section}</th>
                            <td>${values[0]}</td>
                            <td>${values[1] || ''}</td>
                        </tr>`;
                    } else {
                        tableHTML += `<tr>
                            <th colspan="3">${section}</th>
                        </tr>
                        <tr>
                            <td colspan="3">${values}</td>
                        </tr>`;
                    }
                }
            });

            tableHTML += '</table>';
            modalBody.innerHTML = tableHTML;

            // 显示模态框
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    // 关闭模态框
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // 查看更多项目按钮
    const viewMoreBtn = document.querySelector('.view-more-btn');
    const projectTable = document.querySelector('.project-table table tbody');
    const additionalProjects = [
        ['芮城充电中心', 'Ruicheng charging center', '34'],
        ['珠海城市职业技术学院', 'Zhuhai City Vocational and Technical College', '26'],
        ['天河区骏景小学充电站', 'Tianhe District Junjing Primary School charging station', '26'],
        ['唐华充电站', 'Tanghua charging station', '22'],
        ['易明充电站', 'Yiming charging station', '21'],
        ['木雅圣地360KW充电站', 'Muya Holy Land 360KW charging station', '17'],
        ['宜春畅海苑共享充电桩', 'Yichun Changhaiyuan shared charging pile', '16'],
        ['平远县上举镇新农村兴建充电站', 'Pingyuan County Shangju Town New Rural Construction Charging Station', '11'],
        ['云奥泰生物科技', 'Yunaotai Biotechnology', '9'],
        ['贞丰1号加油站', 'Zhenfeng No. 1 Gas Station', '8'],
        ['百色市右江区南大教育基地充站', 'Baise City Youjiang District Nanda Education base charging station', '8'],
        ['奔月充电站', 'Benyue charging station', '8'],
        ['智信机械充电站', 'Zhixin Machinery charging station', '8']
    ];

    let showAllProjects = false;

    viewMoreBtn.addEventListener('click', function () {
        if (!showAllProjects) {
            additionalProjects.forEach(project => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${project[0]}</td>
                    <td>${project[1]}</td>
                    <td>${project[2]}</td>
                `;
                projectTable.appendChild(row);
            });

            this.textContent = i18n.getNestedTranslation(['experience', 'table', 'viewLess']) || '收起项目';
            showAllProjects = true;
        } else {
            const rows = projectTable.querySelectorAll('tr');
            for (let i = 5; i < rows.length; i++) {
                rows[i].remove();
            }

            this.textContent = i18n.getNestedTranslation(['experience', 'table', 'viewMore']) || '查看更多项目';
            showAllProjects = false;
        }
    });

    // 表单提交
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        // 这里可以添加表单验证和提交逻辑
        console.log('表单提交:', { name, email, phone, message });

        // 显示成功消息
        alert(i18n.getNestedTranslation(['contact', 'form', 'success']) || '感谢您的留言！我们会尽快与您联系。');

        // 重置表单
        this.reset();
    });
}