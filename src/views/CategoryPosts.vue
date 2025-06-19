<template>
  <div class="category-posts-container">
    <h1>{{ categoryDisplayName || categoryCode }} 分类的帖子</h1>
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
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PostList from '@/components/PostList.vue'
import { getPostsByCategory, getCategories } from '@/api/posts'

const route = useRoute()
const router = useRouter()

const categoryCode = ref('')
const categoryDisplayName = ref('')
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
    const response = await getPostsByCategory(categoryCode.value, {
      page: pagination.value.page - 1,
      size: pagination.value.size
    });
    posts.value = response.data.content;
    pagination.value.totalElements = response.data.totalElements;
    
    // 如果通过 getCategories() 没能获取到名称，则从帖子信息中获取作为备用
    if (!categoryDisplayName.value && posts.value.length > 0) {
      categoryDisplayName.value = posts.value[0].categoryDisplayName;
    }
  } catch (error) {
    console.error('获取分类帖子失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchCategoryDetails = async (code) => {
  try {
    const response = await getCategories();
    if (response.data && Array.isArray(response.data.categories)) {
      const category = response.data.categories.find(cat => cat.code === code);
      if (category) {
        categoryDisplayName.value = category.displayName;
      }
    }
  } catch (error) {
    console.error('获取分类详情失败:', error);
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
  const newCode = decodeURIComponent(newParams.category)
  categoryCode.value = newCode
  categoryDisplayName.value = '' // 切换分类时重置
  pagination.value.page = 1;
  fetchCategoryDetails(newCode);
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