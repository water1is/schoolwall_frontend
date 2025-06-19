<template>
  <div class="user-comments-container">
    <h2>我的评论</h2>
    
    <el-table :data="userComments" style="width: 100%" v-loading="loading">
      <el-table-column prop="content" label="评论内容" width="300">
        <template #default="{ row }">
          <div class="comment-content" :class="{ 'deleted-comment': row.isDeleted }">
            {{ row.isDeleted ? '[已删除的评论]' : row.content }}
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="postInfo" label="所属帖子" width="250">
        <template #default="{ row }">
          <div v-if="row.postTitle">
              {{ row.postTitle }}
          </div>
          <div v-else>
            帖子已删除
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="createdAt" label="评论时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button 
            v-if="!row.isDeleted"
            type="danger" 
            size="small" 
            @click="handleDelete(row.id)"
            :loading="row.deleting"
          >
            删除
          </el-button>
          <el-tag v-else type="info" size="small">已删除</el-tag>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalComments"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchUserComments"
        @current-change="fetchUserComments"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// 用户评论数据
const userComments = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalComments = ref(0)

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

// 获取用户评论
const fetchUserComments = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/comments/me', {
      params: {
        page: currentPage.value - 1,
        size: pageSize.value
      }
    })
    console.log(response.data)
    userComments.value = response.data.content.map(comment => ({
      ...comment,
      deleting: false
    }))
    totalComments.value = response.data.totalElements
  } catch (error) {
    ElMessage.error('获取评论列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 删除评论
const handleDelete = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？删除后不可恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const commentIndex = userComments.value.findIndex(c => c.id === commentId)
    if (commentIndex !== -1) {
      userComments.value[commentIndex].deleting = true
      
      await axios.delete(`/api/comments/${commentId}`)
      
      ElMessage.success('评论删除成功')
      // 标记为已删除而不是从列表中移除，因为可能还有分页
      userComments.value[commentIndex].isDeleted = true
      userComments.value[commentIndex].deleting = false
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除评论失败')
      console.error(error)
      
      const commentIndex = userComments.value.findIndex(c => c.id === commentId)
      if (commentIndex !== -1) {
        userComments.value[commentIndex].deleting = false
      }
    }
  }
}

// 初始化加载
onMounted(() => {
  fetchUserComments()
})
</script>

<style scoped>
.user-comments-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.comment-content {
  line-height: 1.5;
  white-space: pre-line;
}

.deleted-comment {
  color: #999;
  font-style: italic;
}

.post-link {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.post-link:hover {
  text-decoration: underline;
}


.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>