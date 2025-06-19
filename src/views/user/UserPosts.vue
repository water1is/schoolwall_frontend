<template>
  <div class="user-posts-container">
    <el-card class="posts-card">
      <template #header>
        <div class="card-header">
          <h2>我的帖子</h2>
        </div>
      </template>
      
      <el-table :data="posts" style="width: 100%">
        <el-table-column prop="title" label="标题" width="180" />
        <el-table-column prop="categoryDisplayName" label="分类" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="publishedAt" label="发布时间" width="180" />
        <el-table-column prop="viewCount" label="浏览数" width="80" />
        <el-table-column prop="commentCount" label="评论数" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            {{ formatStatus(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)" type="primary">查看</el-button>
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyPosts, deletePost } from '@/api/posts'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const posts = ref([])

const fetchPosts = async () => {
  try {
    const response = await getMyPosts()
    console.log(response.data)
    posts.value = response.data
  } catch (error) {
    console.error('获取帖子列表失败:', error)
  }
}

const formatStatus = (status) => {
  const statusMap = {
    'DRAFT': '保存',
    'PUBLISHED': '发布',
    'DELETED': '删除',
    'HIDDEN': '隐藏'
  }
  return statusMap[status] || status
}

const handleEdit = (post) => {
  router.push(`/posts/edit/${post.id}/`)
}

const handleDelete = async (post) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇帖子吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deletePost(post.id)
    ElMessage.success('删除成功')
    fetchPosts() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleView = (post) => {
  router.push(`/posts/${post.id}/${post.slug}`)
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.user-posts-container {
  padding: 20px;
}
.posts-card {
  margin-top: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>