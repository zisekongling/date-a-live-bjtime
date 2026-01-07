// 初始化资源路径 - 使用直链传输地址
const resourcesPath = 'https://1816240476.v.123pan.cn/1816240476/直链传输/resources/';

// 存储每个数字的图片文件列表
let imageFiles = {};

// 存储每个数字位置的当前数字和图片路径
let digitCache = {};

// 存储当前显示的完整时间，用于判断是否需要更新
let currentFullTime = '';

// 获取指定文件夹中的图片文件列表
function getImageFiles(digit) {
    // 如果已经获取过，直接返回缓存
    if (imageFiles[digit]) {
        return imageFiles[digit];
    }
    
    // 每个数字只使用一个png图片文件，命名为X-1.png
    const mockFiles = [
        `${digit}-1.png`
    ];
    
    imageFiles[digit] = mockFiles;
    return mockFiles;
}

// 为指定数字位置生成或获取图片路径
function getImagePath(digit, type, index) {
    const cacheKey = `${type}_${index}`;
    
    // 如果当前数字与缓存中的数字相同，返回缓存的图片路径
    if (digitCache[cacheKey] && digitCache[cacheKey].digit === digit) {
        return digitCache[cacheKey].imgPath;
    }
    
    // 获取该数字的图片文件列表
    const files = getImageFiles(digit);
    if (files.length === 0) {
        // 如果没有图片文件，返回空字符串
        digitCache[cacheKey] = {
            digit: digit,
            imgPath: ''
        };
        return '';
    }
    
    // 随机选择一个图片文件
    const randomIndex = Math.floor(Math.random() * files.length);
    const imgPath = `${resourcesPath}${digit}/${files[randomIndex]}`;
    
    // 更新缓存
    digitCache[cacheKey] = {
        digit: digit,
        imgPath: imgPath
    };
    
    return imgPath;
}

// 将数字转换为图片元素
function digitToImage(digit, type, index) {
    const imgPath = getImagePath(digit, type, index);
    
    const img = document.createElement('img');
    img.src = imgPath;
    img.alt = digit;
    img.className = `digit-img`;
    
    // 添加错误处理
    img.onerror = function() {
        console.warn(`无法加载图片: ${imgPath}`);
        // 如果图片加载失败，显示数字文本
        this.style.display = 'none';
        const fallbackSpan = document.createElement('span');
        fallbackSpan.textContent = digit;
        fallbackSpan.className = 'digit-fallback';
        this.parentNode.appendChild(fallbackSpan);
    };
    
    return img;
}

// 将数字转换为带图片的HTML
function numberToImageHtml(number, type) {
    // 确保number是字符串
    const numStr = String(number);
    
    // 根据不同类型处理补零
    let finalStr = numStr;
    if (['hour', 'minute', 'second'].includes(type)) {
        // 时间组件（小时、分钟、秒钟）进行两位数格式化
        finalStr = ('0' + numStr).slice(-2);
    } else if (['year', 'month', 'day', 'countdown', 'week'].includes(type)) {
        // 年份、月份、日期、倒计时、星期不需要补零
        finalStr = numStr;
    }
    
    const digits = finalStr.split('');
    
    // 生成每个数字的图片HTML
    const html = digits.map((digit, index) => {
        const img = digitToImage(digit, type, index);
        const span = document.createElement('span');
        span.className = 'digit';
        span.appendChild(img);
        return span.outerHTML;
    }).join('');
    
    return html;
}

// 获取中文星期几
function getChineseWeekday(day) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return weekdays[day];
}

// 获取星期几对应的数字（星期日用7）
function getWeekdayNumber(day) {
    // day: 0-6，0是星期日
    if (day === 0) {
        return '7'; // 星期日用7的图片
    } else {
        return String(day); // 星期一至星期六用1-6的图片
    }
}

// 优化月份和日期的显示：单数月和单数日隐藏0
function formatMonthOrDay(value) {
    // 将字符串转换为数字
    const num = parseInt(value, 10);
    // 如果小于10，返回数字本身（不补零）
    return String(num);
}

// 更新日期时间
function updateDateTime() {
    const now = new Date();
    
    // 获取日期和时间组件
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 月份从0开始，所以+1
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    const weekday = now.getDay(); // 0-6，0是星期日
    
    // 获取星期几的中文和数字
    const weekdayChinese = getChineseWeekday(weekday);
    const weekdayNumber = getWeekdayNumber(weekday);
    
    // 创建完整时间字符串，用于判断是否需要更新
    const fullTime = `${year}${month}${day}${hour}${minute}${second}${weekday}`;
    
    // 只有当时间变化时才更新DOM，减少不必要的操作
    if (fullTime !== currentFullTime) {
        currentFullTime = fullTime;
        
        // 优化月份和日期的显示：单数月和单数日隐藏0
        const monthStr = formatMonthOrDay(month);
        const dayStr = formatMonthOrDay(day);
        
        // 更新日期显示，包括星期几
        const dateElement = document.getElementById('date');
        dateElement.innerHTML = `
            ${numberToImageHtml(year, 'year')}年
            ${numberToImageHtml(monthStr, 'month')}月
            ${numberToImageHtml(dayStr, 'day')}日 
            星期<span class="week">${numberToImageHtml(weekdayNumber, 'week')}</span>
        `;
        
        // 更新时间显示（保持两位数格式）
        const timeElement = document.getElementById('time');
        timeElement.innerHTML = `
            ${numberToImageHtml(hour, 'hour')}:
            ${numberToImageHtml(minute, 'minute')}:
            ${numberToImageHtml(second, 'second')}
        `;
        
        // 更新倒计时
        const nextYear = new Date(now.getFullYear() + 1, 0, 1);
        const diffTime = nextYear - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const countdownElement = document.getElementById('countdown');
        countdownElement.innerHTML = `距离明年还剩${numberToImageHtml(diffDays, 'countdown')}天`;
    }
    
    // 确保十和万的图片已经加载
    ensureSpecialImagesLoaded();
}

// 确保十和万的图片已经加载
function ensureSpecialImagesLoaded() {
    // 更新十和万的图片，无论元素是否有子节点
    const ten1Element = document.getElementById('ten1');
    const img1 = digitToImage('十', 'ten1', 0);
    ten1Element.innerHTML = '';
    ten1Element.appendChild(img1);
    
    const ten2Element = document.getElementById('ten2');
    const img2 = digitToImage('十', 'ten2', 0);
    ten2Element.innerHTML = '';
    ten2Element.appendChild(img2);
    
    const wanElement = document.getElementById('wan');
    const img3 = digitToImage('万', 'wan', 0);
    wanElement.innerHTML = '';
    wanElement.appendChild(img3);
}

// 初始化页面
function init() {
    updateDateTime();
    // 每秒更新一次时间
    setInterval(updateDateTime, 1000);
}

// 页面加载完成后初始化
window.addEventListener('load', init);