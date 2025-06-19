<template>
  <div class="post-edit-container">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="标题" required>
        <el-input v-model="form.title" placeholder="请输入标题"></el-input>
      </el-form-item>

      <el-form-item label="分类" required>
        <el-select v-model="form.category" placeholder="请选择分类">
          <el-option v-for="item in categories" :key="item.code" :label="item.name" :value="item.code"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="标签">
        <el-input v-model="form.tags" placeholder="请输入标签，多个标签用逗号分隔"></el-input>
      </el-form-item>

      <el-form-item label="内容" required>
        <div class="markdown-editor">
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="编辑" name="edit">
              <el-input v-model="form.content" type="textarea" :rows="15" placeholder="请输入内容（支持Markdown语法）"></el-input>
            </el-tab-pane>
            <el-tab-pane label="预览" name="preview">
              <div class="markdown-preview" v-html="compiledMarkdown"></div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-form-item>

      <el-form-item>
        <!-- 草稿状态（新建或未发布的编辑） -->
        <template v-if="isDraft">
          <el-button type="primary" @click="handleSubmit('SAVE_DRAFT')">保存草稿</el-button>
          <el-button type="success" @click="handleSubmit('PUBLISH')">发布</el-button>
        </template>
        
        <!-- 已发布状态 -->
        <template v-else>
          <el-button type="primary" @click="handleSubmit('UPDATE')">保存更改</el-button>
          <el-button type="info" @click="goToPostView">查看帖子</el-button>
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { marked } from 'marked'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 发布状态常量
const POST_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED'
}

// 操作类型常量
const ACTION_TYPE = {
  SAVE_DRAFT: 'SAVE_DRAFT',
  PUBLISH: 'PUBLISH',
  UPDATE: 'UPDATE'
}

export default {
  name: 'PostEdit',
  data() {
    return {
      activeTab: 'edit',
      form: {
        id: null,
        title: '',
        content: '',
        category: '',
        tags: '',
        status: POST_STATUS.DRAFT // 默认草稿状态
      },
      categories: []
    }
  },
  computed: {
    compiledMarkdown() {
      return marked(this.form.content || '')
    },
    isNewPost() {
      return !this.$route.params.id
    },
    isDraft() {
      return this.form.status === POST_STATUS.DRAFT
    }
  },
  created() {
    this.fetchCategories()
    if (!this.isNewPost) {
      this.fetchPost(this.$route.params.id)
    }
  },
  methods: {
    async fetchCategories() {
      try {
        const { data } = await axios.get('/api/posts/categories')
        this.categories = data.categories.map(item => ({
          name: item.displayName,
          code: item.code
        }))
      } catch (error) {
        ElMessage.error('获取分类列表失败')
        console.error(error)
      }
    },

    async fetchPost(postId) {
      try {
        const { data } = await axios.get(`/api/posts/${postId}`)
        this.form = {
          id: data.id,
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
          status: data.status
        }
      } catch (error) {
        ElMessage.error('获取帖子信息失败')
        console.error(error)
      }
    },

    validateForm() {
      if (!this.form.title.trim()) {
        ElMessage.error('请输入标题')
        return false
      }
      if (!this.form.content.trim()) {
        ElMessage.error('请输入内容')
        return false
      }
      if (!this.form.category) {
        ElMessage.error('请选择分类')
        return false
      }
      return true
    },

    async handleSubmit(action) {
      if (!this.validateForm()) return

      try {
        let response
        
        if (action === ACTION_TYPE.PUBLISH) {
          this.form.status = POST_STATUS.PUBLISHED
        }

        if (this.isNewPost) {
          // 新建帖子
          response = await axios.post('/api/posts', this.form)
          this.form.id = response.data.id
          ElMessage.success(action === ACTION_TYPE.PUBLISH ? '发布成功' : '草稿保存成功')
        } else {
          // 更新帖子
          response = await axios.put(`/api/posts/${this.form.id}`, this.form)
          ElMessage.success(action === ACTION_TYPE.PUBLISH ? '发布成功' : '更新成功')
        }

        // 如果是发布操作或查看操作，跳转到详情页
        if (action === ACTION_TYPE.PUBLISH || action === ACTION_TYPE.VIEW) {
          this.goToPostView(response.data?.slug || this.form.slug)
        }
      } catch (error) {
        this.handleError(error)
      }
    },

    goToPostView(slug = null) {
      this.$router.push({
        name: 'PostDetail',
        params: {
          id: this.form.id,
          slug: slug || this.form.slug
        }
      })
    },

    handleError(error) {
      const message = error.response?.status === 401 ? '请先登录' :
                     error.response?.status === 403 ? '没有权限' :
                     '操作失败，请重试'
      ElMessage.error(message)
      console.error(error)
    }
  }
}
</script>

<style scoped>
.post-edit-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}

.markdown-editor {
  width: 100%;
}

.markdown-preview {
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  min-height: 300px;
}
</style>