<template>
  <div id="app" class="app-container">
    <div class="header">
      <h1 class="title">🌸 心情花园 🌸</h1>
      <p class="subtitle">记录每一份情绪，培育属于自己的心灵花园</p>
    </div>

    <div class="main-content">
      <!-- 记录心情区域 -->
      <div class="record-section" v-if="currentView === 'garden'">
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
                <div class="mood-emoji">{{ mood.emoji }}</div>
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
              @click="saveMood"
            >
              在花园里种下一朵花 🌷
            </t-button>
          </div>
        </t-card>
      </div>

      <!-- 花园视图 -->
      <div class="garden-section" v-if="currentView === 'garden'">
        <div class="garden-title">
          <h2>我的花园</h2>
          <p class="flower-count">{{ moodRecords.length }} 朵花</p>
        </div>
        <div class="garden-grid" v-if="moodRecords.length > 0">
          <div
            v-for="(record, index) in moodRecords"
            :key="index"
            class="flower-item"
            @click="viewMoodDetail(record)"
          >
            <div class="flower">{{ getFlower(record.mood) }}</div>
            <div class="flower-date">{{ formatDate(record.date) }}</div>
          </div>
        </div>
        <div class="empty-garden" v-else>
          <div class="empty-icon">🌱</div>
          <p>花园还是空的，开始记录第一份心情吧</p>
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
        <div class="detail-flower">{{ getFlower(selectedRecord.mood) }}</div>
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
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'

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

// 计算属性
const canSave = computed(() => {
  return selectedMood.value && (diaryContent.value.trim() || chatMessages.value.length > 0)
})

// AI模拟对话
const aiResponses = [
  "我理解你现在的感受，能多跟我说说吗？",
  "听起来你今天过得很特别，还有什么想分享的吗？",
  "你的情绪很重要，我会一直在这里倾听。",
  "这一天对你来说有什么特别的吗？",
  "谢谢你和我分享，我会帮你记住这份心情。",
  "我能感受到你此刻的情绪，继续说下去吧。",
  "每一份情绪都值得被记录和珍视。",
  "你的感受很真实，继续和我说说吧。"
]

// 发送聊天消息
const sendChatMessage = () => {
  if (!chatInput.value.trim()) return

  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: chatInput.value
  })

  const userInput = chatInput.value
  chatInput.value = ''

  // 模拟AI回复
  setTimeout(() => {
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
    chatMessages.value.push({
      role: 'ai',
      content: randomResponse
    })
    
    // 滚动到底部
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    })
  }, 1000)
}

// 保存心情
const saveMood = () => {
  if (!canSave.value) return

  const record = {
    id: Date.now(),
    mood: selectedMood.value,
    date: new Date().toISOString(),
    diary: recordMode.value === 'write' ? diaryContent.value : generateAISummary(),
    chatHistory: recordMode.value === 'chat' ? [...chatMessages.value] : null,
    mode: recordMode.value
  }

  moodRecords.value.unshift(record)
  saveToLocalStorage()
  
  // 重置表单
  selectedMood.value = ''
  diaryContent.value = ''
  chatMessages.value = []
  
  MessagePlugin.success(`🌸 一朵${getMoodLabel(selectedMood.value || record.mood)}之花已在花园绽放`)
}

// AI总结日记
const generateAISummary = () => {
  const summaries = [
    `今天我经历了一次与AI的对话，记录下了当下的感受。虽然对话简单，但每一个字都承载着真实的情绪。${chatMessages.value.length > 1 ? '通过与AI的交流，我更清晰地认识到了自己的内心世界。' : ''}`,
    `这一天，我选择用对话的方式记录心情。${chatMessages.value[0]?.content || ''} AI的倾听让我感到温暖，这份互动成为今日最珍贵的回忆。`,
    `在${new Date().toLocaleDateString()}的这个时刻，我与AI进行了一次深入的心灵对话。每一句话都是情感的真实流露，AI的陪伴让我不再孤单。`,
    `今天的日记来源于与AI的对话。${chatMessages.value.slice(0, 2).map(msg => msg.content).join(' ')} 这份独特的记录方式让情绪表达变得更加轻松自在。`
  ]
  
  return summaries[Math.floor(Math.random() * summaries.length)]
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
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  padding: 20px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.header {
  text-align: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.title {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
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
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

/* 心情选择器 */
.mood-selector {
  margin-bottom: 30px;
}

.mood-selector h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 1.3rem;
}

.mood-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
}

.mood-option {
  padding: 20px 10px;
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.mood-option:hover {
  border-color: #667eea;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}

.mood-option.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.mood-emoji {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.mood-label {
  font-size: 0.9rem;
  font-weight: 500;
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
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 25px;
}

.flower-item {
  background: white;
  border-radius: 15px;
  padding: 25px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.flower-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.flower {
  font-size: 4rem;
  margin-bottom: 10px;
  animation: bloom 0.5s ease-out;
}

@keyframes bloom {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.flower-date {
  color: #666;
  font-size: 0.9rem;
}

.empty-garden {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 20px;
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
  font-size: 5rem;
  margin-bottom: 15px;
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

/* 响应式 */
@media (max-width: 768px) {
  .title {
    font-size: 1.8rem;
  }
  
  .subtitle {
    font-size: 0.95rem;
  }
  
  .mood-options {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .garden-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
  }
}
</style>
