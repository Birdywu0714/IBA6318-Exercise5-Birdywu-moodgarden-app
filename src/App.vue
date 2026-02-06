<template>
  <div id="app" class="app-container">
    <!-- 首页和3D花园视图 -->
    <div class="main-view">
      <!-- 3D花园视图 -->
        <Garden3D v-if="currentView === 'garden-3d'" :records="moodRecords" @back="currentView = 'garden'" />

        <!-- 普通视图（首页） -->
        <div v-if="currentView === 'garden'" class="home-view">
          <div class="header">
            <div class="header-content">
              <div class="header-text">
                <h1 class="title">心情花园</h1>
                <p class="subtitle">记录每一份情绪，培育属于自己的心灵花园</p>
              </div>
              <div class="header-actions">
                <t-button theme="light" variant="outline" size="small" @click="showGardenLibraryDialog = true">
                  🏡 花园库配置
                </t-button>
                <div class="header-illustration">
                  <svg class="garden-icon" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="flowerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#FF6B9D" />
                        <stop offset="100%" style="stop-color:#C44DFF" />
                      </linearGradient>
                    </defs>
                    <path d="M 50 20 Q 30 50 50 80 Q 70 50 50 20" fill="url(#flowerGradient)" opacity="0.8" />
                    <path d="M 50 20 Q 80 40 50 80 Q 20 40 50 20" fill="url(#flowerGradient)" opacity="0.7" />
                    <path d="M 30 35 Q 50 50 70 35" stroke="#FF6B9D" stroke-width="2" fill="none" opacity="0.5" />
                    <circle cx="50" cy="45" r="8" fill="#FFEAA7" opacity="0.6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div class="main-content">
            <!-- 记录心情区域 -->
            <div class="record-section">
              <t-card class="record-card">
                <div class="mood-selector">
                  <h3>今天的心情如何？</h3>
                  <div class="mood-options">
                    <div
                      v-for="mood in moods"
                      :key="mood.value"
                      class="mood-option"
                      :class="{ selected: selectedMood === mood.value }"
                      @click="selectedMood = mood.value"
                    >
                      <div class="mood-illustration-container">
                        <MoodIllustration :mood="mood.value" />
                      </div>
                      <div class="mood-label">{{ mood.label }}</div>
                    </div>
                  </div>
                </div>

                <!-- 直接写日记模式 -->
                <div class="diary-mode" v-if="recordMode === 'write'">
                  <h3>写下今天的日记</h3>
                  <t-textarea
                    v-model="diaryContent"
                    placeholder="记录今天的想法、感受或发生的事情..."
                    :autosize="{ minRows: 6, maxRows: 12 }"
                    class="diary-textarea"
                  />
                </div>

                <!-- AI对话模式 -->
                <div class="ai-chat-mode" v-if="recordMode === 'chat'">
                  <h3>和AI聊聊天</h3>
                  <div class="chat-messages" ref="chatContainer">
                    <div
                      v-for="(msg, index) in chatMessages"
                      :key="index"
                      class="message"
                      :class="msg.role"
                    >
                      <div class="message-content">{{ msg.content }}</div>
                    </div>
                  </div>
                  <div class="chat-input">
                    <t-input
                      v-model="chatInput"
                      placeholder="和AI分享今天的心情..."
                      @keypress.enter="sendChatMessage"
                    />
                    <t-button theme="primary" @click="sendChatMessage">发送</t-button>
                  </div>
                  <!-- 总结日记按钮 -->
                  <div class="summary-section" v-if="chatMessages.length > 0">
                    <t-button
                      theme="success"
                      variant="outline"
                      :loading="isSummarizing"
                      @click="summarizeDiary"
                    >
                      <template #icon>✨</template>
                      总结日记
                    </t-button>
                  </div>
                </div>

                <!-- 模式切换 -->
                <div class="mode-toggle">
                  <t-button
                    :variant="recordMode === 'write' ? 'base' : 'outline'"
                    @click="recordMode = 'write'"
                  >
                    写日记
                  </t-button>
                  <t-button
                    :variant="recordMode === 'chat' ? 'base' : 'outline'"
                    @click="recordMode = 'chat'"
                  >
                    AI对话
                  </t-button>
                </div>

                <!-- 保存按钮 -->
                <div class="save-section">
                  <t-button
                    theme="success"
                    size="large"
                    :disabled="!canSave"
                    :loading="aiService.isLoading.value"
                    @click="saveMood"
                  >
                    在花园里种下一朵花
                  </t-button>
                  <t-button
                    theme="primary"
                    size="large"
                    variant="outline"
                    @click="currentView = 'garden-3d'"
                  >
                    进入3D花园
                  </t-button>
                </div>
              </t-card>
            </div>

            <!-- 花园视图 -->
            <div class="garden-section">
              <div class="garden-title">
                <h2>我的花园</h2>
                <p class="flower-count">{{ moodRecords.length }} 朵花</p>
              </div>
              <t-button
                theme="primary"
                size="large"
                variant="outline"
                @click="currentView = 'garden-3d'"
                v-if="moodRecords.length > 0"
              >
                查看3D花园世界
              </t-button>
              <div class="garden-grid" v-if="moodRecords.length > 0" style="margin-top: 25px;">
                <div
                  v-for="(record, index) in moodRecords"
                  :key="index"
                  class="flower-item"
                  @click="viewMoodDetail(record)"
                >
                  <div class="flower">
                    <FlowerIllustration :mood="record.mood" />
                  </div>
                  <div class="flower-date">{{ formatDate(record.date) }}</div>
                </div>
              </div>
              <div class="empty-garden" v-else>
                <svg class="empty-icon" viewBox="0 0 100 100">
                  <path d="M 50 20 Q 35 40 50 60 Q 65 40 50 20" fill="#81ECEC" opacity="0.6" />
                  <path d="M 50 20 Q 65 40 50 60 Q 35 40 50 20" fill="#74B9FF" opacity="0.4" />
                  <path d="M 50 65 Q 50 75 50 85" stroke="#81ECEC" stroke-width="2" fill="none" />
                  <ellipse cx="50" cy="88" rx="6" ry="3" fill="#81ECEC" transform="rotate(-30 50 88)" opacity="0.5" />
                </svg>
                <p>花园还是空的，开始记录第一份心情吧</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 查看心情详情弹窗 -->
    <t-dialog
      v-model:visible="showDetailDialog"
      header="查看心情"
      :footer="false"
      width="600px"
    >
      <div class="mood-detail" v-if="selectedRecord">
        <div class="detail-flower">
          <FlowerIllustration :mood="selectedRecord.mood" />
        </div>
        <div class="detail-date">{{ formatDetailDate(selectedRecord.date) }}</div>
        <div class="detail-mood">
          心情：{{ getMoodLabel(selectedRecord.mood) }}
        </div>
        <div class="detail-diary">
          <h4>日记</h4>
          <p>{{ selectedRecord.diary }}</p>
        </div>
        <div v-if="selectedRecord.chatHistory && selectedRecord.chatHistory.length > 0" class="detail-chat">
          <h4>对话记录</h4>
          <div class="chat-history">
            <div
              v-for="(msg, index) in selectedRecord.chatHistory"
              :key="index"
              class="chat-record"
              :class="msg.role"
            >
              <span class="chat-role">{{ msg.role === 'user' ? '你' : 'AI' }}：</span>
              <span class="chat-content">{{ msg.content }}</span>
            </div>
          </div>
        </div>
        <div class="detail-actions">
          <t-button theme="danger" variant="outline" @click="deleteRecord(selectedRecord)">
            删除这朵花
          </t-button>
        </div>
      </div>
    </t-dialog>

      <!-- 花园库配置弹窗 -->
      <t-dialog
        v-model:visible="showGardenLibraryDialog"
        header="🏡 花园库配置"
        width="800px"
        :footer="false"
      >
        <div class="garden-config-dialog">
        <div class="config-header">
          <p class="config-tip">自定义每种情绪对应的花朵类型，打造属于你的独特花园！</p>
          <div class="config-actions">
            <t-button theme="default" variant="outline" size="small" @click="resetToDefaultConfig">
              恢复默认
            </t-button>
          </div>
        </div>
        <div class="mood-flower-mapping">
          <div
            v-for="mood in moods"
            :key="mood.value"
            class="mapping-item"
          >
            <div class="mood-info">
              <span class="mood-emoji">{{ mood.emoji }}</span>
              <span class="mood-name">{{ mood.label }}</span>
            </div>
            <div class="flower-selector">
              <t-select
                v-model="gardenConfig[mood.value]"
                :placeholder="`选择${mood.label}的花朵`"
                size="small"
                style="width: 200px"
              >
                <t-option
                  v-for="flower in availableFlowers"
                  :key="flower.value"
                  :value="flower.value"
                  :label="flower.label"
                >
                  <span class="flower-option">
                    <span class="flower-emoji">{{ flower.emoji }}</span>
                    <span class="flower-name">{{ flower.label }}</span>
                  </span>
                </t-option>
              </t-select>
            </div>
          </div>
        </div>
        <div class="config-footer">
          <t-button theme="primary" size="large" @click="saveGardenConfig">
            保存配置
          </t-button>
          <t-button theme="default" variant="outline" size="large" @click="showGardenLibraryDialog = false">
            取消
          </t-button>
        </div>
        </div>
      </t-dialog>

      <!-- AI配置弹窗 -->
      <t-dialog
        v-model:visible="showConfigDialog"
        header="AI服务已配置"
        :confirm-btn="{
          content: '我知道了',
          theme: 'primary'
        }"
        @confirm="showConfigDialog = false"
      >
        <div class="config-dialog">
          <div class="config-info">
            <p class="info-text">AI服务已由系统预配置，您可以直接使用智能聊天功能，无需额外设置。</p>
            <div class="current-status">
              <span>当前使用：</span>
              <span class="status-ok">
                {{ aiService.getConfig().providerName }}
              </span>
            </div>
          </div>
        </div>
      </t-dialog>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import aiService from './services/aiService.js'
import MoodIllustration from './components/MoodIllustration.vue'
import FlowerIllustration from './components/FlowerIllustration.vue'
import Garden3D from './components/Garden3D.vue'

// 心情选项
const moods = [
  { value: 'happy', label: '开心', emoji: '😊', flower: '🌻' },
  { value: 'sad', label: '难过', emoji: '😢', flower: '🌧️' },
  { value: 'angry', label: '生气', emoji: '😤', flower: '🌹' },
  { value: 'calm', label: '平静', emoji: '😌', flower: '🌿' },
  { value: 'excited', label: '兴奋', emoji: '🤩', flower: '🌸' },
  { value: 'tired', label: '疲惫', emoji: '😴', flower: '🥀' },
  { value: 'anxious', label: '焦虑', emoji: '😰', flower: '🍂' },
  { value: 'hopeful', label: '充满希望', emoji: '🌟', flower: '🌺' }
]

// 可用的花卉模型列表
const availableFlowers = [
  { value: 'sunflower向日葵.glb', label: '向日葵', emoji: '🌻' },
  { value: 'daisy小雏菊.glb', label: '小雏菊', emoji: '🌼' },
  { value: 'dandelion蒲公英.glb', label: '蒲公英', emoji: '🌾' },
  { value: 'generic_tulip_flower郁金香.glb', label: '郁金香', emoji: '🌷' },
  { value: 'chrysanthemum绿菊花.glb', label: '绿菊花', emoji: '💚' },
  { value: 'Blue Daze蓝星花.glb', label: '蓝星花', emoji: '💙' },
  { value: 'Lavender薰衣草.glb', label: '薰衣草', emoji: '💜' },
  { value: 'pinkmagnolia粉色玉兰花.glb', label: '粉色玉兰花', emoji: '💗' },
  { value: 'pinkrose粉玫瑰.glb', label: '粉玫瑰', emoji: '🌸' },
  { value: 'rose_red红玫瑰.glb', label: '红玫瑰', emoji: '❤️' },
  { value: 'Myosotis勿忘我.glb', label: '勿忘我', emoji: '💙' },
  { value: 'daffodils黄水仙.glb', label: '黄水仙', emoji: '🌼' }
]

// 默认花园配置
const defaultGardenConfig = {
  happy: 'sunflower向日葵.glb', // 开心 - 向日葵
  sad: 'daisy小雏菊.glb', // 难过 - 小雏菊
  angry: 'rose_red红玫瑰.glb', // 生气 - 红玫瑰
  calm: 'Lavender薰衣草.glb', // 平静 - 薰衣草
  excited: 'daffodils黄水仙.glb', // 兴奋 - 黄水仙
  tired: 'pinkrose粉玫瑰.glb', // 疲惫 - 粉玫瑰
  anxious: 'dandelion蒲公英.glb', // 焦虑 - 蒲公英
  hopeful: 'Blue Daze蓝星花.glb' // 充满希望 - 蓝星花
}

// 状态管理
const currentView = ref('garden')
const recordMode = ref('write')
const selectedMood = ref('')
const diaryContent = ref('')
const chatInput = ref('')
const chatMessages = ref([])
const chatContainer = ref(null)
const moodRecords = ref([])
const showDetailDialog = ref(false)
const selectedRecord = ref(null)
const showConfigDialog = ref(false)
const isAIResponseLoading = ref(false)
const isSummarizing = ref(false)
const generatedDiary = ref('')
const showGardenLibraryDialog = ref(false) // 花园库配置弹窗
const gardenConfig = ref({ ...defaultGardenConfig }) // 当前花园配置

// 计算属性
const canSave = computed(() => {
  return selectedMood.value && (diaryContent.value.trim() || chatMessages.value.length > 0)
})

// 查看生成结果
const showDiaryResult = () => {
  DialogPlugin.confirm({
    header: '生成的日记',
    body: () => {
      return `<div class="diary-result">${generatedDiary.value}</div>`
    },
    confirmBtn: '保存到花园',
    cancelBtn: '再编辑一下',
    onConfirm: () => {
      diaryContent.value = generatedDiary.value
      recordMode.value = 'write'
    },
    onCancel: () => {
      diaryContent.value = generatedDiary.value
      recordMode.value = 'write'
    }
  })
}

// 发送聊天消息
const sendChatMessage = async () => {
  if (!chatInput.value.trim()) return

  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: chatInput.value
  })

  const userInput = chatInput.value
  chatInput.value = ''

  // 滚动到底部
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })

  try {
    isAIResponseLoading.value = true
    const aiResponse = await aiService.generateAIResponse(
      chatMessages.value,
      selectedMood.value || 'calm'
    )

    chatMessages.value.push({
      role: 'ai',
      content: aiResponse
    })

    // 滚动到底部
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    })
  } catch (err) {
    console.error('发送消息错误:', err)
    MessagePlugin.error(err.message || 'AI回复失败，请重试')
  } finally {
    isAIResponseLoading.value = false
  }
}

// 保存心情
const saveMood = async () => {
  if (!canSave.value) return

  try {
    let diaryContentToSave

    if (recordMode.value === 'write') {
      diaryContentToSave = diaryContent.value
    } else {
      // 如果是AI对话模式，生成总结
      MessagePlugin.loading('正在生成日记总结...')
      diaryContentToSave = await generateAISummary()
    }

    const record = {
      id: Date.now(),
      mood: selectedMood.value,
      date: new Date().toISOString(),
      diary: diaryContentToSave,
      chatHistory: recordMode.value === 'chat' ? [...chatMessages.value] : null,
      mode: recordMode.value
    }

    moodRecords.value.unshift(record)
    saveToLocalStorage()

    // 重置表单（只重置内容，保留心情选择，允许重复记录）
    diaryContent.value = ''
    chatMessages.value = []
    generatedDiary.value = ''

    MessagePlugin.success(`🌸 一朵${getMoodLabel(record.mood)}之花已在花园绽放`)

    // 自动跳转到3D花园
    setTimeout(() => {
      currentView.value = 'garden-3d'
    }, 1000)
  } catch (err) {
    MessagePlugin.error('保存失败，请重试')
    console.error('保存失败:', err)
  }
}

// AI总结日记
const generateAISummary = async () => {
  try {
    const summary = await aiService.generateAISummary(
      chatMessages.value,
      selectedMood.value || 'calm'
    )
    return summary
  } catch (err) {
    console.log('使用默认总结:', err.message)
    return aiService.generateDefaultSummary(chatMessages.value, selectedMood.value || 'calm')
  }
}

// 总结日记
const summarizeDiary = async () => {
  if (!selectedMood.value) {
    MessagePlugin.warning('请先选择今天的心情')
    return
  }

  try {
    isSummarizing.value = true
    MessagePlugin.loading('正在生成日记，让灵感绽放...')
    generatedDiary.value = await generateAISummary()
    MessagePlugin.success('日记生成成功！')

    // 显示生成的日记
    DialogPlugin.confirm({
      header: '📝 生成的日记',
      body: () => {
        return `<div class="diary-result">${generatedDiary.value.replace(/\n/g, '<br>')}</div>`
      },
      confirmBtn: '保存到花园',
      cancelBtn: '重新生成',
      onConfirm: () => {
        diaryContent.value = generatedDiary.value
        recordMode.value = 'write'
      },
      onCancel: () => {
        summarizeDiary()
      }
    })
  } catch (err) {
    MessagePlugin.error('生成日记失败，请重试')
  } finally {
    isSummarizing.value = false
  }
}

// 获取花朵
const getFlower = (mood) => {
  const moodConfig = moods.find(m => m.value === mood)
  return moodConfig ? moodConfig.flower : '🌷'
}

// 获取心情标签
const getMoodLabel = (mood) => {
  const moodConfig = moods.find(m => m.value === mood)
  return moodConfig ? moodConfig.label : '未知'
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

// 格式化详细日期
const formatDetailDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 查看心情详情
const viewMoodDetail = (record) => {
  selectedRecord.value = record
  showDetailDialog.value = true
}

// 删除记录
const deleteRecord = (record) => {
  DialogPlugin.confirm({
    title: '确认删除',
    content: '确定要删除这朵花吗？删除后无法恢复。',
    onConfirm: () => {
      moodRecords.value = moodRecords.value.filter(r => r.id !== record.id)
      saveToLocalStorage()
      showDetailDialog.value = false
      MessagePlugin.success('已删除这朵花')
    }
  })
}

// 本地存储
const saveToLocalStorage = () => {
  localStorage.setItem('moodGardenRecords', JSON.stringify(moodRecords.value))
}

const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('moodGardenRecords')
  if (saved) {
    moodRecords.value = JSON.parse(saved)
  }
}

// 生命周期
onMounted(() => {
  loadFromLocalStorage()
  loadGardenConfig()
})

// 花园库配置相关
const loadGardenConfig = () => {
  try {
    const savedConfig = localStorage.getItem('gardenLibraryConfig')
    if (savedConfig) {
      gardenConfig.value = JSON.parse(savedConfig)
    }
  } catch (e) {
    console.error('读取花园配置失败:', e)
  }
}

const saveGardenConfig = () => {
  try {
    localStorage.setItem('gardenLibraryConfig', JSON.stringify(gardenConfig.value))
    MessagePlugin.success('花园配置已保存')
    showGardenLibraryDialog.value = false
  } catch (e) {
    MessagePlugin.error('保存失败，请重试')
    console.error('保存花园配置失败:', e)
  }
}

const resetToDefaultConfig = () => {
  gardenConfig.value = { ...defaultGardenConfig }
  MessagePlugin.success('已恢复默认配置')
}

// AI配置相关
const openConfigDialog = () => {
  showConfigDialog.value = true
}

</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF9F0 0%, #FFE8E1 50%, #E8F4F8 100%);
  padding: 20px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 主视图 */
.main-view {
  animation: fadeIn 0.8s ease-out;
  position: relative;
  z-index: 1;
}

.home-view {
  min-height: 100vh;
}

/* 主界面过渡动画 */
.main-fade-enter-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* 动画关键帧 */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes float-small {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(5deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.header {
  padding: 35px 30px;
  background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 50%, #FECFEF 100%);
  border-radius: 25px;
  margin-bottom: 30px;
  box-shadow: 0 8px 25px rgba(255, 154, 158, 0.2);
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  pointer-events: none;
}

.header::after {
  content: '';
  position: absolute;
  bottom: -30px;
  left: -30px;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  pointer-events: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.header-text {
  flex: 1;
}

.title {
  font-size: 2.2rem;
  color: white;
  margin-bottom: 8px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
  font-weight: 600;
  letter-spacing: 1px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1rem;
  font-weight: 400;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-illustration {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
}

.garden-icon {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 10px rgba(196, 77, 255, 0.3));
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 记录区域 */
.record-section {
  margin-bottom: 40px;
}

.record-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 35px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

/* 心情选择器 */
.mood-selector {
  margin-bottom: 30px;
}

.mood-selector h3 {
  margin-bottom: 20px;
  color: #4A4A4A;
  font-size: 1.3rem;
  font-weight: 500;
}

.mood-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.mood-option {
  padding: 18px 12px;
  border: 2px solid #F0F0F0;
  border-radius: 18px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  position: relative;
  overflow: hidden;
}

.mood-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #FFB8CA 0%, #FFD1DC 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 0;
}

.mood-option:hover {
  border-color: #FF9A9E;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(255, 154, 158, 0.2);
}

.mood-option:hover::before {
  opacity: 0.1;
}

.mood-option.selected {
  border-color: #FF9A9E;
  background: linear-gradient(135deg, #FFF5F5 0%, #FFE8E8 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(255, 154, 158, 0.25);
}

.mood-option.selected::before {
  opacity: 0.05;
}

.mood-illustration-container {
  width: 70px;
  height: 70px;
  margin: 0 auto 10px;
  position: relative;
  z-index: 1;
}

.mood-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #4A4A4A;
  position: relative;
  z-index: 1;
}

.mood-option.selected .mood-label {
  color: #D63031;
}

/* 写日记模式 */
.diary-mode {
  margin-bottom: 25px;
}

.diary-mode h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.3rem;
}

.diary-textarea {
  font-size: 1rem;
  line-height: 1.6;
}

/* AI对话模式 */
.ai-chat-mode {
  margin-bottom: 25px;
}

.ai-chat-mode h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.3rem;
}

.chat-messages {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  background: #f9f9f9;
  margin-bottom: 15px;
}

.message {
  margin-bottom: 15px;
}

.message.user {
  text-align: right;
}

.message.ai {
  text-align: left;
}

.message-content {
  display: inline-block;
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message.ai .message-content {
  background: #f0f0f0;
  color: #333;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex: 1;
}

.summary-section {
  margin-top: 15px;
  text-align: center;
}

.summary-section button {
  width: 100%;
}

/* 模式切换 */
.mode-toggle {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}

/* 保存按钮 */
.save-section {
  text-align: center;
}

.save-section button {
  font-size: 1.1rem;
  padding: 12px 40px;
}

/* 花园区域 */
.garden-section {
  margin-top: 40px;
}

.garden-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.garden-title h2 {
  color: #333;
  font-size: 1.8rem;
}

.flower-count {
  color: #667eea;
  font-weight: 500;
  font-size: 1.1rem;
}

.garden-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 25px;
}

.flower-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
}

.flower-item::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(135deg, #FFE4E1 0%, #FFE8E1 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  transform: rotate(45deg);
}

.flower-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 30px rgba(255, 154, 158, 0.15);
}

.flower-item:hover::before {
  opacity: 0.5;
}

.flower {
  width: 90px;
  height: 90px;
  margin: 0 auto 12px;
  position: relative;
  z-index: 1;
}

.flower-date {
  color: #7A7A7A;
  font-size: 0.85rem;
  position: relative;
  z-index: 1;
  font-weight: 400;
}

.empty-garden {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  opacity: 0.6;
}

.empty-garden p {
  color: #999;
  font-size: 1.1rem;
}

/* 心情详情 */
.mood-detail {
  text-align: center;
}

.detail-flower {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}

.detail-date {
  color: #666;
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.detail-mood {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 25px;
  font-weight: 500;
}

.detail-diary {
  text-align: left;
  margin-bottom: 25px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
}

.detail-diary h4 {
  color: #667eea;
  margin-bottom: 12px;
  font-size: 1rem;
}

.detail-diary p {
  line-height: 1.8;
  color: #555;
  white-space: pre-wrap;
}

.detail-chat {
  text-align: left;
  margin-bottom: 25px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
}

.detail-chat h4 {
  color: #667eea;
  margin-bottom: 12px;
  font-size: 1rem;
}

.chat-history {
  max-height: 250px;
  overflow-y: auto;
}

.chat-record {
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  line-height: 1.6;
}

.chat-record.user {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  text-align: right;
}

.chat-record.ai {
  background: #f0f0f0;
  text-align: left;
}

.chat-role {
  font-weight: 600;
  margin-right: 5px;
}

.chat-record.user .chat-role {
  color: #667eea;
}

.chat-record.ai .chat-role {
  color: #764ba2;
}

.detail-actions {
  margin-top: 20px;
}

/* AI配置对话框 */
.config-dialog {
  padding: 10px 0;
}

.config-info {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.info-text {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.6;
}

.current-status {
  font-size: 0.95rem;
}

.current-status span {
  margin-right: 8px;
}

.status-ok {
  color: #52c41a;
  font-weight: 500;
}

/* 日记结果样式 */
.diary-result {
  padding: 20px;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  border-radius: 12px;
  line-height: 2;
  color: #333;
  font-size: 1rem;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
}

/* 花园库配置弹窗 */
.garden-config-dialog {
  padding: 10px 0;
}

.config-header {
  margin-bottom: 30px;
}

.config-tip {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 15px;
}

.config-actions {
  display: flex;
  justify-content: flex-end;
}

.mood-flower-mapping {
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 25px;
}

.mapping-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.mapping-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #FF9A9E;
}

.mood-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mood-emoji {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFE8E1 0%, #FFF5F5 100%);
  border-radius: 50%;
}

.mood-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
}

.flower-selector {
  flex-shrink: 0;
}

.flower-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flower-emoji {
  font-size: 1.2rem;
}

.flower-name {
  font-size: 0.95rem;
}

.config-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .header-illustration {
    margin-left: 0;
    margin-top: 15px;
  }

  .title {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 0.95rem;
  }

  .mood-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .mood-illustration-container {
    width: 55px;
    height: 55px;
  }

  .mood-label {
    font-size: 0.8rem;
  }

  .garden-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 15px;
  }

  .flower {
    width: 70px;
    height: 70px;
  }

  .detail-flower {
    width: 90px;
    height: 90px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 25px 20px;
  }

  .title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.85rem;
  }

  .mood-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .mood-option {
    padding: 14px 10px;
  }

  .mood-illustration-container {
    width: 50px;
    height: 50px;
  }

  .mood-label {
    font-size: 0.75rem;
  }

  .garden-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

</style>
