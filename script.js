// 初始化资源路径
const resourcesPath = 'resources/';

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
    
    return img;
}

// 将数字转换为带图片的HTML
function numberToImageHtml(number, type) {
    const digits = number.toString().split('');
    
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

// 更新日期时间
function updateDateTime() {
    const now = new Date();
    
    // 格式化日期和时间
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    // 创建完整时间字符串，用于判断是否需要更新
    const fullTime = `${year}${month}${day}${hour}${minute}${second}`;
    
    // 只有当时间变化时才更新DOM，减少不必要的操作
    if (fullTime !== currentFullTime) {
        currentFullTime = fullTime;
        
        // 更新日期显示
        const dateElement = document.getElementById('date');
        dateElement.innerHTML = `${numberToImageHtml(year, 'year')}年${numberToImageHtml(month, 'month')}月${numberToImageHtml(day, 'day')}日`;
        
        // 更新时间显示
        const timeElement = document.getElementById('time');
        timeElement.innerHTML = `${numberToImageHtml(hour, 'hour')}:${numberToImageHtml(minute, 'minute')}:${numberToImageHtml(second, 'second')}`;
        
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