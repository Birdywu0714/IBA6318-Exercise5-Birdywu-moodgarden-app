<template>
  <div class="garden-3d-container">
    <div ref="canvasContainer" class="canvas-container"></div>

    <!-- 控制栏切换按钮 -->
    <div class="toggle-wrapper">
      <button class="toggle-btn" @click="toggleControls" :class="{ hidden: !controlsVisible }">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path v-if="controlsVisible" d="M11 19l-7-7 7-7M18 5l-7 7 7 7"/>
          <path v-else d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
        </svg>
      </button>
      <div class="toggle-tooltip" :class="{ hidden: !controlsVisible }">
        {{ controlsVisible ? '隐藏' : '显示' }}控制台
      </div>
    </div>

    <!-- 左侧统一控制面板 -->
    <div class="controls-panel" :class="{ hidden: !controlsVisible }">
      <!-- 情绪筛选器 -->
      <div class="panel-section">
        <div class="panel-title">😊 情绪筛选</div>
        <div class="filter-buttons">
          <button
            v-for="mood in moodOptions"
            :key="mood.value"
            class="mood-btn"
            :class="{ active: selectedMood === mood.value }"
            :style="{
              borderColor: selectedMood === mood.value ? mood.color : 'transparent',
              backgroundColor: selectedMood === mood.value ? `${mood.color}30` : 'transparent'
            }"
            @click="filterByMood(mood.value)"
          >
            <span class="mood-emoji">{{ mood.emoji }}</span>
            <span class="mood-label">{{ mood.label }}</span>
          </button>
        </div>
      </div>

      <!-- 风力控制器 -->
      <div class="panel-section">
        <div class="panel-title">💨 风力</div>
        <div class="wind-control">
          <div class="wind-header">
            <span class="wind-label">{{ Math.round(windIntensity * 100) }}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              v-model.number="windIntensity"
              class="wind-slider"
            />
          </div>
        </div>
      </div>

      <!-- 日夜模式 -->
      <div class="panel-section">
        <div class="panel-title">🌅 日夜模式</div>
        <div class="panel-buttons">
          <button
            class="env-btn"
            :class="{ active: timeOfDay === 'day' }"
            @click="setTimeOfDay('day')"
          >
            ☀️ 日间
          </button>
          <button
            class="env-btn"
            :class="{ active: timeOfDay === 'night' }"
            @click="setTimeOfDay('night')"
          >
            🌙 夜间
          </button>
        </div>
      </div>

      <!-- 四季模式 -->
      <div class="panel-section">
        <div class="panel-title">🍂 四季模式</div>
        <div class="panel-buttons">
          <button
            class="env-btn"
            :class="{ active: season === 'spring' }"
            @click="setSeason('spring')"
          >
            🌸 春
          </button>
          <button
            class="env-btn"
            :class="{ active: season === 'summer' }"
            @click="setSeason('summer')"
          >
            ☀️ 夏
          </button>
          <button
            class="env-btn"
            :class="{ active: season === 'autumn' }"
            @click="setSeason('autumn')"
          >
            🍁 秋
          </button>
          <button
            class="env-btn"
            :class="{ active: season === 'winter' }"
            @click="setSeason('winter')"
          >
            ❄️ 冬
          </button>
        </div>
      </div>

      <!-- 天气 -->
      <div class="panel-section">
        <div class="panel-title">🌧️ 天气</div>
        <div class="panel-buttons">
          <button
            class="env-btn"
            :class="{ active: weather === 'clear' }"
            @click="setWeather('clear')"
          >
            ☀️ 晴
          </button>
          <button
            class="env-btn"
            :class="{ active: weather === 'rain' }"
            @click="setWeather('rain')"
          >
            🌧️ 雨
          </button>
          <button
            class="env-btn"
            :class="{ active: weather === 'snow' }"
            @click="setWeather('snow')"
          >
            ❄️ 雪
          </button>
        </div>
      </div>

      <!-- 音量控制 -->
      <div class="panel-section">
        <div class="panel-title">🔊 音量</div>

        <!-- 环境音量 -->
        <div class="volume-control">
          <div class="volume-header">
            <span class="volume-label">🎵 环境音</span>
            <span class="volume-value">{{ Math.round(ambientVolume * 100) }}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model.number="ambientVolume"
            class="volume-slider"
          />
        </div>

        <!-- 蜜蜂音量 -->
        <div class="volume-control">
          <div class="volume-header">
            <span class="volume-label">🐝 蜜蜂音</span>
            <span class="volume-value">{{ Math.round(beeVolume * 100) }}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model.number="beeVolume"
            class="volume-slider"
            :disabled="isMuted"
          />
        </div>

        <!-- 一键静音按钮 -->
        <button
          class="mute-btn"
          :class="{ muted: isMuted }"
          @click="toggleMute"
        >
          {{ isMuted ? '🔊 取消静音' : '🔇 静音' }}
        </button>
      </div>
    </div>

    <!-- 月份选择器（顶部居中） -->
    <div class="month-selector">
      <button
        v-for="(month, index) in allMonths"
        :key="month.key"
        class="month-btn"
        :class="{ active: currentMonthIndex === index }"
        @click="selectMonth(index)"
      >
        {{ month.label }}
      </button>
    </div>

    <!-- 返回首页按钮 -->
    <button class="back-btn" @click="goBack">
      <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>返回首页</span>
    </button>

    <!-- 详情弹窗 -->
    <div class="detail-modal" :class="{ show: selectedRecord }" v-if="selectedRecord">
      <div class="modal-content">
        <div class="modal-header">
          <div class="flower-large">
            <FlowerIllustration :mood="selectedRecord.mood" />
          </div>
          <div class="close-btn" @click="closeDetail">×</div>
        </div>
        <div class="modal-body">
          <div class="date">{{ formatDetailDate(selectedRecord.date) }}</div>
          <div class="mood-badge" :class="`mood-${selectedRecord.mood}`">
            {{ getMoodLabel(selectedRecord.mood) }}
          </div>
          <div class="diary-text">{{ selectedRecord.diary }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import FlowerIllustration from './FlowerIllustration.vue'

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['back'])

const canvasContainer = ref(null)
const selectedRecord = ref(null)
const selectedMood = ref('all') // 情绪筛选状态
let highlightAnimationId = null // 高亮动画ID
const hoveredFlower = ref(null) // 当前悬停的花朵
const windIntensity = ref(0.5) // 风力强度 (0-1)
let audioContext = null // 音频上下文
let ambientSource = null // 环境音源
let ambientGainNode = null // 音量控制节点

// 音量控制
const ambientVolume = ref(0.75) // 环境音量 (0-1)
const beeVolume = ref(0.2) // 蜜蜂音量 (0-1)
const isMuted = ref(false) // 静音状态
const previousAmbientVolume = 0.75 // 保存静音前的环境音量
const previousBeeVolume = 0.2 // 保存静音前的蜜蜂音量

// 环境控制状态
const timeOfDay = ref('day') // day, night
const season = ref('spring') // spring, summer, autumn, winter
const weather = ref('clear') // clear, rain, snow
const controlsVisible = ref(true) // 控制面板可见性

// 情绪选项
const moodOptions = [
  { value: 'all', label: '全部', color: '#999', emoji: '🌸' },
  { value: 'happy', label: '开心', color: '#FFD700', emoji: '😊' },
  { value: 'sad', label: '难过', color: '#4169E1', emoji: '😢' },
  { value: 'angry', label: '生气', color: '#FF4500', emoji: '😠' },
  { value: 'calm', label: '平静', color: '#98FB98', emoji: '😌' },
  { value: 'excited', label: '兴奋', color: '#FF69B4', emoji: '🎉' },
  { value: 'tired', label: '疲惫', color: '#9370DB', emoji: '😴' },
  { value: 'anxious', label: '焦虑', color: '#FFA500', emoji: '😰' },
  { value: 'hopeful', label: '充满希望', color: '#98FB98', emoji: '🌟' }
]
const currentMonthIndex = ref(0)

let scene, camera, renderer, controls
let gardenGrids = []
let flowers3D = []
let dateLabels = []
let animationId = null
let targetCameraPosition = null
let targetLookAt = null
let terrainMesh = null // 地形网格
let skyBox = null // 天空盒
let weatherParticles = null // 天气粒子系统
let beeSource = null // 蜜蜂音源
let beeGainNode = null // 蜜蜂音量控制节点
let beePanners = [] // 蜜蜂空间声像节点数组

// 天体系统
let sunLight = null // 太阳光源
let moonLight = null // 月亮光源
let sunMesh = null // 太阳网格
let moonMesh = null // 月亮网格
let clouds = [] // 乌云数组

// 花卉模型对应情绪（默认配置）
const defaultMoodFlowerModels = {
  happy: 'sunflower向日葵.glb',          // 开心 - 向日葵
  sad: 'daisy小雏菊.glb',               // 难过 - 小雏菊
  angry: 'rose_red红玫瑰.glb', // 生气 - 红玫瑰
  calm: 'Lavender薰衣草.glb',   // 平静 - 薰衣草
  excited: 'daffodils黄水仙.glb', // 兴奋 - 黄水仙
  tired: 'pinkrose粉玫瑰.glb',         // 疲惫 - 粉玫瑰
  anxious: 'dandelion蒲公英.glb',       // 焦虑 - 蒲公英
  hopeful: 'Blue Daze蓝星花.glb' // 充满希望 - 蓝星花
}

// 生成所有月份的日历（包括没有记录的月份）
const allMonths = computed(() => {
  const groups = {}

  // 先按记录分组
  props.records.forEach(record => {
    const date = new Date(record.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!groups[monthKey]) {
      groups[monthKey] = []
    }
    groups[monthKey].push(record)
  })

  // 获取所有有记录的月份
  const monthsWithData = Object.keys(groups).sort()

  if (monthsWithData.length === 0) {
    return []
  }

  // 生成从第一个有记录的月份到最后一个有记录的月份之间的所有月份
  const firstMonth = new Date(monthsWithData[0] + '-01')
  const lastMonth = new Date(monthsWithData[monthsWithData.length - 1] + '-01')

  const allMonthKeys = []
  const current = new Date(firstMonth)

  while (current <= lastMonth) {
    const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
    allMonthKeys.push(monthKey)
    current.setMonth(current.getMonth() + 1)
  }

  return allMonthKeys.map(key => ({
    key,
    label: key.replace('-', '年') + '月',
    records: groups[key] || []
  }))
})

// 按日期分组
const groupRecordsByDate = (records) => {
  const groups = {}
  records.forEach(record => {
    const date = new Date(record.date)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    if (!groups[dateStr]) {
      groups[dateStr] = []
    }
    groups[dateStr].push(record)
  })
  return groups
}

// 获取心情标签
const getMoodLabel = (mood) => {
  const moodMap = {
    happy: '开心',
    sad: '难过',
    angry: '生气',
    calm: '平静',
    excited: '兴奋',
    tired: '疲惫',
    anxious: '焦虑',
    hopeful: '充满希望'
  }
  return moodMap[mood] || '未知'
}

// 初始化音频系统
const initAudio = () => {
  try {
    // 创建音频上下文
    audioContext = new (window.AudioContext || window.webkitAudioContext)()

    // 恢复音频上下文（如果被挂起）
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    // 创建音频监听器
    const listener = new THREE.AudioListener()
    camera.add(listener)

    // 加载并播放环境音
    loadAmbientAudio(listener)

    // 加载蜜蜂声音
    loadBeeAudio(listener)

    console.log('音频系统初始化成功')
  } catch (error) {
    console.warn('音频初始化失败:', error)
  }
}

// 加载环境音
const loadAmbientAudio = (listener) => {
  const audioLoader = new THREE.AudioLoader()

  audioLoader.load('/audio/340073__klankbeeld__citygarden6pm-nl-160317_02.ogg', (buffer) => {
    // 创建环境音源
    ambientSource = new THREE.Audio(listener)
    ambientSource.setBuffer(buffer)
    ambientSource.setLoop(true)
    ambientSource.setVolume(ambientVolume.value) // 使用动态音量控制
    ambientSource.play()

    console.log('环境音加载成功')
  }, undefined, (error) => {
    console.warn('环境音加载失败，可能是文件不存在:', error)
  })
}

// 加载蜜蜂声音
const loadBeeAudio = (listener) => {
  const audioLoader = new THREE.AudioLoader()

  audioLoader.load('/audio/588519__felixblume__bee-recorded-individually-zaline.wav', (buffer) => {
    // 在不同位置创建多个蜜蜂声音源
    const beePositions = [
      new THREE.Vector3(0, 5, 0),
      new THREE.Vector3(50, 8, 30),
      new THREE.Vector3(-40, 6, -50),
      new THREE.Vector3(70, 7, -20)
    ]

    beePositions.forEach((position, index) => {
      // 创建蜜蜂音源
      const bee = new THREE.PositionalAudio(listener)
      bee.setBuffer(buffer)
      bee.setLoop(true)
      bee.setRefDistance(30)  // 参考距离（距离30处音量开始衰减）
      bee.setMaxDistance(150)  // 最大距离（超过此距离无法听到）
      bee.setRolloffFactor(2)  // 衰减因子（2表示快速衰减）
      bee.setVolume(beeVolume.value) // 使用动态音量控制（原来的1/4）
      bee.play()

      // 保存蜜蜂音源和位置
      beePanners.push({
        audio: bee,
        position: position
      })

      console.log(`蜜蜂${index + 1}加载成功，位置:`, position)
    })
  }, undefined, (error) => {
    console.warn('蜜蜂声音加载失败，可能是文件不存在:', error)
  })
}

// 更新音频音量（根据摄像机距离和用户设置）
const updateAudioVolume = () => {
  if (!camera || !audioContext) return

  // 静音状态检查
  const finalAmbientVolume = isMuted.value ? 0 : ambientVolume.value
  const finalBeeVolume = isMuted.value ? 0 : beeVolume.value

  // 更新环境音量（变化平缓）
  if (ambientSource) {
    const distance = camera.position.length()
    const maxDistance = 400
    const minDistance = 80

    // 环境音量变化平缓（线性插值），结合用户设置的基础音量
    let volumeFactor = 1 - (distance - minDistance) / (maxDistance - minDistance)
    volumeFactor = Math.max(0.5, Math.min(1, volumeFactor))
    ambientSource.setVolume(finalAmbientVolume * volumeFactor)
  }

  // 更新蜜蜂声音位置和音量（明显距离效果）
  if (beePanners.length > 0) {
    beePanners.forEach(bee => {
      const distance = camera.position.distanceTo(bee.position)
      bee.audio.position.copy(bee.position)
      // 空间音频会自动根据距离衰减，这里设置基础音量
      bee.audio.setVolume(finalBeeVolume)
    })
  }
}

// 花朵摇摆效果
const applyWindToFlowers = () => {
  const time = Date.now() * 0.001
  const windSpeed = 1 + windIntensity.value * 2 // 风力越大，摇摆越快

  flowers3D.forEach((flower, index) => {
    if (!flower.visible) return

    // 每个花朵有不同的摇摆相位
    const phase = index * 0.5

    // 计算摇摆角度
    const swayAngle = Math.sin(time * windSpeed + phase) * windIntensity.value * 0.3

    // 应用摇摆旋转（绕X轴和Z轴）
    flower.rotation.x = Math.sin(time * windSpeed * 0.7 + phase) * windIntensity.value * 0.15
    flower.rotation.z = swayAngle

    // 稍微影响Y轴旋转（风力偏转）
    flower.rotation.y = Math.cos(time * windSpeed * 0.5 + phase) * windIntensity.value * 0.1
  })
}

// 格式化详细日期
const formatDetailDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 根据月份获取季节
const getSeasonFromMonth = (monthKey) => {
  // monthKey 格式: "2025-02"
  const month = parseInt(monthKey.split('-')[1])

  if ([3, 4, 5].includes(month)) {
    return 'spring' // 3-5月：春
  } else if ([6, 7, 8].includes(month)) {
    return 'summer' // 6-8月：夏
  } else if ([9, 10, 11].includes(month)) {
    return 'autumn' // 9-11月：秋
  } else {
    return 'winter' // 12-2月：冬
  }
}

// 选择月份
const selectMonth = (index) => {
  currentMonthIndex.value = index
  const monthData = allMonths.value[index]
  const targetX = index * 150

  // 根据月份自动设置季节
  const targetSeason = getSeasonFromMonth(monthData.key)
  if (season.value !== targetSeason) {
    setSeason(targetSeason)
  }

  // 平滑移动摄像机
  targetCameraPosition = new THREE.Vector3(targetX, 80, 120)
  targetLookAt = new THREE.Vector3(targetX, 0, 0)
}

// 初始化 Three.js 场景
const initThreeJS = () => {
  const container = canvasContainer.value
  const width = container.clientWidth
  const height = container.clientHeight

  // 创建场景
  scene = new THREE.Scene()

  // 创建摄像机
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000)
  camera.position.set(0, 80, 120)
  camera.lookAt(0, 0, 0)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  // 使用 OrbitControls 实现旋转、缩放、平移
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 30
  controls.maxDistance = 300
  controls.maxPolarAngle = Math.PI / 2.2
  controls.enablePan = true
  controls.panSpeed = 1.0
  controls.rotateSpeed = 0.5
  controls.zoomSpeed = 1.0

  // 交换左右键功能：右键旋转，左键平移
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE
  }

  // 设置初始目标点
  controls.target.set(0, 0, 0)

  // 创建起伏地形
  createTerrain()

  // 创建天空盒
  createSkyBox()

  // 添加光照
  addLights()

  // 创建天体系统
  createCelestialBodies()

  // 初始化音频系统
  initAudio()

  // 创建所有月份的日历
  createAllMonthCalendars()

  // 更新季节环境（地形颜色、天空颜色、光照）
  updateTerrainColors(season.value)
  updateSkyColor()
  updateLights()
  updateCelestialBodies()

  // 添加事件监听
  window.addEventListener('resize', onWindowResize)
  renderer.domElement.addEventListener('click', onCanvasClick)
  renderer.domElement.addEventListener('mousemove', onCanvasMouseMove)

  // 开始动画
  animate()
}

// 创建起伏地形
const createTerrain = () => {
  const terrainWidth = 1000
  const terrainDepth = 1000
  const segmentsX = 200
  const segmentsZ = 200

  const geometry = new THREE.PlaneGeometry(terrainWidth, terrainDepth, segmentsX, segmentsZ)

  // 程序化生成地形高度（起伏效果）
  const vertices = geometry.attributes.position.array
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i]
    const z = vertices[i + 1]

    // 叠加多个正弦波创建自然起伏
    let height = 0
    height += Math.sin(x * 0.01) * Math.cos(z * 0.01) * 5  // 大起伏
    height += Math.sin(x * 0.03 + z * 0.02) * 2           // 中起伏
    height += Math.sin(x * 0.05) * Math.cos(z * 0.05) * 1 // 小起伏
    height += (Math.random() - 0.5) * 0.5                 // 随机噪点

    vertices[i + 2] = height // Y轴高度
  }

  geometry.computeVertexNormals()

  // 地形材质 - 使用顶点颜色实现季节效果
  const material = new THREE.MeshPhongMaterial({
    vertexColors: true,
    flatShading: true,
    side: THREE.DoubleSide
  })

  // 初始化地形颜色（春季）
  updateTerrainColors(season.value)

  terrainMesh = new THREE.Mesh(geometry, material)
  terrainMesh.rotation.x = -Math.PI / 2
  terrainMesh.position.y = -5
  scene.add(terrainMesh)
}

// 更新地形颜色（根据季节）
const updateTerrainColors = (currentSeason) => {
  if (!terrainMesh) return

  const colors = new Float32Array(terrainMesh.geometry.attributes.position.count * 3)
  const vertices = terrainMesh.geometry.attributes.position.array

  const seasonColorSchemes = {
    spring: {
      low: new THREE.Color(0x7CBA3D),      // 鲜绿
      mid: new THREE.Color(0x8FBC8F),      // 浅绿
      high: new THREE.Color(0x90EE90),     // 嫩绿
      accent: new THREE.Color(0xFFB7C5)    // 粉色点缀（樱花）
    },
    summer: {
      low: new THREE.Color(0x228B22),      // 深绿
      mid: new THREE.Color(0x32CD32),      // 绿色
      high: new THREE.Color(0x90EE90),     // 浅绿
      accent: new THREE.Color(0xFFD700)    // 金黄色点缀
    },
    autumn: {
      low: new THREE.Color(0x8B4513),      // 棕色
      mid: new THREE.Color(0xD2691E),      // 橙棕色
      high: new THREE.Color(0xFF8C00),     // 橙色
      accent: new THREE.Color(0xFFD700)    // 金黄色
    },
    winter: {
      low: new THREE.Color(0xFFFFFF),      // 白色
      mid: new THREE.Color(0xF0F8FF),      // 淡白
      high: new THREE.Color(0xE6E6FA),     // 淡紫白
      accent: new THREE.Color(0xADD8E6)    // 淡蓝点缀
    }
  }

  const scheme = seasonColorSchemes[currentSeason]

  for (let i = 0, j = 0; i < vertices.length; i += 3, j += 3) {
    const height = vertices[i + 2] // 地形高度

    // 根据高度插值颜色
    const normalizedHeight = (height + 5) / 10 // 归一化高度
    let color

    if (normalizedHeight < 0.33) {
      color = scheme.low.clone().lerp(scheme.mid, normalizedHeight * 3)
    } else if (normalizedHeight < 0.66) {
      color = scheme.mid.clone().lerp(scheme.high, (normalizedHeight - 0.33) * 3)
    } else {
      color = scheme.high.clone().lerp(scheme.accent, (normalizedHeight - 0.66) * 3)
    }

    // 随机添加点缀色
    if (Math.random() < 0.05) {
      color = scheme.accent
    }

    colors[j] = color.r
    colors[j + 1] = color.g
    colors[j + 2] = color.b
  }

  terrainMesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
}

// 创建天空盒（使用渐变球体模拟）
const createSkyBox = () => {
  const skyGeometry = new THREE.SphereGeometry(500, 32, 32)
  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xffffff) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide
  })

  skyBox = new THREE.Mesh(skyGeometry, skyMaterial)
  scene.add(skyBox)

  // 设置初始天空颜色
  updateSkyColor()
}

// 更新天空颜色（根据日夜和季节）
const updateSkyColor = () => {
  if (!skyBox) return

  const colorSchemes = {
    day: {
      spring: { top: 0x87CEEB, bottom: 0xE0F7FA },    // 春日蓝天
      summer: { top: 0x4169E1, bottom: 0x87CEEB },    // 夏日深蓝
      autumn: { top: 0xFFA500, bottom: 0xFFFFE0 },    // 秋日橙天
      winter: { top: 0xB0C4DE, bottom: 0xF0F8FF }     // 冬日灰蓝
    },
    night: {
      spring: { top: 0x191970, bottom: 0x2F2F4F },    // 春夜深蓝
      summer: { top: 0x00008B, bottom: 0x191970 },    // 夏夜深蓝
      autumn: { top: 0x483D8B, bottom: 0x696969 },    // 秋夜紫灰
      winter: { top: 0x0F0F23, bottom: 0x1C1C3D }     // 冬夜深紫
    }
  }

  const scheme = colorSchemes[timeOfDay.value][season.value]
  skyBox.material.uniforms.topColor.value.setHex(scheme.top)
  skyBox.material.uniforms.bottomColor.value.setHex(scheme.bottom)
}

// 添加光照（根据日夜模式调整）
const addLights = () => {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  // 主光源（太阳/月亮）
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
  directionalLight.position.set(50, 100, 50)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // 填充光
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
  fillLight.position.set(-50, 50, -50)
  scene.add(fillLight)

  // 更新光照
  updateLights()
}

// 更新光照（根据日夜和天气）
const updateLights = () => {
  scene.traverse((object) => {
    if (object.isAmbientLight) {
      // 环境光强度根据日夜调整
      object.intensity = timeOfDay.value === 'day' ? 0.4 : 0.15
    } else if (object.isDirectionalLight) {
      // 主光源颜色和强度
      if (timeOfDay.value === 'day') {
        object.intensity = weather.value === 'rain' || weather.value === 'snow' ? 0.6 : 1.0
        object.color.setHex(0xffffff)
      } else {
        object.intensity = 0.3
        object.color.setHex(0x4169E1) // 月光蓝
      }
    }
  })

  // 更新雾效
  scene.fog = null
  if (weather.value === 'rain') {
    scene.fog = new THREE.FogExp2(0x888888, 0.003)
  } else if (weather.value === 'snow') {
    scene.fog = new THREE.FogExp2(0xE0E0E0, 0.002)
  }
}

// 创建天体系统（太阳、月亮、乌云）
const createCelestialBodies = () => {
  // 创建太阳
  const sunGeometry = new THREE.SphereGeometry(20, 32, 32)
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFDD00,
    transparent: true,
    opacity: 0.95
  })
  sunMesh = new THREE.Mesh(sunGeometry, sunMaterial)
  sunMesh.position.set(100, 120, -150)
  scene.add(sunMesh)

  // 太阳光晕
  const sunGlowGeometry = new THREE.SphereGeometry(35, 32, 32)
  const sunGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFF99,
    transparent: true,
    opacity: 0.4,
    side: THREE.BackSide
  })
  const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial)
  sunMesh.add(sunGlow)

  // 创建月亮
  const moonGeometry = new THREE.SphereGeometry(18, 32, 32)
  const moonMaterial = new THREE.MeshBasicMaterial({
    color: 0xE6E6FA,
    transparent: true,
    opacity: 0.95
  })
  moonMesh = new THREE.Mesh(moonGeometry, moonMaterial)
  moonMesh.position.set(-100, 120, -150)
  moonMesh.visible = false // 初始隐藏
  scene.add(moonMesh)

  // 月亮光晕
  const moonGlowGeometry = new THREE.SphereGeometry(30, 32, 32)
  const moonGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
  })
  const moonGlow = new THREE.Mesh(moonGlowGeometry, moonGlowMaterial)
  moonMesh.add(moonGlow)

  // 创建太阳光源
  sunLight = new THREE.PointLight(0xFFDD00, 1.5, 500)
  sunLight.position.copy(sunMesh.position)
  scene.add(sunLight)

  // 创建月亮光源
  moonLight = new THREE.PointLight(0xE6E6FA, 0.5, 500)
  moonLight.position.copy(moonMesh.position)
  moonLight.visible = false
  scene.add(moonLight)

  console.log('天体系统创建完成:', { sunMesh, moonMesh, sunLight, moonLight })

  // 创建乌云
  createClouds()
}

// 创建乌云
const createClouds = () => {
  // 清除旧云
  clouds.forEach(cloud => {
    scene.remove(cloud)
  })
  clouds = []

  // 只有雨天显示乌云
  if (weather.value !== 'rain') return

  // 创建多个云朵
  const cloudCount = 8
  for (let i = 0; i < cloudCount; i++) {
    const cloud = createSingleCloud()
    cloud.position.set(
      (Math.random() - 0.5) * 600,
      140 + Math.random() * 40,
      (Math.random() - 0.5) * 300 - 150
    )
    cloud.userData = {
      speed: 0.02 + Math.random() * 0.03,
      initialX: cloud.position.x
    }
    scene.add(cloud)
    clouds.push(cloud)
  }
}

// 创建单个云朵
const createSingleCloud = () => {
  const cloudGroup = new THREE.Group()

  // 云朵由多个球体组成
  const cloudParts = 5 + Math.floor(Math.random() * 3)
  for (let i = 0; i < cloudParts; i++) {
    const size = 25 + Math.random() * 15
    const geometry = new THREE.SphereGeometry(size, 16, 16)
    const material = new THREE.MeshBasicMaterial({
      color: 0x666666,
      transparent: true,
      opacity: 0.8
    })
    const part = new THREE.Mesh(geometry, material)
    part.position.set(
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 25
    )
    cloudGroup.add(part)
  }

  return cloudGroup
}

// 更新天体显示
const updateCelestialBodies = () => {
  if (!sunMesh || !moonMesh) return

  const isDay = timeOfDay.value === 'day'
  const isRain = weather.value === 'rain'
  const isSnow = weather.value === 'snow'

  // 显示/隐藏太阳
  if (isDay) {
    sunMesh.visible = !isRain
    sunLight.visible = !isRain

    // 晴天：正常太阳；雪天：柔和太阳
    if (isSnow) {
      sunMesh.material.opacity = 0.5
      sunMesh.material.color.setHex(0xFFFFCC)
      sunLight.intensity = 0.6
    } else {
      sunMesh.material.opacity = 0.9
      sunMesh.material.color.setHex(0xFFDD00)
      sunLight.intensity = 1.5
    }
  } else {
    sunMesh.visible = false
    sunLight.visible = false
  }

  // 显示/隐藏月亮
  if (!isDay) {
    moonMesh.visible = true
    moonLight.visible = true

    // 雪天：柔和月亮
    if (isSnow) {
      moonMesh.material.opacity = 0.6
      moonLight.intensity = 0.3
    } else {
      moonMesh.material.opacity = 0.9
      moonLight.intensity = 0.5
    }
  } else {
    moonMesh.visible = false
    moonLight.visible = false
  }

  // 更新云朵（只在雨天显示）
  if (isRain && clouds.length === 0) {
    createClouds()
  } else if (!isRain && clouds.length > 0) {
    clouds.forEach(cloud => {
      scene.remove(cloud)
    })
    clouds = []
  }

  console.log('天体更新:', { isDay, isRain, isSnow, sunVisible: sunMesh.visible, moonVisible: moonMesh.visible })
}

// 动画云朵
const animateClouds = () => {
  if (clouds.length === 0) return

  const time = Date.now() * 0.001
  clouds.forEach(cloud => {
    if (cloud.userData.speed) {
      // 缓慢移动云朵
      cloud.position.x += cloud.userData.speed
      // 循环移动
      if (cloud.position.x > 350) {
        cloud.position.x = -350
      }
      // 轻微上下浮动
      cloud.position.y += Math.sin(time + cloud.position.x * 0.01) * 0.02
    }
  })
}

// 创建天气粒子系统（雨/雪）
const createWeatherParticles = () => {
  if (weatherParticles) {
    scene.remove(weatherParticles)
    weatherParticles.geometry.dispose()
    weatherParticles.material.dispose()
  }

  if (weather.value === 'clear') {
    weatherParticles = null
    return
  }

  const particleCount = weather.value === 'rain' ? 15000 : 8000
  const positions = new Float32Array(particleCount * 3)
  const velocities = new Float32Array(particleCount)

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 800 // X
    positions[i * 3 + 1] = Math.random() * 300      // Y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 500 // Z

    // 下落速度
    if (weather.value === 'rain') {
      velocities[i] = 2 + Math.random() * 3 // 雨滴速度快
    } else {
      velocities[i] = 0.3 + Math.random() * 0.5 // 雪花速度慢
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.userData.velocities = velocities

  let material
  if (weather.value === 'rain') {
    material = new THREE.PointsMaterial({
      color: 0xAAAAAA,
      size: 0.5,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
  } else {
    material = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 2,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    })
  }

  weatherParticles = new THREE.Points(geometry, material)
  scene.add(weatherParticles)
}

// 创建所有月份的日历
const createAllMonthCalendars = () => {
  console.log('创建所有月份的日历，共', allMonths.value.length, '个月份')
  allMonths.value.forEach((monthData, monthIndex) => {
    console.log(`创建 ${monthData.label} 的日历，记录数:`, monthData.records.length)
    createMonthCalendar(monthData, monthIndex)
  })
}

// 创建单个月份的日历
const createMonthCalendar = (monthData, monthIndex) => {
  const records = monthData.records
  const recordsByDate = groupRecordsByDate(records)

  // 获取该月的天数
  const date = new Date(monthData.key + '-01')
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const monthGrid = []
  const offsetX = monthIndex * 150

  // 创建方形格子（每行7天）
  const cellSize = 12
  const spacing = 3
  const cols = 7
  const rows = Math.ceil(daysInMonth / cols)

  const startX = offsetX - ((cellSize * cols + spacing * (cols - 1)) / 2)
  const startZ = -((cellSize * rows + spacing * (rows - 1)) / 2)

  console.log(`${monthData.label} - 天数: ${daysInMonth}, 行数: ${rows}, 起始X: ${startX}`)

  for (let day = 1; day <= daysInMonth; day++) {
    const col = (day - 1) % cols
    const row = Math.floor((day - 1) / cols)

    const dateStr = `${monthData.key}-${String(day).padStart(2, '0')}`
    const dayRecords = recordsByDate[dateStr] || []

    // 创建格子底座
    const tileGeometry = new THREE.BoxGeometry(cellSize, 0.5, cellSize)
    const tileMaterial = new THREE.MeshPhongMaterial({
      color: dayRecords.length > 0 ? 0xFFFFFF : 0xF0F0F0,
      transparent: true,
      opacity: dayRecords.length > 0 ? 0.25 : 0.08
    })
    const tile = new THREE.Mesh(tileGeometry, tileMaterial)
    tile.position.set(
      startX + col * (cellSize + spacing) + cellSize / 2,
      0,
      startZ + row * (cellSize + spacing) + cellSize / 2
    )
    tile.receiveShadow = true
    tile.userData = {
      date: dateStr,
      records: dayRecords
    }
    scene.add(tile)
    monthGrid.push(tile)
    gardenGrids.push(tile)

    // 创建漂浮的日期标签
    if (dayRecords.length > 0) {
      createDateLabel(day, monthData.key, tile.position, tile, dayRecords.length)
    }

    // 创建该日期的所有花朵
    if (dayRecords.length > 0) {
      createFlowersForDate(dayRecords, tile.position)
    }
  }
}

// 创建漂浮的日期标签
const createDateLabel = (day, monthKey, tilePosition, tile, recordCount) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = 1024
  canvas.height = 1024

  // 清除画布
  context.clearRect(0, 0, canvas.width, canvas.height)

  // 解析月份信息（从 "2025-02" 格式）
  const year = monthKey.split('-')[0]
  const month = monthKey.split('-')[1]
  const dateText = `${month}.${day.toString().padStart(2, '0')}` // 格式：02.15

  const centerX = 512
  const centerY = 512
  const radius = 320

  // 绘制半透明背景圆球（增强与背景的对比）
  const sphereGradient = context.createRadialGradient(
    centerX - 80, centerY - 80, 0,
    centerX, centerY, radius
  )
  sphereGradient.addColorStop(0, 'rgba(40, 60, 100, 0.7)')     // 中心深色
  sphereGradient.addColorStop(0.4, 'rgba(60, 90, 140, 0.55)')  // 中间深蓝色
  sphereGradient.addColorStop(0.7, 'rgba(80, 120, 180, 0.4)') // 外层
  sphereGradient.addColorStop(1, 'rgba(100, 140, 200, 0.25)') // 边缘更淡

  context.fillStyle = sphereGradient
  context.beginPath()
  context.arc(centerX, centerY, radius, 0, Math.PI * 2)
  context.fill()

  // 绘制内发光环（增强轮廓）
  const glowRing = context.createRadialGradient(
    centerX, centerY, radius - 40,
    centerX, centerY, radius + 15
  )
  glowRing.addColorStop(0, 'rgba(150, 180, 255, 0)')
  glowRing.addColorStop(0.7, 'rgba(180, 210, 255, 0.4)')
  glowRing.addColorStop(1, 'rgba(200, 230, 255, 0)')

  context.fillStyle = glowRing
  context.beginPath()
  context.arc(centerX, centerY, radius + 15, 0, Math.PI * 2)
  context.fill()

  // 绘制边框（增强轮廓清晰度）
  context.strokeStyle = 'rgba(200, 230, 255, 0.6)'
  context.lineWidth = 4
  context.beginPath()
  context.arc(centerX, centerY, radius, 0, Math.PI * 2)
  context.stroke()

  // 绘制光晕粒子（减少数量，更精细）
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2
    const particleRadius = 280 + Math.random() * 50
    const x = centerX + Math.cos(angle) * particleRadius
    const y = centerY + Math.sin(angle) * particleRadius
    const particleSize = Math.random() * 3 + 1
    const alpha = Math.random() * 0.5 + 0.25

    context.fillStyle = `rgba(200, 230, 255, ${alpha})`
    context.beginPath()
    context.arc(x, y, particleSize, 0, Math.PI * 2)
    context.fill()
  }

  // 绘制高光点（增强立体感）
  const highlightGradient = context.createRadialGradient(
    centerX - 90, centerY - 90, 0,
    centerX - 90, centerY - 90, 60
  )
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

  context.fillStyle = highlightGradient
  context.beginPath()
  context.arc(centerX - 90, centerY - 90, 60, 0, Math.PI * 2)
  context.fill()

  // 绘制文字阴影层（增强清晰度）
  context.shadowColor = 'rgba(0, 0, 0, 0.9)'
  context.shadowBlur = 30
  context.shadowOffsetX = 4
  context.shadowOffsetY = 4

  // 绘制日期文字（使用白色，更粗，更大）
  context.fillStyle = '#FFFFFF'
  context.font = 'bold 260px Arial, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(dateText, centerX + 2, centerY + 2)

  // 绘制文字发光层（在阴影之上）
  context.shadowColor = 'rgba(200, 230, 255, 0.8)'
  context.shadowBlur = 40
  context.shadowOffsetX = 0
  context.shadowOffsetY = 0

  // 再次绘制文字（叠加发光）
  context.fillText(dateText, centerX, centerY)

  // 清除阴影，绘制最上层文字（确保最清晰）
  context.shadowColor = 'transparent'
  context.shadowBlur = 0

  // 绘制最上层文字（白色，最清晰）
  context.fillStyle = '#FFFFFF'
  context.fillText(dateText, centerX, centerY)

  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending
  })
  const sprite = new THREE.Sprite(material)
  // 日期球高度：在花朵上方一点点（花朵高度15）
  sprite.position.set(tilePosition.x, 18, tilePosition.z)
  sprite.scale.set(7, 7, 1)
  sprite.userData = {
    baseY: 18,
    floatOffset: Math.random() * Math.PI * 2,
    floatSpeed: 0.8 + Math.random() * 0.4,
    glowSpeed: 1.2 + Math.random() * 0.6
  }
  scene.add(sprite)
  dateLabels.push(sprite)

  // 在格子底部创建发光数字（显示记录数）
  if (recordCount > 0) {
    createGlowingNumberOnTile(tile, recordCount)
  }
}

// 在格子底部创建发光数字（放在右下角，平铺贴在格子表面）
const createGlowingNumberOnTile = (tile, recordCount) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = 256
  canvas.height = 256

  // 清除画布
  context.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制发光效果
  context.shadowColor = 'rgba(255, 255, 255, 1)'
  context.shadowBlur = 20

  // 绘制数字（右下角位置）
  context.fillStyle = 'rgba(255, 255, 255, 1)'
  context.font = 'bold 150px Arial'
  context.textAlign = 'right'
  context.textBaseline = 'bottom'
  context.fillText(recordCount.toString(), 240, 240)

  const texture = new THREE.CanvasTexture(canvas)

  // 使用PlaneGeometry而不是Sprite，让数字平贴在格子表面
  const geometry = new THREE.PlaneGeometry(4, 4)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  const mesh = new THREE.Mesh(geometry, material)

  // 数字平铺在格子右下角，正好在格子表面上方一点点
  mesh.position.set(
    tile.position.x + 3.5, // 格子中心向右偏移3.5
    0.26, // 格子表面上方一点点（格子高度0.5，表面在0.25）
    tile.position.z + 3.5 // 格子中心向前偏移3.5
  )
  mesh.rotation.x = -Math.PI / 2 // 旋转90度，让平面平贴在格子表面

  scene.add(mesh)
  dateLabels.push(mesh)
}

// 为某一天创建所有花朵（确保所有花都在格子内）
const createFlowersForDate = async (records, tilePosition) => {
  const flowerCount = records.length
  const cellSize = 12 // 格子大小
  const margin = 1.5 // 花朵距离边缘的边距
  const availableWidth = cellSize - margin * 2 // 可用宽度
  const availableDepth = cellSize - margin * 2 // 可用深度

  records.forEach((record, index) => {
    let x, z

    if (flowerCount === 1) {
      // 只有1朵花，放在格子中心
      x = tilePosition.x
      z = tilePosition.z
    } else if (flowerCount <= 3) {
      // 2-3朵花，沿对角线排列
      const spacing = availableWidth / (flowerCount - 1)
      x = tilePosition.x - availableWidth / 2 + index * spacing
      z = tilePosition.z - availableDepth / 2 + index * spacing
    } else if (flowerCount <= 6) {
      // 4-6朵花，按2行3列或3行2列排列
      const cols = flowerCount <= 4 ? 2 : 3
      const rows = Math.ceil(flowerCount / cols)
      const colSpacing = availableWidth / (cols - 1 || 1)
      const rowSpacing = availableDepth / (rows - 1 || 1)

      const col = index % cols
      const row = Math.floor(index / cols)

      x = tilePosition.x - availableWidth / 2 + col * colSpacing
      z = tilePosition.z - availableDepth / 2 + row * rowSpacing
    } else {
      // 7朵及以上，按圆形均匀分布
      const radius = Math.min(availableWidth, availableDepth) / 2
      const angle = (index / flowerCount) * Math.PI * 2

      x = tilePosition.x + Math.cos(angle) * radius * 0.7
      z = tilePosition.z + Math.sin(angle) * radius * 0.7
    }

    const position = new THREE.Vector3(x, 0, z)
    loadAndCreateFlower(record, position)
  })
}

// 加载并创建花朵
const loadAndCreateFlower = (record, position) => {
  // 从 localStorage 获取自定义配置，如果没有则使用默认配置
  let flowerModelConfig
  try {
    const savedConfig = localStorage.getItem('gardenLibraryConfig')
    if (savedConfig) {
      flowerModelConfig = JSON.parse(savedConfig)
    }
  } catch (e) {
    console.error('读取花园配置失败:', e)
  }

  // 获取模型文件名
  const modelFile = flowerModelConfig?.[record.mood] || defaultMoodFlowerModels[record.mood]

  if (!modelFile) {
    console.error(`未找到情绪 ${record.mood} 对应的花卉模型，记录：`, record)
    return
  }

  const loader = new GLTFLoader()
  loader.load(
    `/models/${modelFile}`,
    (gltf) => {
      const model = gltf.scene

      // 确保模型有正确的材质和颜色
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true

          // 如果材质没有颜色，根据情绪设置默认颜色
          const moodColors = {
            happy: 0xFFD700,      // 金黄色
            sad: 0x4169E1,       // 深蓝色
            angry: 0xFF4500,      // 红色
            calm: 0x98FB98,      // 浅绿色
            excited: 0xFF69B4,   // 粉色
            tired: 0x9370DB,     // 紫色
            anxious: 0xFFA500,    // 橙色
            hopeful: 0x90EE90     // 淡绿色
          }

          if (child.material && !child.material.color) {
            child.material.color = new THREE.Color(moodColors[record.mood] || 0xFFFFFF)
          }
        }
      })

      // 调整花朵大小使其种在格子上
      // 获取模型的边界框（缩放前）
      const box = new THREE.Box3().setFromObject(model)
      const originalHeight = box.max.y - box.min.y
      const originalBottomY = box.min.y

      // 放大花朵到目标高度15
      const targetHeight = 15
      const scale = targetHeight / originalHeight
      model.scale.setScalar(scale)

      model.position.copy(position)

      // 其他花朵的正常处理：将花朵底部对齐到格子表面
      let calculatedY = 0.25 - originalBottomY * scale

      // 特殊处理：如果计算出的Y值异常（如NaN或Infinity），强制设置为0.25
      if (!isFinite(calculatedY) || Math.abs(calculatedY) > 50) {
        console.warn(`花朵Y位置异常: ${record.mood}, 重置为0.25`)
        calculatedY = 0.25
      }

      model.position.y = calculatedY

      console.log(`加载花朵模型: ${record.mood}, 文件: ${modelFile}, 高度: ${originalHeight.toFixed(2)}, 底部Y: ${originalBottomY.toFixed(2)}, 缩放: ${scale.toFixed(2)}, 位置Y: ${model.position.y.toFixed(2)}`)

      model.userData = { record }
      flowers3D.push(model)
      scene.add(model)

      // 添加生长动画
      const finalScale = model.scale.clone()
      model.scale.set(0, 0, 0)
      animateFlowerGrow(model, finalScale)
    },
    (xhr) => {
      // 加载进度
      if (xhr.lengthComputable) {
        const percent = (xhr.loaded / xhr.total * 100).toFixed(1)
        console.log(`加载 ${modelFile}: ${percent}%`)
      }
    },
    (error) => {
      console.error(`加载花卉模型失败 (${modelFile}):`, error)
    }
  )
}

// 花朵生长动画
const animateFlowerGrow = (flower, finalScale) => {
  const duration = 800
  const startTime = Date.now()

  const grow = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const scaleValue = easeOutElastic(progress)
    flower.scale.setScalar(finalScale.x * scaleValue)

    if (progress < 1) {
      requestAnimationFrame(grow)
    }
  }
  grow()
}

// 缓动函数
const easeOutElastic = (x) => {
  const c4 = (2 * Math.PI) / 3
  return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
}

// 鼠标悬停检测
const onCanvasMouseMove = (event) => {
  // 确保音频上下文已恢复
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume()
  }

  const rect = renderer.domElement.getBoundingClientRect()
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  // 只检测可见的花朵（筛选后隐藏的花朵无法悬停）
  const visibleFlowers = flowers3D.filter(flower => flower.visible)
  const flowerIntersects = raycaster.intersectObjects(visibleFlowers, true)
  let targetFlower = null

  if (flowerIntersects.length > 0) {
    let target = flowerIntersects[0].object
    // 向上查找 group
    while (target.parent && !target.userData.record) {
      target = target.parent
    }
    if (target.userData.record) {
      targetFlower = target
    }
  }

  // 只有当悬停的花朵改变时才更新
  if (hoveredFlower.value !== targetFlower) {
    // 取消之前悬停花朵的高亮
    if (hoveredFlower.value) {
      unhighlightFlower(hoveredFlower.value)
    }

    hoveredFlower.value = targetFlower

    // 高亮新的悬停花朵
    if (hoveredFlower.value) {
      highlightFlower(hoveredFlower.value)
    }
  }
}

// 点击检测
const onCanvasClick = (event) => {
  // 确保音频上下文已恢复
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume()
  }

  const rect = renderer.domElement.getBoundingClientRect()
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  // 只检测可见的花朵（筛选后隐藏的花朵无法点击）
  const visibleFlowers = flowers3D.filter(flower => flower.visible)
  const flowerIntersects = raycaster.intersectObjects(visibleFlowers, true)
  if (flowerIntersects.length > 0) {
    let target = flowerIntersects[0].object
    // 向上查找 group
    while (target.parent && !target.userData.record) {
      target = target.parent
    }
    if (target.userData.record) {
      selectedRecord.value = target.userData.record
      return
    }
  }
}

// 高亮选中的花朵
const highlightFlower = (flower) => {
  // 保存原始缩放
  if (!flower.userData.originalScale) {
    flower.userData.originalScale = flower.scale.clone()
  }

  // 创建光圈效果（围绕花朵的魔法光圈）
  if (!flower.userData.glowSprite) {
    createFlowerGlow(flower)
  }

  // 显示光圈
  if (flower.userData.glowSprite) {
    flower.userData.glowSprite.visible = true
  }

  // 开始轻微的放大动画
  animateFlowerHighlight(flower)
}

// 为花朵创建光圈效果
const createFlowerGlow = (flower) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = 256
  canvas.height = 256

  // 创建径向渐变（魔法光圈）
  const centerX = 128
  const centerY = 128

  // 外层光晕（柔和的魔法氛围）
  const outerGlow = context.createRadialGradient(centerX, centerY, 30, centerX, centerY, 120)
  outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
  outerGlow.addColorStop(0.3, 'rgba(255, 200, 150, 0.2)')
  outerGlow.addColorStop(0.6, 'rgba(200, 150, 255, 0.1)')
  outerGlow.addColorStop(1, 'rgba(150, 100, 255, 0)')

  context.fillStyle = outerGlow
  context.beginPath()
  context.arc(centerX, centerY, 120, 0, Math.PI * 2)
  context.fill()

  // 添加魔法粒子点缀
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 50 + Math.random() * 50
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    const size = Math.random() * 3 + 1

    context.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`
    context.beginPath()
    context.arc(x, y, size, 0, Math.PI * 2)
    context.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  const glowSprite = new THREE.Sprite(material)

  // 获取花朵的边界框
  const box = new THREE.Box3().setFromObject(flower)
  const flowerCenter = new THREE.Vector3()
  box.getCenter(flowerCenter)

  // 光圈放置在花朵中心
  glowSprite.position.copy(flowerCenter)
  // 光圈在花朵底部一点点的位置
  glowSprite.position.y = box.min.y + 0.5

  // 光圈大小根据花朵大小调整
  const flowerSize = box.max.x - box.min.x
  glowSprite.scale.set(flowerSize * 2.5, flowerSize * 2.5, 1)

  // 将光圈添加到花朵的父级（场景），而不是花朵本身
  if (flower.parent) {
    flower.parent.add(glowSprite)
  } else {
    scene.add(glowSprite)
  }

  // 保存光圈引用
  flower.userData.glowSprite = glowSprite
  flower.userData.glowVisible = false

  // 保存光圈的原始位置和大小
  glowSprite.userData = {
    originalY: glowSprite.position.y,
    originalScale: glowSprite.scale.clone()
  }
}

// 取消高亮
const unhighlightFlower = (flower) => {
  // 取消该花朵的动画
  if (flower.userData.highlightAnimationId) {
    cancelAnimationFrame(flower.userData.highlightAnimationId)
    flower.userData.highlightAnimationId = null
  }

  // 恢复原始缩放
  if (flower.userData.originalScale) {
    flower.scale.copy(flower.userData.originalScale)
  }

  // 隐藏光圈
  if (flower.userData.glowSprite) {
    flower.userData.glowSprite.visible = false
  }
}

// 花朵高亮动画（微微放大和光圈动画）
const animateFlowerHighlight = (flower) => {
  const startTime = Date.now()
  const duration = 2000 // 动画持续时间（更慢的节奏）

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = (elapsed % duration) / duration

    // 计算动画曲线（使用正弦波实现轻微的呼吸效果）
    const scaleMultiplier = Math.sin(progress * Math.PI * 2) * 0.03 // 只有3%的波动

    // 应用轻微的缩放（基础1.08倍，±3%波动）
    if (flower.userData.originalScale) {
      const baseScale = 1.08
      flower.scale.set(
        flower.userData.originalScale.x * (baseScale + scaleMultiplier),
        flower.userData.originalScale.y * (baseScale + scaleMultiplier),
        flower.userData.originalScale.z * (baseScale + scaleMultiplier)
      )
    }

    // 更新光圈动画（旋转和轻微缩放）
    if (flower.userData.glowSprite && flower.userData.glowSprite.visible) {
      const glowSprite = flower.userData.glowSprite

      // 轻微的旋转效果
      glowSprite.rotation.z += 0.005

      // 光圈大小的轻微脉冲
      const glowPulse = 1 + Math.sin(progress * Math.PI * 2) * 0.05
      if (glowSprite.userData.originalScale) {
        glowSprite.scale.set(
          glowSprite.userData.originalScale.x * glowPulse,
          glowSprite.userData.originalScale.y * glowPulse,
          1
        )
      }

      // 透明度轻微波动
      glowSprite.material.opacity = 0.7 + Math.sin(progress * Math.PI * 2) * 0.15
    }

    // 如果花朵还是当前悬停状态，继续动画
    if (hoveredFlower.value === flower) {
      flower.userData.highlightAnimationId = requestAnimationFrame(animate)
    }
  }

  animate()
}

// 关闭详情
const closeDetail = () => {
  selectedRecord.value = null

  // 取消花朵高亮
  if (hoveredFlower.value) {
    unhighlightFlower(hoveredFlower.value)
    hoveredFlower.value = null
  }
}

// 情绪筛选
const filterByMood = (mood) => {
  selectedMood.value = mood

  // 根据筛选条件显示/隐藏花朵
  flowers3D.forEach(flower => {
    if (flower.userData.record) {
      const shouldShow = mood === 'all' || flower.userData.record.mood === mood
      flower.visible = shouldShow
    }
  })
}

// 返回首页
const goBack = () => {
  // 停止所有音频
  stopAllAudio()
  emit('back')
}

// 一键静音/取消静音
const toggleMute = () => {
  isMuted.value = !isMuted.value

  if (isMuted.value) {
    // 保存当前音量
    previousAmbientVolume = ambientVolume.value
    previousBeeVolume = beeVolume.value
    console.log('已静音')
  } else {
    // 恢复音量
    ambientVolume.value = previousAmbientVolume
    beeVolume.value = previousBeeVolume
    console.log('已取消静音')
  }
}

// 停止所有音频
const stopAllAudio = () => {
  // 停止环境音
  if (ambientSource) {
    ambientSource.stop()
    ambientSource.disconnect()
    ambientSource = null
  }

  // 停止蜜蜂音
  if (beePanners.length > 0) {
    beePanners.forEach(bee => {
      bee.audio.stop()
      bee.audio.disconnect()
    })
    beePanners = []
  }

  // 关闭音频上下文
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close()
    audioContext = null
  }

  console.log('所有音频已停止')
}

// 设置日夜模式
const setTimeOfDay = (value) => {
  timeOfDay.value = value
  updateSkyColor()
  updateLights()
  updateCelestialBodies()
}

// 设置季节
const setSeason = (value) => {
  season.value = value
  updateTerrainColors(value)
  updateSkyColor()
}

// 设置天气
const setWeather = (value) => {
  weather.value = value
  updateLights()
  createWeatherParticles()
  updateCelestialBodies()
}

// 切换控制面板显示/隐藏
const toggleControls = () => {
  controlsVisible.value = !controlsVisible.value
}

// 窗口大小调整
const onWindowResize = () => {
  const container = canvasContainer.value
  if (!container) return
  const width = container.clientWidth
  const height = container.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 更新控制器
  controls.update()

  // 平滑移动摄像机到目标位置
  if (targetCameraPosition && targetLookAt) {
    const lerpFactor = 0.05
    camera.position.lerp(targetCameraPosition, lerpFactor)
    controls.target.lerp(targetLookAt, lerpFactor)

    // 检查是否到达目标
    const distance = camera.position.distanceTo(targetCameraPosition)
    if (distance < 0.5) {
      targetCameraPosition = null
      targetLookAt = null
    }
  }

  // 应用花朵摇摆效果
  applyWindToFlowers()

  // 更新音频音量（根据摄像机距离）
  updateAudioVolume()

  // 动画云朵
  animateClouds()

  // 更新天气粒子动画
  if (weatherParticles) {
    const positions = weatherParticles.geometry.attributes.position.array
    const velocities = weatherParticles.geometry.userData.velocities

    for (let i = 0; i < velocities.length; i++) {
      const i3 = i * 3

      if (weather.value === 'rain') {
        // 雨滴垂直下落
        positions[i3 + 1] -= velocities[i]
        // 轻微的偏移
        positions[i3] += Math.sin(Date.now() * 0.001 + i) * 0.1
      } else if (weather.value === 'snow') {
        // 雪花飘落（带横向飘动）
        positions[i3 + 1] -= velocities[i]
        positions[i3] += Math.sin(Date.now() * 0.001 + i * 0.1) * 0.2
        positions[i3 + 2] += Math.cos(Date.now() * 0.001 + i * 0.1) * 0.1
      }

      // 循环重置
      if (positions[i3 + 1] < -10) {
        positions[i3 + 1] = 300
        positions[i3] = (Math.random() - 0.5) * 800
        positions[i3 + 2] = (Math.random() - 0.5) * 500
      }
    }

    weatherParticles.geometry.attributes.position.needsUpdate = true
  }

  // 更新日期标签的漂浮动画（更加明显的上下漂浮和发光效果）
  const time = Date.now() * 0.001
  dateLabels.forEach(label => {
    if (label.userData.baseY && label.userData.floatOffset) {
      // 更明显的上下漂浮（幅度增加到1.5）
      const floatSpeed = label.userData.floatSpeed || 1.5
      label.position.y = label.userData.baseY + Math.sin(time * floatSpeed + label.userData.floatOffset) * 1.5

      // 更明显的发光效果（透明度变化范围增大到0.6-1.0）
      const glowSpeed = label.userData.glowSpeed || 2
      label.material.opacity = 0.75 + Math.sin(time * glowSpeed + label.userData.floatOffset) * 0.25

      // 尺寸轻微脉冲（日期球尺寸已改为7）
      const baseScale = label.position.y > 0.3 ? 7 : 3 // 底部数字是3
      if (label.position.y > 1) { // 只对日期球应用尺寸脉冲
        const scalePulse = 1 + Math.sin(time * glowSpeed + label.userData.floatOffset) * 0.05
        label.scale.set(baseScale * scalePulse, baseScale * scalePulse, 1)
      }
    }
  })

  renderer.render(scene, camera)
}

// 生命周期
onMounted(() => {
  setTimeout(() => {
    // 如果有月份数据，根据第一个有记录的月份设置默认季节
    if (allMonths.value.length > 0) {
      const firstMonthKey = allMonths.value[0].key
      const defaultSeason = getSeasonFromMonth(firstMonthKey)
      season.value = defaultSeason
      console.log(`根据月份 ${firstMonthKey} 设置默认季节为: ${defaultSeason}`)
    }
    initThreeJS()
  }, 100)
})

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (highlightAnimationId) {
    cancelAnimationFrame(highlightAnimationId)
  }
  window.removeEventListener('resize', onWindowResize)
  if (renderer && renderer.domElement) {
    renderer.domElement.removeEventListener('click', onCanvasClick)
    renderer.domElement.removeEventListener('mousemove', onCanvasMouseMove)
  }
  if (controls) {
    controls.dispose()
  }

  // 清理所有花朵的光圈
  flowers3D.forEach(flower => {
    if (flower.userData.highlightAnimationId) {
      cancelAnimationFrame(flower.userData.highlightAnimationId)
    }
    if (flower.userData.glowSprite) {
      flower.userData.glowSprite.visible = false
      flower.userData.glowSprite.material.dispose()
      flower.userData.glowSprite.geometry.dispose()
      scene.remove(flower.userData.glowSprite)
    }
  })

  // 清理天体
  if (sunMesh) {
    scene.remove(sunMesh)
    sunMesh.geometry.dispose()
    sunMesh.material.dispose()
  }
  if (moonMesh) {
    scene.remove(moonMesh)
    moonMesh.geometry.dispose()
    moonMesh.material.dispose()
  }
  if (sunLight) {
    scene.remove(sunLight)
  }
  if (moonLight) {
    scene.remove(moonLight)
  }
  clouds.forEach(cloud => {
    cloud.traverse(child => {
      if (child.isMesh) {
        child.geometry.dispose()
        child.material.dispose()
      }
    })
    scene.remove(cloud)
  })
  clouds = []

  // 停止并清理音频（使用统一的停止函数）
  stopAllAudio()
})
</script>

<style scoped>
.garden-3d-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.canvas-container {
  width: 100%;
  height: 100%;
}

/* 控制栏切换按钮 */
.toggle-wrapper {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 200;
  display: flex;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-btn {
  width: 32px;
  height: 80px;
  border-radius: 0 16px 16px 0;
  border: none;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  cursor: pointer;
  z-index: 201;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.toggle-btn:active {
  transform: scale(0.98);
}

.toggle-btn .icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.9);
  transition: transform 0.3s ease;
}

.toggle-btn:hover .icon {
  transform: scale(1.1);
  color: rgba(255, 255, 255, 1);
}

.toggle-tooltip {
  position: absolute;
  left: 50px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left center;
}

.toggle-wrapper:hover .toggle-tooltip {
  opacity: 1;
  transform: translateY(-50%) translateX(8px);
}

/* 左侧统一控制面板 */
.controls-panel {
  position: fixed;
  left: 40px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 24px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 150;
  max-height: 75vh;
  overflow-y: auto;
  min-width: 200px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
}

.controls-panel.hidden {
  opacity: 0;
  transform: translateY(-50%) translateX(-30px);
  pointer-events: none;
}

.controls-panel:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.panel-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.panel-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.panel-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 14px;
  text-align: left;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.panel-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 风力控制器 */
.wind-control {
  margin-top: 10px;
}

.wind-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}

.wind-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.12);
  padding: 6px 16px;
  border-radius: 20px;
  min-width: 60px;
  text-align: center;
  letter-spacing: 0.5px;
}

/* 音量控制器 */
.volume-control {
  margin-bottom: 16px;
}

.volume-control:last-child {
  margin-bottom: 0;
}

.volume-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.volume-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.volume-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 10px;
  min-width: 45px;
  text-align: center;
}

.volume-slider {
  width: 100%;
  height: 5px;
  border-radius: 2.5px;
  background: rgba(255, 255, 255, 0.15);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.volume-slider:hover {
  background: rgba(255, 255, 255, 0.25);
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.volume-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.volume-slider:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.volume-slider:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}

.volume-slider:disabled::-moz-range-thumb {
  cursor: not-allowed;
}

/* 一键静音按钮 */
.mute-btn {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mute-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mute-btn:active {
  transform: translateY(0);
}

.mute-btn.muted {
  background: rgba(255, 107, 157, 0.3);
  border: 1px solid rgba(255, 107, 157, 0.4);
}

.mute-btn.muted:hover {
  background: rgba(255, 107, 157, 0.4);
}

.wind-slider {
  width: 100%;
  height: 5px;
  border-radius: 2.5px;
  background: rgba(255, 255, 255, 0.15);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.wind-slider:hover {
  background: rgba(255, 255, 255, 0.25);
}

.wind-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.wind-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.wind-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.wind-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.month-selector {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 10px 20px;
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow-x: auto;
  max-width: 90vw;
}

.month-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.month-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 1);
}

.month-btn.active {
  background: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 1);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 情绪筛选器 - 透明样式 */
.mood-filter {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  padding: 15px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 150;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  max-height: 70vh;
  overflow-y: auto;
  min-width: 130px;
}

.filter-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

/* 风力控制器 */
.wind-control {
  padding-top: 15px;
}

.wind-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.wind-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.wind-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 8px;
  border-radius: 8px;
  min-width: 45px;
  text-align: center;
}

.wind-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.wind-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s ease;
}

.wind-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.wind-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s ease;
}

.wind-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
}

.mood-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.mood-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 1);
  transform: translateX(4px);
  border-color: rgba(255, 255, 255, 0.15);
}

.mood-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 1);
  font-weight: 600;
  transform: translateX(4px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.mood-emoji {
  font-size: 1.15rem;
  line-height: 1;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.mood-label {
  flex-shrink: 0;
}

/* 返回首页按钮 */
.back-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.back-btn:active {
  transform: translateY(0);
}

.back-btn .back-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.back-btn:hover .back-icon {
  transform: translateX(-3px);
}

.back-btn span {
  white-space: nowrap;
}

/* 环境控制面板 - 已废弃，使用 .controls-panel */

.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
}

.detail-modal.show {
  opacity: 1;
  pointer-events: all;
}

.modal-content {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  transform: scale(0.9);
  transition: transform 0.3s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.detail-modal.show .modal-content {
  transform: scale(1);
}

.modal-header {
  position: relative;
  padding: 30px;
  background: linear-gradient(135deg, #FFE8E1 0%, #FFF5F5 100%);
  border-radius: 24px 24px 0 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.flower-large {
  width: 120px;
  height: 120px;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.modal-body {
  padding: 25px;
}

.date {
  text-align: center;
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 15px;
}

.mood-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 20px;
  width: 100%;
  text-align: center;
}

.mood-badge.mood-happy { background: #FFE8E1; color: #FF6B9D; }
.mood-badge.mood-sad { background: #E8F4F8; color: #74B9FF; }
.mood-badge.mood-angry { background: #FFE8E8; color: #E17055; }
.mood-badge.mood-calm { background: #E8FFF8; color: #55E6C1; }
.mood-badge.mood-excited { background: #FFF0F5; color: #FD79A8; }
.mood-badge.mood-tired { background: #F0E8FF; color: #A29BFE; }
.mood-badge.mood-anxious { background: #FFF8E8; color: #FDCB6E; }
.mood-badge.mood-hopeful { background: #FFF5E8; color: #FFEAA7; }

.diary-text {
  background: #F9F9F9;
  padding: 20px;
  border-radius: 16px;
  line-height: 1.8;
  color: #555;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
}
</style>
