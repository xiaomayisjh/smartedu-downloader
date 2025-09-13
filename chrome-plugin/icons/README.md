# 插件图标说明

此目录应包含以下图标文件：

- `icon.ico` - 包含多种尺寸的ICO格式图标文件

## 图标要求

- 格式：ICO（包含16x16, 32x32, 48x48, 128x128等尺寸）
- 背景：透明或白色
- 主题：教育/PDF相关
- 建议使用：📚 书本图标或 📄 文档图标

## ICO文件制作方法

### 方法1：在线转换
1. 准备一个高质量的PNG图标（建议512x512像素）
2. 使用在线ICO转换器：
   - [ConvertICO](https://converticon.com/)
   - [ICO Convert](https://icoconvert.com/)
   - [Favicon Generator](https://www.favicon-generator.org/)

### 方法2：使用工具
- **GIMP** - 免费图像编辑器，支持导出ICO
- **Photoshop** - 使用ICO插件
- **Paint.NET** - 免费，支持ICO格式

### 方法3：命令行工具
```bash
# 使用ImageMagick
convert icon.png -resize 16x16 icon16.png
convert icon.png -resize 32x32 icon32.png
convert icon.png -resize 48x48 icon48.png
convert icon.png -resize 128x128 icon128.png
```

## 推荐图标网站

- [Flaticon](https://www.flaticon.com/)
- [Icons8](https://icons8.com/)
- [Feather Icons](https://feathericons.com/)
- [Material Icons](https://fonts.google.com/icons)

## 注意事项

- ICO文件应该包含多种尺寸，Chrome会自动选择最合适的尺寸
- 确保图标在不同尺寸下都清晰可见
- 建议使用简洁的设计，避免过于复杂的细节
