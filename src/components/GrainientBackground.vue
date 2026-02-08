<template>
  <canvas ref="canvasRef" class="grainient-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  color1: { type: String, default: '#FF9FFC' },
  color2: { type: String, default: '#0a3f03' },
  color3: { type: String, default: '#30b5f8' },
  timeSpeed: { type: Number, default: 0.25 },
  warpStrength: { type: Number, default: 1 },
  warpFrequency: { type: Number, default: 5 },
  warpSpeed: { type: Number, default: 2 },
  warpAmplitude: { type: Number, default: 50 },
  noiseScale: { type: Number, default: 2 },
  grainAmount: { type: Number, default: 0.1 },
  grainScale: { type: Number, default: 2 },
  contrast: { type: Number, default: 1.5 },
  centerX: { type: Number, default: 0 },
  centerY: { type: Number, default: 0 },
  zoom: { type: Number, default: 0.9 }
})

const canvasRef = ref(null)
let ctx = null
let animationId = null
let time = 0

// Simple Noise 实现
class SimpleNoise {
  constructor() {
    this.p = []
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256)
    }
    this.perm = new Array(512)
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255]
    }
  }

  noise2D(x, y) {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    x -= Math.floor(x)
    y -= Math.floor(y)

    const u = x * x * x * (x * (x * 6 - 15) + 10)
    const v = y * y * y * (y * (y * 6 - 15) + 10)

    const A = this.perm[X] + Y
    const B = this.perm[X + 1] + Y

    return (1 - u) * ((1 - v) * (this.perm[A] / 255) + v * (this.perm[A + 1] / 255)) +
           u * ((1 - v) * (this.perm[B] / 255) + v * (this.perm[B + 1] / 255))
  }
}

const noise = new SimpleNoise()

// 解析颜色
function hexToRgb(hex) {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return { r, g, b }
}

// 混合颜色
function mix(c1, c2, t) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t)
  }
}

// 三色渐变
function gradient3(c1, c2, c3, t) {
  t = Math.max(0, Math.min(1, t))
  if (t < 0.5) {
    return mix(c1, c2, t * 2)
  } else {
    return mix(c2, c3, (t - 0.5) * 2)
  }
}

// 缓存 RGB 颜色
let cachedRgb1, cachedRgb2, cachedRgb3
let lastColor1, lastColor2, lastColor3

// 渲染帧
function renderFrame() {
  if (!ctx || !canvasRef.value) return

  const canvas = canvasRef.value
  const width = canvas.width
  const height = canvas.height

  // 检查颜色是否变化，避免重复解析
  if (lastColor1 !== props.color1) {
    cachedRgb1 = hexToRgb(props.color1)
    lastColor1 = props.color1
  }
  if (lastColor2 !== props.color2) {
    cachedRgb2 = hexToRgb(props.color2)
    lastColor2 = props.color2
  }
  if (lastColor3 !== props.color3) {
    cachedRgb3 = hexToRgb(props.color3)
    lastColor3 = props.color3
  }

  const rgb1 = cachedRgb1
  const rgb2 = cachedRgb2
  const rgb3 = cachedRgb3
  const contrast = props.contrast
  const timeFactor = time * props.timeSpeed * 0.0005
  const warpFactor = props.warpSpeed * 0.01

  // 降低分辨率以提高性能
  const scale = 4
  const scaledWidth = Math.floor(width / scale)
  const scaledHeight = Math.floor(height / scale)

  const imageData = ctx.createImageData(scaledWidth, scaledHeight)
  const data = imageData.data

  for (let y = 0; y < scaledHeight; y++) {
    for (let x = 0; x < scaledWidth; x++) {
      // 归一化坐标
      const nx = ((x / scaledWidth - 0.5) * props.zoom + props.centerX) * props.noiseScale
      const ny = ((y / scaledHeight - 0.5) * props.zoom + props.centerY) * props.noiseScale

      // 噪声 + 扭曲
      const n1 = noise.noise2D(nx, ny + timeFactor)
      const n2 = noise.noise2D(nx * props.warpFrequency + timeFactor, ny * props.warpFrequency + timeFactor)
      const warped = n1 + n2 * props.warpStrength * props.warpAmplitude * 0.01

      // 颜色位置
      let colorPos = ((warped + 1) / 2 + timeFactor) % 1
      if (colorPos < 0) colorPos += 1

      // 获取颜色
      let color = gradient3(rgb1, rgb2, rgb3, colorPos)

      // 添加噪点
      const grain = (Math.random() - 0.5) * props.grainAmount * 255
      color.r = color.r + grain
      color.g = color.g + grain
      color.b = color.b + grain

      // 对比度
      color.r = ((color.r / 128 - 1) * contrast + 1) * 128
      color.g = ((color.g / 128 - 1) * contrast + 1) * 128
      color.b = ((color.b / 128 - 1) * contrast + 1) * 128

      // 限制范围
      const idx = (y * scaledWidth + x) * 4
      data[idx] = Math.max(0, Math.min(255, color.r))
      data[idx + 1] = Math.max(0, Math.min(255, color.g))
      data[idx + 2] = Math.max(0, Math.min(255, color.b))
      data[idx + 3] = 255
    }
  }

  // 创建临时 canvas 进行缩放
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')
  tempCanvas.width = scaledWidth
  tempCanvas.height = scaledHeight
  tempCtx.putImageData(imageData, 0, 0)

  // 放大到原始尺寸
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(tempCanvas, 0, 0, width, height)

  time += 16.67
  animationId = requestAnimationFrame(renderFrame)
}

const resize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const container = canvas.parentElement
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
}

onMounted(() => {
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  animationId = requestAnimationFrame(renderFrame)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.grainient-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  display: block;
  min-width: 100vw;
  min-height: 100vh;
}
</style>
