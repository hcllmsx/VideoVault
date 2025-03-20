# VideoVault

VideoVault 是一个基于[Vercel](https://vercel.com/home)，需要配合[123云盘](https://www.123pan.com/)的视频展示网站，支持视频、图片文件鉴权。

> 123云盘的直链需要123云盘会员

## 功能特点

- 放进来的123云盘的视频直链，支持URL鉴权和Referer鉴权
- 支持视频合集和单集视频
- 支持多清晰度视频源
- 支持自定义Plyr播放器配置

## 技术栈

- Node.js
- Express
- EJS模板引擎
- Bootstrap 5
- Plyr播放器
- Vercel 部署

## 环境变量配置

在Vercel后台需要配置以下环境变量：

- `UID`：123云盘用户的UID
- `AUTH_KEY`：123云盘用户的鉴权密钥
- `DOMAIN`：123云盘Referer鉴权的域名（同时也是Vercel项目绑定的域名）
- `PLYR_CONFIG`：（可选）Plyr播放器的全局配置，JSON格式
- `VIDEO_SERIES_n`：（可选）视频合集配置，`n`为数字，从1开始

  - `slug`：（必须）视频合集标识
  - `group`：视频合集分组名称
  - `title`：视频合集标题
  - `description`：视频合集描述
  - `cover`：视频合集封面
  - `episodes`：（必须）分集列表，每个分集包含：
    - `title`：分集标题
    - `description`：分集描述
    - `cover`：分集封面
    - `qualities`：（必须）视频质量列表，每个质量包含：
      - `url`：视频直链URL
      - `height`：视频高度（如720、1080等）
      - `label`：（可选）质量标签（如"720P"、"1080P"等）

  > **配置多个视频说明**：要在一个视频合集中添加多个视频，只需在 `episodes`数组中添加多个视频对象即可。每个视频对象都需要包含完整的信息（标题、描述、封面和质量选项）。系统会自动在视频播放页面生成分集列表，用户可以点击切换不同的视频。第一个视频将作为默认显示的视频。
  >
- `VIDEO_SINGLE_n`：（可选）单集视频配置，`n`为数字，从1开始

  - `slug`：（必须）视频标识
  - `group`：视频分组名称
  - `title`：视频标题
  - `description`：视频描述
  - `cover`：视频封面
  - `qualities`：（必须）视频质量列表，每个质量包含：
    - `url`：视频直链URL
    - `height`：视频高度（如720、1080等）
    - `label`：（可选）质量标签（如"720P"、"1080P"等）
- `SITE_BRAND`：（可选）自定义网站品牌设置，JSON格式，包含以下字段：

  - `logo`: 网站Logo图片的URL
  - `name`: 网站名称，替换默认的"VideoVault"

## 配置示例

### 视频合集配置示例 `VIDEO_SERIES_n`

```json
{
    "slug": "my-series",
    "group": "电视剧",
    "title": "我的电视剧",
    "description": "这是一部电视剧",
    "cover": "https://example.com/cover.jpg",
    "episodes": [
        {
            "title": "第一集",
            "description": "第一集描述",
            "cover": "https://example.com/ep1.jpg",
            "qualities": [
                {
                    "url": "https://example.com/ep1-720p.mp4",
                    "height": 720,
                    "label": "720P"
                },
                {
                    "url": "https://example.com/ep1-1080p.mp4",
                    "height": 1080,
                    "label": "1080P"
                }
            ]
        },
        {
            "title": "第二集",
            "description": "第二集描述",
            "cover": "https://example.com/ep2.jpg",
            "qualities": [
                {
                    "url": "https://example.com/ep2-720p.mp4",
                    "height": 720,
                    "label": "720P"
                },
                {
                    "url": "https://example.com/ep2-1080p.mp4",
                    "height": 1080,
                    "label": "1080P"
                }
            ]
        },
        {
            "title": "第三集",
            "description": "第三集描述",
            "cover": "https://example.com/ep3.jpg",
            "qualities": [
                {
                    "url": "https://example.com/ep3-720p.mp4",
                    "height": 720,
                    "label": "720P"
                },
                {
                    "url": "https://example.com/ep3-1080p.mp4",
                    "height": 1080,
                    "label": "1080P"
                }
            ]
        }
    ]
}
```

### 单集视频配置示例 `VIDEO_SINGLE_n`

```json
{
    "slug": "my-video",
    "group": "电影",
    "title": "我的电影",
    "description": "这是一部电影",
    "cover": "https://example.com/cover.jpg",
    "qualities": [
        {
            "url": "https://example.com/video-720p.mp4",
            "height": 720,
            "label": "720P"
        },
        {
            "url": "https://example.com/video-1080p.mp4",
            "height": 1080,
            "label": "1080P"
        }
    ]
}
```

### Plyr播放器配置示例 `PLYR_CONFIG`

```json
{
    "theme": "dark",
    "controls": ["play-large", "play", "progress", "current-time", "duration", "mute", "volume", "fullscreen"],
    "settings": ["quality", "speed"],
    "speed": { "selected": 1, "options": [0.5, 1, 1.5, 2] },
    "quality": {
        "default": 720,
        "options": [720, 1080]
    }
}
```

## 本地开发

> 如果你在123云盘后台设置了Referer鉴权，本地开发会无法播放视频

1. 克隆仓库：

   ```bash
   git clone https://github.com/hcllmsx/VideoVault.git
   cd VideoVault
   ```
2. 安装依赖：

   ```bash
   npm install
   ```
3. 创建 .env 文件并配置环境变量：

   ```bash
   UID=你的123云盘UID
   AUTH_KEY=你的123云盘URL鉴权密钥
   DOMAIN=你的123云盘Referer鉴权域名
   VIDEO_SERIES_1={"slug":"my-series","group":"电视剧","title":"我的电视剧","description":"这是一部电视剧","cover":"https://example.com/cover.jpg","episodes":[...]}
   VIDEO_SINGLE_1={"slug":"my-video","group":"电影","title":"我的电影","description":"这是一部电影","cover":"https://example.com/cover.jpg","qualities":[...]}
   PLYR_CONFIG={"theme":"dark","controls":[...]}
   ```
4. 启动开发服务器：

   ```bash
   npm run dev
   ```

## 部署到Vercel

1. Fork 这个仓库到你的GitHub账号
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署完成后，设置自定义域名
