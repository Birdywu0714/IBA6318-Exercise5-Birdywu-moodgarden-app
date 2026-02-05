<template>
  <div class="flower-illustration" :class="moodClass">
    <svg :viewBox="viewBox" class="flower">
      <defs>
        <linearGradient :id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="lightColor" />
          <stop offset="100%" :stop-color="darkColor" />
        </linearGradient>
      </defs>

      <!-- 花茎 -->
      <g class="stem">
        <path d="M 100 140 Q 100 160 100 180" :stroke="stemColor" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M 100 150 Q 90 145 85 140" :stroke="stemColor" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6" />
        <ellipse cx="85" cy="138" rx="8" ry="4" :fill="leafColor" transform="rotate(-30 85 138)" opacity="0.7" />
        <path d="M 100 165 Q 110 160 115 155" :stroke="stemColor" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6" />
        <ellipse cx="115" cy="153" rx="8" ry="4" :fill="leafColor" transform="rotate(30 115 153)" opacity="0.7" />
      </g>

      <!-- 花瓣 -->
      <g class="petals" v-html="petalsSvg"></g>

      <!-- 花心 -->
      <circle cx="100" cy="90" r="15" :fill="centerColor" />
      <circle cx="95" cy="88" r="4" fill="#FFF" opacity="0.3" />
      <circle cx="103" cy="92" r="3" fill="#FFF" opacity="0.2" />
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

const viewBox = computed(() => '0 0 200 200')

const petalGradient = computed(() => `petal-${props.mood}`)

const moodConfig = computed(() => {
  const configs = {
    happy: {
      lightColor: '#FFD93D',
      darkColor: '#FFA500',
      stemColor: '#7CB342',
      leafColor: '#8BC34A',
      centerColor: '#FFF59D',
      petals: `
        <ellipse cx="100" cy="60" rx="18" ry="35" fill="url(#petal-happy)" />
        <ellipse cx="100" cy="120" rx="18" ry="35" fill="url(#petal-happy)" />
        <ellipse cx="60" cy="90" rx="35" ry="18" fill="url(#petal-happy)" />
        <ellipse cx="140" cy="90" rx="35" ry="18" fill="url(#petal-happy)" />
        <ellipse cx="70" cy="65" rx="20" ry="30" fill="url(#petal-happy)" transform="rotate(-45 70 65)" />
        <ellipse cx="130" cy="65" rx="20" ry="30" fill="url(#petal-happy)" transform="rotate(45 130 65)" />
        <ellipse cx="70" cy="115" rx="20" ry="30" fill="url(#petal-happy)" transform="rotate(45 70 115)" />
        <ellipse cx="130" cy="115" rx="20" ry="30" fill="url(#petal-happy)" transform="rotate(-45 130 115)" />
      `
    },
    sad: {
      lightColor: '#74B9FF',
      darkColor: '#0984E3',
      stemColor: '#636E72',
      leafColor: '#B2BEC3',
      centerColor: '#A29BFE',
      petals: `
        <ellipse cx="100" cy="65" rx="15" ry="30" fill="url(#petal-sad)" opacity="0.8" />
        <ellipse cx="100" cy="115" rx="15" ry="30" fill="url(#petal-sad)" opacity="0.8" />
        <ellipse cx="65" cy="90" rx="30" ry="15" fill="url(#petal-sad)" opacity="0.8" />
        <ellipse cx="135" cy="90" rx="30" ry="15" fill="url(#petal-sad)" opacity="0.8" />
        <ellipse cx="75" cy="70" rx="18" ry="28" fill="url(#petal-sad)" opacity="0.7" transform="rotate(-45 75 70)" />
        <ellipse cx="125" cy="70" rx="18" ry="28" fill="url(#petal-sad)" opacity="0.7" transform="rotate(45 125 70)" />
        <ellipse cx="75" cy="110" rx="18" ry="28" fill="url(#petal-sad)" opacity="0.7" transform="rotate(45 75 110)" />
        <ellipse cx="125" cy="110" rx="18" ry="28" fill="url(#petal-sad)" opacity="0.7" transform="rotate(-45 125 110)" />
      `
    },
    angry: {
      lightColor: '#E17055',
      darkColor: '#D63031',
      stemColor: '#2D3436',
      leafColor: '#636E72',
      centerColor: '#FDCB6E',
      petals: `
        <ellipse cx="100" cy="58" rx="20" ry="35" fill="url(#petal-angry)" />
        <ellipse cx="100" cy="122" rx="20" ry="35" fill="url(#petal-angry)" />
        <ellipse cx="58" cy="90" rx="35" ry="20" fill="url(#petal-angry)" />
        <ellipse cx="142" cy="90" rx="35" ry="20" fill="url(#petal-angry)" />
        <ellipse cx="68" cy="62" rx="22" ry="32" fill="url(#petal-angry)" transform="rotate(-50 68 62)" />
        <ellipse cx="132" cy="62" rx="22" ry="32" fill="url(#petal-angry)" transform="rotate(50 132 62)" />
        <ellipse cx="68" cy="118" rx="22" ry="32" fill="url(#petal-angry)" transform="rotate(50 68 118)" />
        <ellipse cx="132" cy="118" rx="22" ry="32" fill="url(#petal-angry)" transform="rotate(-50 132 118)" />
      `
    },
    calm: {
      lightColor: '#55E6C1',
      darkColor: '#00B894',
      stemColor: '#00CEC9',
      leafColor: '#81ECEC',
      centerColor: '#E8F8F5',
      petals: `
        <ellipse cx="100" cy="60" rx="16" ry="32" fill="url(#petal-calm)" />
        <ellipse cx="100" cy="120" rx="16" ry="32" fill="url(#petal-calm)" />
        <ellipse cx="62" cy="90" rx="32" ry="16" fill="url(#petal-calm)" />
        <ellipse cx="138" cy="90" rx="32" ry="16" fill="url(#petal-calm)" />
        <ellipse cx="72" cy="67" rx="19" ry="29" fill="url(#petal-calm)" transform="rotate(-45 72 67)" />
        <ellipse cx="128" cy="67" rx="19" ry="29" fill="url(#petal-calm)" transform="rotate(45 128 67)" />
        <ellipse cx="72" cy="113" rx="19" ry="29" fill="url(#petal-calm)" transform="rotate(45 72 113)" />
        <ellipse cx="128" cy="113" rx="19" ry="29" fill="url(#petal-calm)" transform="rotate(-45 128 113)" />
      `
    },
    excited: {
      lightColor: '#FD79A8',
      darkColor: '#E84393',
      stemColor: '#FDCB6E',
      leafColor: '#FFEAA7',
      centerColor: '#FAB1A0',
      petals: `
        <ellipse cx="100" cy="55" rx="18" ry="38" fill="url(#petal-excited)" />
        <ellipse cx="100" cy="125" rx="18" ry="38" fill="url(#petal-excited)" />
        <ellipse cx="55" cy="90" rx="38" ry="18" fill="url(#petal-excited)" />
        <ellipse cx="145" cy="90" rx="38" ry="18" fill="url(#petal-excited)" />
        <ellipse cx="68" cy="62" rx="21" ry="34" fill="url(#petal-excited)" transform="rotate(-50 68 62)" />
        <ellipse cx="132" cy="62" rx="21" ry="34" fill="url(#petal-excited)" transform="rotate(50 132 62)" />
        <ellipse cx="68" cy="118" rx="21" ry="34" fill="url(#petal-excited)" transform="rotate(50 68 118)" />
        <ellipse cx="132" cy="118" rx="21" ry="34" fill="url(#petal-excited)" transform="rotate(-50 132 118)" />
      `
    },
    tired: {
      lightColor: '#A29BFE',
      darkColor: '#6C5CE7',
      stemColor: '#636E72',
      leafColor: '#B2BEC3',
      centerColor: '#DDE1E7',
      petals: `
        <ellipse cx="100" cy="62" rx="15" ry="30" fill="url(#petal-tired)" opacity="0.85" />
        <ellipse cx="100" cy="118" rx="15" ry="30" fill="url(#petal-tired)" opacity="0.85" />
        <ellipse cx="65" cy="90" rx="30" ry="15" fill="url(#petal-tired)" opacity="0.85" />
        <ellipse cx="135" cy="90" rx="30" ry="15" fill="url(#petal-tired)" opacity="0.85" />
        <ellipse cx="73" cy="68" rx="18" ry="28" fill="url(#petal-tired)" opacity="0.75" transform="rotate(-45 73 68)" />
        <ellipse cx="127" cy="68" rx="18" ry="28" fill="url(#petal-tired)" opacity="0.75" transform="rotate(45 127 68)" />
        <ellipse cx="73" cy="112" rx="18" ry="28" fill="url(#petal-tired)" opacity="0.75" transform="rotate(45 73 112)" />
        <ellipse cx="127" cy="112" rx="18" ry="28" fill="url(#petal-tired)" opacity="0.75" transform="rotate(-45 127 112)" />
      `
    },
    anxious: {
      lightColor: '#FDCB6E',
      darkColor: '#E17055',
      stemColor: '#636E72',
      leafColor: '#B2BEC3',
      centerColor: '#FFEAA7',
      petals: `
        <ellipse cx="100" cy="60" rx="16" ry="32" fill="url(#petal-anxious)" />
        <ellipse cx="100" cy="120" rx="16" ry="32" fill="url(#petal-anxious)" />
        <ellipse cx="62" cy="90" rx="32" ry="16" fill="url(#petal-anxious)" />
        <ellipse cx="138" cy="90" rx="32" ry="16" fill="url(#petal-anxious)" />
        <ellipse cx="72" cy="67" rx="19" ry="29" fill="url(#petal-anxious)" transform="rotate(-45 72 67)" />
        <ellipse cx="128" cy="67" rx="19" ry="29" fill="url(#petal-anxious)" transform="rotate(45 128 67)" />
        <ellipse cx="72" cy="113" rx="19" ry="29" fill="url(#petal-anxious)" transform="rotate(45 72 113)" />
        <ellipse cx="128" cy="113" rx="19" ry="29" fill="url(#petal-anxious)" transform="rotate(-45 128 113)" />
      `
    },
    hopeful: {
      lightColor: '#FFEAA7',
      darkColor: '#FD79A8',
      stemColor: '#7CB342',
      leafColor: '#8BC34A',
      centerColor: '#FDCB6E',
      petals: `
        <ellipse cx="100" cy="58" rx="17" ry="35" fill="url(#petal-hopeful)" />
        <ellipse cx="100" cy="122" rx="17" ry="35" fill="url(#petal-hopeful)" />
        <ellipse cx="58" cy="90" rx="35" ry="17" fill="url(#petal-hopeful)" />
        <ellipse cx="142" cy="90" rx="35" ry="17" fill="url(#petal-hopeful)" />
        <ellipse cx="70" cy="65" rx="20" ry="32" fill="url(#petal-hopeful)" transform="rotate(-45 70 65)" />
        <ellipse cx="130" cy="65" rx="20" ry="32" fill="url(#petal-hopeful)" transform="rotate(45 130 65)" />
        <ellipse cx="70" cy="115" rx="20" ry="32" fill="url(#petal-hopeful)" transform="rotate(45 70 115)" />
        <ellipse cx="130" cy="115" rx="20" ry="32" fill="url(#petal-hopeful)" transform="rotate(-45 130 115)" />
      `
    }
  }
  return configs[props.mood] || configs.calm
})

const petalsSvg = computed(() => moodConfig.value.petals)

const lightColor = computed(() => moodConfig.value.lightColor)

const darkColor = computed(() => moodConfig.value.darkColor)

const stemColor = computed(() => moodConfig.value.stemColor)

const leafColor = computed(() => moodConfig.value.leafColor)

const centerColor = computed(() => moodConfig.value.centerColor)

const moodClass = computed(() => `flower-${props.mood}`)
</script>

<style scoped>
.flower-illustration {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flower {
  width: 100%;
  height: 100%;
  max-width: 150px;
  max-height: 150px;
  transition: transform 0.3s ease;
}

.flower-illustration:hover .flower {
  transform: scale(1.05);
}

.petals ellipse {
  transition: all 0.3s ease;
}

.flower-happy .petals {
  animation: bloom 0.5s ease-out;
}

.flower-hopeful .petals {
  animation: bloom 0.5s ease-out;
}

@keyframes bloom {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
