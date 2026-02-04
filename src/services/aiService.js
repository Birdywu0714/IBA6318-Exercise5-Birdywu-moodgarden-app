import { ref } from 'vue'

// 从环境变量读取API配置
const getEnvConfig = () => {
  return {
    openai: {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      apiUrl: import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1'
    },
    tencent: {
      apiKey: import.meta.env.VITE_TENCENT_API_KEY || '',
      apiUrl: import.meta.env.VITE_TENCENT_API_URL || 'https://hunyuan.tencentcloudapi.com'
    },
    zhipu: {
      apiKey: import.meta.env.VITE_ZHIPU_API_KEY || '',
      apiUrl: import.meta.env.VITE_ZHIPU_API_URL || 'https://open.bigmodel.cn/api/paas/v4'
    },
    defaultProvider: import.meta.env.VITE_AI_PROVIDER || 'zhipu'
  }
}

const envConfig = getEnvConfig()

// AI服务配置
const aiProviders = {
  openai: {
    name: 'OpenAI',
    apiKey: envConfig.openai.apiKey,
    apiUrl: envConfig.openai.apiUrl,
    model: 'gpt-3.5-turbo',
    systemPrompt: '你是一位温暖、善解人意的心理陪伴者，像朋友一样与用户自然对话。回复策略：1）根据用户分享的内容深度灵活调整长度：简单的日常分享回复30-50字；情绪较深或内容较多时回复80-120字；2）简短回复时：回应用户内容 + 轻松引导提问；3）较长回复时：先共情理解，再分享一些温柔的想法或小建议，最后轻松提问；4）语气像朋友聊天，不要像心理医生或AI助手；5）偶尔可以分享一些小感悟或共情的感受，让对话更有人情味；6）避免说教，多用"我""我们"拉近距离。'
  },
  tencent: {
    name: '腾讯混元',
    apiKey: envConfig.tencent.apiKey,
    apiUrl: envConfig.tencent.apiUrl,
    model: 'hunyuan-lite',
    systemPrompt: '你是一位温暖、善解人意的心理陪伴者，像朋友一样与用户自然对话。回复策略：1）根据用户分享的内容深度灵活调整长度：简单的日常分享回复30-50字；情绪较深或内容较多时回复80-120字；2）简短回复时：回应用户内容 + 轻松引导提问；3）较长回复时：先共情理解，再分享一些温柔的想法或小建议，最后轻松提问；4）语气像朋友聊天，不要像心理医生或AI助手；5）偶尔可以分享一些小感悟或共情的感受，让对话更有人情味；6）避免说教，多用"我""我们"拉近距离。'
  },
  zhipu: {
    name: '智谱AI',
    apiKey: envConfig.zhipu.apiKey,
    apiUrl: envConfig.zhipu.apiUrl,
    model: 'glm-4',
    systemPrompt: '你是一位温暖、善解人意的心理陪伴者，像朋友一样与用户自然对话。回复策略：1）根据用户分享的内容深度灵活调整长度：简单的日常分享回复30-50字；情绪较深或内容较多时回复80-120字；2）简短回复时：回应用户内容 + 轻松引导提问；3）较长回复时：先共情理解，再分享一些温柔的想法或小建议，最后轻松提问；4）语气像朋友聊天，不要像心理医生或AI助手；5）偶尔可以分享一些小感悟或共情的感受，让对话更有人情味；6）避免说教，多用"我""我们"拉近距离。'
  }
}

const currentProvider = ref(envConfig.defaultProvider)
const isLoading = ref(false)
const error = ref(null)

// 从本地存储加载API配置
const loadConfig = () => {
  try {
    const config = localStorage.getItem('moodGardenAIConfig')
    if (config) {
      const parsed = JSON.parse(config)
      currentProvider.value = parsed.provider || 'openai'
      Object.keys(parsed.keys || {}).forEach(provider => {
        if (aiProviders[provider]) {
          aiProviders[provider].apiKey = parsed.keys[provider]
        }
      })
    }
  } catch (e) {
    console.error('加载AI配置失败:', e)
  }
}

// 保存API配置到本地存储
const saveConfig = (provider, apiKey) => {
  try {
    const config = {
      provider,
      keys: {}
    }
    
    // 更新当前提供商的密钥
    if (aiProviders[provider]) {
      aiProviders[provider].apiKey = apiKey
      config.keys[provider] = apiKey
    }
    
    localStorage.setItem('moodGardenAIConfig', JSON.stringify(config))
    currentProvider.value = provider
  } catch (e) {
    console.error('保存AI配置失败:', e)
  }
}

// OpenAI API调用
const callOpenAI = async (messages, mood) => {
  const provider = aiProviders.openai

  // 添加情绪上下文
  const systemMessage = {
    role: 'system',
    content: `${provider.systemPrompt}\n\n当前用户的心情状态是：${mood}。请根据这个情绪状态给出更贴切的回复。`
  }

  const response = await fetch(`${provider.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500
    })
  })

  if (!response.ok) {
    const responseText = await response.text()
    let errorData
    try {
      errorData = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`API调用失败: ${responseText}`)
    }
    throw new Error(errorData.error?.message || errorData.message || 'API调用失败')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 腾讯混元API调用
const callTencent = async (messages, mood) => {
  const provider = aiProviders.tencent

  // 腾讯混元API的实现（简化版）
  const systemMessage = {
    role: 'system',
    content: `${provider.systemPrompt}\n\n当前用户的心情状态是：${mood}。请根据这个情绪状态给出更贴切的回复。`
  }

  const response = await fetch(`${provider.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500
    })
  })

  if (!response.ok) {
    const responseText = await response.text()
    let errorData
    try {
      errorData = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`API调用失败: ${responseText}`)
    }
    throw new Error(errorData.error?.message || errorData.message || 'API调用失败')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 智谱AI API调用
const callZhipu = async (messages, mood) => {
  const provider = aiProviders.zhipu

  // 智谱AI需要特殊的API Key格式和请求结构
  const systemMessage = {
    role: 'system',
    content: `你是一位温暖、善解人意的心理陪伴者，像朋友一样与用户自然对话。回复策略：1）根据用户分享的内容深度灵活调整长度：简单的日常分享回复30-50字；情绪较深或内容较多时回复80-120字；2）简短回复时：回应用户内容 + 轻松引导提问；3）较长回复时：先共情理解，再分享一些温柔的想法或小建议，最后轻松提问；4）语气像朋友聊天，不要像心理医生或AI助手；5）偶尔可以分享一些小感悟或共情的感受，让对话更有人情味；6）避免说教，多用"我""我们"拉近距离。当前用户的心情状态是：${mood}。`
  }

  // 清理消息格式，确保只包含有效的角色
  const validMessages = messages.filter(msg => {
    const validRoles = ['user', 'assistant', 'system']
    return validRoles.includes(msg.role) && msg.content && msg.content.trim()
  }).map(msg => {
    // 智谱AI可能要求 assistant 而不是 ai
    return {
      role: msg.role === 'ai' ? 'assistant' : msg.role,
      content: msg.content.trim()
    }
  })

  console.log('智谱AI请求:', {
    url: provider.apiUrl,
    model: provider.model,
    messagesCount: validMessages.length,
    messages: validMessages
  })

  const response = await fetch(`${provider.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [systemMessage, ...validMessages],
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.7
    })
  })

  const responseText = await response.text()
  console.log('智谱AI响应状态:', response.status, response.statusText)

  if (!response.ok) {
    let errorData
    try {
      errorData = JSON.parse(responseText)
      console.error('智谱AI错误详情:', errorData)
    } catch (e) {
      console.error('智谱AI错误文本:', responseText)
      throw new Error(`API调用失败: ${responseText}`)
    }
    throw new Error(errorData.error?.message || errorData.message || 'API调用失败')
  }

  const data = JSON.parse(responseText)
  console.log('智谱AI响应数据:', data)

  // 智谱AI返回的结构
  if (!data.choices || data.choices.length === 0) {
    console.error('智谱AI返回结构异常:', data)
    throw new Error('AI返回的数据格式不正确')
  }

  const content = data.choices[0].message?.content || data.choices[0].delta?.content || ''
  if (!content) {
    console.error('智谱AI返回内容为空:', data)
    throw new Error('AI返回的内容为空')
  }

  return content
}

// 生成AI回复
const generateAIResponse = async (messages, mood) => {
  isLoading.value = true
  error.value = null

  try {
    const provider = aiProviders[currentProvider.value]

    if (!provider.apiKey) {
      // 如果没有配置API，使用默认回复
      throw new Error('NO_API_KEY')
    }

    let response
    switch (currentProvider.value) {
      case 'openai':
        response = await callOpenAI(messages, mood)
        break
      case 'tencent':
        response = await callTencent(messages, mood)
        break
      case 'zhipu':
        response = await callZhipu(messages, mood)
        break
      default:
        throw new Error('不支持的AI服务提供商')
    }

    return response
  } catch (err) {
    error.value = err.message
    console.error('AI回复错误:', err)
    // 如果是API密钥未配置或API调用失败，使用默认回复
    if (err.message === 'NO_API_KEY' || err.message.includes('API密钥') || err.message.includes('API调用失败')) {
      return generateDefaultResponse(messages, mood)
    }
    // 如果是其他错误，也使用默认回复
    return generateDefaultResponse(messages, mood)
  } finally {
    isLoading.value = false
  }
}

// 生成AI日记总结
const generateAISummary = async (messages, mood) => {
  isLoading.value = true
  error.value = null

  try {
    const provider = aiProviders[currentProvider.value]

    if (!provider.apiKey) {
      // 如果没有配置API，返回默认模板
      throw new Error('NO_API_KEY')
    }

    // 清理消息格式，确保只包含有效的角色
    const validMessages = messages.filter(msg => {
      const validRoles = ['user', 'assistant', 'system']
      return validRoles.includes(msg.role) && msg.content && msg.content.trim()
    }).map(msg => {
      // 智谱AI可能要求 assistant 而不是 ai
      return {
        role: msg.role === 'ai' ? 'assistant' : msg.role,
        content: msg.content.trim()
      }
    })

    // 构建对话上下文描述（用于提示词）
    const userMessages = validMessages.filter(m => m.role === 'user')
    const assistantMessages = validMessages.filter(m => m.role === 'assistant')

    // 计算内容长度，动态决定日记长度
    const totalContentLength = validMessages.reduce((sum, m) => sum + m.content.length, 0)
    let targetWordCount
    let lengthInstruction

    if (totalContentLength < 100) {
      targetWordCount = '100-200'
      lengthInstruction = '内容较少，写成一段简短的日记，200字以内即可。'
    } else if (totalContentLength < 300) {
      targetWordCount = '200-400'
      lengthInstruction = '内容适中，写成一篇简短的日记，200-400字。'
    } else if (totalContentLength < 500) {
      targetWordCount = '400-600'
      lengthInstruction = '内容较多，写成一篇中等长度的日记，400-600字。'
    } else {
      targetWordCount = '600-800'
      lengthInstruction = '内容丰富，写成一篇较长的日记，600-800字。'
    }

    const conversationContext = validMessages.map((m, i) => {
      const role = m.role === 'user' ? '我' : '对方'
      return `${role}：${m.content}`
    }).join('\n')

    const prompt = {
      role: 'system',
      content: `你是一位日记作家。你的任务是基于真实的聊天记录，写一篇日记。

## 核心要求

**真实第一，文艺适度**

日记必须基于实际的对话内容，但要用流畅的文笔串联起来，避免生硬罗列。

## 必须遵守的原则

### 1. 包含完整对话内容
- 既要包含我（用户）说的话，也要包含对方（AI）的回应
- 将对话转化为自然流畅的叙述
- 对方的回应应该作为我情绪的触发点或思考的转折

### 2. 文笔适度，不要过度文艺
- 语言要自然流畅，不要堆砌辞藻
- 适度的文学化表达即可，不要写成散文诗
- 重点在于把对话内容生动地呈现出来

### 3. 内容长度根据实际情况调整
${lengthInstruction}

### 4. 适度扩展，基于事实
- 可以适当加入一些场景描写（如时间、环境、氛围）
- 可以加入我内心的感受和思考
- 但**不要过度想象或虚构**，要基于对话内容

### 5. 结构安排
- 开篇：用简洁的方式引入对话场景
- 中间：按时间顺序呈现对话，加入适当的描写和感受
- 结尾：可以有一个简短的感悟或感受

### 6. 禁止事项
- ❌ 不要出现"AI"、"助手"、"聊天"等词汇
- ❌ 不要把对话生硬罗列在一起
- ❌ 不要过度虚构脱离对话内容
- ❌ 不要写成纯文艺的散文，要保留对话的实质内容

## 创作示范

假如对话记录是：
我：今天工作很累，加班到很晚
对方：我能理解你现在的感受，愿意多跟我说说吗？
我：老板临时安排了一个项目，搞到凌晨
对方：听起来你有很多想分享的，我愿意一直听你说。
我：就是觉得有点委屈，明明计划好了要早点回家

你应该写成这样的日记：

今天加班到很晚，老板临时安排了一个项目，搞得我措手不及。凌晨走出办公楼的时候，整个人都累瘫了。跟朋友说了这件事，他说能理解我的感受，让我多说说。我告诉他，就是觉得有点委屈，明明计划好了要早点回家的。说完这些，心里的郁结好像散了一些，虽然还是很累，但至少有人愿意听我说这些。

## 当前心情基调
${mood}

## 对话记录（你的创作素材）
${conversationContext}

现在，请基于这段对话，写一篇日记。记住：真实自然，适度文学化。`
    }

    // 根据内容长度动态设置 max_tokens
    const maxTokens = totalContentLength < 100 ? 300 :
                     totalContentLength < 300 ? 500 :
                     totalContentLength < 500 ? 700 : 1000

    const response = await fetch(`${provider.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [prompt, ...validMessages],
        temperature: 0.7,
        max_tokens: maxTokens
      })
    })

    const responseText = await response.text()
    console.log('日记总结API响应状态:', response.status, response.statusText)

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
        console.error('日记总结API错误详情:', errorData)
      } catch (e) {
        console.error('日记总结API错误文本:', responseText)
        throw new Error(`生成总结失败: ${responseText}`)
      }
      throw new Error(errorData.error?.message || errorData.message || '生成总结失败')
    }

    const data = JSON.parse(responseText)
    console.log('日记总结API返回数据:', data)

    if (!data.choices || data.choices.length === 0) {
      console.error('日记总结返回结构异常:', data)
      throw new Error('AI返回的数据格式不正确')
    }

    const content = data.choices[0].message?.content || data.choices[0].delta?.content || ''
    if (!content) {
      console.error('日记总结返回内容为空:', data)
      throw new Error('AI返回的内容为空')
    }

    return content
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    isLoading.value = false
  }
}

// 生成默认的AI回复（当API不可用时）
const generateDefaultResponse = (messages, mood) => {
  // 找到最后一条用户消息（不修改原数组）
  const userMessages = messages.filter(m => m.role === 'user')
  const lastUserMessage = userMessages[userMessages.length - 1]
  const userMessageLength = lastUserMessage?.content?.length || 0

  // 根据用户消息长度决定回复风格
  const useLongerResponse = userMessageLength > 30

  const responses = useLongerResponse ? [
    "我能理解你现在的感受，愿意多跟我说说吗？",
    "听起来你有很多想分享的，我愿意一直听你说。",
    "这种感觉我能体会到，还有什么想聊的吗？"
  ] : [
    "还想聊聊吗？",
    "愿意多跟我说说吗？",
    "我在这，继续分享？"
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

// 生成默认的日记总结（当API不可用时）
const generateDefaultSummary = (messages, mood) => {
  const moodDescriptions = {
    happy: '阳光像是被精心调过色的，暖得恰到好处',
    sad: '窗外的雨滴像是在替我诉说那些难以言喻的情绪',
    angry: '胸口那团火燃烧着，既灼热又混乱',
    calm: '风穿过窗棂的时候，我感到一种难得的宁静',
    excited: '心跳的节奏像是被按下了快进键',
    tired: '疲惫像潮水一样慢慢漫过脚踝',
    anxious: '呼吸间带着一丝慌乱，像迷路的蝴蝶',
    hopeful: '心里藏着一颗小小的种子，正悄悄发芽'
  }

  const moodEnding = {
    happy: '原来快乐有时候不需要特别的理由，只是恰好遇见了一个美好的瞬间。',
    sad: '泪水是心灵在排毒，明天一定会是个好天气。',
    angry: '发泄过后，我学会了与自己和解。',
    calm: '这份平静，是我与自己相处的最好的方式。',
    excited: '让我记住这份心跳，它是对生活最好的回应。',
    tired: '休息也是一种修行，明天又是新的开始。',
    anxious: '深呼吸，一切都会慢慢好起来的。',
    hopeful: '带着这份期待，我继续走在自己的路上。'
  }

  const date = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const userMessages = messages.filter(m => m.role === 'user')
  const mainContent = userMessages.map(m => m.content).join('；')

  return `${moodDescriptions[mood] || '今天的情绪像一幅未完成的画'}

${mainContent ? `那些想要被记住的念头，在脑海里盘旋：${mainContent}` : '有些情绪太轻，轻到连文字都承载不住，只能在心底悄悄沉淀。'}

${moodEnding[mood] || '每一个当下，都值得被温柔地收藏。'}`
}

// 获取当前配置
const getConfig = () => {
  const provider = aiProviders[currentProvider.value]
  return {
    provider: currentProvider.value,
    hasApiKey: !!provider.apiKey,
    providerName: provider.name
  }
}

// 初始化
loadConfig()

export default {
  aiProviders,
  currentProvider,
  isLoading,
  error,
  generateAIResponse,
  generateAISummary,
  generateDefaultSummary,
  generateDefaultResponse,
  saveConfig,
  loadConfig,
  getConfig
}
