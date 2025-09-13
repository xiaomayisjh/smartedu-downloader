// ==UserScript==
// @name         智慧中小学PDF下载器
// @namespace    https://github.com/smartedu-downloader
// @version      1.0.0
// @description  自动提取并下载智慧教育平台教材页面的PDF文件，支持认证头处理和智能检测
// @author       SmartEdu Downloader
// @homepage     https://github.com/smartedu-downloader
// @supportURL   https://github.com/smartedu-downloader/issues
// @updateURL    https://raw.githubusercontent.com/smartedu-downloader/main/smartedu-pdf-downloader.user.js
// @downloadURL  https://raw.githubusercontent.com/smartedu-downloader/main/smartedu-pdf-downloader.user.js
// @match        https://basic.smartedu.cn/tchMaterial/detail*
// @match        https://basic.smartedu.cn/*/tchMaterial/detail*
// @grant        none
// @run-at       document-end
// @license      MIT
// @icon         https://basic.smartedu.cn/favicon.ico
// ==/UserScript==

(function() {
    'use strict';
    
    console.log('智慧中小学PDF下载器已加载');
    
    // 配置
    const CONFIG = {
        iframeXPath: '/html/body/div[1]/div/div/div[3]/div[5]/div/div/div/div[3]/div/div/div/div/div/iframe',
        checkInterval: 2000,
        maxRetries: 10
    };
    
    // 状态管理
    let isInitialized = false;
    let downloadButton = null;
    let pdfInfo = null;
    
    // 工具函数：等待元素出现
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
    
    // 工具函数：使用XPath查找元素
    function getElementByXPath(xpath) {
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue;
    }
    
    // 提取PDF信息
    function extractPDFInfo() {
        try {
            // 使用XPath查找iframe
            const iframe = getElementByXPath(CONFIG.iframeXPath);
            
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
    
    // 下载PDF文件
    async function downloadPDF(pdfInfo) {
        try {
            showNotification('开始下载PDF文件...', 'info');
            
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
        // 移除现有通知
        const existingNotification = document.getElementById('smartedu-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'smartedu-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            max-width: 300px;
            word-wrap: break-word;
            transition: all 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
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
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        button.addEventListener('mouseenter', () => {
            button.style.background = 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)';
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        });
        
        button.addEventListener('click', async () => {
            const pdfInfo = extractPDFInfo();
            if (pdfInfo) {
                await downloadPDF(pdfInfo);
            } else {
                showNotification('未找到PDF文件信息', 'error');
            }
        });
        
        document.body.appendChild(button);
        console.log('下载按钮已创建');
    }
    
    // 初始化脚本
    async function init() {
        if (isInitialized) {
            return;
        }
        
        try {
            console.log('开始初始化智慧中小学PDF下载器');
            
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
            
            isInitialized = true;
            
        } catch (error) {
            console.error('初始化失败:', error);
            showNotification('页面加载超时，请刷新页面重试', 'error');
        }
    }
    
    // 监听页面变化（SPA应用）
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            console.log('页面URL变化，重新初始化');
            isInitialized = false;
            setTimeout(init, 1000);
        }
    });
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 开始监听页面变化
    urlObserver.observe(document, { subtree: true, childList: true });
    
    // 定期检查PDF信息（用于动态加载的页面）
    let retryCount = 0;
    const checkInterval = setInterval(() => {
        if (isInitialized) {
            clearInterval(checkInterval);
            return;
        }
        
        retryCount++;
        if (retryCount > CONFIG.maxRetries) {
            clearInterval(checkInterval);
            console.log('达到最大重试次数，停止检查');
            return;
        }
        
        const iframe = getElementByXPath(CONFIG.iframeXPath);
        if (iframe && iframe.src && iframe.src.includes('viewer.html')) {
            console.log('检测到PDF iframe，开始初始化');
            init();
            clearInterval(checkInterval);
        }
    }, CONFIG.checkInterval);
    
    console.log('智慧中小学PDF下载器脚本加载完成');
    
})();
