const express = require('express');
const path = require('path');
const crypto = require('crypto-js');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 修改缓存结构，增加过期时间
const signedURLCache = new Map(); // 缓存已鉴权的链接

// 生成带有鉴权的URL
function signURL(originURL) {
  // 如果是相对路径，不进行签名
  if (originURL.startsWith('/')) {
    return originURL;
  }

  const now = Date.now();
  
  // 检查缓存是否存在且未过期（设置2小时过期）
  if (signedURLCache.has(originURL)) {
    const cached = signedURLCache.get(originURL);
    if (now - cached.timestamp < 2 * 60 * 60 * 1000) { // 2小时内有效
      return cached.url;
    }
    // 如果过期，删除缓存
    signedURLCache.delete(originURL);
  }

  const privateKey = process.env.AUTH_KEY; // 鉴权密钥
  const uid = process.env.UID; // 账号id
  const validDuration = 3 * 60 * 60 * 1000; // 链接签名有效期3小时，单位：毫秒

  const ts = Math.floor((now + validDuration) / 1000); // 有效时间戳，单位：秒
  const rInt = Math.floor(Math.random() * 1000000); // 随机正整数

  try {
    // 确保URL是有效的
    if (!originURL.startsWith('http://') && !originURL.startsWith('https://')) {
      throw new Error('Invalid URL: ' + originURL);
    }
    const objURL = new URL(originURL);
    if (objURL.hostname === 'vip.123pan.cn') {
      // 移除已有的 auth_key 参数（如果存在）
      objURL.searchParams.delete('auth_key');
      
      const authKey = `${ts}-${rInt}-${uid}-${crypto
        .MD5(`${decodeURIComponent(objURL.pathname)}-${ts}-${rInt}-${uid}-${privateKey}`)
        .toString()}`;

      objURL.searchParams.append('auth_key', authKey);
    }
    const signedURL = objURL.toString();
    // 缓存URL时同时记录时间戳
    signedURLCache.set(originURL, {
      url: signedURL,
      timestamp: now
    });
    return signedURL;
  } catch (error) {
    console.error('Failed to sign URL:', error);
    return originURL;
  }
}

// 解析Plyr配置
function parsePlyrConfig() {
  const defaultPlyrConfig = {
    controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
    settings: ['captions', 'quality', 'speed'],
    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    keyboard: { focused: true, global: true },
    tooltips: { controls: true, seek: true },
    theme: 'default',
    autoplay: false,
    loop: { active: false },
    clickToPlay: true,
    disableContextMenu: true,
    loadSprite: true,
    iconUrl: 'https://cdn.plyr.io/3.7.8/plyr.svg',
    blankVideo: 'https://cdn.plyr.io/static/blank.mp4',
    quality: {
      default: 1080,
      options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
    },
    i18n: {
      restart: '重新播放',
      rewind: '倒退{seektime}秒',
      play: '播放',
      pause: '暂停',
      fastForward: '快进{seektime}秒',
      seek: '跳转',
      seekLabel: '{currentTime} / {duration}',
      played: '已播放',
      buffered: '已缓冲',
      currentTime: '当前时间',
      duration: '时长',
      volume: '音量',
      mute: '静音',
      unmute: '取消静音',
      enableCaptions: '启用字幕',
      disableCaptions: '禁用字幕',
      download: '下载',
      enterFullscreen: '进入全屏',
      exitFullscreen: '退出全屏',
      frameTitle: '{title}',
      captions: '字幕',
      settings: '设置',
      menuBack: '返回上级菜单',
      speed: '播放速度',
      normal: '正常',
      quality: '视频质量',
      loop: '循环',
      start: '开始',
      end: '结束',
      all: '全部',
      reset: '重置',
      disabled: '禁用',
      enabled: '启用',
      advertisement: '广告',
      qualityBadge: {
        2160: '4K',
        1440: 'HD',
        1080: 'HD',
        720: 'HD',
        576: 'SD',
        480: 'SD'
      }
    }
  };

  if (process.env.PLYR_CONFIG) {
    try {
      return { ...defaultPlyrConfig, ...JSON.parse(process.env.PLYR_CONFIG) };
    } catch (error) {
      console.error('Failed to parse PLYR_CONFIG:', error);
    }
  }
  return defaultPlyrConfig;
}

// 解析视频合集配置
function parseVideoSeriesConfig() {
  const series = {};
  
  // 获取所有视频合集配置
  const seriesConfigs = Object.keys(process.env)
    .filter(key => key.startsWith('VIDEO_SERIES_'))
    .map(key => process.env[key]);

  seriesConfigs.forEach(config => {
    if (config) {
      try {
        const parsedSeries = JSON.parse(config);
        if (Array.isArray(parsedSeries)) {
          parsedSeries.forEach(seriesItem => processSeries(seriesItem, series));
        } else {
          processSeries(parsedSeries, series);
        }
      } catch (error) {
        console.error('Failed to parse video series config:', error);
      }
    }
  });

  function processSeries(seriesConfig, targetObj) {
    const defaultSeries = {
      title: '未命名合集',
      description: '暂无描述',
      group: '默认分组',
      cover: '/media/VideoVault-standby.webp',
      episodes: []
    };

    const processedSeries = { ...defaultSeries, ...seriesConfig };
    
    if (!processedSeries.slug) {
      console.error('Invalid series config, missing slug:', processedSeries);
      return;
    }

    // 处理每个分集
    processedSeries.episodes = processedSeries.episodes.map(episode => {
      const defaultEpisode = {
        title: '未命名分集',
        description: '暂无描述',
        cover: processedSeries.cover,
        qualities: []
      };
      
      const processedEpisode = { ...defaultEpisode, ...episode };
      
      // 处理视频质量选项
      if (processedEpisode.qualities && processedEpisode.qualities.length > 0) {
        processedEpisode.qualities = processedEpisode.qualities.map(quality => ({
          ...quality,
          url: signURL(quality.url)
        }));
      }
      
      return processedEpisode;
    });

    // 签名封面URL
    if (processedSeries.cover) {
      processedSeries.cover = signURL(processedSeries.cover);
    }

    // 将处理后的系列添加到目标对象
    targetObj[processedSeries.slug] = processedSeries;
  }

  return series;
}

// 解析单集视频配置
function parseSingleVideoConfig() {
  const videos = {};
  
  // 获取所有单集视频配置
  const videoConfigs = Object.keys(process.env)
    .filter(key => key.startsWith('VIDEO_SINGLE_'))
    .map(key => process.env[key]);

  videoConfigs.forEach(config => {
    if (config) {
      try {
        const parsedVideo = JSON.parse(config);
        if (Array.isArray(parsedVideo)) {
          parsedVideo.forEach(video => processVideo(video, videos));
        } else {
          processVideo(parsedVideo, videos);
        }
      } catch (error) {
        console.error('Failed to parse single video config:', error);
      }
    }
  });

  function processVideo(videoConfig, targetObj) {
    const defaultVideo = {
      title: '未命名视频',
      description: '暂无描述',
      group: '默认分组',
      cover: '/media/VideoVault-standby.webp',
      qualities: []
    };

    const video = { ...defaultVideo, ...videoConfig };
    
    if (!video.slug) {
      console.error('Invalid video config, missing slug:', video);
      return;
    }

    // 处理视频质量选项
    if (video.qualities && video.qualities.length > 0) {
      video.qualities = video.qualities.map(quality => ({
        ...quality,
        url: signURL(quality.url)
      }));
    }

    // 签名封面URL
    if (video.cover) {
      video.cover = signURL(video.cover);
    }

    // 将处理后的视频添加到目标对象
    targetObj[video.slug] = video;
  }

  return videos;
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
      cover: '/media/VideoVault-standby.webp', // 默认封面
      // 添加Plyr默认配置
      plyr: {
        controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
        settings: ['captions', 'quality', 'speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        theme: 'default',
        autoplay: false,
        loop: { active: false },
        clickToPlay: true,
        disableContextMenu: true,
        loadSprite: true,
        iconUrl: 'https://cdn.plyr.io/3.7.8/plyr.svg',
        blankVideo: 'https://cdn.plyr.io/static/blank.mp4',
        quality: {
          default: 720,
          options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
        }
      }
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
  const videoSeries = parseVideoSeriesConfig();
  const singleVideos = parseSingleVideoConfig();
  const plyrConfig = parsePlyrConfig();
  
  let siteBrand = null;
  if (process.env.SITE_BRAND) {
    try {
      siteBrand = JSON.parse(process.env.SITE_BRAND);
      if (siteBrand.logo) {
        siteBrand.logo = signURL(siteBrand.logo);
      }
    } catch (error) {
      console.error('Failed to parse SITE_BRAND:', error);
    }
  }

  res.render('index', { 
    videoSeries,
    singleVideos,
    plyrConfig,
    domain: process.env.DOMAIN || req.get('host'),
    siteBrand
  });
});

// 视频页面路由
app.get('/:videoSlug', (req, res) => {
  const videoSeries = parseVideoSeriesConfig();
  const singleVideos = parseSingleVideoConfig();
  const plyrConfig = parsePlyrConfig();
  
  let foundVideo = null;
  let isSeries = false;
  
  // 先查找单集视频
  if (singleVideos[req.params.videoSlug]) {
    foundVideo = singleVideos[req.params.videoSlug];
  }
  // 再查找视频合集
  else if (videoSeries[req.params.videoSlug]) {
    foundVideo = videoSeries[req.params.videoSlug];
    isSeries = true;
  }
  
  if (!foundVideo) {
    return res.status(404).render('404');
  }
  
  let siteBrand = null;
  if (process.env.SITE_BRAND) {
    try {
      siteBrand = JSON.parse(process.env.SITE_BRAND);
      if (siteBrand.logo) {
        siteBrand.logo = signURL(siteBrand.logo);
      }
    } catch (error) {
      console.error('Failed to parse SITE_BRAND:', error);
    }
  }

  res.render('video', { 
    video: foundVideo,
    isSeries,
    plyrConfig,
    refererDomain: process.env.DOMAIN,
    title: foundVideo.title,
    isVideoPage: true,
    siteBrand
  });
});

// 404页面
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});