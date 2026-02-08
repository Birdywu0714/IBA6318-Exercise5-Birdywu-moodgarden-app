# 背景视频使用说明

## 如何添加背景视频

### 方式一：使用本地视频文件

1. 准备一个 MP4 格式的视频文件（推荐分辨率：1920x1080 或更高）
2. 将视频文件重命名为 `gradient-bg.mp4`
3. 将视频文件放入 `public/videos/` 文件夹
4. 刷新页面，视频将自动播放作为背景

### 方式二：使用在线视频资源

在 `src/components/VideoBackground.vue` 中修改 `videoSrc` 属性：

```vue
<VideoBackground
  videoSrc="https://example.com/your-video.mp4"
/>
```

### 方式三：使用 Iframe 嵌入外部网站

在页面左上角点击背景切换按钮（🌐 图标），将切换到 iframe 模式。

默认使用：https://grainy-gradients.vercel.app/

你可以修改 `src/App.vue` 中的 iframeSrc 来更换其他网站：

```vue
<IframeBackground
  iframeSrc="https://your-external-website.com"
/>
```

## 推荐的视频资源

### 免费视频网站
- **Pexels**: https://www.pexels.com/videos/
- **Pixabay**: https://pixabay.com/videos/
- **Coverr**: https://coverr.co/
- **Videvo**: https://www.videvo.net/

### 视频制作工具
- **Canva**: 可以制作简单的渐变动画视频
- **After Effects**: 专业视频编辑软件
- **DaVinci Resolve**: 免费的专业视频编辑软件

### 推荐的视频类型
1. **渐变动画**：平滑的颜色过渡
2. **自然风景**：云层流动、水波荡漾
3. **抽象图形**：几何图形、粒子效果
4. **星空效果**：缓慢移动的星空

## 视频格式建议

- **格式**: MP4 (H.264 编码)
- **分辨率**: 1920x1080 (1080p) 或更高
- **帧率**: 30fps 或 60fps
- **码率**: 建议 2-5 Mbps
- **时长**: 5-30 秒（循环播放）
- **文件大小**: 建议不超过 50MB

## 性能优化

1. **使用 loop 属性**：让视频无限循环播放
2. **使用 muted 属性**：静音播放（大多数浏览器要求）
3. **使用 playsinline 属性**：在移动设备上内联播放
4. **视频压缩**：使用工具压缩视频大小
5. **格式转换**：使用 HandBrake 等工具优化视频

## 视频压缩工具

- **HandBrake** (免费): https://handbrake.fr/
- **Adobe Media Encoder**
- **FFmpeg** (命令行工具)
- **Online Video Compressor**: https://www.freeconvert.com/video-compressor

## 当前背景类型

点击左上角的按钮可以切换三种背景类型：

- **🎨 Grainient**: Canvas 渲染的动态渐变（默认）
- **🎬 Video**: 视频背景（需要放置视频文件）
- **🌐 Iframe**: 外部网站背景（默认为 grainy-gradients）

## 故障排除

### 视频不播放
1. 检查视频文件是否在 `public/videos/` 文件夹中
2. 确认视频格式为 MP4
3. 检查浏览器控制台是否有错误信息
4. 尝试点击页面，某些浏览器需要用户交互才能播放

### 视频加载慢
1. 压缩视频文件
2. 降低视频分辨率
3. 使用 CDN 托管视频文件

### Iframe 不显示
1. 检查外部网站是否允许被 iframe 嵌入
2. 某些网站有 X-Frame-Options 限制
3. 尝试使用其他网站
