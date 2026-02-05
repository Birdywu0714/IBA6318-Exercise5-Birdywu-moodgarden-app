<template>
  <div class="mood-illustration" :class="moodClass">
    <svg :viewBox="viewBox" class="illustration">
      <defs>
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="color1" />
          <stop offset="100%" :stop-color="color2" />
        </linearGradient>
      </defs>

      <!-- 背景元素 -->
      <g class="background">
        <circle :r="bgRadius" :fill="gradientUrl" opacity="0.3" />
        <circle :r="bgRadius * 0.6" :fill="color1" opacity="0.15" />
      </g>

      <!-- 主体插图 -->
      <g class="main-element" v-html="svgContent"></g>

      <!-- 装饰元素 -->
      <g class="decorations" v-html="decorations"></g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mood: {
    type: String,
    required: true
  }
})

const gradientId = computed(() => `gradient-${props.mood}`)

const gradientUrl = computed(() => `url(#${gradientId.value})`)

const viewBox = computed(() => '0 0 200 200')

const bgRadius = computed(() => 90)

const moodConfig = computed(() => {
  const configs = {
    happy: {
      color1: '#FFD93D',
      color2: '#FF6B6B',
      svg: `
        <circle cx="100" cy="90" r="45" fill="url(#gradient-happy)" />
        <ellipse cx="82" cy="85" rx="8" ry="10" fill="#333" />
        <ellipse cx="118" cy="85" rx="8" ry="10" fill="#333" />
        <path d="M 80 105 Q 100 125 120 105" stroke="#333" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M 100 45 L 100 30 M 80 40 L 70 28 M 120 40 L 130 28" stroke="url(#gradient-happy)" stroke-width="6" stroke-linecap="round" />
      `,
      decorations: `
        <circle cx="30" cy="50" r="8" fill="#FFD93D" opacity="0.6" />
        <circle cx="170" cy="45" r="5" fill="#FFD93D" opacity="0.5" />
        <circle cx="160" cy="150" r="6" fill="#FF6B6B" opacity="0.4" />
        <path d="M 40 120 Q 50 110 60 120 Q 50 130 40 120" fill="#FFD93D" opacity="0.5" />
      `
    },
    sad: {
      color1: '#74B9FF',
      color2: '#6C5CE7',
      svg: `
        <circle cx="100" cy="95" r="42" fill="url(#gradient-sad)" />
        <ellipse cx="82" cy="90" rx="8" ry="6" fill="#333" opacity="0.7" />
        <ellipse cx="118" cy="90" rx="8" ry="6" fill="#333" opacity="0.7" />
        <path d="M 82 112 Q 100 102 118 112" stroke="#333" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M 85 65 Q 100 60 115 65" stroke="#6C5CE7" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.5" />
        <ellipse cx="100" cy="155" rx="12" ry="8" fill="#74B9FF" opacity="0.3" />
      `,
      decorations: `
        <ellipse cx="40" cy="140" rx="3" ry="6" fill="#74B9FF" opacity="0.6" />
        <ellipse cx="55" cy="145" rx="4" ry="7" fill="#74B9FF" opacity="0.5" />
        <ellipse cx="145" cy="135" rx="3" ry="5" fill="#74B9FF" opacity="0.4" />
        <circle cx="160" cy="55" r="6" fill="#6C5CE7" opacity="0.3" />
        <path d="M 30 60 Q 35 55 40 60 Q 35 65 30 60" fill="#6C5CE7" opacity="0.3" />
      `
    },
    angry: {
      color1: '#E17055',
      color2: '#D63031',
      svg: `
        <circle cx="100" cy="92" r="43" fill="url(#gradient-angry)" />
        <path d="M 72 78 L 92 88 M 92 78 L 72 88" stroke="#333" stroke-width="5" stroke-linecap="round" />
        <path d="M 108 78 L 128 88 M 128 78 L 108 88" stroke="#333" stroke-width="5" stroke-linecap="round" />
        <path d="M 80 110 Q 100 105 120 110" stroke="#333" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M 55 65 L 75 70 M 145 65 L 125 70" stroke="#E17055" stroke-width="6" stroke-linecap="round" />
        <circle cx="100" cy="158" r="8" fill="#D63031" opacity="0.4" />
      `,
      decorations: `
        <path d="M 30 80 L 35 75 M 35 80 L 30 75" stroke="#E17055" stroke-width="4" stroke-linecap="round" opacity="0.5" />
        <path d="M 170 90 L 165 85 M 165 90 L 170 85" stroke="#E17055" stroke-width="4" stroke-linecap="round" opacity="0.4" />
        <circle cx="40" cy="130" r="5" fill="#D63031" opacity="0.4" />
        <circle cx="155" cy="145" r="4" fill="#E17055" opacity="0.3" />
      `
    },
    calm: {
      color1: '#55E6C1',
      color2: '#00CEC9',
      svg: `
        <circle cx="100" cy="95" r="44" fill="url(#gradient-calm)" />
        <ellipse cx="82" cy="90" rx="7" ry="8" fill="#333" opacity="0.8" />
        <ellipse cx="118" cy="90" rx="7" ry="8" fill="#333" opacity="0.8" />
        <path d="M 80 108 Q 100 115 120 108" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M 100 48 Q 100 40 100 48" stroke="#00CEC9" stroke-width="5" stroke-linecap="round" />
        <path d="M 130 155 Q 100 165 70 155" stroke="#55E6C1" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.4" />
        <path d="M 135 148 Q 100 158 65 148" stroke="#55E6C1" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.3" />
      `,
      decorations: `
        <ellipse cx="50" cy="60" rx="12" ry="6" fill="#55E6C1" opacity="0.3" transform="rotate(-20 50 60)" />
        <ellipse cx="150" cy="70" rx="10" ry="5" fill="#55E6C1" opacity="0.25" transform="rotate(15 150 70)" />
        <circle cx="35" cy="140" r="5" fill="#00CEC9" opacity="0.4" />
        <circle cx="165" cy="135" r="4" fill="#00CEC9" opacity="0.35" />
      `
    },
    excited: {
      color1: '#FD79A8',
      color2: '#E84393',
      svg: `
        <circle cx="100" cy="90" r="46" fill="url(#gradient-excited)" />
        <ellipse cx="82" cy="88" rx="9" ry="12" fill="#333" />
        <ellipse cx="118" cy="88" rx="9" ry="12" fill="#333" />
        <path d="M 75 105 Q 100 130 125 105" stroke="#333" stroke-width="5" fill="none" stroke-linecap="round" />
        <circle cx="95" cy="100" r="4" fill="#FF6B9D" opacity="0.6" />
        <circle cx="105" cy="100" r="3" fill="#FF6B9D" opacity="0.5" />
        <path d="M 100 40 L 100 20 M 80 45 L 65 32 M 120 45 L 135 32" stroke="#E84393" stroke-width="7" stroke-linecap="round" />
        <path d="M 75 130 Q 100 140 125 130" stroke="#FD79A8" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5" />
      `,
      decorations: `
        <circle cx="25" cy="45" r="10" fill="#FD79A8" opacity="0.5" />
        <circle cx="175" cy="50" r="8" fill="#FD79A8" opacity="0.4" />
        <circle cx="165" cy="155" r="7" fill="#E84393" opacity="0.4" />
        <path d="M 40 115 L 50 110 L 50 120 Z" fill="#FD79A8" opacity="0.4" />
        <circle cx="155" cy="70" r="5" fill="#E84393" opacity="0.3" />
      `
    },
    tired: {
      color1: '#A29BFE',
      color2: '#6C5CE7',
      svg: `
        <ellipse cx="100" cy="98" rx="44" ry="40" fill="url(#gradient-tired)" />
        <path d="M 76 88 L 88 88" stroke="#333" stroke-width="4" stroke-linecap="round" />
        <path d="M 112 88 L 124 88" stroke="#333" stroke-width="4" stroke-linecap="round" />
        <path d="M 85 108 Q 100 115 115 108" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M 55 75 Q 100 70 145 75" stroke="#6C5CE7" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.4" />
        <ellipse cx="100" cy="158" rx="14" ry="6" fill="#A29BFE" opacity="0.3" />
      `,
      decorations: `
        <ellipse cx="45" cy="130" rx="4" ry="8" fill="#A29BFE" opacity="0.5" />
        <ellipse cx="60" cy="138" rx="5" ry="9" fill="#A29BFE" opacity="0.4" />
        <ellipse cx="140" cy="128" rx="4" ry="7" fill="#A29BFE" opacity="0.35" />
        <circle cx="155" cy="55" r="5" fill="#6C5CE7" opacity="0.3" />
      `
    },
    anxious: {
      color1: '#FDCB6E',
      color2: '#E17055',
      svg: `
        <circle cx="100" cy="92" r="42" fill="url(#gradient-anxious)" />
        <ellipse cx="82" cy="88" rx="8" ry="10" fill="#333" opacity="0.7" />
        <ellipse cx="118" cy="88" rx="8" ry="10" fill="#333" opacity="0.7" />
        <ellipse cx="100" cy="112" rx="8" ry="5" fill="#333" opacity="0.6" />
        <path d="M 60 65 L 70 60 M 60 60 L 70 65" stroke="#E17055" stroke-width="5" stroke-linecap="round" opacity="0.6" />
        <path d="M 140 65 L 130 60 M 140 60 L 130 65" stroke="#E17055" stroke-width="5" stroke-linecap="round" opacity="0.6" />
      `,
      decorations: `
        <path d="M 30 75 Q 35 70 40 75 Q 35 80 30 75" stroke="#FDCB6E" stroke-width="4" stroke-linecap="round" opacity="0.6" />
        <path d="M 170 85 Q 165 80 160 85 Q 165 90 170 85" stroke="#FDCB6E" stroke-width="4" stroke-linecap="round" opacity="0.5" />
        <circle cx="45" cy="125" r="6" fill="#E17055" opacity="0.4" />
        <circle cx="155" cy="130" r="5" fill="#E17055" opacity="0.35" />
        <path d="M 35 50 L 45 55 M 45 50 L 35 55" stroke="#FDCB6E" stroke-width="3" stroke-linecap="round" opacity="0.4" />
      `
    },
    hopeful: {
      color1: '#FFEAA7',
      color2: '#FD79A8',
      svg: `
        <circle cx="100" cy="93" r="45" fill="url(#gradient-hopeful)" />
        <ellipse cx="82" cy="88" rx="8" ry="10" fill="#333" />
        <ellipse cx="118" cy="88" rx="8" ry="10" fill="#333" />
        <path d="M 80 108 Q 100 118 120 108" stroke="#333" stroke-width="4" fill="none" stroke-linecap="round" />
        <circle cx="95" cy="100" r="3" fill="#FD79A8" opacity="0.5" />
        <circle cx="105" cy="100" r="2" fill="#FD79A8" opacity="0.4" />
        <path d="M 100 43 L 100 25 M 82 52 L 70 40 M 118 52 L 130 40" stroke="#FD79A8" stroke-width="6" stroke-linecap="round" />
      `,
      decorations: `
        <circle cx="28" cy="50" r="9" fill="#FFEAA7" opacity="0.6" />
        <circle cx="172" cy="55" r="7" fill="#FFEAA7" opacity="0.5" />
        <circle cx="160" cy="152" r="6" fill="#FD79A8" opacity="0.4" />
        <circle cx="40" cy="145" r="5" fill="#FFEAA7" opacity="0.4" />
        <path d="M 155 75 Q 160 70 165 75 Q 160 80 155 75" fill="#FD79A8" opacity="0.3" />
      `
    }
  }
  return configs[props.mood] || configs.calm
})

const moodClass = computed(() => `mood-${props.mood}`)

const color1 = computed(() => moodConfig.value.color1)

const color2 = computed(() => moodConfig.value.color2)

const svgContent = computed(() => moodConfig.value.svg)

const decorations = computed(() => moodConfig.value.decorations)
</script>

<style scoped>
.mood-illustration {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration {
  width: 100%;
  height: 100%;
  max-width: 200px;
  max-height: 200px;
  transition: transform 0.3s ease;
}

.background circle {
  transition: all 0.3s ease;
}

.main-element {
  transition: transform 0.3s ease;
}

.decorations {
  transition: opacity 0.3s ease;
}

/* 不同心情的动画效果 */
.mood-happy .main-element {
  animation: bounce 2s ease-in-out infinite;
}

.mood-excited .main-element {
  animation: bounce 1.5s ease-in-out infinite;
}

.mood-sad .main-element {
  animation: gentle-sway 3s ease-in-out infinite;
}

.mood-calm .main-element {
  animation: float 4s ease-in-out infinite;
}

.mood-tired .main-element {
  animation: slow-pulse 3s ease-in-out infinite;
}

.mood-anxious .decorations {
  animation: shake 0.5s ease-in-out infinite;
}

.mood-hopeful .decorations circle {
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes gentle-sway {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  50% { transform: translateX(-2px) rotate(-1deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes slow-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}
</style>
