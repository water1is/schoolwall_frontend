<template>
    <div class="home-container">
        <!-- 顶部搜索栏 -->
        <div class="search-bar">
            <el-input v-model="searchKeyword" placeholder="搜索帖子..." @keyup.enter="handleSearch">
                <template #append>
                    <el-button :icon="Search" @click="handleSearch">搜索</el-button>
                </template>
            </el-input>
        </div>

        <!-- 内容区域 -->
        <div class="content-wrapper">
            <!-- 帖子列表 -->
            <PostList :posts="posts" :loading="loading" :pagination="pagination" @post-click="navigateToPost" :showPagination="true"
                @page-change="handlePageChange" />

            <!-- 侧边栏 -->
            <div class="sidebar">
                <el-card shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>热门分类</span>
                        </div>
                    </template>

                    <div class="category-tags">
                        <el-tag v-for="category in categories" :key="category.code"
                            :type="selectedCategory === category.name ? 'primary' : 'info'" size="large" effect="plain"
                            class="category-tag" @click="toggleCategory(category.code)">
                            {{ category.name }}
                        </el-tag>
                    </div>
                </el-card>

                <el-card shadow="hover" style="margin-top: 20px;">
                    <template #header>
                        <div class="card-header">
                            <span>推荐帖子</span> <!-- 从'热门帖子'改为'推荐帖子' -->
                        </div>
                    </template>

                    <div class="hot-posts">
                        <div v-for="post in hotPosts" :key="post.id" class="hot-post-item"
                            @click="navigateToPost(post)">
                            <h4 class="hot-post-title">{{ post.title }}</h4>
                            <div class="hot-post-meta">
                                <span>{{ post.likeCount }} 赞</span>
                                <span>{{ formatDate(post.createdAt, true) }}</span>
                            </div>
                        </div>

                        <el-empty v-if="hotPosts.length === 0" description="暂无推荐帖子" :image-size="60" />
                    </div>
                </el-card>
            </div>
        </div>

        <!-- 创建帖子按钮 -->
        <el-button class="create-post-btn" type="primary" :icon="Plus" circle size="large" @click="navigateToCreate" />
    </div>
</template>

<script>
import PostList from '@/components/PostList.vue';
import { getFeedPosts, getRecommendedPosts, getCategories } from '@/api/posts';

export default {
  components: {
    PostList
  },
  data() {
    return {
      searchKeyword: '',
      selectedCategory: '',
      pagination: {
        page: 0,
        size: 15,
        totalElements: 0,
        totalPages: 0
      },
      posts: [],
      hotPosts: [],
      categories: [],
      loading: true,
      currentPage: 0,
      pageSize: 15,
      sort: 'createdAt',
      direction: 'DESC'
    }
  },
  methods: {
    async fetchPosts() {
      this.loading = true;
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          sort: this.sort,
          direction: this.direction,
        };
        const response = await getFeedPosts(params);
        this.posts = response.data.content;
        this.totalPages = response.data.totalPages;
      } catch (error) {
        this.$message.error('获取帖子列表失败: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
    async fetchRecommended() {
      try {
        const response = await getRecommendedPosts({ limit: 5 });
        this.hotPosts = response.data;
      } catch (error) {
        console.error('获取推荐帖子失败:', error);
      }
    },
    async fetchCategories() {
      try {
        const response = await getCategories();
        // 参照 PostEdit.vue 的实现，API返回的数据结构为 { categories: [...] }
        // 模板中使用了 `category.name`，因此需要将 API 返回的 `displayName` 进行映射。
        if (response.data && Array.isArray(response.data.categories)) {
          this.categories = response.data.categories.map(item => ({
            name: item.displayName,
            code: item.code
          }));
        } else {
          // 如果数据格式不符，确保 categories 是一个空数组以避免渲染错误
          this.categories = [];
          console.warn('获取到的分类数据格式不正确或为空:', response.data);
        }
      } catch (error) {
        this.categories = []; // 在出错时也清空
        console.error('获取分类失败:', error);
        this.$message.error('获取分类列表失败');
      }
    },
    handleSearch() {
      if (this.searchKeyword.trim()) {
        this.$router.push(`/search/${encodeURIComponent(this.searchKeyword.trim())}`);
      }
    },
    toggleCategory(category) {
      if (category) {
        this.$router.push(`/posts/category/${encodeURIComponent(category)}`);
      }
    },
    handlePageChange() {
      this.fetchPosts();
    },
    navigateToPost(post) {
      this.$router.push({ name: 'PostDetail', params: { id: post.id, slug: post.slug } });
    },
    navigateToCreate() {
      this.$router.push({ name: 'PostCreate' });
    }
  },
  mounted() {
    this.fetchPosts();
    this.fetchRecommended();
    this.fetchCategories();
  }
}
</script>

<style scoped>
.home-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.search-bar {
    display: flex;
    margin-bottom: 20px;
}

.content-wrapper {
    display: flex;
    gap: 20px;
}

.post-list {
    flex: 1;
    min-width: 0;
}

.sidebar {
    width: 300px;
    flex-shrink: 0;
}

.card-header {
    font-weight: bold;
}

.post-item {
    padding: 20px;
    margin-bottom: 15px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.post-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.post-content {
    flex: 1;
    min-width: 0;
}

.post-title {
    margin: 0 0 10px 0;
    font-size: 18px;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.post-summary {
    margin: 0 0 15px 0;
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.post-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.author-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.author-name {
    font-size: 13px;
    color: #666;
}

.post-stats {
    display: flex;
    gap: 15px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #999;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

.category-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.category-tag {
    cursor: pointer;
}

.hot-posts {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.hot-post-item {
    cursor: pointer;
    padding-bottom: 10px;
    border-bottom: 1px dashed #eee;
}

.hot-post-item:last-child {
    border-bottom: none;
}
.hot-post-title {
    margin: 0 0 5px 0;
    font-size: 14px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.hot-post-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #999;
}

.skeleton-item {
    padding: 20px;
    margin-bottom: 15px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.create-post-btn {
    position: fixed;
    right: 40px;
    bottom: 40px;
    width: 56px;
    height: 56px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 992px) {
    .content-wrapper {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        margin-top: 20px;
    }
}

@media (max-width: 576px) {
    .search-bar {
        flex-direction: column;
        gap: 10px;
    }

    .search-bar .el-select {
        margin-left: 0 !important;
        width: 100% !important;
    }

    .post-meta {
        flex-direction: column;
        align-items: flex-start;
    }

    .post-stats {
        margin-left: 38px;
    }
}
</style>