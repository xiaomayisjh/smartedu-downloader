// 智慧教育PDF下载器 - 弹出页面脚本
console.log('弹出页面脚本已加载');

// DOM元素
const statusElement = document.getElementById('status');
const statusIcon = statusElement.querySelector('.status-icon');
const statusText = statusElement.querySelector('.status-text');
const pdfInfoElement = document.getElementById('pdf-info');
const fileNameElement = document.getElementById('file-name');
const fileSizeElement = document.getElementById('file-size');
const fileStatusElement = document.getElementById('file-status');
const downloadBtn = document.getElementById('download-btn');
const refreshBtn = document.getElementById('refresh-btn');
const downloadProgress = document.getElementById('download-progress');
const errorMessage = document.getElementById('error-message');
const errorText = errorMessage.querySelector('.error-text');

// 状态管理
let currentPDFInfo = null;
let isDownloading = false;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('弹出页面已加载');
    initializePopup();
    setupEventListeners();
});

// 初始化弹出页面
async function initializePopup() {
    try {
        updateStatus('⏳', '正在检测页面...', 'info');
        
        // 检查扩展上下文是否有效
        if (!isExtensionContextValid()) {
            updateStatus('⚠️', '扩展上下文已失效', 'warning');
            showError('扩展上下文已失效，请刷新页面或重新加载插件');
            return;
        }
        
        // 检查当前标签页
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs[0]) {
            showError('未找到活动标签页');
            return;
        }
        
        const currentTab = tabs[0];
        console.log('当前标签页:', currentTab.url);
        
        // 检查是否在智慧教育页面
        if (!currentTab.url || !currentTab.url.includes('basic.smartedu.cn')) {
            updateStatus('⚠️', '请在智慧教育平台页面使用此插件', 'warning');
            showError('当前页面不是智慧教育平台页面');
            return;
        }
        
        if (!currentTab.url.includes('tchMaterial/detail')) {
            updateStatus('⚠️', '请在教材详情页面使用此插件', 'warning');
            showError('请访问教材详情页面（URL包含tchMaterial/detail）');
            return;
        }
        
        // 获取PDF信息
        await getPDFInfo();
        
    } catch (error) {
        console.error('初始化失败:', error);
        showError('初始化失败: ' + error.message);
    }
}

// 设置事件监听器
function setupEventListeners() {
    downloadBtn.addEventListener('click', handleDownload);
    refreshBtn.addEventListener('click', handleRefresh);
    
    // 监听来自后台脚本的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('弹出页面收到消息:', request);
        
        if (request.action === 'downloadProgress') {
            updateDownloadProgress(request.progress);
        } else if (request.action === 'downloadComplete') {
            handleDownloadComplete(request.success, request.error);
        }
    });
}

// 获取PDF信息
async function getPDFInfo() {
    try {
        updateStatus('🔍', '正在检测PDF文件...', 'info');
        
        const response = await sendMessageToContentScript({ action: 'getPDFInfo' });
        
        if (response && response.success && response.data) {
            currentPDFInfo = response.data;
            displayPDFInfo(currentPDFInfo);
            updateStatus('✅', '检测到PDF文件', 'success');
            downloadBtn.disabled = false;
        } else {
            updateStatus('❌', '未检测到PDF文件', 'error');
            downloadBtn.disabled = true;
            showError(response?.error || '未找到PDF文件信息');
        }
        
    } catch (error) {
        console.error('获取PDF信息失败:', error);
        updateStatus('❌', '检测失败', 'error');
        showError('检测PDF信息失败: ' + error.message);
    }
}

// 显示PDF信息
function displayPDFInfo(pdfInfo) {
    fileNameElement.textContent = pdfInfo.fileName || '未知文件名';
    fileSizeElement.textContent = '点击下载后显示';
    fileStatusElement.textContent = '可用';
    
    pdfInfoElement.style.display = 'block';
}

// 处理下载
async function handleDownload() {
    if (!currentPDFInfo || isDownloading) {
        return;
    }
    
    try {
        isDownloading = true;
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">下载中...</span>';
        
        showDownloadProgress();
        
        // 直接发送消息给content script进行下载
        const response = await sendMessageToContentScript({
            action: 'downloadPDF'
        });
        
        if (response && response.success) {
            updateStatus('📥', '下载已开始', 'success');
            hideError();
        } else {
            throw new Error(response?.error || '下载失败');
        }
        
    } catch (error) {
        console.error('下载失败:', error);
        showError('下载失败: ' + error.message);
        updateStatus('❌', '下载失败', 'error');
    } finally {
        isDownloading = false;
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<span class="btn-icon">📥</span><span class="btn-text">下载PDF</span>';
        hideDownloadProgress();
    }
}

// 处理刷新
async function handleRefresh() {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">刷新中...</span>';
    
    try {
        await getPDFInfo();
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<span class="btn-icon">🔄</span><span class="btn-text">刷新检测</span>';
    }
}

// 处理下载完成
function handleDownloadComplete(success, error) {
    if (success) {
        updateStatus('✅', '下载完成', 'success');
        hideError();
    } else {
        updateStatus('❌', '下载失败', 'error');
        showError(error || '下载失败');
    }
    
    hideDownloadProgress();
}

// 更新状态
function updateStatus(icon, text, type = 'info') {
    statusIcon.textContent = icon;
    statusText.textContent = text;
    
    // 移除所有状态类
    statusElement.classList.remove('success', 'error', 'warning');
    
    // 添加新的状态类
    if (type !== 'info') {
        statusElement.classList.add(type);
    }
}

// 显示错误信息
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
}

// 隐藏错误信息
function hideError() {
    errorMessage.style.display = 'none';
}

// 显示下载进度
function showDownloadProgress() {
    downloadProgress.style.display = 'block';
}

// 隐藏下载进度
function hideDownloadProgress() {
    downloadProgress.style.display = 'none';
}

// 更新下载进度
function updateDownloadProgress(progress) {
    const progressFill = downloadProgress.querySelector('.progress-fill');
    const progressText = downloadProgress.querySelector('.progress-text');
    
    if (progressFill && progressText) {
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `下载中... ${progress}%`;
    }
}

// 检查扩展上下文是否有效
function isExtensionContextValid() {
    try {
        return chrome.runtime && chrome.runtime.id;
    } catch (e) {
        return false;
    }
}

// 发送消息给内容脚本
function sendMessageToContentScript(message) {
    return new Promise((resolve) => {
        // 检查扩展上下文是否有效
        if (!isExtensionContextValid()) {
            resolve({ success: false, error: '扩展上下文已失效，请刷新页面' });
            return;
        }
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('Content script连接错误:', chrome.runtime.lastError.message);
                        resolve({ success: false, error: '页面未加载或不在支持的页面' });
                    } else {
                        resolve(response || { success: false, error: '无响应' });
                    }
                });
            } else {
                resolve({ success: false, error: '未找到活动标签页' });
            }
        });
    });
}

// 发送消息给后台脚本
function sendMessageToBackground(message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => {
            resolve(response);
        });
    });
}
