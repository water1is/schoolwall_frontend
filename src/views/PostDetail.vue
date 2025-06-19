<template>
  <div class="post-container">
    <!-- 帖子详情部分 -->
    <div class="post-detail">
      <h1>
  {{ post.title }}
  <span v-if="post.emoji" class="sentiment-emoji">{{ post.emoji }}</span>
</h1>
      <div class="post-meta">
        <span>作者: {{ post.authorUsername }}</span>
        <span>分类: {{ post.categoryDisplayName }}</span>
        <span>发布时间: {{ formatDate(post.publishedAt) }}</span>
        <div class="post-stats">
          <span><el-icon><View /></el-icon> {{ post.viewCount }}</span>
          <span><el-icon><Star /></el-icon> {{ post.likeCount || 0 }}</span>
          <span><el-icon><ChatDotRound /></el-icon> {{ post.commentCount }}</span>
        </div>
      </div>
      
      <!-- 封面图片 -->
      <img v-if="post.coverImage" :src="post.coverImage" alt="封面" class="cover-image">
      
      <!-- Markdown内容 -->
      <div class="markdown-body" v-html="renderedMarkdown"></div>
      
      <!-- 操作按钮 -->
      <div class="post-actions">
        <el-button type="success" :icon="DocumentCopy" @click="copyPostLink">复制链接</el-button>
      </div>
    </div>
    
    <!-- 评论部分 -->
    <div class="comment-section">
      <h2>评论 ({{ post.commentCount }})</h2>
      
      <!-- 评论表单 -->
      <div class="comment-form">
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="写下你的评论..."
        />
        <el-button type="primary" @click="submitComment">提交评论</el-button>
      </div>
      
      <!-- 评论列表 -->
      <div class="comment-list">
        <div 
          v-for="comment in topLevelComments.content" 
          :key="comment.id"
          class="comment-item"
        >
          <comment-item 
            :comment="comment" 
            @reply="handleReply"
            @fetch-replies="fetchReplies"
          />
        </div>
        
        <!-- 分页 -->
        <el-pagination
          v-if="topLevelComments.totalPages > 1"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="topLevelComments.totalElements"
          layout="prev, pager, next"
          @current-change="fetchTopLevelComments"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import sentimentHelper from '@/assets/sentimentHelper'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { View, Star, ChatDotRound, Share, Bookmark, DocumentCopy } from '@element-plus/icons-vue'
import axios from 'axios'
import CommentItem from '@/components/CommentItem.vue'
import { marked } from 'marked' // 需要安装marked
import DOMPurify from 'dompurify' // 需要安装dompurify

const route = useRoute()

// 帖子数据
const post = ref({
  id: 0,
  title: '',
  summary: '',
  slug: '',
  authorUsername: '',
  category: '',
  categoryDisplayName: '',
  coverImage: null,
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  isTop: false,
  isRecommended: false,
  publishedAt: '',
  sentiment: ''
})

// 评论数据
const topLevelComments = ref({
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  last: true,
  content: []
})

const newComment = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 从路由中提取ID和slug
const postId = computed(() => {

  return route.params.id
})

const postSlug = computed(() => {
  return route.params.slug
})

// 渲染Markdown
const renderedMarkdown = computed(() => {
  return DOMPurify.sanitize(marked(post.value.content || ''))
})

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

// 获取帖子详情
const fetchPostDetail = async () => {
  try {
    const response = await axios.get(`/api/posts/slug/${route.params.slug}`)
    post.value = response.data
    post.value.emoji = await sentimentHelper.getSentimentEmoji('post', route.params.id)
    // 获取顶级评论
    await fetchTopLevelComments()
  } catch (error) {
    ElMessage.error('获取帖子详情失败')
    console.error(error)
  }
}

const fetchTopLevelComments = async () => {
  try {
    const response = await axios.get(`/api/comments/post/${postId.value}/toplevel`, {
      params: {
        page: currentPage.value - 1,
        size: pageSize.value
      }
    })
    console.log(response.data)
    topLevelComments.value = response.data
  } catch (error) {
    ElMessage.error('获取评论失败')
    console.error(error)
  }
  for (const comment of topLevelComments.value.content) {
      try {
        comment.emoji = await sentimentHelper.getSentimentEmoji('comment', comment.id);
      } catch (error) {
        console.error(`获取评论 ${comment.id} 的情感emoji失败:`, error);
        comment.emoji = '😐'; // 默认表情
      }
    }

    console.log('带emoji的评论数据:', topLevelComments.value);
}

// 提交评论
// 复制帖子链接
const copyPostLink = () => {
  const postUrl = window.location.href
  navigator.clipboard.writeText(postUrl)
    .then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
      ElMessage.error('复制链接失败')
    })
}

const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  
  try {
    await axios.post('/api/comments', {
      content: newComment.value,
      postId: postId.value,
      parentId: 0 // 顶级评论
    })
    ElMessage.success('评论成功')
    newComment.value = ''
    await fetchTopLevelComments()
    // 更新评论计数
    post.value.commentCount += 1
  } catch (error) {
    ElMessage.error('评论失败')
    console.error(error)
  }
}

// 处理回复
const handleReply = (commentId, content) => {
  // 这里可以实现在评论框中自动引用回复的内容
  newComment.value = `@${commentId} ${content}\n`
}

onMounted(() => {
  fetchPostDetail()
})
</script>

<style scoped>
.post-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.post-meta {
  color: #666;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.post-stats {
  display: flex;
  gap: 15px;
}

.cover-image {
  max-width: 100%;
  margin-bottom: 20px;
  border-radius: 4px;
}

.markdown-body {
  margin: 20px 0;
  line-height: 1.6;
}

.post-actions {
  margin: 30px 0;
  display: flex;
  gap: 10px;
}

.comment-section {
  margin-top: 40px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.comment-form {
  margin: 20px 0;
}

.comment-list {
  margin-top: 30px;
}

.comment-item {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  justify-content: center;
}
.sentiment-emoji {
  margin-left: 8px;
  font-size: 1.2em;
  vertical-align: middle;
}
</style>