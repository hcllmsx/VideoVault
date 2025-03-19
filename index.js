const express = require('express');
const path = require('path');
const crypto = require('crypto-js');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const signedURLCache = new Map(); // 缓存已鉴权的链接

// 生成带有鉴权的URL
function signURL(originURL) {
  if (signedURLCache.has(originURL)) {
    return signedURLCache.get(originURL);
  }

  const privateKey = process.env.AUTH_KEY; // 鉴权密钥
  const uid = process.env.UID; // 账号id
  const validDuration = 3 * 60 * 60 * 1000; // 链接签名有效期3小时，单位：毫秒

  const ts = Math.floor((Date.now() + validDuration) / 1000); // 有效时间戳，单位：秒
  const rInt = Math.floor(Math.random() * 1000000); // 随机正整数

  try {
    const objURL = new URL(originURL);
    if (objURL.hostname === 'vip.123pan.cn') {
      const authKey = `${ts}-${rInt}-${uid}-${crypto
        .MD5(`${decodeURIComponent(objURL.pathname)}-${ts}-${rInt}-${uid}-${privateKey}`)
        .toString()}`;

      objURL.searchParams.append('auth_key', authKey);
    }
    const signedURL = objURL.toString();
    signedURLCache.set(originURL, signedURL);
    return signedURL;
  } catch (error) {
    console.error('Failed to sign URL:', error);
    return originURL;
  }
}

// 设置EJS模板引擎和布局
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 解析环境变量中的视频信息
function parseVideosConfig() {
  const groups = {};

  function processVideo(videoConfig) {
    const defaultVideo = {
      title: '未命名视频',
      description: '暂无描述',
      group: '默认分组',
      cover: '' // 新增封面字段，默认为空字符串
    };
    const video = { ...defaultVideo, ...videoConfig };
    if (!video.url || !video.slug) {
      console.error('Invalid video config, missing url or slug:', video);
      return;
    }
    if (!groups[video.group]) {
      groups[video.group] = [];
    }
    video.url = signURL(video.url); // 对视频链接进行鉴权
    if (video.cover) {
      video.cover = signURL(video.cover); // 对封面链接进行鉴权
    }
    groups[video.group].push(video);
  }

  // 解析环境变量中的视频配置
  const videoConfigs = [process.env.VIDEOS_CONFIG, ...Object.keys(process.env).filter(key => key.startsWith('VIDEOS_CONFIG_')).map(key => process.env[key])];
  videoConfigs.forEach(config => {
    if (config) {
      try {
        const parsedVideos = JSON.parse(config);
        if (Array.isArray(parsedVideos)) {
          parsedVideos.forEach(processVideo);
        } else {
          processVideo(parsedVideos);
        }
      } catch (error) {
        console.error('Failed to parse video config:', error);
      }
    }
  });

  // 确保至少有一个测试视频
  if (Object.keys(groups).length === 0) {
    console.warn('No videos configured. Adding a test video.');
    groups['测试分组'] = [{
      title: '测试视频',
      slug: 'test',
      url: 'https://example.com/test.mp4',
      description: '这是一个测试视频，请在环境变量中配置真实视频。',
      group: '测试分组'
    }];
  }

  console.log(`Loaded ${Object.values(groups).flat().length} videos in ${Object.keys(groups).length} groups`);
  return groups;
}

// 首页路由
app.get('/', (req, res) => {
  const videoGroups = parseVideosConfig();
  let siteBrand = null;
  if (process.env.SITE_BRAND) {
    try {
      siteBrand = JSON.parse(process.env.SITE_BRAND);
      if (siteBrand.logo) {
        siteBrand.logo = signURL(siteBrand.logo); // 对品牌 Logo 链接进行鉴权
      }
    } catch (error) {
      console.error('Failed to parse SITE_BRAND:', error);
    }
  }
  res.render('index', { 
    videoGroups,
    domain: process.env.DOMAIN || req.get('host'),
    siteBrand
  });
});

// 视频页面路由
app.get('/:videoSlug', (req, res) => {
  const videoGroups = parseVideosConfig();
  let foundVideo = null;
  
  // 在所有分组中查找视频
  foundVideo = Object.values(videoGroups)
    .flat()
    .find(video => video.slug === req.params.videoSlug);
  
  if (!foundVideo) {
    return res.status(404).render('404');
  }
  
  // 生成带鉴权的视频URL
  const signedVideoUrl = signURL(foundVideo.url);
  
  res.render('video', { 
    video: {
      ...foundVideo,
      signedUrl: signedVideoUrl
    },
    refererDomain: process.env.DOMAIN,
    title: foundVideo.title,
    isVideoPage: true
  });
});

// 404页面
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});