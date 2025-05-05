// 多语言支持系统
class I18nManager {
    constructor() {
        this.translations = {};
        this.currentLang = localStorage.getItem('language') || 'zh-CN';
        this.fallbackLang = 'zh-CN';
        this.initialized = false;
        this.initPromise = null;
        this.maxRetries = 3;
        this.retryCount = 0;
        this.retryDelay = 500; // 毫秒
        this.supportedLanguages = ['zh-CN', 'zh-TW', 'en'];

        // 通用规格值（不需要翻译的技术参数）
        this.commonSpecValues = {
            'spec.portable.input.value': 'AC 220V±15%',
            'spec.portable.output.value': '3.5kW',
            'spec.portable.connector.value': 'Type 2',
            'spec.portable.protection.value': 'IP54',
            'spec.portable.temperature.value': '-20°C to +50°C',
            'spec.portable.cable.value': '5m',
            'spec.portable.certification.value': 'CE/TUV',

            'spec.7kw.input.value': 'AC 220V±15%',
            'spec.7kw.output.value': '7kW',
            'spec.7kw.connector.value': 'Type 2',
            'spec.7kw.protection.value': 'IP65',
            'spec.7kw.temperature.value': '-30°C to +50°C',
            'spec.7kw.certification.value': 'CE/TUV',

            'spec.22kw.input.value': 'AC 380V±15%',
            'spec.22kw.output.value': '11kW/22kW',
            'spec.22kw.connector.value': 'Type 2',
            'spec.22kw.protection.value': 'IP65',
            'spec.22kw.temperature.value': '-30°C to +50°C',
            'spec.22kw.certification.value': 'CE/TUV',

            'spec.40kw.input.value': 'AC 380V±15%',
            'spec.40kw.output.value': '20kW-40kW',
            'spec.40kw.connector.value': 'CCS2/CHAdeMO',
            'spec.40kw.protection.value': 'IP54',
            'spec.40kw.temperature.value': '-30°C to +50°C',
            'spec.40kw.certification.value': 'CE/TUV'
        };
    }

    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise(async (resolve) => {
            const initializeWithRetry = async () => {
                try {
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', () => {
                            this._initialize();
                            resolve();
                        });
                    } else {
                        await this._initialize();
                        resolve();
                    }
                } catch (error) {
                    console.error('Initialization error:', error);
                    if (this.retryCount < this.maxRetries) {
                        this.retryCount++;
                        console.log(`Retrying initialization (${this.retryCount}/${this.maxRetries})...`);
                        await new Promise(r => setTimeout(r, this.retryDelay));
                        await initializeWithRetry();
                    } else {
                        console.error('Max retries reached. Using fallback initialization.');
                        this._fallbackInitialize();
                        resolve();
                    }
                }
            };

            await initializeWithRetry();
        });

        return this.initPromise;
    }

    _fallbackInitialize() {
        // 基础初始化，确保至少能显示默认语言
        this.currentLang = this.fallbackLang;
        this.updatePageLanguage();
    }

    async _initialize() {
        if (this.initialized) {
            return;
        }

        try {
            // 验证翻译数据
            this._validateTranslations();

            // 设置 MutationObserver 来处理动态加载的内容
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length) {
                        this.updatePageLanguage();
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // 预加载所有翻译数据
            await this._preloadTranslations();

            // 初始化语言切换器
            this.setupLanguageSwitcher();

            // 更新页面语言
            await this.updatePageLanguage();

            this.initialized = true;
        } catch (error) {
            console.error('Error in _initialize:', error);
            // 发生错误时使用后备初始化
            this._fallbackInitialize();
        }
    }

    async _preloadTranslations() {
        // 预加载所有语言的翻译
        for (const lang of this.supportedLanguages) {
            if (!this.translations[lang]) {
                console.warn(`Missing translations for language: ${lang}`);
            }
        }
    }

    _validateTranslations() {
        // 验证翻译数据的完整性
        const missingTranslations = {};

        this.supportedLanguages.forEach(lang => {
            if (!this.translations[lang]) {
                console.error(`Missing translation object for language: ${lang}`);
                return;
            }

            // 收集所有翻译键
            const allKeys = new Set();
            this.supportedLanguages.forEach(l => {
                Object.keys(this.translations[l] || {}).forEach(k => allKeys.add(k));
            });

            // 检查每个键是否存在
            missingTranslations[lang] = [];
            allKeys.forEach(key => {
                if (!this.translations[lang][key] && !this.commonSpecValues[key]) {
                    missingTranslations[lang].push(key);
                }
            });
        });

        // 报告缺失的翻译
        this.supportedLanguages.forEach(lang => {
            if (missingTranslations[lang].length > 0) {
                console.warn(`Missing translations for ${lang}:`, missingTranslations[lang]);
            }
        });
    }

    async updatePageLanguage() {
        try {
            document.documentElement.lang = this.currentLang;

            const elements = document.querySelectorAll('[data-i18n]');
            for (const element of elements) {
                try {
                    const key = element.getAttribute('data-i18n');
                    const params = this.getElementParams(element);
                    const translation = this.translate(key, params);

                    if (translation) {
                        if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                            element.placeholder = translation;
                        } else {
                            element.textContent = translation;
                        }
                    } else {
                        console.warn(`Missing translation for key: ${key} in language: ${this.currentLang}`);
                        // 使用后备翻译
                        const fallbackTranslation = this.translations[this.fallbackLang]?.[key];
                        if (fallbackTranslation) {
                            element.textContent = fallbackTranslation;
                        }
                    }
                } catch (err) {
                    console.error(`Error updating element with key: ${element.getAttribute('data-i18n')}`, err);
                }
            }

            // 更新属性翻译
            document.querySelectorAll('[data-i18n-attr]').forEach(element => {
                try {
                    const attrs = element.getAttribute('data-i18n-attr').split(',');
                    attrs.forEach(attr => {
                        const [attrName, key] = attr.trim().split(':');
                        if (attrName && key) {
                            const params = this.getElementParams(element);
                            const translation = this.translate(key, params);
                            if (translation) {
                                element.setAttribute(attrName, translation);
                            }
                        }
                    });
                } catch (err) {
                    console.error(`Error updating attributes for element`, err);
                }
            });
        } catch (err) {
            console.error('Error in updatePageLanguage:', err);
            // 尝试使用后备方案
            this._fallbackInitialize();
        }
    }

    // 注册翻译
    registerTranslations(lang, translations) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        this.translations[lang] = { ...this.translations[lang], ...translations };
    }

    // 动态添加翻译
    addTranslation(lang, key, value) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        this.translations[lang][key] = value;
    }

    // 批量添加翻译
    addTranslations(lang, newTranslations) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        Object.assign(this.translations[lang], newTranslations);
    }

    // 获取翻译
    translate(key, params = {}) {
        // 首先检查是否是通用规格值
        if (this.commonSpecValues[key]) {
            return this.commonSpecValues[key];
        }

        let text = this.translations[this.currentLang]?.[key]
            || this.translations[this.fallbackLang]?.[key]
            || key;

        // 支持参数替换，例如: "hello, {name}" => "hello, John"
        return text.replace(/\{(\w+)\}/g, (_, param) => params[param] || '');
    }

    // 设置语言
    setLanguage(lang) {
        if (this.currentLang === lang) {
            return; // 如果语言相同，直接返回，避免不必要的重载
        }

        try {
            localStorage.setItem('language', lang);
            this.currentLang = lang;
            this.updatePageLanguage();

            // 触发自定义事件
            const event = new CustomEvent('languageChanged', { detail: { language: lang } });
            document.dispatchEvent(event);

            // 更新按钮状态
            this.updateButtonStates();
        } catch (error) {
            console.error('Error setting language:', error);
            // 发生错误时不重载页面
        }
    }

    // 获取元素的参数
    getElementParams(element) {
        const paramsAttr = element.getAttribute('data-i18n-params');
        if (!paramsAttr) return {};

        try {
            return JSON.parse(paramsAttr);
        } catch (e) {
            console.error('Invalid data-i18n-params:', paramsAttr);
            return {};
        }
    }

    // 设置语言切换器
    setupLanguageSwitcher() {
        try {
            const switcherContainer = document.querySelector('.language-switcher');
            if (!switcherContainer) {
                console.warn('Language switcher container not found');
                return;
            }

            // 移除现有的事件监听器
            const oldButtons = switcherContainer.querySelectorAll('.lang-btn');
            oldButtons.forEach(btn => {
                btn.replaceWith(btn.cloneNode(true));
            });

            // 添加新的事件监听器
            const buttons = switcherContainer.querySelectorAll('.lang-btn');
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const lang = btn.getAttribute('data-lang');
                    if (lang) {
                        this.setLanguage(lang);
                    }
                });
            });

            // 初始化按钮状态
            this.updateButtonStates();
        } catch (error) {
            console.error('Error setting up language switcher:', error);
        }
    }

    updateButtonStates() {
        try {
            const buttons = document.querySelectorAll('.lang-btn');
            buttons.forEach(btn => {
                const btnLang = btn.getAttribute('data-lang');
                if (btnLang === this.currentLang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        } catch (error) {
            console.error('Error updating button states:', error);
        }
    }
}

// 创建全局实例
const i18n = new I18nManager();

// 确保在其他脚本使用之前初始化完成
i18n.init().then(() => {
    // 触发一个事件表示i18n已经准备就绪
    window.dispatchEvent(new CustomEvent('i18nReady'));
});

// 导出全局实例供其他模块使用
window.i18n = i18n;

// 注册翻译
i18n.registerTranslations('zh-CN', {
    // 公司信息
    'companyShort': '国际天利有限公司',
    'companyName': '国际天利有限公司',

    // 导航菜单
    'nav.home': '首页',
    'nav.about': '关于我们',
    'nav.products': '产品目录',
    'nav.experience': '项目经验',
    'nav.team': '团队介绍',
    'nav.environment': '环保',
    'nav.technology': '科技',
    'nav.media': '媒体',
    'nav.focus': '焦点',
    'nav.focus.ev': 'EV充电',
    'nav.focus.esg': 'ESG可持续发展',
    'nav.newEnergy': '新能源科技',
    'nav.newEnergy.solar': '光伏为易能',
    'nav.newEnergy.storage': '储能',
    'nav.newEnergy.charging': 'EV充电',
    'nav.newEnergy.exchange': '冷热交换',
    'nav.newEnergy.cases': '案例',
    'nav.newMedia': '新媒体',
    'nav.newMedia.video': '短视频制作',
    'nav.newMedia.operation': '代营运',
    'nav.newMedia.live': '直播',
    'nav.newMedia.cases': '案例',
    'nav.ai': 'AI人工智能',
    'nav.engineering': '工程系统',
    'nav.engineering.traffic': '交通系统',
    'nav.engineering.booking': '预约系统',
    'nav.engineering.food': '餐饮车',
    'nav.engineering.cases': '案例',
    'nav.trade': '贸易',
    'nav.trade.import': '进出口贸易',
    'nav.trade.supply': '供应链管理',
    'nav.trade.service': '贸易服务',
    'nav.trade.cases': '案例',
    'nav.contact': '联系我们',

    // 页面标题
    'title.home': '国际天利有限公司',
    'title.ai': '国际天利有限公司 - AI人工智能',
    'title.trade': '国际天利有限公司 - 贸易',

    // 语言选择
    'lang.zh-CN': '简体',
    'lang.zh-TW': '繁體',
    'lang.en': 'EN',

    // 通用元素
    'slogan': '绿色能源 · 刷新世界',
    'slogan.ai': '智能创新 · 引领未来',
    'slogan.trade': '全球贸易 · 专业服务',

    // 页面内容
    'hero.title': '专业再生能源解决方案提供商',
    'hero.subtitle': '专注于电动汽车充电站和综合能源系统的设计、生产和安装',
    'hero.title.ai': 'AI人工智能',
    'hero.subtitle.ai': '为企业提供智能化转型升级服务',
    'hero.title.trade': '国际贸易',
    'hero.subtitle.trade': '提供全方位的国际贸易解决方案',

    // 关于我们
    'about.title': '关于我们',
    'about.content': '我们专注于再生能源产品的生产、分销和工程解决方案。提供批发电动汽车充电站销售以及综合能源系统的建造和维护服务。',
    'about.awardsTitle': '企业殊荣',
    'about.features.certification': '专业认证',
    'about.features.certification.desc': '多项国际认证，品质保证',
    'about.features.support': '技术支持',
    'about.features.support.desc': '24/7全天候技术支持',
    'about.features.global': '全球服务',
    'about.features.global.desc': '覆盖亚太地区主要市场',
    'about.awards.1': '2023年 国家级高新技术企业',
    'about.awards.2': '2022年 深圳科技创新委员会 - 高新技术企业证书',
    'about.awards.3': '2022年 职业健康安全管理体系认证',
    'about.awards.4': '2022年 环境管理体系认证',
    'about.awards.5': '2022年 质量管理体系认证',
    'about.awards.6': '2020年 智慧灯杆产业联盟 - 理事单位',
    'about.awards.7': '2019年 中国充电桩协会 - 理事单位',

    // 联系方式
    'contact.title': '联系我们',
    'contact.address.label': '公司地址',
    'contact.address': '香港上环永乐街116-118号祥顺大厦3楼A室',
    'contact.phone.label': '联系电话',
    'contact.phone': '+852 3524 3104',
    'contact.email.label': '电子邮箱',
    'contact.email': 'interskyprofit@gmail.com',
    'contact.hours.label': '工作时间',
    'contact.hours.value': '周一至周五: 9:00 - 18:00',

    // 施工中提示
    'construction.title': '页面建设中',
    'construction.message': '我们正在努力完善相关内容，敬请期待！',

    // 页脚
    'footer.quickLinks': '快速链接',
    'footer.copyright': '© 2024 INTER SKY PROFIT LIMITED. All rights reserved.',
    'footer.description': '专注于新能源科技发展，致力于为客户提供专业的解决方案',
    'footer.contact': '联系方式',
    'footer.followUs': '关注我们',
    'footer.subscribe': '关注我们的社交媒体，获取最新动态',

    // 媒体更新
    'media.title': '媒体',
    'media.news.title': '媒体报道',
    'media.news.desc': '关注行业动态，传播企业声音',
    'media.news.alt': '媒体报道图片',
    'media.brand.title': '品牌传播',
    'media.brand.desc': '打造品牌影响力',
    'media.brand.alt': '品牌传播图片',
    'media.updates.title': '企业动态',
    'media.updates.desc': '分享企业最新资讯和发展动态',
    'media.updates.alt': '企业动态图片',

    // 产品相关
    'products.title': '产品目录',
    'products.subtitle': '智能充电解决方案',
    'products.categories.ac': '交流充电器',
    'products.categories.dc': '直流充电器',
    'products.viewSpec': '查看规格',

    // AC充电器
    'products.ac.portable.title': 'AC便携式充电器 3.5kW',
    'products.ac.portable.features.1': '便携方便',
    'products.ac.portable.features.2': '即插即用',
    'products.ac.portable.features.3': '友好界面',
    'products.ac.portable.features.4': '安全可靠',

    'products.ac.7kw.title': 'AC充电器 7kW',
    'products.ac.7kw.features.1': '家用充电器RFID版本',
    'products.ac.7kw.features.2': 'Ocpp1.6版本',
    'products.ac.7kw.features.3': '4.3英寸屏幕',
    'products.ac.7kw.features.4': '多语言支持',

    'products.ac.22kw.title': 'AC充电器 11kW/22kW',
    'products.ac.22kw.features.1': '家用充电器RFID版本',
    'products.ac.22kw.features.2': 'Ocpp1.6版本',
    'products.ac.22kw.features.3': 'LCD显示屏',
    'products.ac.22kw.features.4': '三相电源输入',

    // DC充电器
    'products.dc.40kw.title': 'DC充电器 20kW-40kW',
    'products.dc.40kw.features.1': 'Ocpp1.6版本',
    'products.dc.40kw.features.2': '5英寸彩色触摸屏',
    'products.dc.40kw.features.3': '强制风冷',
    'products.dc.40kw.features.4': '多重保护功能',

    'products.dc.120kw.title': 'DC充电器 60kW-120kW',
    'products.dc.120kw.features.1': 'Ocpp1.6版本',
    'products.dc.120kw.features.2': '7英寸彩色触摸屏',
    'products.dc.120kw.features.3': '双充电接口',
    'products.dc.120kw.features.4': '高功率输出',

    'products.dc.240kw.title': 'DC充电器 120kW-240kW',
    'products.dc.240kw.features.1': 'Ocpp1.6版本',
    'products.dc.240kw.features.2': '55英寸大屏幕(可选)',
    'products.dc.240kw.features.3': '超高功率输出',
    'products.dc.240kw.features.4': '商业充电站首选',

    // 团队成员
    'team.title': '我们的团队',
    'team.intro': '我们的优势在于我们多元化且敬业的专业团队。每位成员都拥有再生能源、工程和项目管理的独特专业知识，共同协作推动创新和卓越。',
    'team.ivan.title': '首席执行官 / CEO',
    'team.ivan.desc': '有接近10年地产及6年香港再生能源建设及管理经验',
    'team.casen.title': '技术总监 / CTO',
    'team.casen.desc': '电力工程开发团队，管理生产业务',
    'team.ziv.title': '系统架构师 / System Architect',
    'team.ziv.desc': '有多年IT开发及程式经验，同政府机构有合作经验',

    // 项目经验
    'experience.title': '项目经验',
    'experience.subtitle': '我们的充电站已成功部署在全国多个城市',
    'experience.project1.title': '上海万达外场新能源园区充电站',
    'experience.project1.desc': '5x 120kW<br>12x 7kW',
    'experience.project2.title': '广州白云区体育馆',
    'experience.project2.desc': '23x 180kW<br>46x 80kW',
    'experience.project3.title': '武汉绿地中心停车场充电站',
    'experience.project3.desc': '420x 7kW',
    'experience.table.header.location': '地点',
    'experience.table.header.location.en': 'Location',
    'experience.table.header.count': '充电桩数目',
    'experience.table.row1.location': '苍南县城新区祥和锦园安置小区',
    'experience.table.row1.count': '42',
    'experience.table.row2.location': '锦绣开州充电站',
    'experience.table.row2.count': '38',
    'experience.table.row3.location': '永顺县行政中心停车场充电站',
    'experience.table.row3.count': '36',
    'experience.table.row4.location': '暨南大学广州知识产权人才基地',
    'experience.table.row4.count': '35',
    'experience.table.row5.location': '浦东新区两港充电站',
    'experience.table.row5.count': '35',
    'experience.table.row6.location': '芮城充电中心',
    'experience.table.row6.count': '34',
    'experience.table.row7.location': '珠海城市职业技术学院',
    'experience.table.row7.count': '26',
    'experience.table.row8.location': '天河区骏景小学充电站',
    'experience.table.row8.count': '26',
    'experience.table.row9.location': '唐华充电站',
    'experience.table.row9.count': '22',
    'experience.table.row10.location': '易明充电站',
    'experience.table.row10.count': '21',
    'experience.table.row11.location': '木雅圣地360KW充电站',
    'experience.table.row11.count': '17',
    'experience.table.row12.location': '宜春畅海苑共享充电桩',
    'experience.table.row12.count': '16',
    'experience.table.row13.location': '平远县上举镇新农村兴建充电站',
    'experience.table.row13.count': '11',
    'experience.table.row14.location': '云奥泰生物科技',
    'experience.table.row14.count': '9',
    'experience.table.row15.location': '贞丰1号加油站',
    'experience.table.row15.count': '8',
    'experience.table.row16.location': '百色市右江区南大教育基地充站',
    'experience.table.row16.count': '8',
    'experience.table.row17.location': '奔月充电站',
    'experience.table.row17.count': '8',
    'experience.table.row18.location': '智信机械充电站',
    'experience.table.row18.count': '8',
    'experience.viewMore': '查看更多项目',

    // 环保
    'environment.title': '环保',
    'environment.project.title': '环保项目展示',
    'environment.project.desc': '我们致力于提供环保解决方案，推动可持续发展',
    'environment.tech.title': '环保技术',
    'environment.tech.desc': '采用先进技术，实现资源的高效利用',
    'environment.sustainable.title': '可持续发展',
    'environment.sustainable.desc': '通过创新技术和解决方案，推动环保事业可持续发展',

    // 科技
    'technology.title': '科技',
    'technology.innovation.title': '科技创新',
    'technology.innovation.desc': '持续创新，引领行业发展',
    'technology.rd.title': '技术研发',
    'technology.rd.desc': '专业团队，专注研发',
    'technology.smart.title': '智能系统',
    'technology.smart.desc': '运用人工智能技术，打造智能化解决方案',

    // 模态框翻译
    'modal.title': '产品规格',
    'modal.close': '×',

    // 规格项翻译
    'spec.input': '输入',
    'spec.output': '输出功率',
    'spec.connector': '充电接口',
    'spec.protection': '防护等级',
    'spec.temperature': '工作温度',
    'spec.display': '显示屏',
    'spec.communication': '通信',
    'spec.certification': '认证',
    'spec.cooling': '冷却方式',
    'spec.cable': '线缆长度'
});

i18n.registerTranslations('zh-TW', {
    // 公司信息
    'companyShort': '國際天利有限公司',
    'companyName': '國際天利有限公司',

    // 导航菜单
    'nav.home': '首頁',
    'nav.about': '關於我們',
    'nav.products': '產品目錄',
    'nav.experience': '項目經驗',
    'nav.team': '團隊介紹',
    'nav.environment': '環保',
    'nav.technology': '科技',
    'nav.media': '媒體',
    'nav.focus': '焦點',
    'nav.focus.ev': 'EV充電',
    'nav.focus.esg': 'ESG可持續發展',
    'nav.newEnergy': '新能源科技',
    'nav.newEnergy.solar': '光伏為易能',
    'nav.newEnergy.storage': '儲能',
    'nav.newEnergy.charging': 'EV充電',
    'nav.newEnergy.exchange': '冷熱交換',
    'nav.newEnergy.cases': '案例',
    'nav.newMedia': '新媒體',
    'nav.newMedia.video': '短視頻製作',
    'nav.newMedia.operation': '代營運',
    'nav.newMedia.live': '直播',
    'nav.newMedia.cases': '案例',
    'nav.ai': 'AI人工智能',
    'nav.engineering': '工程系統',
    'nav.engineering.traffic': '交通系統',
    'nav.engineering.booking': '預約系統',
    'nav.engineering.food': '餐飲車',
    'nav.engineering.cases': '案例',
    'nav.trade': '貿易',
    'nav.trade.import': '進出口貿易',
    'nav.trade.supply': '供應鏈管理',
    'nav.trade.service': '貿易服務',
    'nav.trade.cases': '案例',
    'nav.contact': '聯繫我們',

    // 页面标题
    'title.home': '國際天利有限公司',
    'title.ai': '國際天利有限公司 - AI人工智能',
    'title.trade': '國際天利有限公司 - 貿易',

    // 语言选择
    'lang.zh-CN': '简体',
    'lang.zh-TW': '繁體',
    'lang.en': 'EN',

    // 通用元素
    'slogan': '綠色能源 · 刷新世界',
    'slogan.ai': '智能創新 · 引領未來',
    'slogan.trade': '全球貿易 · 專業服務',

    // 页面内容
    'hero.title': '專業再生能源解決方案提供商',
    'hero.subtitle': '專注於電動汽車充電站和綜合能源系統的設計、生產和安裝',
    'hero.title.ai': 'AI人工智能',
    'hero.subtitle.ai': '為企業提供智能化轉型升級服務',
    'hero.title.trade': '國際貿易',
    'hero.subtitle.trade': '提供全方位的國際貿易解決方案',

    // 关于我们
    'about.title': '關於我們',
    'about.content': '我們專注於再生能源產品的生產、分銷和工程解決方案。提供批發電動汽車充電站銷售以及綜合能源系統的建造和維護服務。',
    'about.awardsTitle': '企業殊榮',
    'about.features.certification': '專業認證',
    'about.features.certification.desc': '多項國際認證，品質保證',
    'about.features.support': '技術支持',
    'about.features.support.desc': '24/7全天候技術支持',
    'about.features.global': '全球服務',
    'about.features.global.desc': '覆蓋亞太地區主要市場',
    'about.awards.1': '2023年 國家級高新技術企業',
    'about.awards.2': '2022年 深圳科技創新委員會 - 高新技術企業證書',
    'about.awards.3': '2022年 職業健康安全管理體系認證',
    'about.awards.4': '2022年 環境管理體系認證',
    'about.awards.5': '2022年 質量管理體系認證',
    'about.awards.6': '2020年 智慧燈桿產業聯盟 - 理事單位',
    'about.awards.7': '2019年 中國充電樁協會 - 理事單位',

    // 联系方式
    'contact.title': '聯繫我們',
    'contact.address.label': '公司地址',
    'contact.address': '香港上環永樂街116-118號祥順大廈3樓A室',
    'contact.phone.label': '聯繫電話',
    'contact.phone': '+852 3524 3104',
    'contact.email.label': '電子郵箱',
    'contact.email': 'interskyprofit@gmail.com',
    'contact.hours.label': '工作時間',
    'contact.hours.value': '週一至週五: 9:00 - 18:00',

    // 施工中提示
    'construction.title': '頁面建設中',
    'construction.message': '我們正在努力完善相關內容，敬請期待！',

    // 页脚
    'footer.quickLinks': '快速鏈接',
    'footer.copyright': '© 2024 INTER SKY PROFIT LIMITED. 保留所有權利。',
    'footer.description': '專注於新能源科技發展，致力於為客戶提供專業的解決方案',
    'footer.contact': '聯繫方式',
    'footer.followUs': '關注我們',
    'footer.subscribe': '關注我們的社交媒體，獲取最新動態',

    // 媒體部分
    'media.title': '媒體',
    'media.news.title': '媒體報導',
    'media.news.desc': '關注行業動態，傳播企業聲音',
    'media.news.alt': '媒體報導圖片',
    'media.brand.title': '品牌傳播',
    'media.brand.desc': '打造品牌影響力',
    'media.brand.alt': '品牌傳播圖片',
    'media.updates.title': '企業動態',
    'media.updates.desc': '分享企業最新資訊和發展動態',
    'media.updates.alt': '企業動態圖片',

    // 產品相關
    'products.title': '產品目錄',
    'products.subtitle': '智能充電解決方案',
    'products.categories.ac': '交流充電器',
    'products.categories.dc': '直流充電器',
    'products.viewSpec': '查看規格',

    // AC充電器
    'products.ac.portable.title': 'AC便攜式充電器 3.5kW',
    'products.ac.portable.features.1': '便攜方便',
    'products.ac.portable.features.2': '即插即用',
    'products.ac.portable.features.3': '友好界面',
    'products.ac.portable.features.4': '安全可靠',

    'products.ac.7kw.title': 'AC充電器 7kW',
    'products.ac.7kw.features.1': '家用充電器RFID版本',
    'products.ac.7kw.features.2': 'Ocpp1.6版本',
    'products.ac.7kw.features.3': '4.3英寸屏幕',
    'products.ac.7kw.features.4': '多語言支持',

    'products.ac.22kw.title': 'AC充電器 11kW/22kW',
    'products.ac.22kw.features.1': '家用充電器RFID版本',
    'products.ac.22kw.features.2': 'Ocpp1.6版本',
    'products.ac.22kw.features.3': 'LCD顯示屏',
    'products.ac.22kw.features.4': '三相電源輸入',

    // DC充電器
    'products.dc.40kw.title': 'DC充電器 20kW-40kW',
    'products.dc.40kw.features.1': 'Ocpp1.6版本',
    'products.dc.40kw.features.2': '5英寸彩色觸摸屏',
    'products.dc.40kw.features.3': '強制風冷',
    'products.dc.40kw.features.4': '多重保護功能',

    'products.dc.120kw.title': 'DC充電器 60kW-120kW',
    'products.dc.120kw.features.1': 'Ocpp1.6版本',
    'products.dc.120kw.features.2': '7英寸彩色觸摸屏',
    'products.dc.120kw.features.3': '雙充電接口',
    'products.dc.120kw.features.4': '高功率輸出',

    'products.dc.240kw.title': 'DC充電器 120kW-240kW',
    'products.dc.240kw.features.1': 'Ocpp1.6版本',
    'products.dc.240kw.features.2': '55英寸大屏幕(可選)',
    'products.dc.240kw.features.3': '超高功率輸出',
    'products.dc.240kw.features.4': '商業充電站首選',

    // 團隊成員
    'team.title': '我們的團隊',
    'team.intro': '我們的優勢在於我們多元化且敬業的專業團隊。每位成員都擁有再生能源、工程和項目管理的獨特專業知識，共同協作推動創新和卓越。',
    'team.ivan.title': '首席執行官 / CEO',
    'team.ivan.desc': '有接近10年地產及6年香港再生能源建設及管理經驗',
    'team.casen.title': '技術總監 / CTO',
    'team.casen.desc': '電力工程開發團隊，管理生產業務',
    'team.ziv.title': '系統架構師 / System Architect',
    'team.ziv.desc': '有多年IT開發及程式經驗，同政府機構有合作經驗',

    // 項目經驗
    'experience.title': '項目經驗',
    'experience.subtitle': '我們的充電站已成功部署在全國多個城市',
    'experience.project1.title': '上海萬達外場新能源園區充電站',
    'experience.project1.desc': '5x 120kW<br>12x 7kW',
    'experience.project2.title': '廣州白雲區體育館',
    'experience.project2.desc': '23x 180kW<br>46x 80kW',
    'experience.project3.title': '武漢綠地中心停車場充電站',
    'experience.project3.desc': '420x 7kW',
    'experience.table.header.location': '地點',
    'experience.table.header.location.en': 'Location',
    'experience.table.header.count': '充電樁數目',
    'experience.table.row1.location': '蒼南縣城新區祥和錦園安置小區',
    'experience.table.row1.count': '42',
    'experience.table.row2.location': '錦繡開州充電站',
    'experience.table.row2.count': '38',
    'experience.table.row3.location': '永順縣行政中心停車場充電站',
    'experience.table.row3.count': '36',
    'experience.table.row4.location': '暨南大學廣州知識產權人才基地',
    'experience.table.row4.count': '35',
    'experience.table.row5.location': '浦東新區兩港充電站',
    'experience.table.row5.count': '35',
    "experience.table.row6.location": "芮城充電中心",
    "experience.table.row6.count": "34",
    "experience.table.row7.location": "珠海城市職業技術學院",
    "experience.table.row7.count": "26",
    "experience.table.row8.location": "天河區駿景小學充電站",
    "experience.table.row8.count": "26",
    "experience.table.row9.location": "唐華充電站",
    "experience.table.row9.count": "22",
    "experience.table.row10.location": "易明充電站",
    "experience.table.row10.count": "21",
    "experience.table.row11.location": "木雅聖地360KW充電站",
    "experience.table.row11.count": "17",
    "experience.table.row12.location": "宜春暢海苑共享充電樁",
    "experience.table.row12.count": "16",
    "experience.table.row13.location": "平遠縣上舉鎮新農村興建充電站",
    "experience.table.row13.count": "11",
    "experience.table.row14.location": "雲奧泰生物科技",
    "experience.table.row14.count": "9",
    "experience.table.row15.location": "貞豐1號加油站",
    "experience.table.row15.count": "8",
    "experience.table.row16.location": "百色市右江區南大教育基地充站",
    "experience.table.row16.count": "8",
    "experience.table.row17.location": "奔月充電站",
    "experience.table.row17.count": "8",
    "experience.table.row18.location": "智信機械充電站",
    "experience.table.row18.count": "8",
    'experience.viewMore': '查看更多項目',

    // 環保
    'environment.title': '環保',
    'environment.project.title': '環保項目展示',
    'environment.project.desc': '我們致力於提供環保解決方案，推動可持續發展',
    'environment.tech.title': '環保技術',
    'environment.tech.desc': '採用先進技術，實現資源的高效利用',
    'environment.sustainable.title': '可持續發展',
    'environment.sustainable.desc': '通過創新技術和解決方案，推動環保事業可持續發展',

    // 科技
    'technology.title': '科技',
    'technology.innovation.title': '科技創新',
    'technology.innovation.desc': '持續創新，引領行業發展',
    'technology.rd.title': '技術研發',
    'technology.rd.desc': '專業團隊，專注研發',
    'technology.smart.title': '智能系統',
    'technology.smart.desc': '運用人工智能技術，打造智能化解決方案',

    // 模態框翻譯
    'modal.title': '產品規格',
    'modal.close': '×',

    // 規格項翻譯
    'spec.input': '輸入',
    'spec.output': '輸出功率',
    'spec.connector': '充電接口',
    'spec.protection': '防護等級',
    'spec.temperature': '工作溫度',
    'spec.display': '顯示屏',
    'spec.communication': '通信',
    'spec.certification': '認證',
    'spec.cooling': '冷卻方式',
    'spec.cable': '線纜長度'
});

i18n.registerTranslations('en', {
    // Company Info
    'companyShort': 'INTER SKY PROFIT LIMITED',
    'companyName': 'INTER SKY PROFIT LIMITED',

    // Navigation Menu
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.products': 'Products',
    'nav.experience': 'Experience',
    'nav.team': 'Team',
    'nav.environment': 'Environment',
    'nav.technology': 'Technology',
    'nav.media': 'Media',
    'nav.focus': 'Focus',
    'nav.focus.ev': 'EV Charging',
    'nav.focus.esg': 'ESG Sustainability',
    'nav.newEnergy': 'New Energy',
    'nav.newEnergy.solar': 'Solar Power',
    'nav.newEnergy.storage': 'Energy Storage',
    'nav.newEnergy.charging': 'EV Charging',
    'nav.newEnergy.exchange': 'Heat Exchange',
    'nav.newEnergy.cases': 'Cases',
    'nav.newMedia': 'New Media',
    'nav.newMedia.video': 'Video Production',
    'nav.newMedia.operation': 'Operation',
    'nav.newMedia.live': 'Live Streaming',
    'nav.newMedia.cases': 'Cases',
    'nav.ai': 'AI',
    'nav.engineering': 'Engineering',
    'nav.engineering.traffic': 'Traffic Systems',
    'nav.engineering.booking': 'Booking Systems',
    'nav.engineering.food': 'Food Trucks',
    'nav.engineering.cases': 'Cases',
    'nav.trade': 'Trade',
    'nav.trade.import': 'Import & Export',
    'nav.trade.supply': 'Supply Chain',
    'nav.trade.service': 'Trade Services',
    'nav.trade.cases': 'Cases',
    'nav.contact': 'Contact',

    // Page Titles
    'title.home': 'INTER SKY PROFIT LIMITED',
    'title.ai': 'INTER SKY PROFIT LIMITED - AI Solutions',
    'title.trade': 'INTER SKY PROFIT LIMITED - Trade',

    // Language Selection
    'lang.zh-CN': '简体',
    'lang.zh-TW': '繁體',
    'lang.en': 'EN',

    // Common Elements
    'slogan': 'Green Energy · Refresh the World',
    'slogan.ai': 'Smart Innovation · Leading the Future',
    'slogan.trade': 'Global Trade · Professional Service',

    // Page Content
    'hero.title': 'Professional Renewable Energy Solutions Provider',
    'hero.subtitle': 'Specializing in EV Charging Station and Integrated Energy System Design, Production and Installation',
    'hero.title.ai': 'AI Solutions',
    'hero.subtitle.ai': 'Providing Intelligent Transformation Services for Enterprises',
    'hero.title.trade': 'International Trade',
    'hero.subtitle.trade': 'Comprehensive International Trade Solutions',

    // About Us
    'about.title': 'About Us',
    'about.content': 'We focus on the production and distribution of renewable energy products, providing wholesale EV charging station sales and comprehensive energy system construction and maintenance services.',
    'about.awardsTitle': 'Corporate Awards',
    'about.features.certification': 'Professional Certification',
    'about.features.certification.desc': 'Multiple international certifications, quality assured',
    'about.features.support': 'Technical Support',
    'about.features.support.desc': '24/7 technical support',
    'about.features.global': 'Global Service',
    'about.features.global.desc': 'Covering major markets in Asia Pacific',
    'about.awards.1': '2023 National High-Tech Enterprise',
    'about.awards.2': '2022 Shenzhen Science and Technology Innovation Committee - High-Tech Enterprise Certificate',
    'about.awards.3': '2022 Occupational Health and Safety Management System Certification',
    'about.awards.4': '2022 Environmental Management System Certification',
    'about.awards.5': '2022 Quality Management System Certification',
    'about.awards.6': '2020 Smart Pole Industry Alliance - Council Member',
    'about.awards.7': '2019 China Charging Pile Association - Council Member',

    // Contact
    'contact.title': 'Contact Us',
    'contact.address.label': 'Address',
    'contact.address': 'Unit A,3/F Cheong Sun Tower116-118 Wing Lok Street, Sheung Wan, HK',
    'contact.phone.label': 'Phone',
    'contact.phone': '+852 3524 3104',
    'contact.email.label': 'Email',
    'contact.email': 'interskyprofit@gmail.com',
    'contact.hours.label': 'Business Hours',
    'contact.hours.value': 'Mon-Fri: 9:00 AM - 6:00 PM',

    // Under Construction
    'construction.title': 'Under Construction',
    'construction.message': 'We are working hard to improve the content. Please stay tuned!',

    // Footer
    'footer.quickLinks': 'Quick Links',
    'footer.copyright': '© 2024 INTER SKY PROFIT LIMITED. All rights reserved.',
    'footer.description': 'Focused on new energy technology development, committed to providing professional solutions',
    'footer.contact': 'Contact',
    'footer.followUs': 'Follow Us',
    'footer.subscribe': 'Follow our social media for latest updates',

    // Media Section
    'media.title': 'Media',
    'media.news.title': 'Media Coverage',
    'media.news.desc': 'Industry news and corporate voice',
    'media.news.alt': 'Media coverage image',
    'media.brand.title': 'Brand Communication',
    'media.brand.desc': 'Building brand influence',
    'media.brand.alt': 'Brand communication image',
    'media.updates.title': 'Company Updates',
    'media.updates.desc': 'Share latest company news and developments',
    'media.updates.alt': 'Company updates image',

    // Products
    'products.title': 'Product Catalog',
    'products.subtitle': 'Smart Charging Solutions',
    'products.categories.ac': 'AC Chargers',
    'products.categories.dc': 'DC Chargers',
    'products.viewSpec': 'View Specifications',

    // AC Chargers
    'products.ac.portable.title': 'AC Portable Charger 3.5kW',
    'products.ac.portable.features.1': 'Portable & Convenient',
    'products.ac.portable.features.2': 'Plug and Play',
    'products.ac.portable.features.3': 'User-friendly Interface',
    'products.ac.portable.features.4': 'Safe and Reliable',

    'products.ac.7kw.title': 'AC Charger 7kW',
    'products.ac.7kw.features.1': 'Home Charger with RFID',
    'products.ac.7kw.features.2': 'Ocpp1.6 Version',
    'products.ac.7kw.features.3': '4.3-inch Screen',
    'products.ac.7kw.features.4': 'Multi-language Support',

    'products.ac.22kw.title': 'AC Charger 11kW/22kW',
    'products.ac.22kw.features.1': 'Home Charger with RFID',
    'products.ac.22kw.features.2': 'Ocpp1.6 Version',
    'products.ac.22kw.features.3': 'LCD Display',
    'products.ac.22kw.features.4': 'Three-phase Power Input',

    // DC Chargers
    'products.dc.40kw.title': 'DC Charger 20kW-40kW',
    'products.dc.40kw.features.1': 'Ocpp1.6 Version',
    'products.dc.40kw.features.2': '5-inch Color Touch Screen',
    'products.dc.40kw.features.3': 'Forced Air Cooling',
    'products.dc.40kw.features.4': 'Multiple Protection Features',

    'products.dc.120kw.title': 'DC Charger 60kW-120kW',
    'products.dc.120kw.features.1': 'Ocpp1.6 Version',
    'products.dc.120kw.features.2': '7-inch Color Touch Screen',
    'products.dc.120kw.features.3': 'Dual Charging Ports',
    'products.dc.120kw.features.4': 'High Power Output',

    'products.dc.240kw.title': 'DC Charger 120kW-240kW',
    'products.dc.240kw.features.1': 'Ocpp1.6 Version',
    'products.dc.240kw.features.2': '55-inch Screen (Optional)',
    'products.dc.240kw.features.3': 'Ultra-high Power Output',
    'products.dc.240kw.features.4': 'Ideal for Commercial Stations',

    // Team Members
    'team.title': 'Our Team',
    'team.intro': 'Our strength lies in our diverse and dedicated team of professionals. Each member brings unique expertise in renewable energy, engineering, and project management.',
    'team.ivan.title': 'Chief Executive Officer / CEO',
    'team.ivan.desc': 'Nearly 10 years of experience in real estate and 6 years in Hong Kong renewable energy construction and management',
    'team.casen.title': 'Chief Technology Officer / CTO',
    'team.casen.desc': 'Electrical engineering development & research team, managing production operations',
    'team.ziv.title': 'System Architect',
    'team.ziv.desc': 'Many years of experience in IT development and programming, with government agency cooperation experience',

    // Experience
    'experience.title': 'Project Experience',
    'experience.subtitle': 'Our charging stations have been successfully deployed in multiple cities',
    'experience.project1.title': 'Shanghai Wanda New Energy Park Charging Station',
    'experience.project1.desc': '5x 120kW<br>12x 7kW',
    'experience.project2.title': 'Guangzhou Baiyun District Stadium',
    'experience.project2.desc': '23x 180kW<br>46x 80kW',
    'experience.project3.title': 'Wuhan Greenland Center Parking Charging Station',
    'experience.project3.desc': '420x 7kW',
    'experience.table.header.location': 'Location',
    'experience.table.header.location.en': 'Location',
    'experience.table.header.count': 'Number of Chargers',
    'experience.table.row1.location': 'Xianghe Jinyuan Resettlement Community',
    'experience.table.row1.count': '42',
    'experience.table.row2.location': 'Jinxiu Kaizhou Charging Station',
    'experience.table.row2.count': '38',
    'experience.table.row3.location': 'Yongshun County Administrative Center',
    'experience.table.row3.count': '36',
    'experience.table.row4.location': 'Jinan University Guangzhou IP Talent Base',
    'experience.table.row4.count': '35',
    'experience.table.row5.location': 'Pudong New Area Lianggang Station',
    'experience.table.row5.count': '35',
    "experience.table.row6.location": "Ruicheng Charging Center",
    "experience.table.row6.count": "34",
    "experience.table.row7.location": "Zhuhai City Vocational and Technical College",
    "experience.table.row7.count": "26",
    "experience.table.row8.location": "Junjing Primary School Charging Station, Tianhe District",
    "experience.table.row8.count": "26",
    "experience.table.row9.location": "Tanghua Charging Station",
    "experience.table.row9.count": "22",
    "experience.table.row10.location": "Yiming Charging Station",
    "experience.table.row10.count": "21",
    "experience.table.row11.location": "Munya Holy Land 360KW Charging Station",
    "experience.table.row11.count": "17",
    "experience.table.row12.location": "Yichun Changhaiyuan Shared Charging Pile",
    "experience.table.row12.count": "16",
    "experience.table.row13.location": "Shangju Town New Rural Charging Station, Pingyuan County",
    "experience.table.row13.count": "11",
    "experience.table.row14.location": "Yunaotai Biotechnology",
    "experience.table.row14.count": "9",
    "experience.table.row15.location": "Zhenfeng No. 1 Gas Station",
    "experience.table.row15.count": "8",
    "experience.table.row16.location": "Nanda Education Base Charging Station, Youjiang District, Baise",
    "experience.table.row16.count": "8",
    "experience.table.row17.location": "Benyue Charging Station",
    "experience.table.row17.count": "8",
    "experience.table.row18.location": "Zhixin Machinery Charging Station",
    "experience.table.row18.count": "8",
    'experience.viewMore': 'View More Projects',

    // Environment
    'environment.title': 'Environment',
    'environment.project.title': 'Environmental Projects',
    'environment.project.desc': 'We are committed to providing eco-friendly solutions for sustainable development',
    'environment.tech.title': 'Green Technology',
    'environment.tech.desc': 'Adopting advanced technology for efficient resource utilization',
    'environment.sustainable.title': 'Sustainable Development',
    'environment.sustainable.desc': 'Promoting environmental sustainability through innovative technology and solutions',

    // Technology
    'technology.title': 'Technology',
    'technology.innovation.title': 'Innovation',
    'technology.innovation.desc': 'Continuous innovation, leading industry development',
    'technology.rd.title': 'R&D',
    'technology.rd.desc': 'Professional team, focused on research and development',
    'technology.smart.title': 'Smart Systems',
    'technology.smart.desc': 'Leveraging AI technology to create intelligent solutions',

    // Modal translations
    'modal.title': 'Product Specifications',
    'modal.close': '×',

    // Specification item translations
    'spec.input': 'Input',
    'spec.output': 'Output Power',
    'spec.connector': 'Charging Interface',
    'spec.protection': 'Protection Level',
    'spec.temperature': 'Operating Temperature',
    'spec.display': 'Display',
    'spec.communication': 'Communication',
    'spec.certification': 'Certification',
    'spec.cooling': 'Cooling Method',
    'spec.cable': 'Cable Length'
});