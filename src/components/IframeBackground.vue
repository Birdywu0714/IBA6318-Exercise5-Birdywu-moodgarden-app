<template>
  <iframe
    ref="iframeRef"
    :src="iframeSrc"
    class="iframe-background"
    frameborder="0"
    allow="autoplay"
  ></iframe>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  iframeSrc: {
    type: String,
    required: true
  }
})

const iframeRef = ref(null)
</script>

<style scoped>
.iframe-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  border: none;
}

/* 确保 iframe 内容不滚动 */
.iframe-background::-webkit-scrollbar {
  display: none;
}
</style>
