<template>
  <div class="search-posts-container">
    <h1>搜索 "{{ keyword }}" 的结果</h1>
    
    <PostList
      :posts="posts"
      :loading="loading"
      :pagination="pagination"
      @post-click="navigateToPost"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PostList from '@/components/PostList.vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const keyword = ref(decodeURIComponent(route.params.keyword))
const posts = ref([])
const loading = ref(true)

const pagination = ref({
  page: 0,
  size: 10,
  totalElements: 0
})

const fetchPosts = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/posts/search', {
      params: {
        keyword: keyword.value,
        page: pagination.value.page-1,
        size: pagination.value.size
      }
    })
    posts.value = response.data.content
    pagination.value.totalElements = response.data.totalElements
  } catch (error) {
    console.error('搜索帖子失败:', error)
  } finally {
    loading.value = false
  }
}

const navigateToPost = (post) => {
  router.push(`/posts/${post.id}/${post.slug}`)
}

const handlePageChange = (page) => {
  pagination.value.page = page
  fetchPosts()
}

watch(() => route.params.keyword, (newKeyword) => {
  keyword.value = decodeURIComponent(newKeyword)
  pagination.value.page = 0
  fetchPosts()
}, { immediate: true })
</script>

<style scoped>
.search-posts-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}
</style>