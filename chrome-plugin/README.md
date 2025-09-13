# 智慧教育PDF下载器

这是一个用于下载智慧教育平台PDF文件的Python脚本。

## 功能特点

- 自动解析PDF查看器URL中的文件地址和认证信息
- 支持带认证头的文件下载
- 显示下载进度
- 自动生成文件名
- 错误处理和重试机制

## 安装依赖

```bash
pip install -r requirements.txt
```

## 使用方法

### 方法1：直接运行（使用示例URL）
```bash
python smartedu_downloader.py
```

### 方法2：指定URL和输出文件名
```bash
python smartedu_downloader.py "你的PDF查看器URL" "输出文件名.pdf"
```

### 方法3：在Python代码中使用
```python
from smartedu_downloader import SmartEduDownloader

downloader = SmartEduDownloader()
success = downloader.download_from_url("你的PDF查看器URL", "输出文件名.pdf")
```

## 示例

```bash
python smartedu_downloader.py "https://basic.smartedu.cn/pdfjs/2.15/web/viewer.html?hasCatalog=true&file=https://r2-ndr-private.ykt.cbern.com.cn/edu_product/esp/assets/6e764703-6e5e-4ea3-9462-34652c2678ef.pkg/普通高中教科书%20数学%20必修%20第一册（A版）_1756191767678.pdf&headers=%7B%22X-ND-AUTH%22:%22MAC%20id=%5C%227F938B205F876FC3A30551F3A4931383AB46A5ED796633E20D6DC75C2AC2026271FC1F534015D41532711DFCD23A05B458D55BA71C5C46ED%5C%22,nonce=%5C%221757236081267:UAB14BP1%5C%22,mac=%5C%22p64LFHYxuftVDEr41AqIyM/GNmTAKXDdDbsYcmPWwLw=%5C%22%22%7D#disablestream=true" "数学教材.pdf"
```

## 注意事项

1. 确保网络连接正常
2. 认证信息有时效性，如果下载失败可能是认证过期
3. 某些文件可能需要特定的User-Agent或其他请求头
4. 下载的文件会保存在脚本运行目录下

## 错误处理

脚本包含以下错误处理：
- 网络连接错误
- 认证失败
- 文件不存在
- 权限不足

如果遇到问题，请检查：
1. URL是否正确
2. 网络连接是否正常
3. 认证信息是否有效
