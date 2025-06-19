<template>
  <div class="category-posts-container">
    <h1>{{ category }}分类的帖子</h1>
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

const category = ref(decodeURIComponent(route.params.category))
const posts = ref([])
const loading = ref(true)

const pagination = ref({
  page: 1,
  size: 10,
  totalElements: 0
})

const fetchPosts = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`/api/posts/category/${category.value}`, {
      params: {
        page: pagination.value.page-1,
        size: pagination.value.size
      }
    });
    console.log(response.data);
    posts.value = response.data.content;
    pagination.value.totalElements = response.data.totalElements;
  } catch (error) {
    console.error('获取分类帖子失败:', error);
  } finally {
    loading.value = false;
  }
};

const navigateToPost = (post) => {
  router.push(`/posts/${post.id}/${post.slug}`)
}

const handlePageChange = (page) => {
  pagination.value.page = page
  fetchPosts()
}

watch(() => route.params, (newParams) => {
  category.value = decodeURIComponent(newParams.category)
  pagination.value.page = 1;
  fetchPosts()
}, { immediate: true })
</script>

<style scoped>
.category-posts-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}
</style>