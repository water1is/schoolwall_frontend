<template>
  <div class="post-edit-container">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="标题">
        <el-input v-model="form.title" placeholder="请输入标题"></el-input>
      </el-form-item>

      <el-form-item label="分类">
        <el-select v-model="form.category" placeholder="请选择分类">
          <el-option v-for="item in categories" :key="item.code" :label="item.name" :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="标签">
        <el-input v-model="form.tags" placeholder="请输入标签"></el-input>
      </el-form-item>

      <el-form-item label="内容">
        <div class="markdown-editor">
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="编辑" name="edit">
              <el-input v-model="form.content" type="textarea" :rows="15" placeholder="请输入内容（支持Markdown语法）">
              </el-input>
            </el-tab-pane>
            <el-tab-pane label="预览" name="preview">
              <div class="markdown-preview" v-html="compiledMarkdown"></div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-form-item>

      <el-form-item>
        <template v-if="form.status=='DRAFT'">
          <el-button type="primary" @click="submitPost('save')">
            保存草稿
          </el-button>
          <el-button type="success" @click="submitPost('publish')">
            保存并发布
          </el-button>
        </template>

        <!-- 编辑帖子时的按钮 -->
        <template v-else>
          <el-button type="primary" @click="submitPost('save')">
            保存更改
          </el-button>
          <el-button type="info" @click="submitPost('view')">
            查看帖子
          </el-button>
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { marked } from 'marked'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export default {
  name: 'PostEdit',
  data() {
    return {
      activeTab: 'edit',
      form: {
        title: '',
        content: '',
        category: '',
        tags: '',
        status: ''
      },
      categories: []
    }
  },
  created() {
    this.fetchCategories()

    // 根据路由参数判断是创建还是编辑模式
    if (this.$route.params.id) {
      this.fetchPost(this.$route.params.id)
    }
  },
  computed: {
    compiledMarkdown() {
      return marked(this.form.content || '')
    }
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await axios.get('/api/posts/categories')
        this.categories = response.data.categories.map(item => ({
          name: item.displayName,
          code: item.code
        }))
      } catch (error) {
        ElMessage.error('获取分类列表失败: ' + error.message)
      }
    },

    async fetchPost(postId) {
      try {
        const response = await axios.get(`/api/posts/${postId}`)
        this.form = {
          id: response.data.id,
          title: response.data.title,
          content: response.data.content,
          category: response.data.category,
          slug: response.data.slug,
          tags: response.data.tags,
          status: response.data.status
        }
      } catch (error) {
        ElMessage.error('获取帖子信息失败: ' + error.message)
      }
    },
    saveDraft() {
      this.form.status = 'draft'
      this.submitPost()
    },
    publishPost() {
      this.form.status = 'published'
      this.submitPost()
    }, async submitPost(action = 'save') {
      // 基础验证
      if (!this.form.title) {
        ElMessage.error('请输入标题');
        return;
      }
      if (!this.form.content) {
        ElMessage.error('请输入内容');
        return;
      }

      try {
        // 创建发送数据对象
        const { status, ...postData } = this.form;

        // 区分新建和编辑模式
        if (this.form.status == 'DRAFT') {

          // 新建帖子逻辑
          const response = await axios.post('/api/posts', postData);
          this.form.id = response.data.id;

          // 根据操作类型处理发布逻辑
          if (action === 'publish') {

            const publishResponse = await axios.put(`/api/posts/${this.form.id}/publish`);
            console.log(publishResponse)
            ElMessage.success('发布成功');
          } else {
            ElMessage.success('保存草稿成功');
          }

          // 跳转到详情页
          return this.$router.push({
            name: 'PostDetail',
            params: {
              id: this.form.id,
              slug: response.data.slug
            }
          });
        } else {
          // 编辑帖子逻辑 - 只有保存操作
          await axios.put(`/api/posts/${this.form.id}`, postData);
          ElMessage.success('更新成功');

          // 如果是编辑已发布的帖子，不需要再次发布
          // 直接留在编辑页或跳转到详情页
          if (action === 'view') {
            return this.$router.push({
              name: 'PostDetail',
              params: {
                id: this.form.id,
                slug: this.form.slug
              }
            });
          }
        }
      } catch (error) {
        // 错误处理
        const message = error.response?.status === 401 ? '请先登录'
          : error.response?.status === 403 ? '没有权限'
            : error.message || '操作失败';

        ElMessage.error(message);
        console.error(error);
      }
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