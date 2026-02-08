<template>
  <div class="app-container" @wheel="handleWheel" @touchmove="handleTouchMove" @mousemove="handleMouseMove">
    <!-- 粒子背景 - 只在3D花园显示 -->
    <ParticleBackground v-if="currentView === 'garden-3d'" />

    <!-- 语言切换按钮 - 不在3D花园显示 -->
    <button v-if="currentView !== 'garden-3d'" class="lang-switch" @click="toggleLanguage">
      <span class="lang-flag">{{ currentLang === 'zh' ? '🇨🇳' : '🇬🇧' }}</span>
      <span class="lang-text">{{ currentLang === 'zh' ? '中文' : 'EN' }}</span>
    </button>

    <!-- 浮动功能按钮区域 - 不在3D花园显示 -->
    <div v-if="currentView !== 'garden-3d'" class="floating-actions">
      <button class="action-btn" @click="showGardenLibraryDialog = true" :title="t('gardenLibraryTitle')">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 1 4.5 4.5m-4.5-4.5V12m9-4.5a4.5 4.5 0 1 1 4.5 4.5M12 16.5V18"/>
          <circle cx="12" cy="7.5" r="1.5"/>
          <circle cx="7.5" cy="12" r="1.5"/>
          <circle cx="16.5" cy="12" r="1.5"/>
          <circle cx="12" cy="16.5" r="1.5"/>
        </svg>
        <span class="btn-label">{{ t('gardenLibrary') }}</span>
      </button>
      <button class="action-btn" @click="currentView = 'garden-3d'" :title="t('garden3dTitle')">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11l-9-4-9 4z"/>
        </svg>
        <span class="btn-label">{{ t('garden3d') }}</span>
      </button>
      <button class="action-btn" @click="scrollToHistory" :title="t('myDiaryTitle')">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <span class="btn-label">{{ t('myDiary') }}</span>
      </button>
    </div>

    <!-- 主内容区 - 使用固定容器实现无滚动切换 -->
    <div class="main-content">
      <!-- 3D花园视图 -->
      <Garden3D v-if="currentView === 'garden-3d'" :records="moodRecords" :currentLang="currentLang" @back="currentView = 'garden'" />

      <!-- 首页视图 - 固定全屏显示 -->
      <div v-else class="home-view" :class="`season-${currentSeason}`">
        <!-- 视频背景 -->
        <VideoBackground
          videoSrc="/videos/gradient-bg.mp4"
        />
        <!--
        <div class="mood-flow-background">
          <div class="flow-blob blob-1" :style="getBlobStyle(1)"></div>
          <div class="flow-blob blob-2" :style="getBlobStyle(2)"></div>
          <div class="flow-blob blob-3" :style="getBlobStyle(3)"></div>
          <div class="flow-blob blob-4" :style="getBlobStyle(4)"></div>
          <div class="flow-blob blob-5" :style="getBlobStyle(5)"></div>
          <div class="flow-blob blob-6" :style="getBlobStyle(6)"></div>
        </div>
        -->

        <!-- 第1屏：英雄区域 - MoodGarden标题 -->
        <section class="hero-section" :class="{ active: currentSection === 'hero' }">
          <div class="hero-content">
            <h1 class="hero-title" :class="{ 'title-visible': showTitle }">
              {{ t('title') }}
            </h1>
            <p class="hero-subtitle" :class="{ 'subtitle-visible': showTitle }">
              {{ t('heroSubtitle') }}
            </p>
            <div class="scroll-hint">
              <span>{{ t('scrollToBegin') }}</span>
              <svg class="scroll-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </section>

        <!-- 第2屏：心情选择 -->
        <section class="mood-selection-section" :class="{ active: currentSection === 'mood' }">
          <div class="wave-guide">
            <div class="wave"></div>
          </div>
          <div class="section-content">
            <h2 class="section-title">
              <span class="title-icon">✨</span>
              {{ t('moodTitle') }}
              <span class="title-icon">✨</span>
            </h2>
            <p class="section-subtitle">{{ t('moodSubtitle') }}</p>

            <div class="mood-grid">
              <div
                v-for="mood in moodsI18n"
                :key="mood.value"
                class="mood-card"
                :class="{ selected: selectedMood === mood.value }"
                @click="selectMood(mood)"
              >
                <div class="mood-card-header">
                  <div class="mood-emoji">{{ mood.emoji }}</div>
                  <div class="mood-label">{{ mood.label }}</div>
                </div>
                <div class="mood-quote">{{ mood.quote }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 第3屏：日记/AI聊天 -->
        <section class="journal-section" :class="{ active: currentSection === 'journal' }">
          <div class="wave-guide">
            <div class="wave"></div>
          </div>
          <div class="section-content">
            <h2 class="section-title">
              <span class="title-icon">🌸</span>
              {{ t('journalTitle') }}
              <span class="title-icon">🌸</span>
            </h2>
            <p class="section-subtitle">{{ t('journalSubtitle') }}</p>

            <!-- 未选择心情提示 -->
            <div v-if="!selectedMood" class="mood-reminder">
              <div class="reminder-icon">💭</div>
              <p class="reminder-text">{{ t('pleaseSelectMood') }}</p>
              <button class="go-select-mood-btn" @click="currentSection = 'mood'">
                {{ t('goSelectMood') }}
              </button>
            </div>

            <!-- 已选择心情，显示写日记/AI聊天 -->
            <template v-else>
              <!-- 模式切换 -->
              <div class="mode-tabs">
                <button
                  class="mode-tab"
                  :class="{ active: recordMode === 'write' }"
                  @click="recordMode = 'write'"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  {{ t('writeDiary') }}
                </button>
                <button
                  class="mode-tab"
                  :class="{ active: recordMode === 'chat' }"
                  @click="recordMode = 'chat'"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {{ t('aiChat') }}
                </button>
              </div>

            <!-- 换个心情和日期按钮 -->
            <div class="change-options">
              <button class="change-mood-btn" @click="changeMood">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                {{ t('changeMood') }}
              </button>
              <button class="change-date-btn" @click="showDatePicker = true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {{ t('changeDate') }}
              </button>
            </div>

            <!-- 日期选择器弹窗 -->
            <t-dialog
              v-model:visible="showDatePicker"
              :header="t('selectDate')"
              :footer="false"
              width="400px"
            >
              <div class="date-picker-dialog">
                <input
                  type="date"
                  v-model="selectedDate"
                  class="date-input"
                />
                <div class="date-picker-actions">
                  <t-button theme="primary" @click="confirmDate">
                    {{ t('today') }}
                  </t-button>
                  <t-button theme="default" variant="outline" @click="showDatePicker = false">
                    {{ t('confirmBtn') }}
                  </t-button>
                </div>
              </div>
            </t-dialog>

              <!-- 写日记模式 -->
              <div v-if="recordMode === 'write'" class="write-container">
                <textarea
                  v-model="diaryContent"
                  class="diary-textarea"
                  :placeholder="t('diaryPlaceholder')"
                ></textarea>
              </div>

              <!-- AI聊天模式 -->
              <div v-if="recordMode === 'chat'" class="chat-container">
                <div class="chat-messages" ref="chatMessagesRef">
                  <div
                    v-for="(msg, index) in chatMessages"
                    :key="index"
                    class="message"
                    :class="msg.role"
                  >
                    <div class="message-content">{{ msg.content }}</div>
                  </div>
                </div>
                <div class="chat-input-wrapper">
                  <input
                    v-model="chatInput"
                    class="chat-input"
                    :placeholder="t('chatPlaceholder')"
                    @keypress.enter="sendChatMessage"
                  />
                  <button class="send-btn" @click="sendChatMessage">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
                <div class="chat-actions">
                  <button
                    v-if="chatMessages.length > 0"
                    class="summarize-btn"
                    @click="summarizeDiary"
                  >
                    ✨ {{ t('summarize') }}
                  </button>
                  <button
                    v-if="chatMessages.length > 0"
                    class="clear-chat-btn"
                    @click="clearChatMessages"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                    {{ t('clearChat') }}
                  </button>
                </div>
              </div>

              <!-- 种花按钮 -->
              <button
                class="plant-flower-btn"
                :disabled="!canSave"
                @click="plantFlower"
              >
                <span class="btn-icon">🌷</span>
                {{ t('plantFlower') }}
              </button>
            </template>
          </div>
        </section>

        <!-- 第4屏：历史花园 -->
        <section class="history-section" :class="{ active: currentSection === 'history' }">
          <!-- 返回首页按钮 -->
          <button class="history-back-btn" @click="goBackToHome">
            <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>{{ t('backToHome') }}</span>
          </button>
          <div class="section-content">
            <h2 class="section-title">
              <span class="title-icon">🌺</span>
              {{ t('myDiary') }}
              <span class="title-icon">🌺</span>
            </h2>
            <p class="flower-count">{{ t('flowerCount').replace('xx', moodRecords.length) }}</p>

            <!-- 日期筛选 -->
            <div class="date-filter">
              <button
                class="filter-btn"
                :class="{ active: historyFilterDate === '' }"
                @click="historyFilterDate = ''"
              >
                {{ t('allDates') }}
              </button>
              <input
                type="date"
                v-model="historyFilterDate"
                class="filter-date-input"
                :placeholder="t('filterByDate')"
              />
              <button
                class="export-album-btn"
                @click="exportAlbum"
                :disabled="filteredRecords.length === 0"
              >
                {{ t('exportAlbum') }}
              </button>
            </div>

            <div v-if="filteredRecords.length > 0" class="garden-grid">
              <div
                v-for="(record, index) in filteredRecords"
                :key="index"
                class="flower-card"
                @click="viewMoodDetail(record)"
              >
                <div class="flower-emoji">
                  <FlowerIllustration :mood="record.mood" />
                </div>
                <div class="flower-date">{{ formatDate(record.date) }}</div>
                <div class="flower-mood">{{ getMoodLabel(record.mood) }}</div>
              </div>
            </div>
            <div v-else class="empty-garden">
              <div class="empty-icon">🌱</div>
              <p>{{ t('emptyGarden') }}</p>
              <p class="empty-hint">{{ t('emptyGardenHint') }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- 查看心情详情弹窗 -->
    <t-dialog
      v-model:visible="showDetailDialog"
      :header="t('viewMoodTitle')"
      :footer="false"
      width="600px"
    >
      <div class="mood-detail" v-if="selectedRecord">
        <div class="detail-flower">
          <FlowerIllustration :mood="selectedRecord.mood" />
        </div>
        <div class="detail-date">{{ formatDetailDate(selectedRecord.date) }}</div>
        <div class="detail-mood">
          {{ t('moodTitle') }}{{ getMoodLabel(selectedRecord.mood) }}
        </div>
        <div class="detail-diary">
          <h4>{{ t('diaryLabel') }}</h4>
          <p>{{ selectedRecord.diary }}</p>
        </div>
        <div v-if="selectedRecord.chatHistory && selectedRecord.chatHistory.length > 0" class="detail-chat">
          <h4>{{ t('chatHistoryLabel') }}</h4>
          <div class="chat-history">
            <div
              v-for="(msg, index) in selectedRecord.chatHistory"
              :key="index"
              class="chat-record"
              :class="msg.role"
            >
              <span class="chat-role">{{ msg.role === 'user' ? t('youLabel') : t('aiLabel') }}：</span>
              <span class="chat-content">{{ msg.content }}</span>
            </div>
          </div>
        </div>
        <div class="detail-actions">
          <t-button theme="default" variant="outline" @click="exportAsImage(selectedRecord)">
            {{ t('exportFlower') }}
          </t-button>
          <t-button theme="danger" variant="outline" @click="deleteRecord(selectedRecord)">
            {{ t('deletFlowerBtn') }}
          </t-button>
        </div>
      </div>
    </t-dialog>

    <!-- 花园库配置弹窗 -->
    <t-dialog
      v-model:visible="showGardenLibraryDialog"
      :header="t('gardenConfigTitle')"
      width="800px"
      :footer="false"
    >
      <div class="garden-config-dialog">
        <div class="config-header">
          <p class="config-tip">{{ t('gardenConfigTip') }}</p>
          <div class="config-actions">
            <t-button theme="default" variant="outline" size="small" @click="resetToDefaultConfig">
              {{ t('resetDefaultBtn') }}
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
              <span class="mood-name">{{ currentLang === 'zh' ? mood.label_zh : mood.label_en }}</span>
            </div>
            <div class="flower-selector">
              <t-select
                v-model="gardenConfig[mood.value]"
                :placeholder="t('selectFlowerPlaceholder').replace('{mood}', currentLang === 'zh' ? mood.label_zh : mood.label_en)"
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
            {{ t('saveConfigBtn') }}
          </t-button>
          <t-button theme="default" variant="outline" size="large" @click="showGardenLibraryDialog = false">
            {{ t('cancelBtn') }}
          </t-button>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import html2canvas from 'html2canvas'
import aiService from './services/aiService.js'
import MoodIllustration from './components/MoodIllustration.vue'
import FlowerIllustration from './components/FlowerIllustration.vue'
import Garden3D from './components/Garden3D.vue'
import ParticleBackground from './components/ParticleBackground.vue'
import VideoBackground from './components/VideoBackground.vue'
import { i18n, moods, availableFlowers, defaultGardenConfig } from './i18n.js'

// 当前语言（从本地存储读取）
const currentLang = ref('zh')
// 语言切换


// 语言切换
const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
  // 保存语言偏好到本地存储
  localStorage.setItem('preferredLanguage', currentLang.value)
}

// 翻译函数
const t = (key) => {
  return i18n[currentLang.value][key] || key
}

// 计算属性：获取当前语言的心情列表
const moodsI18n = computed(() => {
  return moods.map(mood => ({
    ...mood,
    label: currentLang.value === 'zh' ? mood.label_zh : mood.label_en,
    quote: currentLang.value === 'zh' ? mood.quote_zh : mood.quote_en
  }))
})

// 旧的心情选项定义已移除




// 状态管理
const currentView = ref('garden')
const recordMode = ref('write')
const selectedMood = ref('')
const diaryContent = ref('')
const chatInput = ref('')
const chatMessages = ref([])
const chatMessagesRef = ref(null)
const moodRecords = ref([])
const showDetailDialog = ref(false)
const selectedRecord = ref(null)
const showGardenLibraryDialog = ref(false)
const gardenConfig = ref({ ...defaultGardenConfig })
const isSummarizing = ref(false)
const generatedDiary = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showDatePicker = ref(false)
const historyFilterDate = ref('')

// 当前显示的区块
const currentSection = ref('hero')
const showTitle = ref(false)
let isScrolling = false

// 当前季节状态
const currentSeason = ref('spring')

// 鼠标追踪
const mouseX = ref(0)
const mouseY = ref(0)
const isMouseActive = ref(false)

// 四季配色方案 - 柔和幻想花园风格
const seasonColorSchemes = {
  spring: {
    background: 'linear-gradient(135deg, #FFF5F5 0%, #F0FFF4 50%, #E6FFFA 100%)',
    blobs: [
      { gradient: 'linear-gradient(135deg, rgba(255, 182, 193, 0.4) 0%, rgba(255, 218, 185, 0.35) 100%)', size: 500, x: 15, y: 15 },
      { gradient: 'linear-gradient(135deg, rgba(144, 238, 144, 0.35) 0%, rgba(152, 251, 152, 0.3) 100%)', size: 450, x: 75, y: 65 },
      { gradient: 'linear-gradient(135deg, rgba(255, 218, 185, 0.3) 0%, rgba(255, 182, 193, 0.25) 100%)', size: 400, x: 40, y: 80 },
      { gradient: 'linear-gradient(135deg, rgba(230, 255, 250, 0.35) 0%, rgba(144, 238, 144, 0.3) 100%)', size: 480, x: 20, y: 70 },
      { gradient: 'linear-gradient(135deg, rgba(255, 182, 193, 0.3) 0%, rgba(230, 255, 250, 0.25) 100%)', size: 420, x: 65, y: 25 },
      { gradient: 'linear-gradient(135deg, rgba(144, 238, 144, 0.3) 0%, rgba(255, 218, 185, 0.25) 100%)', size: 380, x: 50, y: 50 }
    ]
  },
  summer: {
    background: 'linear-gradient(135deg, #FFFEF0 0%, #FFF5E6 50%, #FFF0F5 100%)',
    blobs: [
      { gradient: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 165, 0, 0.2) 100%)', size: 520, x: 12, y: 18 },
      { gradient: 'linear-gradient(135deg, rgba(50, 205, 50, 0.3) 0%, rgba(34, 139, 34, 0.25) 100%)', size: 460, x: 78, y: 62 },
      { gradient: 'linear-gradient(135deg, rgba(255, 165, 0, 0.25) 0%, rgba(255, 99, 71, 0.2) 100%)', size: 440, x: 42, y: 78 },
      { gradient: 'linear-gradient(135deg, rgba(50, 205, 50, 0.28) 0%, rgba(255, 215, 0, 0.22) 100%)', size: 500, x: 18, y: 72 },
      { gradient: 'linear-gradient(135deg, rgba(255, 99, 71, 0.22) 0%, rgba(50, 205, 50, 0.18) 100%)', size: 430, x: 70, y: 22 },
      { gradient: 'linear-gradient(135deg, rgba(255, 215, 0, 0.23) 0%, rgba(255, 165, 0, 0.19) 100%)', size: 400, x: 55, y: 55 }
    ]
  },
  autumn: {
    background: 'linear-gradient(135deg, #FFF8F0 0%, #FFFAF0 50%, #FFFBF0 100%)',
    blobs: [
      { gradient: 'linear-gradient(135deg, rgba(255, 140, 0, 0.28) 0%, rgba(210, 105, 30, 0.22) 100%)', size: 490, x: 14, y: 16 },
      { gradient: 'linear-gradient(135deg, rgba(218, 165, 32, 0.25) 0%, rgba(184, 134, 11, 0.2) 100%)', size: 450, x: 76, y: 64 },
      { gradient: 'linear-gradient(135deg, rgba(255, 99, 71, 0.24) 0%, rgba(205, 133, 63, 0.19) 100%)', size: 420, x: 44, y: 76 },
      { gradient: 'linear-gradient(135deg, rgba(210, 105, 30, 0.26) 0%, rgba(218, 165, 32, 0.21) 100%)', size: 470, x: 16, y: 74 },
      { gradient: 'linear-gradient(135deg, rgba(205, 133, 63, 0.21) 0%, rgba(255, 140, 0, 0.17) 100%)', size: 410, x: 72, y: 24 },
      { gradient: 'linear-gradient(135deg, rgba(218, 165, 32, 0.23) 0%, rgba(255, 99, 71, 0.18) 100%)', size: 390, x: 56, y: 52 }
    ]
  },
  winter: {
    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
    blobs: [
      { gradient: 'linear-gradient(135deg, rgba(173, 216, 230, 0.32) 0%, rgba(176, 196, 222, 0.26) 100%)', size: 510, x: 13, y: 17 },
      { gradient: 'linear-gradient(135deg, rgba(230, 230, 250, 0.28) 0%, rgba(224, 255, 255, 0.22) 100%)', size: 470, x: 77, y: 63 },
      { gradient: 'linear-gradient(135deg, rgba(176, 196, 222, 0.26) 0%, rgba(216, 191, 216, 0.2) 100%)', size: 440, x: 43, y: 77 },
      { gradient: 'linear-gradient(135deg, rgba(173, 216, 230, 0.3) 0%, rgba(230, 230, 250, 0.24) 100%)', size: 490, x: 17, y: 73 },
      { gradient: 'linear-gradient(135deg, rgba(216, 191, 216, 0.22) 0%, rgba(224, 255, 255, 0.18) 100%)', size: 430, x: 71, y: 23 },
      { gradient: 'linear-gradient(135deg, rgba(230, 230, 250, 0.24) 0%, rgba(173, 216, 230, 0.19) 100%)', size: 410, x: 54, y: 54 }
    ]
  }
}

// 季节自动切换
const switchSeason = () => {
  const seasons = ['spring', 'summer', 'autumn', 'winter']
  const currentIndex = seasons.indexOf(currentSeason.value)
  currentSeason.value = seasons[(currentIndex + 1) % seasons.length]
}

// 每分钟自动切换季节
setInterval(switchSeason, 60000)

// 获取色块样式
const getBlobStyle = (blobIndex) => {
  const scheme = seasonColorSchemes[currentSeason.value]
  const blob = scheme.blobs[blobIndex - 1]

  if (!blob) return {}

  // 计算鼠标影响
  let offsetX = 0
  let offsetY = 0

  if (isMouseActive.value) {
    const screenCenterX = window.innerWidth / 2
    const screenCenterY = window.innerHeight / 2
    offsetX = (mouseX.value - screenCenterX) * 0.05
    offsetY = (mouseY.value - screenCenterY) * 0.05
  }

  return {
    width: `${blob.size}px`,
    height: `${blob.size}px`,
    background: blob.gradient,
    left: `calc(${blob.x}% + ${offsetX}px)`,
    top: `calc(${blob.y}% + ${offsetY}px)`
  }
}

// 鼠标移动处理
const handleMouseMove = (e) => {
  if (currentView.value === 'garden-3d') return

  mouseX.value = e.clientX
  mouseY.value = e.clientY
  isMouseActive.value = true

  // 3秒后标记鼠标不活跃
  clearTimeout(window.mouseActiveTimeout)
  window.mouseActiveTimeout = setTimeout(() => {
    isMouseActive.value = false
  }, 3000)
}

// 滚轮事件处理 - 固定位置切换（添加防抖）
let wheelTimeout = null
let wheelAccumulator = 0
const handleWheel = (e) => {
  if (currentView.value !== 'garden' || isScrolling) {
    e.preventDefault()
    return
  }

  // 累积滚动距离
  wheelAccumulator += Math.abs(e.deltaY)

  // 防抖处理，避免频繁触发
  if (wheelTimeout) return

  // 需要更大的滚动距离才触发页面切换
  const SCROLL_THRESHOLD = 120

  if (wheelAccumulator >= SCROLL_THRESHOLD) {
    isScrolling = true
    wheelAccumulator = 0

    if (e.deltaY > 0) {
      // 向下滚动
      if (currentSection.value === 'hero') {
        currentSection.value = 'mood'
      } else if (currentSection.value === 'mood' && selectedMood.value) {
        // 只有选择心情后才能进入日记界面
        currentSection.value = 'journal'
      }
      // 不允许通过滚动从日记界面进入历史界面
    } else if (e.deltaY < 0) {
      // 向上滚动
      // 不允许通过滚动从日记界面返回到心情选择界面
      if (currentSection.value === 'mood') {
        currentSection.value = 'hero'
      }
    }

    // 设置防抖，减少滚动延迟
    wheelTimeout = setTimeout(() => {
      isScrolling = false
      wheelTimeout = null
    }, 500)
  }
}

// 触摸事件处理（添加防抖）
let touchTimeout = null
const handleTouchMove = (e) => {
  if (currentView.value !== 'garden') {
    e.preventDefault()
    return
  }

  // 防抖处理
  if (touchTimeout) return

  const touch = e.touches[0]
  const startY = e.startY || touch.clientY

  // 增加滑动阈值，从50px改为120px
  const TOUCH_THRESHOLD = 120

  let changed = false
  if (touch.clientY - startY < -TOUCH_THRESHOLD && currentSection.value === 'hero') {
    currentSection.value = 'mood'
    changed = true
  } else if (touch.clientY - startY < -TOUCH_THRESHOLD && currentSection.value === 'mood' && selectedMood.value) {
    // 只有选择心情后才能进入日记界面
    currentSection.value = 'journal'
    changed = true
  }
  // 不允许通过滑动从日记界面进入历史界面或返回心情界面
  else if (touch.clientY - startY > TOUCH_THRESHOLD && currentSection.value === 'mood') {
    currentSection.value = 'hero'
    changed = true
  }

  e.startY = touch.clientY

  // 如果有变化，设置防抖
  if (changed) {
    touchTimeout = setTimeout(() => {
      touchTimeout = null
    }, 400)
  }
}

// 计算属性
const canSave = computed(() => {
  return selectedMood.value && (diaryContent.value.trim() || chatMessages.value.length > 0)
})

// 发送聊天消息
const sendChatMessage = async () => {
  if (!chatInput.value.trim()) return

  chatMessages.value.push({
    role: 'user',
    content: chatInput.value
  })

  const userInput = chatInput.value
  chatInput.value = ''

  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })

  try {
    const aiResponse = await aiService.generateAIResponse(
      chatMessages.value,
      selectedMood.value || 'calm'
    )

    chatMessages.value.push({
      role: 'ai',
      content: aiResponse
    })

    nextTick(() => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
      }
    })
  } catch (err) {
    console.error('发送消息错误:', err)
    MessagePlugin.error(err.message || 'AI回复失败，请重试')
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
    generatedDiary.value = await aiService.generateAISummary(
      chatMessages.value,
      selectedMood.value || 'calm'
    )
    MessagePlugin.success('日记生成成功！')

    DialogPlugin.confirm({
      header: '📝 生成的日记',
      body: generatedDiary.value,
      confirmBtn: '保存到花园',
      theme: 'primary',
      confirmBtnTheme: {
        variant: 'base',
        theme: 'warning'
      },
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
    console.error('生成日记失败:', err)
    // 如果AI API不可用，使用默认日记模板
    const defaultDiary = aiService.generateDefaultSummary(chatMessages.value, selectedMood.value || 'calm')
    MessagePlugin.info('AI服务不可用，使用默认日记模板')

    DialogPlugin.confirm({
      header: '📝 日记',
      body: defaultDiary,
      confirmBtn: '保存到花园',
      theme: 'primary',
      confirmBtnTheme: {
        variant: 'base',
        theme: 'warning'
      },
      cancelBtn: '取消',
      onConfirm: () => {
        diaryContent.value = defaultDiary
        recordMode.value = 'write'
      }
    })
  } finally {
    isSummarizing.value = false
  }
}

// 选择心情
const selectMood = (mood) => {
  selectedMood.value = mood.value
  // 自动跳转到日记界面
  nextTick(() => {
    currentSection.value = 'journal'
  })
}

// 换个心情
const changeMood = () => {
  selectedMood.value = ''
  currentSection.value = 'mood'
}

// 清除聊天记录
const clearChatMessages = () => {
  chatMessages.value = []
}

// 确认日期（设为今天）
const confirmDate = () => {
  selectedDate.value = new Date().toISOString().split('T')[0]
  showDatePicker.value = false
}

// 格式化日期用于比较
const formatDateForKey = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 计算属性：根据日期筛选后的记录
const filteredRecords = computed(() => {
  if (!historyFilterDate.value) {
    return moodRecords.value
  }
  return moodRecords.value.filter(record => {
    const recordDate = formatDateForKey(record.date)
    return recordDate === historyFilterDate.value
  })
})

// 滚动到下一部分
const scrollToNextSection = () => {
  if (currentSection.value === 'mood') {
    currentSection.value = 'journal'
  }
}

// 滚动到历史
const scrollToHistory = () => {
  currentView.value = 'garden'
  currentSection.value = 'history'
  isScrolling = false // 重置滚动状态
}

// 返回首页
const goBackToHome = () => {
  currentView.value = 'garden'
  currentSection.value = 'hero'
}

// 种花
const plantFlower = async () => {
  if (!canSave.value) return

  try {
    let diaryContentToSave

    if (recordMode.value === 'write') {
      diaryContentToSave = diaryContent.value
    } else {
      MessagePlugin.loading('正在生成日记总结...')
      diaryContentToSave = await aiService.generateAISummary(
        chatMessages.value,
        selectedMood.value || 'calm'
      )
    }

    // 使用选择的日期，如果没有选择则使用今天
    const recordDate = selectedDate.value
      ? new Date(selectedDate.value + 'T12:00:00').toISOString()
      : new Date().toISOString()

    const record = {
      id: Date.now(),
      mood: selectedMood.value,
      date: recordDate,
      diary: diaryContentToSave,
      chatHistory: recordMode.value === 'chat' ? [...chatMessages.value] : null,
      mode: recordMode.value
    }

    moodRecords.value.unshift(record)
    saveToLocalStorage()

    diaryContent.value = ''
    chatMessages.value = []
    generatedDiary.value = ''

    MessagePlugin.success(`🌸 ${t('plantFlowerSuccessMsg').replace('{mood}', getMoodLabel(record.mood))}`)

    // 自动跳转到3D花园
    setTimeout(() => {
      currentView.value = 'garden-3d'
    }, 1000)
  } catch (err) {
    MessagePlugin.error('保存失败，请重试')
    console.error('保存失败:', err)
  }
}

// 获取心情标签（支持当前语言）
const getMoodLabel = (mood) => {
  const moodConfig = moods.find(m => m.value === mood)
  if (!moodConfig) return '未知'
  return currentLang.value === 'zh' ? moodConfig.label_zh : moodConfig.label_en
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

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
    title: t('deleteConfirmTitle'),
    content: t('deleteConfirmContent'),
    onConfirm: () => {
      moodRecords.value = moodRecords.value.filter(r => r.id !== record.id)
      saveToLocalStorage()
      showDetailDialog.value = false
      MessagePlugin.success(t('deleteSuccessMsg'))
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

// 花园库配置
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
    MessagePlugin.success(t('configSaveSuccessMsg'))
    showGardenLibraryDialog.value = false
  } catch (e) {
    MessagePlugin.error(t('configSaveErrorMsg'))
    console.error('保存花园配置失败:', e)
  }
}

const resetToDefaultConfig = () => {
  gardenConfig.value = { ...defaultGardenConfig }
  MessagePlugin.success('已恢复默认配置')
}

// 导出为图片
const exportAsImage = async (record) => {
  try {
    MessagePlugin.loading(t('exportPreparing'))
    
    // 创建临时容器
    const exportContainer = document.createElement('div')
    exportContainer.style.position = 'fixed'
    exportContainer.style.top = '0'
    exportContainer.style.left = '0'
    exportContainer.style.width = '800px'
    exportContainer.style.zIndex = '-9999'
    exportContainer.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)'
    exportContainer.style.padding = '40px'
    exportContainer.style.borderRadius = '20px'
    
    // 创建内容
    const moodConfig = moods.find(m => m.value === record.mood)
    const moodLabel = currentLang.value === 'zh' ? moodConfig.label_zh : moodConfig.label_en
    
    exportContainer.innerHTML = `
      <div style="text-align: center; font-family: 'Playfair Display', serif;">
        <div style="font-size: 4rem; margin-bottom: 20px;">${moodConfig.emoji}</div>
        <h2 style="font-size: 2rem; color: #333; margin: 20px 0; font-weight: 700;">${moodLabel}</h2>
        <div style="font-size: 0.9rem; color: #999; margin-bottom: 30px;">${new Date(record.date).toLocaleDateString(currentLang.value === 'zh' ? 'zh-CN' : 'en-US')}</div>
        
        <div style="background: rgba(255, 255, 255, 0.8); padding: 30px; border-radius: 16px; text-align: left; margin: 30px 0; line-height: 1.8;">
          <h3 style="color: #667eea; margin-bottom: 15px; font-size: 1.2rem;">${t('diaryLabel')}</h3>
          <p style="color: #555; white-space: pre-wrap; font-size: 0.95rem;">${record.diary}</p>
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #E5E7EB; color: #999; font-size: 0.85rem;">
          <p>🌸 MoodGarden - 记录情绪，绽放生活</p>
        </div>
      </div>
    `
    
    document.body.appendChild(exportContainer)
    
    // 转换为图片
    const canvas = await html2canvas(exportContainer, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    })
    
    // 移除临时容器
    document.body.removeChild(exportContainer)
    
    // 下载图片
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `mood-${moodLabel}-${Date.now()}.png`
    link.click()
    
    MessagePlugin.success(t('exportSuccess'))
  } catch (err) {
    console.error('导出失败:', err)
    MessagePlugin.error(t('exportError'))
  }
}

// 导出花园相册
const exportAlbum = async () => {
  if (filteredRecords.value.length === 0) {
    MessagePlugin.warning('没有记录可导出')
    return
  }

  try {
    MessagePlugin.loading(t('exportPreparing'))
    
    // 创建HTML文件内容
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="${currentLang.value}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t('exportAlbum')} - MoodGarden</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Playfair Display', 'Didot', 'Bodoni MT', serif;
            background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%);
            padding: 40px 20px;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          h1 {
            text-align: center;
            font-size: 3rem;
            margin-bottom: 10px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 50px;
            padding: 30px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 20px;
          }
          .stats {
            font-size: 1.1rem;
            color: #666;
            margin: 15px 0;
          }
          .emoji { font-size: 2rem; margin-right: 10px; }
          .flowers {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 30px;
            margin-bottom: 50px;
          }
          .flower-item {
            background: rgba(255, 255, 255, 0.9);
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            page-break-inside: avoid;
          }
          .flower-emoji {
            font-size: 3rem;
            text-align: center;
            margin-bottom: 20px;
          }
          .flower-date {
            font-size: 0.9rem;
            color: #999;
            text-align: center;
            margin-bottom: 10px;
          }
          .flower-mood {
            font-size: 1.3rem;
            font-weight: 700;
            text-align: center;
            color: #667eea;
            margin-bottom: 20px;
          }
          .flower-diary {
            font-size: 0.95rem;
            line-height: 1.6;
            color: #555;
            white-space: pre-wrap;
            border-top: 2px solid #E5E7EB;
            padding-top: 15px;
          }
          .footer {
            text-align: center;
            padding: 30px;
            border-top: 2px solid #E5E7EB;
            color: #999;
            font-size: 0.9rem;
          }
          @media print {
            body { background: white; }
            .flower-item { box-shadow: none; border: 1px solid #E5E7EB; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌸 ${t('myDiary')}</h1>
            <div class="stats">${t('flowerCount').replace('xx', filteredRecords.value.length)}</div>
            <div class="stats">${new Date().toLocaleDateString(currentLang.value === 'zh' ? 'zh-CN' : 'en-US')}</div>
          </div>
          
          <div class="flowers">`
    
    // 添加每朵花的内容
    filteredRecords.value.forEach(record => {
      const moodConfig = moods.find(m => m.value === record.mood)
      const moodLabel = currentLang.value === 'zh' ? moodConfig.label_zh : moodConfig.label_en
      const flowerEmoji = moodConfig.emoji
      
      htmlContent += `
        <div class="flower-item">
          <div class="flower-emoji">${flowerEmoji}</div>
          <div class="flower-date">${new Date(record.date).toLocaleDateString(currentLang.value === 'zh' ? 'zh-CN' : 'en-US')}</div>
          <div class="flower-mood">${moodLabel}</div>
          <div class="flower-diary">${record.diary}</div>
        </div>
      `
    })
    
    htmlContent += `
          </div>
          
          <div class="footer">
            <p>🌸 MoodGarden - 记录情绪，绽放生活</p>
            <p>Exported on ${new Date().toLocaleString(currentLang.value === 'zh' ? 'zh-CN' : 'en-US')}</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    // 创建并下载HTML文件
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `MoodGarden-Album-${Date.now()}.html`
    link.click()
    
    MessagePlugin.success(t('exportSuccess'))
  } catch (err) {
    console.error('导出相册失败:', err)
    MessagePlugin.error(t('exportError'))
  }
}

onMounted(() => {
  // 从本地存储读取语言偏好
  const savedLanguage = localStorage.getItem('preferredLanguage')
  if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
    currentLang.value = savedLanguage
  }
  
  loadFromLocalStorage()
  loadGardenConfig()
  
  // 延迟显示标题，确保动画效果
  setTimeout(() => {
    showTitle.value = true
  }, 100)
})
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

#app {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>

<style scoped>
/* 语言切换按钮 */
.lang-switch {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(255, 255, 255, 0.1);
  animation: pulse-border 3s ease-in-out infinite;
}

@keyframes pulse-border {
  0%, 100% {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(255, 255, 255, 0.05);
  }
}

.lang-switch:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.12) 100%);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.4), 0 0 0 0 rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.7);
}

.lang-switch:active {
  transform: translateY(-1px) scale(1.02);
}

.lang-flag {
  font-size: 1.4rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: flag-bounce 2s ease-in-out infinite;
}

@keyframes flag-bounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-3px) rotate(3deg);
  }
}

.lang-text {
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 主容器 */
.app-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  width: 100%;
}

/* 浮动功能按钮 */
.floating-actions {
  position: fixed;
  top: 50%;
  right: 30px;
  transform: translateY(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}

.action-btn:active {
  transform: translateY(0);
}

.action-btn .btn-icon {
  width: 24px;
  height: 24px;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover .btn-icon {
  color: rgba(255, 255, 255, 1);
}

.action-btn .btn-label {
  position: absolute;
  right: 60px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  color: white;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  transform: translateX(10px);
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-btn:hover .btn-label {
  opacity: 1;
  transform: translateX(0);
}

/* 主内容 */
.main-content {
  position: relative;
  z-index: 1;
}

/* 首页视图 - 固定容器 */
.home-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 1;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%);
  isolation: isolate;
  display: block;
  font-family: 'Playfair Display', 'Didot', 'Bodoni MT', 'Book Antiqua', 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'STSong', serif;
}

/* 全局艺术字体 */
.app-container {
  font-family: 'Playfair Display', 'Didot', 'Bodoni MT', 'Book Antiqua', 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'STSong', serif;
}

/* 按钮和输入框使用更现代的字体组合 */
button, input, textarea {
  font-family: 'Playfair Display', 'Didot', 'Bodoni MT', 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif;
}

/* 季节背景 - 白色系清晰模式 */
.home-view.season-spring {
  background: linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 50%, #F0F9FF 100%);
}

.home-view.season-summer {
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 50%, #FFF1F2 100%);
}

.home-view.season-autumn {
  background: linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 50%, #FEF2F2 100%);
}

.home-view.season-winter {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%);
}

/* 流动色块背景层 */
.mood-flow-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.flow-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  animation: floatBlob 20s ease-in-out infinite;
}

/* 春季 - 绿色系 */
.blob-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #7CBA3D 0%, #90EE90 100%);
  top: 10%;
  left: 15%;
  animation-delay: 0s;
  animation-duration: 25s;
}

/* 夏季 - 深绿色 + 金色 */
.blob-2 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #228B22 0%, #FFD700 100%);
  top: 60%;
  right: 10%;
  animation-delay: -5s;
  animation-duration: 30s;
}

/* 秋季 - 橙色系 */
.blob-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #D2691E 0%, #FF8C00 100%);
  top: 30%;
  right: 25%;
  animation-delay: -10s;
  animation-duration: 22s;
}

/* 冬季 - 蓝白系 */
.blob-4 {
  width: 450px;
  height: 450px;
  background: linear-gradient(135deg, #ADD8E6 0%, #E6E6FA 100%);
  bottom: 15%;
  left: 20%;
  animation-delay: -15s;
  animation-duration: 28s;
}

/* 春季粉色点缀 */
.blob-5 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #FFB7C5 0%, #90EE90 100%);
  top: 70%;
  left: 50%;
  animation-delay: -8s;
  animation-duration: 24s;
}

/* 冬季淡紫点缀 */
.blob-6 {
  width: 380px;
  height: 380px;
  background: linear-gradient(135deg, #E6E6FA 0%, #F0F8FF 100%);
  top: 5%;
  right: 40%;
  animation-delay: -12s;
  animation-duration: 26s;
}

@keyframes floatBlob {
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  25% {
    transform: translate(30px, -30px) scale(1.1) rotate(90deg);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9) rotate(180deg);
  }
  75% {
    transform: translate(20px, 30px) scale(1.05) rotate(270deg);
  }
}

/* 区块通用样式 */
.hero-section,
.mood-selection-section,
.journal-section,
.history-section {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  transform: translateY(40px) scale(0.96);
  pointer-events: none;
  padding: 40px 20px;
  overflow-y: auto;
  background: transparent;
  z-index: 2;
  will-change: opacity, transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.history-section.active {
  align-items: center;
  z-index: 100;
}

.journal-section.active {
  align-items: center;
  z-index: 50;
}

.journal-section .section-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  width: 100%;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  padding: 20px 0;
}

.hero-section.active {
  z-index: 30;
}

.mood-selection-section.active {
  z-index: 40;
}

.hero-section.active,
.mood-selection-section.active,
.journal-section.active,
.history-section.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

/* 添加淡出时的动画延迟 */
.hero-section:not(.active),
.mood-selection-section:not(.active),
.journal-section:not(.active),
.history-section:not(.active) {
  transition-delay: 0s;
}

/* 添加淡入时的动画延迟 */
.hero-section.active,
.mood-selection-section.active,
.journal-section.active,
.history-section.active {
  transition-delay: 0.1s;
}

.hero-content {
  text-align: center;
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

/* Hero区域内容入场动画 */
.hero-section.active .hero-title {
  animation: fade-slide-up 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.2s both;
}

.hero-section.active .hero-subtitle {
  animation: fade-slide-up 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.35s both;
}

.hero-section.active .scroll-hint {
  animation: fade-slide-up 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.5s both;
}

@keyframes fade-slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Section标题入场动画 */
.mood-selection-section.active .section-title,
.journal-section.active .section-title,
.history-section.active .section-title {
  animation: scale-fade-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.2s both;
}

.mood-selection-section.active .section-subtitle,
.journal-section.active .section-subtitle,
.history-section.active .section-subtitle {
  animation: scale-fade-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.35s both;
}

@keyframes scale-fade-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 心情卡片入场动画 */
.mood-selection-section.active .mood-card {
  animation: card-appear 0.5s cubic-bezier(0.23, 1, 0.32, 1) both;
}

.mood-selection-section.active .mood-card:nth-child(1) { animation-delay: 0.3s; }
.mood-selection-section.active .mood-card:nth-child(2) { animation-delay: 0.4s; }
.mood-selection-section.active .mood-card:nth-child(3) { animation-delay: 0.5s; }
.mood-selection-section.active .mood-card:nth-child(4) { animation-delay: 0.6s; }
.mood-selection-section.active .mood-card:nth-child(5) { animation-delay: 0.7s; }
.mood-selection-section.active .mood-card:nth-child(6) { animation-delay: 0.8s; }
.mood-selection-section.active .mood-card:nth-child(7) { animation-delay: 0.9s; }
.mood-selection-section.active .mood-card:nth-child(8) { animation-delay: 1.0s; }

@keyframes card-appear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.85);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 日记区域入场动画 */
.journal-section.active .mode-tabs {
  animation: fade-slide-up 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.4s both;
}

.journal-section.active .change-mood-btn,
.journal-section.active .change-date-btn {
  animation: fade-slide-up 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.5s both;
}

.journal-section.active .diary-textarea,
.journal-section.active .chat-container {
  animation: fade-slide-up 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.6s both;
}

.journal-section.active .plant-flower-btn {
  animation: scale-fade-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.7s both;
}

/* 历史区域入场动画 */
.history-section.active .garden-container {
  animation: fade-slide-up 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.4s both;
}

.history-section.active .flower-grid {
  animation: fade-slide-up 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.5s both;
}

.history-section.active .garden-stats {
  animation: scale-fade-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.6s both;
}

/* 空状态入场动画 */
.empty-garden {
  animation: empty-appear 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.5s both;
}

@keyframes empty-appear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.hero-title {
  font-size: clamp(3.5rem, 10vw, 8rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  margin: 0 0 20px 0;
  font-family: 'Playfair Display', 'Didot', 'Bodoni MT', 'Book Antiqua', 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'STSong', serif;
  font-style: italic;
  background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 25%, #4ECDC4 50%, #A8E6CF 75%, #FF6B6B 100%);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
  opacity: 1;
  transition: all 1s ease;
  position: relative;
  animation: gentleFloat 6s ease-in-out infinite;
  text-shadow: none;
  padding: 0 10px;
  line-height: 1.1;
}

.hero-title::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 25%, #4ECDC4 50%, #A8E6CF 75%, #FF6B6B 100%);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: blur(50px);
  opacity: 0.35;
  z-index: -1;
  animation: glowPulse 3s ease-in-out infinite;
}

.title-word {
  display: inline-block;
  animation: floatUp 1s ease-out forwards;
  opacity: 0;
  transform: translateY(40px);
  background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 25%, #4ECDC4 50%, #A8E6CF 75%, #FF6B6B 100%);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.6));
}

.title-word {
  opacity: 1;
  transform: translateY(0);
}

.title-divider {
  display: inline-block;
  width: 2px;
  height: 60px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8), transparent);
  margin: 0 15px;
  vertical-align: middle;
  animation: floatUp 1s ease-out forwards;
  opacity: 0;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2.2vw, 1.6rem);
  color: #ffffff;
  margin: 15px auto 0;
  max-width: 600px;
  letter-spacing: 0.08em;
  font-weight: 500;
  opacity: 0;
  transition: opacity 1.5s ease 0.5s;
  text-align: center;
  font-family: 'Playfair Display', 'Didot', 'Bodoni MT', 'Book Antiqua', 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'STSong', serif;
  font-style: italic;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  padding: 14px 28px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  line-height: 1.6;
}

.hero-subtitle.subtitle-visible {
  opacity: 1;
}

.scroll-hint {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: bounce 2s ease-in-out infinite;
  z-index: 100;
}

.scroll-hint span {
  font-size: 1rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 400;
  font-style: italic;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

.scroll-hint span {
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.scroll-arrow {
  width: 24px;
  height: 24px;
  stroke: rgba(255, 255, 255, 0.7);
}

/* 第二屏：心情选择 */
.mood-selection-section {
  min-height: 100vh;
  padding: 100px 20px;
  position: relative;
}

.wave-guide {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  overflow: hidden;
  opacity: 0.3;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(180deg, transparent 0%, rgba(102, 126, 234, 0.1) 100%);
  animation: waveMove 10s linear infinite;
}

.section-content {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.section-title {
  text-align: center;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.title-icon {
  font-size: 2.5rem;
  animation: sparkle 3s ease-in-out infinite;
}

.section-subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #ffffff;
  margin-bottom: 60px;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 心情网格 */
.mood-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.mood-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  will-change: transform;
}

.mood-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.mood-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.mood-card:hover::before {
  opacity: 1;
}

.mood-card:active {
  transform: translateY(-2px);
}

.mood-card.selected {
  border-color: #FF6B6B;
  background: rgba(255, 107, 107, 0.4);
  box-shadow: 0 12px 40px rgba(255, 107, 107, 0.4),
              0 0 0 6px rgba(255, 107, 107, 0.6),
              0 0 50px rgba(255, 107, 107, 0.5);
  transform: translateY(-15px) scale(1.12);
  animation: selected-pulse 1s ease-in-out infinite;
}

@keyframes selected-pulse {
  0%, 100% {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3),
                0 0 0 4px rgba(255, 255, 255, 0.5),
                0 0 30px rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3),
                0 0 0 4px rgba(255, 255, 255, 0.8),
                0 0 50px rgba(255, 255, 255, 0.4);
  }
}

.mood-card.selected::before {
  opacity: 1;
}

.mood-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.mood-emoji {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
  line-height: 1;
}

.mood-card:hover .mood-emoji {
  transform: scale(1.1) rotate(5deg);
}

.mood-card.selected .mood-emoji {
  transform: scale(1.2);
  animation: emoji-bounce 1.5s ease-in-out infinite;
}

.mood-card.selected:hover .mood-emoji {
  animation: emoji-bounce 1.5s ease-in-out infinite;
}

@keyframes emoji-bounce {
  0%, 100% {
    transform: scale(1.2) translateY(0);
  }
  50% {
    transform: scale(1.25) translateY(-5px);
  }
}

.mood-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  position: relative;
  z-index: 1;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  line-height: 1;
}

.mood-quote {
  font-size: 0.85rem;
  color: #ffffff;
  line-height: 1.4;
  font-style: italic;
  position: relative;
  z-index: 1;
  font-weight: 400;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  opacity: 0.9;
}

.continue-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto;
  padding: 18px 45px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.continue-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.22);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.45);
}

.continue-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.continue-btn .btn-arrow {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.continue-btn:hover .btn-arrow {
  transform: translateX(5px);
}

/* 第三屏：日记区域 */
.mode-tabs {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
}

.change-mood-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto 30px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.change-mood-btn svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.change-mood-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.change-mood-btn:hover svg {
  transform: rotate(-180deg);
}

.change-mood-btn:active {
  transform: translateY(0);
}

.change-options {
  display: flex;
  gap: 12px;
  margin: 0 auto 30px;
}

.change-date-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.change-date-btn svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.change-date-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.change-date-btn:active {
  transform: translateY(0);
}

/* 日期选择器弹窗 */
.date-picker-dialog {
  padding: 20px;
}

.date-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 1.1rem;
  font-family: 'Playfair Display', 'Didot', 'Bodoni MT', 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif;
  color: #333;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.date-input:focus {
  border-color: rgba(251, 191, 36, 0.6);
  box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.15);
}

.date-picker-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

/* 日期筛选 */
.date-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
  align-items: center;
  justify-content: center;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.filter-btn.active {
  background: rgba(251, 191, 36, 0.8);
  border-color: rgba(251, 191, 36, 1);
  color: rgba(255, 255, 255, 0.98);
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.filter-btn:active {
  transform: translateY(0);
}

.filter-date-input {
  padding: 10px 18px;
  font-size: 0.95rem;
  font-family: 'Playfair Display', 'Didot', 'Bodoni MT', 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif;
  color: #333;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.filter-date-input:focus {
  border-color: rgba(251, 191, 36, 0.5);
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
}

.export-album-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #ffffff;
  background: rgba(102, 126, 234, 0.6);
  border: 1px solid rgba(102, 126, 234, 0.5);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.export-album-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  border-color: rgba(102, 126, 234, 0.7);
}

.export-album-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.export-album-btn:active {
  transform: translateY(0);
}

/* 未选择心情提示 */
.mood-reminder {
  text-align: center;
  padding: 80px 40px;
}

.reminder-icon {
  font-size: 5rem;
  margin-bottom: 24px;
  animation: gentleFloat 3s ease-in-out infinite;
}

.reminder-text {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 30px;
  line-height: 1.8;
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.go-select-mood-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 40px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.go-select-mood-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.45);
}

.go-select-mood-btn:active {
  transform: translateY(-1px);
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  font-size: 1rem;
  font-weight: 500;
  color: #fef3c7;
  background: rgba(255, 255, 255, 0.75);
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.mode-tab svg {
  width: 20px;
  height: 20px;
}

.mode-tab:hover {
  background: rgba(255, 255, 255, 0.8);
  color: #fcd34d;
  border-color: rgba(251, 191, 36, 0.5);
}

.mode-tab.active {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(251, 191, 36, 0.7);
  color: #d97706;
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
}

.write-container {
  max-width: 800px;
  margin: 0 auto 30px;
}

.diary-textarea {
  width: 100%;
  min-height: 200px;
  max-height: 300px;
  padding: 25px;
  font-size: 1.1rem;
  line-height: 1.8;
  color: #d97706;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(60px) saturate(250%);
  -webkit-backdrop-filter: blur(60px) saturate(250%);
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-radius: 24px;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

.diary-textarea:focus {
  border-color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.35);
}

.diary-textarea::placeholder {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.chat-container {
  max-width: 800px;
  margin: 0 auto 30px;
}

.chat-messages {
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
  padding: 20px;
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(60px) saturate(250%);
  -webkit-backdrop-filter: blur(60px) saturate(250%);
  border: 2px solid rgba(255, 255, 255, 0.65);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  /* 隐藏滚动条但保留滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.chat-messages::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.message {
  margin-bottom: 18px;
  animation: fadeIn 0.5s ease;
}

.message.user {
  text-align: right;
}

.message.ai {
  text-align: left;
}

.message-content {
  display: inline-block;
  max-width: 75%;
  padding: 16px 22px;
  border-radius: 20px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
  word-wrap: break-word;
}

.message.user .message-content {
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.95) 0%, rgba(202, 138, 4, 0.95) 100%);
  border-bottom-right-radius: 6px;
  color: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4px 16px rgba(234, 179, 8, 0.4);
}

.message.ai .message-content {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.8) 100%);
  border-bottom-left-radius: 6px;
  color: rgba(255, 255, 255, 0.98);
}

.chat-input-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.chat-input {
  flex: 1;
  padding: 16px 22px;
  font-size: 1rem;
  color: #d97706;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(50px) saturate(250%);
  -webkit-backdrop-filter: blur(50px) saturate(250%);
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 50px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.chat-input:focus {
  border-color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.75);
}

.send-btn {
  width: 54px;
  height: 54px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.send-btn:hover {
  transform: scale(1.1);
}

.send-btn svg {
  width: 24px;
  height: 24px;
}

.chat-actions {
  display: flex;
  gap: 12px;
  margin-top: 15px;
  justify-content: center;
}

.summarize-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  padding: 16px 28px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #f59e0b;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(251, 191, 36, 0.5);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.25);
}

.summarize-btn:hover {
  background: rgba(255, 255, 255, 1);
  color: #d97706;
  border-color: rgba(251, 191, 36, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(251, 191, 36, 0.35);
}

.clear-chat-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  padding: 16px 28px;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.clear-chat-btn svg {
  width: 18px;
  height: 18px;
}

.clear-chat-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.clear-chat-btn:active {
  transform: translateY(0);
}

.plant-flower-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 20px auto 0;
  padding: 18px 40px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.plant-flower-btn:hover:not(:disabled) {
  transform: translateY(-5px) scale(1.02);
  background: rgba(255, 255, 255, 0.22);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.45);
}

.plant-flower-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.plant-flower-btn .btn-icon {
  font-size: 1.5rem;
}

/* 第四屏：历史花园 - 移除单独定义，使用通用样式 */
.history-section {
  /* 样式已合并到通用样式中 */
}

.history-section .section-content {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 10 !important;
  width: 100%;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 40px 20px;
}

/* 历史记录滚动条样式 */
.history-section .section-content::-webkit-scrollbar {
  width: 8px;
}

.history-section .section-content::-webkit-scrollbar-track {
  background: rgba(91, 79, 207, 0.1);
  border-radius: 4px;
}

.history-section .section-content::-webkit-scrollbar-thumb {
  background: rgba(91, 79, 207, 0.4);
  border-radius: 4px;
}

.history-section .section-content::-webkit-scrollbar-thumb:hover {
  background: rgba(91, 79, 207, 0.6);
}

/* 历史花园返回按钮 */
.history-back-btn {
  position: fixed;
  top: 30px;
  left: 30px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.history-back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}

.history-back-btn:active {
  transform: translateY(0);
}

.history-back-btn .back-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.history-back-btn:hover .back-icon {
  transform: translateX(-3px);
}

.history-back-btn span {
  white-space: nowrap;
}

.flower-count {
  text-align: center;
  font-size: 1.3rem;
  color: #ffffff;
  margin-bottom: 50px;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.garden-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.flower-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 24px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.flower-card:hover {
  transform: translateY(-10px) scale(1.05);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.15);
}

.flower-emoji {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}

.flower-date {
  font-size: 1.2rem;
  color: #ffffff;
  margin-bottom: 10px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.flower-mood {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.empty-garden {
  text-align: center;
  padding: 80px 30px;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  display: inline-block;
  animation: plant-sway 4s ease-in-out infinite;
}

@keyframes plant-sway {
  0%, 100% {
    transform: rotate(-8deg) translateY(0);
  }
  25% {
    transform: rotate(5deg) translateY(-8px);
  }
  50% {
    transform: rotate(-3deg) translateY(0);
  }
  75% {
    transform: rotate(8deg) translateY(-5px);
  }
}

.empty-garden p {
  color: rgba(91, 79, 207, 0.75);
  font-size: 1.2rem;
  margin: 10px 0;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  animation: gentle-pulse 3s ease-in-out infinite;
}

.empty-hint {
  color: rgba(91, 79, 207, 0.6);
  font-size: 1rem;
  margin-top: 15px;
  animation: gentle-pulse 3s ease-in-out infinite 0.5s;
}

@keyframes gentle-pulse {
  0%, 100% {
    opacity: 0.75;
  }
  50% {
    opacity: 1;
  }
}

/* 心情详情弹窗 */
.mood-detail {
  text-align: center;
}

.detail-flower {
  width: 130px;
  height: 130px;
  margin: 0 auto 25px;
}

.detail-date {
  color: rgba(100, 100, 100, 0.8);
  margin-bottom: 18px;
  font-size: 1rem;
}

.detail-mood {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 28px;
  font-weight: 500;
}

.detail-diary {
  text-align: left;
  margin-bottom: 28px;
  padding: 25px;
  background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
  border-radius: 16px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.detail-diary h4 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 1.05rem;
}

.detail-diary p {
  line-height: 1.8;
  color: #555;
  white-space: pre-wrap;
}

.detail-chat {
  text-align: left;
  margin-bottom: 28px;
  padding: 25px;
  background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
  border-radius: 16px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.detail-chat h4 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 1.05rem;
}

.chat-history {
  max-height: 280px;
  overflow-y: auto;
}

.chat-record {
  padding: 14px;
  margin-bottom: 12px;
  border-radius: 12px;
  line-height: 1.7;
  background: rgba(255, 255, 255, 0.5);
}

.chat-record.user {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  text-align: right;
}

.chat-record.ai {
  background: #f0f0f0;
  text-align: left;
}

.chat-role {
  font-weight: 600;
  margin-right: 8px;
}

.chat-record.user .chat-role {
  color: #667eea;
}

.chat-record.ai .chat-role {
  color: #764ba2;
}

.detail-actions {
  margin-top: 25px;
}

/* 花园配置弹窗 */
.garden-config-dialog {
  padding: 15px 0;
}

.config-header {
  margin-bottom: 35px;
}

.config-tip {
  color: rgba(100, 100, 100, 0.85);
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 18px;
}

.config-actions {
  display: flex;
  justify-content: flex-end;
}

.mood-flower-mapping {
  max-height: 520px;
  overflow-y: auto;
  margin-bottom: 28px;
  padding: 5px;
}

.mood-flower-mapping::-webkit-scrollbar {
  width: 6px;
}

.mood-flower-mapping::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.mood-flower-mapping::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.mapping-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%);
  border-radius: 16px;
  margin-bottom: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.mapping-item:hover {
  transform: translateX(6px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

.mood-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.mood-emoji {
  font-size: 1.6rem;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFE8E1 0%, #FFF5F5 100%);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(255, 154, 158, 0.15);
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
  gap: 10px;
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
  gap: 16px;
  padding-top: 25px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
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

@keyframes floatUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-15px);
  }
  60% {
    transform: translateX(-50%) translateY(-7px);
  }
}

@keyframes waveMove {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50px);
  }
}

@keyframes sparkle {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes gentleFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.5;
    filter: blur(30px);
  }
  50% {
    opacity: 0.8;
    filter: blur(40px);
  }
}

/* 日记结果样式 - 信纸样式 */
.diary-result {
  padding: 30px;
  background: linear-gradient(to bottom, #fefefe 0%, #f9f9f9 100%);
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  line-height: 2.2;
  color: #333;
  font-size: 1rem;
  max-height: 420px;
  overflow-y: auto;
  white-space: pre-wrap;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8),
    inset 0 2px 0 rgba(0, 0, 0, 0.03);
  position: relative;
  font-family: 'Georgia', 'Times New Roman', serif;
}

/* 信纸横线效果 */
.diary-result::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    transparent,
    transparent 2.2em,
    #e8e8e8 2.2em,
    #e8e8e8 2.25em
  );
  pointer-events: none;
  border-radius: 3px;
}

/* 信纸左侧红线效果 */
.diary-result::after {
  content: '';
  position: absolute;
  top: 0;
  left: 40px;
  bottom: 0;
  width: 2px;
  background-color: #ffb3b3;
  pointer-events: none;
}

.diary-result::-webkit-scrollbar {
  width: 8px;
}

.diary-result::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.diary-result::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

/* 响应式 */
@media (max-width: 768px) {
  .floating-actions {
    right: 15px;
    gap: 10px;
  }

  .action-btn {
    width: 50px;
    height: 50px;
  }

  .action-btn .btn-icon {
    width: 24px;
    height: 24px;
  }

  .action-btn .btn-label {
    display: none;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .title-divider {
    height: 40px;
  }

  .mood-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .garden-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
  }

  .section-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .mood-grid {
    grid-template-columns: 1fr;
  }

  .garden-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .plant-flower-btn {
    font-size: 1rem;
    padding: 16px 30px;
  }
}
</style>
