// 智慧教育PDF下载器 - 内容脚本
console.log('智慧教育PDF下载器已加载');

// 等待页面完全加载
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function check() {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`元素未找到: ${selector}`));
            } else {
                setTimeout(check, 100);
            }
        }
        
        check();
    });
}

// 提取PDF信息
function extractPDFInfo() {
    try {
        // 使用XPath查找iframe
        const xpath = '/html/body/div[1]/div/div/div[3]/div[5]/div/div/div/div[3]/div/div/div/div/div/iframe';
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const iframe = result.singleNodeValue;
        
        if (!iframe) {
            console.log('未找到PDF iframe');
            return null;
        }
        
        const src = iframe.src;
        if (!src || !src.includes('viewer.html')) {
            console.log('iframe src不包含viewer.html');
            return null;
        }
        
        console.log('找到PDF iframe:', src);
        
        // 解析URL参数
        const url = new URL(src, window.location.origin);
        const fileParam = url.searchParams.get('file');
        const headersParam = url.searchParams.get('headers');
        
        if (!fileParam) {
            console.log('未找到file参数');
            return null;
        }
        
        // 解码文件URL
        const fileUrl = decodeURIComponent(fileParam);
        
        // 解析认证头信息
        let authHeaders = {};
        if (headersParam) {
            try {
                const decodedHeaders = decodeURIComponent(headersParam);
                authHeaders = JSON.parse(decodedHeaders);
            } catch (e) {
                console.error('解析认证头信息失败:', e);
            }
        }
        
        // 提取文件名
        const fileName = extractFileName(fileUrl);
        
        const pdfInfo = {
            fileUrl: fileUrl,
            authHeaders: authHeaders,
            fileName: fileName,
            originalSrc: src,
            pageUrl: window.location.href
        };
        
        console.log('提取的PDF信息:', pdfInfo);
        return pdfInfo;
        
    } catch (error) {
        console.error('提取PDF信息时出错:', error);
        return null;
    }
}

// 从URL中提取文件名
function extractFileName(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const fileName = pathname.split('/').pop();
        
        if (fileName && fileName.includes('.pdf')) {
            // 解码文件名
            return decodeURIComponent(fileName);
        }
        
        // 如果无法从URL提取，生成默认文件名
        return `智慧教育教材_${Date.now()}.pdf`;
    } catch (e) {
        return `智慧教育教材_${Date.now()}.pdf`;
    }
}

// 创建下载按钮
function createDownloadButton() {
    // 检查是否已经存在下载按钮
    if (document.getElementById('smartedu-download-btn')) {
        return;
    }
    
    const button = document.createElement('button');
    button.id = 'smartedu-download-btn';
    button.innerHTML = '📥 下载PDF';
    button.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: #4CAF50;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    
    button.addEventListener('mouseenter', () => {
        button.style.background = '#45a049';
        button.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = '#4CAF50';
        button.style.transform = 'translateY(0)';
    });
    
    button.addEventListener('click', async () => {
        const pdfInfo = extractPDFInfo();
        if (pdfInfo) {
            // 直接在页面上下文中下载，避免CORS问题
            await downloadPDFInPage(pdfInfo);
        } else {
            showNotification('未找到PDF文件信息', 'error');
        }
    });
    
    document.body.appendChild(button);
    console.log('下载按钮已创建');
}

// 在页面上下文中下载PDF
async function downloadPDFInPage(pdfInfo) {
    try {
        showNotification('开始下载PDF文件...', 'info');
        
        // 使用fetch在页面上下文中下载
        const response = await fetch(pdfInfo.fileUrl, {
            method: 'GET',
            headers: pdfInfo.authHeaders || {}
        });
        
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
        }
        
        // 获取文件内容
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const filename = pdfInfo.fileName || `智慧教育教材_${Date.now()}.pdf`;
        
        // 创建临时下载链接
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        // 添加到页面并触发下载
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // 清理
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        
        showNotification('PDF文件下载完成！', 'success');
        
    } catch (error) {
        console.error('下载失败:', error);
        showNotification('下载失败: ' + error.message, 'error');
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 10001;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// 检查扩展上下文是否有效
function isExtensionContextValid() {
    try {
        return chrome.runtime && chrome.runtime.id;
    } catch (e) {
        return false;
    }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 检查扩展上下文是否有效
    if (!isExtensionContextValid()) {
        console.log('扩展上下文已失效，忽略消息');
        return;
    }
    
    if (request.action === 'getPDFInfo') {
        const pdfInfo = extractPDFInfo();
        sendResponse({ success: true, data: pdfInfo });
    } else if (request.action === 'downloadPDF') {
        const pdfInfo = extractPDFInfo();
        if (pdfInfo) {
            // 直接在页面上下文中下载
            downloadPDFInPage(pdfInfo).then(() => {
                sendResponse({ success: true });
            }).catch((error) => {
                sendResponse({ success: false, error: error.message });
            });
            return true; // 保持消息通道开放
        } else {
            sendResponse({ success: false, error: '未找到PDF信息' });
        }
    }
});

// 页面加载完成后执行
async function init() {
    try {
        // 检查扩展上下文是否有效
        if (!isExtensionContextValid()) {
            console.log('扩展上下文已失效，跳过初始化');
            return;
        }
        
        // 等待iframe加载
        await waitForElement('iframe[src*="viewer.html"]', 15000);
        console.log('PDF iframe已加载');
        
        // 创建下载按钮
        createDownloadButton();
        
        // 检查PDF信息是否可用
        const pdfInfo = extractPDFInfo();
        if (pdfInfo) {
            console.log('PDF信息提取成功:', pdfInfo);
            showNotification('检测到PDF文件，可以开始下载', 'success');
        } else {
            console.log('PDF信息提取失败');
            showNotification('未检测到PDF文件', 'error');
        }
        
    } catch (error) {
        console.error('初始化失败:', error);
        showNotification('页面加载超时，请刷新页面重试', 'error');
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 监听页面变化（SPA应用）
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        console.log('页面URL变化，重新初始化');
        setTimeout(init, 1000);
    }
}).observe(document, { subtree: true, childList: true });

// 监听扩展上下文失效
function checkExtensionContext() {
    if (!isExtensionContextValid()) {
        console.log('扩展上下文已失效，移除下载按钮');
        const downloadBtn = document.getElementById('smartedu-download-btn');
        if (downloadBtn) {
            downloadBtn.remove();
        }
        showNotification('扩展上下文已失效，请刷新页面', 'error');
        return false;
    }
    return true;
}

// 定期检查扩展上下文
setInterval(checkExtensionContext, 5000);
