<template>
  <div class="video-background">
    <video
      ref="videoRef"
      class="video-element"
      autoplay
      muted
      loop
      playsinline
      :poster="poster"
      @error="handleVideoError"
    >
      <source :src="videoSrc" type="video/mp4">
    </video>
    <div v-if="videoError" class="fallback-bg"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  videoSrc: {
    type: String,
    default: '/videos/gradient-bg.mp4'
  },
  poster: {
    type: String,
    default: ''
  }
})

const videoRef = ref(null)
const videoError = ref(false)

const handleVideoError = () => {
  console.warn('视频加载失败，使用备用背景')
  videoError.value = true
}

onMounted(() => {
  const video = videoRef.value
  if (video) {
    // 确保视频播放
    video.play().catch(err => {
      console.warn('自动播放失败，需要用户交互:', err)
      videoError.value = true
    })
  }
})

onBeforeUnmount(() => {
  const video = videoRef.value
  if (video) {
    video.pause()
  }
})
</script>

<style scoped>
.video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fallback-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
