// 创建Plyr播放器实例
const player = new Plyr('video', {
    controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
    fullscreen: { 
        enabled: true,
        fallback: true,
        iosNative: true
    },
    ratio: '16:9'
});

// 获取视频容器和元素
const videoWrapper = document.querySelector('.video-container');
const videoElement = document.querySelector('video');

// 视频布局初始化
const initVideoLayout = () => {
    if (!videoWrapper || !videoElement) return;
    
    videoElement.style.width = '100%';
    videoElement.style.height = 'auto';
    player.ratio = '16:9';
    
    player.resize();
};

// 事件监听
player.on('ready', initVideoLayout);
player.on('enterfullscreen', () => {
    videoElement.style.maxHeight = 'none';
});
player.on('exitfullscreen', initVideoLayout);

window.addEventListener('resize', initVideoLayout);
document.addEventListener('DOMContentLoaded', initVideoLayout);