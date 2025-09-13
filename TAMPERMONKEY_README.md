# 智慧中小学PDF下载器 - Tampermonkey脚本

这是一个Tampermonkey用户脚本，用于在智慧教育平台教材页面自动提取并下载PDF文件。

## 功能特点

✅ **自动检测** - 在智慧教育教材页面自动检测PDF文件  
✅ **一键下载** - 点击按钮即可下载PDF文件  
✅ **认证支持** - 自动处理X-ND-AUTH认证头  
✅ **美观界面** - 现代化的下载按钮和通知  
✅ **智能重试** - 自动检测动态加载的页面  
✅ **无依赖** - 纯JavaScript实现，无需额外依赖  

## 安装方法

### 前提条件
- 安装Tampermonkey浏览器扩展
  - [Chrome版本](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
  - [Firefox版本](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
  - [Edge版本](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 安装步骤

1. **打开Tampermonkey管理页面**
   - 点击浏览器工具栏中的Tampermonkey图标
   - 选择"管理面板"

2. **创建新脚本**
   - 点击"创建新脚本"按钮
   - 删除默认内容

3. **复制脚本内容**
   - 打开`smartedu-pdf-downloader.user.js`文件
   - 复制全部内容到Tampermonkey编辑器

4. **保存脚本**
   - 按`Ctrl+S`保存脚本
   - 确保脚本状态为"已启用"

## 使用方法

### 基本使用

1. **访问智慧教育平台**
   - 打开浏览器，访问智慧教育平台
   - 登录你的账号

2. **进入教材页面**
   - 导航到教材详情页面
   - 确保URL包含`tchMaterial/detail`

3. **等待脚本加载**
   - 页面加载完成后，脚本会自动检测PDF文件
   - 右上角会出现下载按钮

4. **下载PDF文件**
   - 点击"📥 下载PDF"按钮
   - 文件会自动下载到默认下载目录

### 界面说明

- **下载按钮**：页面右上角的绿色按钮
- **状态通知**：下载过程中的提示信息
- **自动检测**：脚本会自动检测页面中的PDF文件

## 脚本配置

脚本包含以下可配置参数：

```javascript
const CONFIG = {
    iframeXPath: '/html/body/div[1]/div/div/div[3]/div[5]/div/div/div/div[3]/div/div/div/div/div/iframe',
    checkInterval: 2000,    // 检查间隔（毫秒）
    maxRetries: 10          // 最大重试次数
};
```

## 工作原理

1. **页面检测**：脚本在智慧教育教材页面注入
2. **iframe查找**：使用XPath查找PDF查看器iframe
3. **信息提取**：从iframe的src属性中提取文件URL和认证信息
4. **文件下载**：使用fetch API下载文件并创建下载链接
5. **用户界面**：提供下载按钮和状态通知

## 技术细节

### 支持的页面
- URL模式：`https://basic.smartedu.cn/tchMaterial/detail*`
- 检测元素：XPath `/html/body/div[1]/div/div/div[3]/div[5]/div/div/div/div[3]/div/div/div/div/div/iframe`

### 认证处理
- 自动解析X-ND-AUTH认证头
- 支持MAC认证方式
- 在页面上下文中下载，避免CORS问题

### 兼容性
- 支持Chrome、Firefox、Edge等现代浏览器
- 兼容Tampermonkey 4.0+
- 支持动态加载的SPA页面

## 故障排除

### 常见问题

**Q: 脚本没有加载**
A: 检查：
- Tampermonkey是否已安装并启用
- 脚本是否已保存并启用
- 是否在正确的页面（URL包含tchMaterial/detail）

**Q: 没有检测到PDF文件**
A: 可能原因：
- 页面还未完全加载
- PDF iframe的XPath发生变化
- 需要登录智慧教育账号

**Q: 下载失败**
A: 可能原因：
- 认证信息过期，需要重新登录
- 网络连接问题
- 文件权限不足

### 调试方法

1. **打开浏览器控制台**（F12）
2. **查看Console标签页**的错误信息
3. **检查Network标签页**的网络请求
4. **在Tampermonkey管理面板**查看脚本状态

### 手动调试

在浏览器控制台中运行以下代码来手动检测：

```javascript
// 检查iframe
const iframe = document.evaluate('/html/body/div[1]/div/div/div[3]/div[5]/div/div/div/div[3]/div/div/div/div/div/iframe', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
console.log('iframe:', iframe);

// 检查PDF信息
if (iframe && iframe.src) {
    const url = new URL(iframe.src, window.location.origin);
    console.log('file参数:', url.searchParams.get('file'));
    console.log('headers参数:', url.searchParams.get('headers'));
}
```

## 更新日志

### v1.0.0
- 初始版本发布
- 支持PDF文件检测和下载
- 完整的用户界面
- 错误处理和状态提示
- 支持动态页面加载

## 注意事项

1. **合法使用**：请确保你有权限下载相关教材文件
2. **账号安全**：不要在公共设备上保存登录状态
3. **网络环境**：确保网络连接稳定
4. **浏览器版本**：建议使用现代浏览器的最新版本

## 技术支持

如果遇到问题，请：
1. 检查浏览器控制台错误信息
2. 确认Tampermonkey扩展状态
3. 尝试重新安装脚本
4. 检查网络连接和登录状态

## 免责声明

本脚本仅供学习和研究使用，请遵守相关法律法规和平台使用条款。使用者需自行承担使用风险。
