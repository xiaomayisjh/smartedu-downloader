#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智慧教育PDF下载器
用于下载智慧教育平台上的PDF文件
"""

import requests
import urllib.parse
import json
import os
import sys
from pathlib import Path


class SmartEduDownloader:
    def __init__(self):
        self.session = requests.Session()
        # 设置默认请求头
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/pdf,application/octet-stream,*/*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'cross-site',
            'Upgrade-Insecure-Requests': '1'
        })

    def download_pdf(self, viewer_url, output_filename=None):
        """
        从智慧教育平台下载PDF文件
        
        Args:
            viewer_url (str): PDF查看器URL
            output_filename (str): 输出文件名，如果为None则自动生成
        
        Returns:
            bool: 下载是否成功
        """
        try:
            # 解析URL参数
            parsed_url = urllib.parse.urlparse(viewer_url)
            query_params = urllib.parse.parse_qs(parsed_url.query)
            
            # 提取文件URL
            file_url = query_params.get('file', [None])[0]
            if not file_url:
                print("错误：无法从URL中提取文件地址")
                return False
            
            # 解码文件URL
            file_url = urllib.parse.unquote(file_url)
            print(f"文件URL: {file_url}")
            
            # 提取认证头信息
            headers_str = query_params.get('headers', [None])[0]
            if headers_str:
                try:
                    headers_dict = json.loads(urllib.parse.unquote(headers_str))
                    print(f"认证头信息: {headers_dict}")
                    
                    # 添加认证头到请求
                    for key, value in headers_dict.items():
                        self.session.headers[key] = value
                except json.JSONDecodeError as e:
                    print(f"警告：无法解析认证头信息: {e}")
            
            # 生成输出文件名
            if not output_filename:
                # 从文件URL中提取文件名
                file_path = urllib.parse.urlparse(file_url).path
                filename = os.path.basename(file_path)
                if not filename or not filename.endswith('.pdf'):
                    filename = "downloaded_file.pdf"
                output_filename = filename
            
            print(f"开始下载: {output_filename}")
            
            # 发送请求下载文件
            response = self.session.get(file_url, stream=True)
            response.raise_for_status()
            
            # 检查响应内容类型
            content_type = response.headers.get('content-type', '')
            if 'pdf' not in content_type.lower() and 'application/octet-stream' not in content_type.lower():
                print(f"警告：响应内容类型可能不是PDF: {content_type}")
            
            # 获取文件大小
            total_size = int(response.headers.get('content-length', 0))
            if total_size > 0:
                print(f"文件大小: {total_size / 1024 / 1024:.2f} MB")
            
            # 保存文件
            downloaded_size = 0
            with open(output_filename, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded_size += len(chunk)
                        
                        # 显示下载进度
                        if total_size > 0:
                            progress = (downloaded_size / total_size) * 100
                            print(f"\r下载进度: {progress:.1f}% ({downloaded_size / 1024 / 1024:.2f} MB)", end='', flush=True)
            
            print(f"\n下载完成: {output_filename}")
            print(f"文件大小: {downloaded_size / 1024 / 1024:.2f} MB")
            return True
            
        except requests.exceptions.RequestException as e:
            print(f"下载失败: {e}")
            return False
        except Exception as e:
            print(f"发生错误: {e}")
            return False

    def download_from_url(self, url, output_filename=None):
        """
        从完整的查看器URL下载PDF
        
        Args:
            url (str): 完整的PDF查看器URL
            output_filename (str): 输出文件名
        
        Returns:
            bool: 下载是否成功
        """
        return self.download_pdf(url, output_filename)


def main():
    """主函数"""
    # 示例URL
    example_url = "https://basic.smartedu.cn/pdfjs/2.15/web/viewer.html?hasCatalog=true&file=https://r2-ndr-private.ykt.cbern.com.cn/edu_product/esp/assets/6e764703-6e5e-4ea3-9462-34652c2678ef.pkg/%E6%99%AE%E9%80%9A%E9%AB%98%E4%B8%AD%E6%95%99%E7%A7%91%E4%B9%A6%20%E6%95%B0%E5%AD%A6%20%E5%BF%85%E4%BF%AE%20%E7%AC%AC%E4%B8%80%E5%86%8C%EF%BC%88A%E7%89%88%EF%BC%89_1756191767678.pdf&headers=%7B%22X-ND-AUTH%22:%22MAC%20id=%5C%227F938B205F876FC3A30551F3A4931383AB46A5ED796633E20D6DC75C2AC2026271FC1F534015D41532711DFCD23A05B458D55BA71C5C46ED%5C%22,nonce=%5C%221757236081267:UAB14BP1%5C%22,mac=%5C%22p64LFHYxuftVDEr41AqIyM/GNmTAKXDdDbsYcmPWwLw=%5C%22%22%7D#disablestream=true"
    
    # 创建下载器实例
    downloader = SmartEduDownloader()
    
    # 检查命令行参数
    if len(sys.argv) > 1:
        url = sys.argv[1]
        output_filename = sys.argv[2] if len(sys.argv) > 2 else None
    else:
        url = example_url
        output_filename = "普通高中教科书_数学_必修_第一册_A版.pdf"
    
    print("智慧教育PDF下载器")
    print("=" * 50)
    print(f"目标URL: {url[:100]}...")
    
    # 开始下载
    success = downloader.download_from_url(url, output_filename)
    
    if success:
        print("\n✅ 下载成功！")
    else:
        print("\n❌ 下载失败！")
        sys.exit(1)


if __name__ == "__main__":
    main()
