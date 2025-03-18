# VideoVault

VideoVault 是一个基于 123云盘的视频直链展示网站，支持视频鉴权和自适应播放。

> 123云盘的直链需要123云盘会员，没有的话那你就别搞了

## 功能特点

- 响应式视频播放器
- 视频URL鉴权
- 防盗链保护
- 自动播放支持
- 禁用视频下载和开发者工具
- 自适应视频尺寸（最大1280×720）

## 技术栈

- Node.js
- Express
- EJS模板引擎
- Bootstrap 5
- Vercel部署

## 环境变量配置

在Vercel后台需要配置以下环境变量：

- `UID`: 123云盘用户的UID
- `AUTH_KEY`: 123云盘用户的鉴权密钥
- `DOMAIN`: 123云盘Referer鉴权的域名（同时也是Vercel项目绑定的域名）
- `SITE_BRAND`: (可选) 自定义网站品牌设置，JSON格式，包含以下字段：
  - `logo`: 网站Logo图片的URL
  - `name`: 网站名称，替换默认的"VideoVault"

示例：
```json
{"logo":"https://example.com/logo.png","name":"My Video Site"}
```

视频配置可以通过以下两种方式之一进行：

1. 使用单个 `VIDEOS_CONFIG` 环境变量：

```json
[{"url":"视频直链URL-1","slug":"video-slug-1","group":"视频分组名称1","title":"视频标题1","description":"视频描述1","cover":"https://example.com/video-cover.jpg"},{"url":"视频直链URL-2","slug":"video-slug-2","group":"视频分组名称2","title":"视频标题2","description":"视频描述2","cover":"https://example.com/video-cover.jpg"}]
```

2. 使用多个 `VIDEOS_CONFIG_n` 环境变量（n 为数字，从1开始）：

- `VIDEOS_CONFIG_1`:

```json
{"url":"视频直链URL-1","slug":"video-slug-1","group":"视频分组名称1","title":"视频标题1","description":"视频描述1","cover":"https://example.com/video-cover.jpg"}
```

- `VIDEOS_CONFIG_2`:

```json
{"url":"视频直链URL-2","slug":"video-slug-2","group":"视频分组名称2","title":"视频标题2","description":"视频描述2","cover":"https://example.com/video-cover.jpg"}
```

视频配置中的字段说明：

- `url`: (必填) 视频的直链地址
- `slug`: (必填) 视频的URL路径标识
- `title`: (可选) 视频标题，默认为"未命名视频"
- `description`: (可选) 视频描述，默认为"暂无描述"
- `group`: (可选) 视频分组，默认为"默认分组"
- `cover`: (可选) 视频封面图片URL，默认为空。如果不设置，将使用视频默认预览帧
- `group`: (可选) 视频分组，默认为"默认分组"

你可以根据需要添加更多的 `VIDEOS_CONFIG_n` 变量，并通过 `group` 字段将视频分组展示。

## 本地开发

1. 克隆仓库：
   \`\`\`bash
   git clone https://github.com/hcllmsx/VideoVault.git
   cd VideoVault
   \`\`\`
2. 安装依赖：
   \`\`\`bash
   npm install
   \`\`\`
3. 创建 .env 文件并配置环境变量：

```
UID=your_uid
AUTH_KEY=your_auth_key
DOMAIN=your.domain.com
VIDEOS_CONFIG_1={"title":"测试视频1","slug":"test1","url":"https://example.com/video1.mp4","description":"测试视频1描述","cover":"https://example.com/video-cover.jpg"}
VIDEOS_CONFIG_2={"title":"测试视频2","slug":"test2","url":"https://example.com/video2.mp4","description":"测试视频2描述","cover":"https://example.com/video-cover.jpg"}
```

4. 启动开发服务器：
   \`\`\`bash
   npm run dev
   \`\`\`

## 部署到Vercel

1. Fork 这个仓库到你的GitHub账号
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署完成后，设置自定义域名
