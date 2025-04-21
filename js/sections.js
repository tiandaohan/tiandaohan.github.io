document.addEventListener('DOMContentLoaded', function() {
    // 产品分类切换
    const categoryBtns = document.querySelectorAll('.category-btn');
    const productLists = {
        ac: document.querySelector('.ac-products'),
        dc: document.querySelector('.dc-products')
    };
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
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
    const modal = document.getElementById('spec-modal-new');
    const modalTitle = document.getElementById('modal-title-new');
    const modalBody = document.getElementById('modal-body-new');
    const closeBtn = document.querySelector('.modal-new .close-btn');
    const specBtns = document.querySelectorAll('.spec-btn');
    
    // 产品规格数据
    const productSpecs = {
        'ac-portable': {
            '输入': 'AC 220V±15%',
            '输出功率': '3.5kW',
            '充电接口': 'Type 2',
            '防护等级': 'IP65',
            '工作温度': '-30°C to +50°C',
            '通信': 'WiFi/4G(选配)',
            '认证': 'CE/TUV'
        },
        'ac-7kw': {
            '输入': 'AC 220V±15%',
            '输出功率': '7kW',
            '充电接口': 'Type 2',
            '防护等级': 'IP65',
            '工作温度': '-30°C to +50°C',
            '显示屏': '4.3英寸LCD',
            '通信': 'WiFi/4G(选配)',
            '认证': 'CE/TUV'
        },
        'ac-22kw': {
            '输入': 'AC 380V±15%',
            '输出功率': '22kW',
            '充电接口': 'Type 2',
            '防护等级': 'IP65',
            '工作温度': '-30°C to +50°C',
            '显示屏': 'LCD',
            '通信': 'WiFi/4G(选配)',
            '认证': 'CE/TUV'
        },
        'dc-40kw': {
            '输入': 'AC 380V±15%',
            '输出功率': '40kW',
            '充电接口': 'CCS2/CHAdeMO',
            '防护等级': 'IP54',
            '工作温度': '-30°C to +50°C',
            '显示屏': '5英寸触摸屏',
            '通信': 'WiFi/4G(选配)',
            '认证': 'CE/TUV'
        },
        'dc-120kw': {
            '输入': 'AC 380V±15%',
            '输出功率': '120kW',
            '充电接口': 'CCS2/CHAdeMO',
            '防护等级': 'IP54',
            '工作温度': '-30°C to +50°C',
            '显示屏': '7英寸触摸屏',
            '通信': 'WiFi/4G(选配)',
            '认证': 'CE/TUV'
        },
        'dc-240kw': {
            '输入': 'AC 380V±15%',
            '输出功率': '240kW',
            '充电接口': 'CCS2/CHAdeMO',
            '防护等级': 'IP54',
            '工作温度': '-30°C to +50°C',
            '显示屏': '55英寸大屏幕(可选)',
            '通信': 'WiFi/4G(选配)',
            '认证': 'CE/TUV'
        }
    };
    
    // 显示产品规格
    function showProductSpecs(productId) {
        const specs = productSpecs[productId];
        
        let specsHtml = '<table class="specs-table">';
        for (const [key, value] of Object.entries(specs)) {
            specsHtml += `
                <tr>
                    <td class="spec-key">${key}</td>
                    <td class="spec-value">${value}</td>
                </tr>
            `;
        }
        specsHtml += '</table>';
        
        modalBody.innerHTML = specsHtml;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // 添加规格按钮点击事件
    specBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.product;
            showProductSpecs(productId);
        });
    });
    
    // 关闭模态框
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    window.addEventListener('click', function(e) {
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
    
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', function() {
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
                
                this.textContent = '收起项目';
                showAllProjects = true;
            } else {
                const rows = projectTable.querySelectorAll('tr');
                for (let i = 5; i < rows.length; i++) {
                    rows[i].remove();
                }
                
                this.textContent = '查看更多项目';
                showAllProjects = false;
            }
        });
    }
}); 