<template>
  <div class="comment" :class="{ 'comment-deleted': comment.isDeleted }">
    <div class="comment-header">
      <img 
        v-if="comment.userAvatarUrl" 
        :src="comment.userAvatarUrl" 
        class="comment-avatar"
        alt="用户头像"
        style="width: 40px; height: 40px; border-radius: 30%; object-fit: cover; margin-right: 10px;"
      />
      <span class="comment-author">{{ comment.username || '匿名用户' }}</span>
      <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
    </div>
    
    <div class="comment-content">
      <template v-if="!comment.isDeleted">
        <span v-if="comment.parentCommentUsername" class="reply-to">
          @{{ comment.parentCommentUsername }} 
        </span>
        {{ comment.content }}
      </template>
      <template v-else>
        该评论已删除
      </template>
    </div>
    
    <div class="comment-actions">
      <el-button 
        v-if="!comment.isDeleted"
        type="text" 
        size="small" 
        @click="toggleReply"
      >
        回复
      </el-button>
      
      <el-button 
        v-if="showViewReplies && hasReplies && !comment.isDeleted"
        type="text" 
        size="small" 
        @click="toggleReplies"
      >
        {{ showReplies ? '隐藏回复' : `查看回复 (${replyCount})` }}
      </el-button>
    </div>
    
    <!-- 回复表单 -->
    <div v-if="showReplyForm" class="reply-form">
      <el-input
        v-model="replyContent"
        type="textarea"
        :rows="2"
        :placeholder="replyPlaceholder"
      />
      <div class="form-actions">
        <el-button size="small" @click="cancelReply">取消</el-button>
        <el-button type="primary" size="small" @click="submitReply">提交</el-button>
      </div>
    </div>
    
    <!-- 回复列表 -->
    <div v-if="showReplies" class="replies">
      <div 
        v-for="reply in replies" 
        :key="reply.id"
        class="reply-item"
      >
        <comment-item 
          :comment="reply" 
          :show-view-replies="false"
          @reply="handleNestedReply"
          @fetch-replies="fetchNestedReplies"
        />
      </div>
      
      <!-- 回复分页 -->
      <el-pagination
        v-if="repliesPageInfo.totalPages > 1"
        small
        v-model:current-page="repliesCurrentPage"
        v-model:page-size="repliesPageSize"
        :total="repliesPageInfo.totalElements"
        layout="prev, pager, next"
        @current-change="fetchCommentReplies"
      />
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  showViewReplies: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['reply', 'fetch-replies'])

const showReplyForm = ref(false)
const replyContent = ref('')
const showReplies = ref(false)
const replies = ref([])
const repliesCurrentPage = ref(1)
const repliesPageSize = ref(5)
const repliesPageInfo = ref({
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  last: true
})

// 计算回复框的placeholder
const replyPlaceholder = computed(() => {
  return `回复 ${props.comment.username || '匿名用户'}:`
})

// 是否有回复
const hasReplies = computed(() => {
  return props.comment.replyCount > 0 || replies.value.length > 0
})

// 回复数量
const replyCount = computed(() => {
  return repliesPageInfo.value.totalElements || props.comment.replyCount || 0
})

// 获取顶级评论ID
const getTopLevelCommentId = (comment) => {
  return comment.parentCommentId ? comment.parentCommentId : comment.id
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

// 切换回复表单
const toggleReply = () => {
  showReplyForm.value = !showReplyForm.value
  if (showReplyForm.value) {
    emit('reply', props.comment.id, props.comment.content)
  }
}

// 取消回复
const cancelReply = () => {
  showReplyForm.value = false
  replyContent.value = ''
}

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('回复内容不能为空')
    return
  }
  
  try {
    // 获取顶级评论ID作为parentCommentId
    const parentIdToUse = getTopLevelCommentId(props.comment)
    
    // 构建回复内容，自动添加@username
    let finalContent = replyContent.value
    if (props.comment.username) {
      finalContent = `@${props.comment.username} ${finalContent}`
    }
    
    const res = await axios.post('/api/comments', {
      content: finalContent,
      postId: props.comment.postId,
      parentCommentId: parentIdToUse,  // 始终指向顶级评论
      parentCommentUsername: props.comment.username  // 记录被回复的用户名
    })
    
    ElMessage.success('回复成功')
    replyContent.value = ''
    showReplyForm.value = false
    
    if (showReplies.value) {
      await fetchCommentReplies()
    } else {
      toggleReplies()
    }
    // 刷新当前评论的回复列表
    emit('fetch-replies')
  } catch (error) {
    ElMessage.error('回复失败')
    console.error(error)
  }
}

// 切换回复显示
const toggleReplies = async () => {
  showReplies.value = !showReplies.value
  if (showReplies.value && replies.value.length === 0) {
    await fetchCommentReplies()
  }
}

// 获取评论的回复
const fetchCommentReplies = async () => {
  try {
    const response = await axios.get(`/api/comments/${props.comment.id}/replies`, {
      params: {
        page: repliesCurrentPage.value - 1,
        size: repliesPageSize.value
      }
    })
    replies.value = response.data.content
    repliesPageInfo.value = {
      page: response.data.page,
      size: response.data.size,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      last: response.data.last
    }
  } catch (error) {
    ElMessage.error('获取回复失败')
    console.error(error)
  }
}
fetchCommentReplies();

// 处理嵌套回复
const handleNestedReply = (commentId, content) => {
  emit('reply', commentId, content)
}

// 处理嵌套回复的刷新
const fetchNestedReplies = () => {
  emit('fetch-replies')
}
</script>

<style scoped>
.reply-to {
  color: #409eff;
  font-weight: bold;
  margin-right: 4px;
}
.comment {
  padding: 12px;
  border-radius: 4px;
  background-color: #f9f9f9;
  margin-bottom: 12px;
}

.comment-deleted {
  opacity: 0.6;
  background-color: #f0f0f0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.comment-author {
  font-weight: bold;
  color: #333;
}

.comment-time {
  color: #999;
}

.comment-content {
  margin-bottom: 8px;
  line-height: 1.5;
  white-space: pre-line;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.reply-form {
  margin-top: 10px;
}

.form-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.replies {
  margin-top: 10px;
  padding-left: 20px;
  border-left: 2px solid #eee;
}

.reply-item {
  margin-top: 10px;
}

.el-pagination {
  margin-top: 10px;
}
</style>