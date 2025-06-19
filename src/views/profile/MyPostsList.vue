<template>
  <div>
    <PostList
      :posts="posts"
      :loading="loading"
      :pagination="pagination"
      :show-actions="true"
      @page-change="handlePageChange"
      @post-click="handlePostClick"
      @edit-post="handleEdit"
      @delete-post="handleDelete"
      empty-text="你还没有发布任何帖子"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getMyPosts, deletePost } from "@/api/posts";
import PostList from "@/components/PostList.vue";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const posts = ref([]);
const loading = ref(true);
const pagination = ref({
  page: 1,
  size: 10,
  totalElements: 0,
});

const fetchPosts = async () => {
  loading.value = true;
  try {
    const response = await getMyPosts();
    console.log(response.data);
    posts.value = response.data;
  } catch (error) {
    console.error("获取帖子列表失败:", error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (newPage) => {
  pagination.value.page = newPage;
  fetchPosts();
};

const handlePostClick = (post) => {
  if (post.id && post.slug) {
    router.push(`/posts/${post.id}/${post.slug}`);
  } else if (post.id) {
    router.push(`/posts/${post.id}`);
  }
};

const handleEdit = (post) => {
  router.push(`/posts/edit/${post.id}`);
};

const handleDelete = async (post) => {
  try {
    await ElMessageBox.confirm(
      "确定要删除这篇帖子吗？此操作不可撤销。",
      "警告",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    await deletePost(post.id);
    ElMessage.success("帖子已删除");
    // 刷新列表，如果删除的是当前页最后一条，可能需要处理页码
    if (posts.value.length === 1 && pagination.value.page > 1) {
      pagination.value.page--;
    }
    fetchPosts();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
      console.error("删除帖子时出错:", error);
    }
  }
};

onMounted(fetchPosts);
</script>
