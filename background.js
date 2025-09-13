// 智慧教育PDF下载器 - 后台脚本
console.log('智慧教育PDF下载器后台脚本已加载');

// 监听来自内容脚本和popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request);
    
    if (request.action === 'downloadPDF') {
        handleDownloadPDF(request.data, sendResponse);
        return true; // 保持消息通道开放以支持异步响应
    }
    
    if (request.action === 'getPDFInfo') {
        // 转发给内容脚本
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('Content script连接错误:', chrome.runtime.lastError.message);
                        sendResponse({ success: false, error: '页面未加载或不在支持的页面' });
                    } else {
                        sendResponse(response || { success: false, error: '无响应' });
                    }
                });
            } else {
                sendResponse({ success: false, error: '未找到活动标签页' });
            }
        });
        return true;
    }
});

// 处理PDF下载
async function handleDownloadPDF(pdfInfo, sendResponse) {
    try {
        console.log('开始下载PDF:', pdfInfo);
        
        // 验证PDF信息
        if (!pdfInfo || !pdfInfo.fileUrl) {
            throw new Error('PDF信息不完整');
        }
        
        // 使用fetch下载文件
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
        
        // 使用Chrome下载API下载blob
        const downloadId = await chrome.downloads.download({
            url: url,
            filename: filename,
            saveAs: true // 让用户选择保存位置
        });
        
        console.log('下载已开始，ID:', downloadId);
        
        // 监听下载状态
        const downloadListener = (downloadDelta) => {
            if (downloadDelta.id === downloadId) {
                console.log('下载状态变化:', downloadDelta);
                
                if (downloadDelta.state && downloadDelta.state.current === 'complete') {
                    console.log('下载完成');
                    URL.revokeObjectURL(url); // 清理blob URL
                    chrome.downloads.onChanged.removeListener(downloadListener);
                } else if (downloadDelta.state && downloadDelta.state.current === 'interrupted') {
                    console.log('下载中断');
                    URL.revokeObjectURL(url); // 清理blob URL
                    chrome.downloads.onChanged.removeListener(downloadListener);
                }
            }
        };
        
        chrome.downloads.onChanged.addListener(downloadListener);
        
        sendResponse({ 
            success: true, 
            downloadId: downloadId,
            message: '下载已开始'
        });
        
    } catch (error) {
        console.error('下载失败:', error);
        sendResponse({ 
            success: false, 
            error: error.message 
        });
    }
}

// 监听插件安装
chrome.runtime.onInstalled.addListener((details) => {
    console.log('插件已安装:', details);
    
    if (details.reason === 'install') {
        // 首次安装时的处理
        console.log('首次安装插件');
    } else if (details.reason === 'update') {
        // 更新时的处理
        console.log('插件已更新');
    }
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('basic.smartedu.cn/tchMaterial/detail')) {
        console.log('智慧教育教材页面已加载:', tab.url);
        
        // 可以在这里添加页面加载完成后的处理逻辑
        // 比如自动检测PDF信息等
    }
});

// 处理下载错误
chrome.downloads.onChanged.addListener((downloadDelta) => {
    if (downloadDelta.error) {
        console.error('下载错误:', downloadDelta.error);
        
        // 可以在这里添加错误处理逻辑
        // 比如显示错误通知、重试下载等
    }
});

// 工具函数：验证URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// 工具函数：生成唯一文件名
function generateUniqueFileName(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${originalName}_${timestamp}_${random}.pdf`;
}
