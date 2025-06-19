<template>
  <div class="post-list">
    <el-skeleton :loading="loading" animated :count="5">
      <template #template>
        <div class="skeleton-item">
          <el-skeleton-item variant="h3" style="width: 50%;" />
          <el-skeleton-item variant="text" style="width: 100%; margin-top: 10px;" />
          <div style="display: flex; align-items: center; margin-top: 15px;">
            <el-skeleton-item variant="circle" style="width: 30px; height: 30px;" />
            <el-skeleton-item variant="text" style="width: 100px; margin-left: 10px;" />
            <el-skeleton-item variant="text" style="width: 80px; margin-left: auto;" />
          </div>
        </div>
      </template>

      <template #default>
        <template v-if="posts.length > 0">
          <div
            v-for="post in posts"
            :key="post.id"
            class="post-item"
            @click="$emit('post-click', post)"
          >
            <div class="post-content">
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-summary">{{ post.summary }}</p>
              
              <div class="post-meta">
                <div class="author-info">
                  <span class="author-name">{{ post.authorUsername }}</span>
                </div>
                
                <div class="post-stats">
                  <span class="stat-item">
                    <el-icon><Clock /></el-icon>
                    {{ formatDate(post.publishedAt) }}
                  </span>
                  <span class="stat-item">
                    <el-icon><Star /></el-icon>
                    {{ post.likeCount || 0 }}
                  </span>
                  <span class="stat-item">
                    <el-icon><ChatDotRound /></el-icon>
                    {{ post.commentCount || 0 }}
                  </span>
                  <span class="stat-item">
                    <el-icon><View /></el-icon>
                    {{ post.viewCount || 0 }}
                  </span>
                </div>
              </div>
            </div>
            
            <el-tag v-if="post.category" type="info" size="small" effect="plain">
              {{ post.categoryDisplayName }}
            </el-tag>
          </div>
          
          <!-- 分页 -->
          <div class="pagination" v-if="showPagination">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :total="pagination.totalElements"
              layout="prev, pager, next, jumper"
              @current-change="$emit('page-change', $event)"
              hide-on-single-page
            />
          </div>
        </template>
        
        <el-empty v-else :description="emptyText" />
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Clock, Star, ChatDotRound, View } from '@element-plus/icons-vue'

const props = defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: () => ({
      page: 0,
      size: 10,
      totalElements: 0
    })
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  emptyText: {
    type: String,
    default: '暂无帖子'
  }
})

const emit = defineEmits(['post-click', 'page-change'])

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}
// let posts = ref([
//   {
//     id: 1,
//     title: 'Vue3组合式API使用技巧',
//     summary: '分享一些Vue3组合式API的实用技巧和最佳实践',
//     category: '学术交流',
//     likeCount: 24,
//     commentCount: 8,
//     createdAt: '2023-05-15T10:30:00',
//     authorInfo: {
//       username: '前端开发者',
//       avatarUrl: 'https://example.com/avatar1.jpg'
//     }
//   },
//   {
//     id: 2,
//     title: '校园美食推荐',
//     summary: '分享学校周边值得一试的美食店铺',
//     category: '饮食推荐',
//     likeCount: 56,
//     commentCount: 23,
//     createdAt: '2023-05-10T14:15:00',
//     authorInfo: {
//       username: '美食达人',
//       avatarUrl: 'https://example.com/avatar2.jpg'
//     }
//   },
//   {
//     id: 3,
//     title: '春季校园摄影比赛',
//     summary: '欢迎参加我们举办的春季校园摄影比赛',
//     category: '社团活动',
//     likeCount: 102,
//     commentCount: 45,
//     createdAt: '2023-04-28T09:00:00',
//     authorInfo: {
//       username: '摄影社',
//       avatarUrl: 'https://example.com/avatar3.jpg'
//     }
//   }
// ])
</script>

<style scoped>
.post-list {
  width: 100%;
}

.post-item {
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.post-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.post-content {
  flex: 1;
}

.post-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.post-summary {
  margin: 8px 0 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.author-info {
  display: flex;
  align-items: center;
}

.author-name {
  margin-left: 8px;
  font-size: 13px;
  color: #666;
}

.post-stats {
  display: flex;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  margin-left: 15px;
  font-size: 12px;
  color: #999;
}

.stat-item .el-icon {
  margin-right: 3px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.skeleton-item {
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>