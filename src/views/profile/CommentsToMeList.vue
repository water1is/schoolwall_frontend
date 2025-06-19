<template>
  <div class="comments-to-me-list">
    <el-skeleton :loading="loading" animated :count="3">
      <template #template>
        <el-skeleton-item
          variant="p"
          style="width: 100%; height: 80px; margin-bottom: 15px"
        />
      </template>
      <template #default>
        <div v-if="comments.length > 0">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-wrapper"
          >
            <div class="comment-meta">
              <span
                >评论于 {{ new Date(comment.createdAt).toLocaleString() }}</span
              >
              <a
                @click="goToPost(comment.postId, comment.postSlug)"
                class="post-link"
              >
                帖子: {{ comment.postTitle || "帖子已删除" }}
              </a>
            </div>
            <CommentItem :comment="comment" />
          </div>
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :total="pagination.totalElements"
              layout="prev, pager, next"
              @current-change="handlePageChange"
              hide-on-single-page
            />
          </div>
        </div>
        <el-empty v-else description="还没有人评论你的帖子" />
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getCommentsForMe } from "@/api/comments"; // 注意：此API函数需要您在后端实现
import CommentItem from "@/components/CommentItem.vue";
import { ElMessage } from "element-plus";

const router = useRouter();
const comments = ref([]);
const loading = ref(true);
const pagination = ref({
  page: 1,
  size: 10,
  totalElements: 0,
});

const fetchComments = async () => {
  loading.value = true;
  try {
    const response = await getCommentsForMe();
    response.data.content.forEach((comment) => {
      comment.postTitle = comment.postTitle || "帖子已删除"; // 确保帖子标题存在
      comment.parentCommentId = comment.parentCommentId || null; // 确保父评论存在
    });
    comments.value = response.data.content;
    pagination.value.totalElements = response.data.totalElements;
  } catch (error) {
    ElMessage.error("获取评论列表失败");
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (newPage) => {
  pagination.value.page = newPage;
  fetchComments();
};

const goToPost = (postId, postSlug) => {
  if (postId && postSlug) {
    router.push(`/posts/${postId}/${postSlug}`);
  }
};

onMounted(fetchComments);
</script>

<style scoped>
.comment-wrapper {
  background-color: #fafafa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}
.comment-meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}
.post-link {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.post-link:hover {
  text-decoration: underline;
}
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
