<template>
  <div class="post-management-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>帖子管理</span>
          <el-button type="primary" @click="fetchPosts">刷新</el-button>
        </div>
      </template>

      <!-- 查询表单 -->
      <div class="filter-container">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 140px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      
        <el-select v-model="queryParams.category" placeholder="全部分类" clearable style="width: 140px">
          <el-option
            v-for="item in categories"
            :key="item.code"
            :label="item.displayName"
            :value="item.code"
          />
        </el-select>
      
        <el-select v-model="queryParams.sort" placeholder="默认排序" clearable style="width: 140px">
          <el-option label="创建时间" value="createdAt" />
          <el-option label="更新时间" value="updatedAt" />
        </el-select>
        <el-select v-model="queryParams.direction" placeholder="排序方向" clearable style="width: 140px">
          <el-option label="升序" value="ASC" />
          <el-option label="降序" value="DESC" />
        </el-select>
      
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>

      <!-- 帖子列表表格 -->
      <el-table
        :data="posts"
        v-loading="loading"
        style="width: 100%"
        border
        max-height="60vh"
      >
        <el-table-column prop="title" label="标题" width="200" />
        <el-table-column prop="authorUsername" label="作者" width="80" />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            {{ getCategoryName(row.category) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="showContent(row)">查看内容</el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="goToDetail(row)"
              :disabled="row.status !== 'PUBLISHED'"
            >
              跳转详情
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
              :disabled="row.status === 'DELETED'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentDisplayPage"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 内容查看对话框 -->
      <el-dialog v-model="contentDialogVisible" title="帖子内容" width="70%">
        <div class="content-preview" v-html="compiledContent"></div>
        <template #footer>
          <el-button type="primary" @click="contentDialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'

export default {
  name: 'PostManagement',
  data() {
    return {
      loading: false,
      posts: [],
      categories: [],
      total: 0,
      statusOptions: [
        { value: 'DRAFT', label: '草稿' },
        { value: 'PUBLISHED', label: '已发布' },
        { value: 'DELETED', label: '已删除' },
        { value: 'HIDDEN', label: '已隐藏' }
      ],
      queryParams: {
        page: 0,
        size: 10,
        sort: '',
        direction: '',
        status: '',
        category: ''
      },
      contentDialogVisible: false,
      currentContent: ''
    }
  },
  computed: {
    currentDisplayPage() {
      return this.queryParams.page + 1
    },
    compiledContent() {
      return marked(this.currentContent || '')
    }
  },
  created() {
    this.fetchCategories()
    this.fetchPosts()
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await axios.get('/api/admin/posts/categories')
        this.categories = response.data
      } catch (error) {
        ElMessage.error('获取分类列表失败: ' + error.message)
        console.error(error)
      }
    },
    
    async fetchPosts() {
      this.loading = true
      try {
        const params = Object.fromEntries(
          Object.entries(this.queryParams).filter(([_, v]) => v !== '')
        )
        const response = await axios.get('/api/admin/posts', { params })
        this.posts = response.data.content
        this.total = response.data.totalElements
      } catch (error) {
        ElMessage.error('获取帖子列表失败: ' + error.message)
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    
    getCategoryName(code) {
      const category = this.categories.find(item => item.code === code)
      return category ? category.displayName : code
    },
    
    getStatusTagType(status) {
      switch (status) {
        case 'DRAFT': return 'warning'
        case 'PUBLISHED': return 'success'
        case 'DELETED': return 'danger'
        case 'HIDDEN': return 'info'
        default: return ''
      }
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleString()
    },
    
    handleSearch() {
      this.queryParams.page = 0
      this.fetchPosts()
    },
    
    resetSearch() {
      this.queryParams = {
        page: 0,
        size: 10,
        sort: '',
        direction: '',
        status: '',
        category: ''
      }
      this.fetchPosts()
    },
    
    handleSizeChange(size) {
      this.queryParams.size = size
      this.fetchPosts()
    },
    
    handleCurrentChange(page) {
      this.queryParams.page = page - 1
      this.fetchPosts()
    },
    
    async handleDelete(row) {
      try {
        await axios.delete(`/api/admin/posts/${row.id}`)
        ElMessage.success('删除成功')
        this.fetchPosts()
      } catch (error) {
        ElMessage.error('删除失败: ' + error.message)
        console.error(error)
      }
    },
    
    showContent(row) {
      this.currentContent = row.content
      this.contentDialogVisible = true
    },
    
    goToDetail(row) {
      this.$router.push({
        name: 'PostDetail',
        params: {
          id: row.id,
          slug: row.slug || 'post' // 如果slug不存在使用默认值
        }
      })
    }
  }
}
</script>

<style scoped>
.post-management-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.content-preview {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}
</style>