<template>
  <canvas ref="canvas" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvas = ref(null)
let ctx = null
let particles = []
let animationId = null
let mouseX = 0
let mouseY = 0

// 粒子类
class Particle {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.size = Math.random() * 3 + 1
    this.speedX = (Math.random() - 0.5) * 0.5
    this.speedY = (Math.random() - 0.5) * 0.5
    this.opacity = Math.random() * 0.5 + 0.2
    this.life = Math.random() * 100 + 100
    this.maxLife = this.life
    this.hue = Math.random() * 60 + 260 // 紫色到粉色范围 (260-320)
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY
    this.life--

    // 鼠标交互 - 靠近时轻微避让
    const dx = this.x - mouseX
    const dy = this.y - mouseY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 150) {
      const force = (150 - dist) / 150
      this.speedX += (dx / dist) * force * 0.02
      this.speedY += (dy / dist) * force * 0.02
    }

    // 速度限制
    const maxSpeed = 2
    this.speedX = Math.max(-maxSpeed, Math.min(maxSpeed, this.speedX))
    this.speedY = Math.max(-maxSpeed, Math.min(maxSpeed, this.speedY))

    // 透明度随生命周期变化
    this.opacity = (this.life / this.maxLife) * 0.5 + 0.1
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${this.opacity})`
    ctx.fill()

    // 添加发光效果
    ctx.shadowBlur = 15
    ctx.shadowColor = `hsla(${this.hue}, 70%, 70%, ${this.opacity})`
  }

  isDead() {
    return this.life <= 0
  }
}

// 初始化画布
const initCanvas = () => {
  const canvasEl = canvas.value
  ctx = canvasEl.getContext('2d')
  resizeCanvas()

  // 创建初始粒子
  for (let i = 0; i < 100; i++) {
    createParticle()
  }
}

// 调整画布大小
const resizeCanvas = () => {
  const canvasEl = canvas.value
  canvasEl.width = window.innerWidth
  canvasEl.height = window.innerHeight
}

// 创建新粒子
const createParticle = () => {
  const canvasEl = canvas.value
  const x = Math.random() * canvasEl.width
  const y = Math.random() * canvasEl.height
  particles.push(new Particle(x, y))
}

// 动画循环
const animate = () => {
  const canvasEl = canvas.value
  if (!canvasEl || !ctx) return

  // 清除画布并绘制渐变背景
  const gradient = ctx.createRadialGradient(
    canvasEl.width / 2, canvasEl.height / 2, 0,
    canvasEl.width / 2, canvasEl.height / 2, canvasEl.width / 2
  )
  gradient.addColorStop(0, '#1a1a2e')
  gradient.addColorStop(0.5, '#16213e')
  gradient.addColorStop(1, '#0f0f23')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height)

  // 更新和绘制粒子
  particles.forEach((particle, index) => {
    particle.update()
    particle.draw()
  })

  // 移除死亡粒子
  particles = particles.filter(p => !p.isDead())

  // 添加新粒子以保持数量
  while (particles.length < 100) {
    createParticle()
  }

  // 绘制粒子之间的连线
  drawConnections()

  animationId = requestAnimationFrame(animate)
}

// 绘制粒子连线
const drawConnections = () => {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 120) {
        const opacity = (1 - dist / 120) * 0.3
        ctx.beginPath()
        ctx.strokeStyle = `hsla(${particles[i].hue}, 70%, 70%, ${opacity})`
        ctx.lineWidth = 1
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
      }
    }
  }
}

// 鼠标移动事件
const handleMouseMove = (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
}

// 窗口大小调整事件
const handleResize = () => {
  resizeCanvas()
}

onMounted(() => {
  initCanvas()
  animate()

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}
</style>
