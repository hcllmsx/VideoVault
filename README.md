# VideoVault

VideoVault 是一个基于[Vercel](https://vercel.com/home)，需要配合[123云盘](https://www.123pan.com/)的视频展示网站，支持视频、图片文件鉴权。

> 123云盘的直链需要123云盘会员

## 功能特点

- 放进来的123云盘的视频直链，支持URL鉴权和Referer鉴权

## 技术栈

- Node.js
- Express
- EJS模板引擎
- Bootstrap 5
- Vercel 部署

## 环境变量配置

在Vercel后台需要配置以下环境变量：

- `UID`：123云盘用户的UID
- `AUTH_KEY`：123云盘用户的鉴权密钥
- `DOMAIN `：123云盘Referer鉴权的域名（同时也是Vercel项目绑定的域名）
- `VIDEOS_CONFIG_n `：（可选）每一个环境变量放一个视频，`n`为数字，从1开始

  - `url`：（必须）视频直链URL
  - `slug`：（必须）域名地址，比如你绑定的域名是 `a.b.com`，且你**slug**的值是 `slug1`，那么你视频地址就是 `a.b.com/slug1`
  - `group`：视频分组名称
  - `title`：视频标题，也是该视频页面的标题
  - `description`：视频描述文字，自定义备注
  - `cover`：视频封面

  例如：`{"url":"","slug":"","group":"","title":"","description":"","cover":""}`
- `VIDEOS_CONFIG`：（可选）多个视频放入一个环境变量

  与上面的相同参数，只是可以写多个 `{}`里的数据，用 `[]`框起来
  例如：`[{"url":"","slug":"","group":"","title":"","description":"","cover":""},{"url":"","slug":"","group":"","title":"","description":"","cover":""}]`
- `SITE_BRAND`：（可选）自定义网站品牌设置，JSON格式，包含以下字段：

  - `logo`: 网站Logo图片的URL
  - `name`: 网站名称，替换默认的"VideoVault"

  例如：`{"logo":"","name":""}`

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
   VIDEOS_CONFIG_1={"url":"","slug":"","group":"","title":"","description":"","cover":""}
   VIDEOS_CONFIG_2={"url":"","slug":"","group":"","title":"","description":"","cover":""}
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
