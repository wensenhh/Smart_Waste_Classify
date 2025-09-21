<template>
  <div class="community-share-container">
    <!-- 使用Header组件的默认模式 -->
    <Header mode="default" :title="$t('community.title')" defaultColor="#000"/>
    <main class="community-main">
      <!-- 页面标题 -->
      <div class="community-header">
        <h1>{{ $t('community.title') }}</h1>
        <p class="community-subtitle">{{ $t('community.subtitle') }}</p>
      </div>

      <!-- 发布帖子按钮 -->
      <div class="create-post-section">
        <button class="create-post-btn" @click="showCreatePostModal = true">
          ✏️ {{ $t('community.createPost') }}
        </button>
      </div>

      <!-- 帖子列表 -->
      <div class="posts-section">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>{{ $t('common.loading') }}</p>
        </div>
        <div v-else-if="posts.length === 0" class="empty-state">
          <p>{{ $t('community.noPosts') }}</p>
          <button class="create-first-post-btn" @click="showCreatePostModal = true">
            {{ $t('community.createFirstPost') }}
          </button>
        </div>
        <div v-else class="posts-list">
          <div v-for="post in posts" :key="post.id" class="post-item" @click="viewPostDetail(post.id)">
            <div class="post-header">
              <img :src="post.user.avatar" alt="User Avatar" class="user-avatar" />
              <div class="user-info">
                <span class="user-name">{{ post.user.name }}</span>
                <span class="post-time">{{ formatDate(post.createdAt) }}</span>
              </div>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-content">{{ post.content }}</p>
            <div class="post-stats">
              <span class="stat-item" @click.stop="likePost(post.id)">
                <i :class="{ liked: isPostLiked(post.id) }">👍</i>
                {{ getPostLikesCount(post.id) }}
              </span>
              <span class="stat-item">
                💬 {{ post.commentsCount || 0 }}
              </span>
              <span class="stat-item">
                👁️ {{ post.views || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
    <BottomNavBar />
    <Footer />

    <!-- 创建帖子弹窗 -->
    <div v-if="showCreatePostModal" class="modal-overlay" @click="closeCreatePostModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('community.createPost') }}</h3>
          <button class="modal-close-btn" @click="closeCreatePostModal">
            <span>×</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="post-title">{{ $t('community.postTitle') }}</label>
            <input
              id="post-title"
              v-model="newPost.title"
              type="text"
              placeholder="{{ $t('community.postTitlePlaceholder') }}"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="post-content">{{ $t('community.postContent') }}</label>
            <textarea
              id="post-content"
              v-model="newPost.content"
              placeholder="{{ $t('community.postContentPlaceholder') }}"
              class="form-textarea"
              rows="5"
            ></textarea>
          </div>
          <div class="form-group">
            <label>{{ $t('community.postCategory') }}</label>
            <select v-model="newPost.category" class="form-select">
              <option value="tips">{{ $t('community.categoryTips') }}</option>
              <option value="experience">{{ $t('community.categoryExperience') }}</option>
              <option value="question">{{ $t('community.categoryQuestion') }}</option>
              <option value="news">{{ $t('community.categoryNews') }}</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeCreatePostModal">
            {{ $t('common.cancel') }}
          </button>
          <button
            class="submit-btn"
            :disabled="!newPost.title.trim() || !newPost.content.trim()"
            @click="submitPost"
          >
            {{ $t('common.submit') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 帖子详情弹窗 -->
    <div v-if="showPostDetailModal" class="modal-overlay" @click="closePostDetailModal">
      <div class="post-detail-modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ currentPost?.title }}</h3>
          <button class="modal-close-btn" @click="closePostDetailModal">
            <span>×</span>
          </button>
        </div>
        <div v-if="currentPost" class="modal-body">
          <div class="post-detail-header">
            <img :src="currentPost.user.avatar" alt="User Avatar" class="user-avatar" />
            <div class="user-info">
              <span class="user-name">{{ currentPost.user.name }}</span>
              <span class="post-time">{{ formatDate(currentPost.createdAt) }}</span>
            </div>
          </div>
          <div class="post-detail-content">{{ currentPost.content }}</div>
          <div class="post-detail-stats">
            <span class="stat-item" @click.stop="likePost(currentPost.id)">
              <i :class="{ liked: isPostLiked(currentPost.id) }">👍</i>
              {{ getPostLikesCount(currentPost.id) }}
            </span>
            <span class="stat-item">
              💬 {{ currentPost.commentsCount || 0 }}
            </span>
            <span class="stat-item">
              👁️ {{ currentPost.views || 0 }}
            </span>
          </div>
          
          <!-- 评论区 -->
          <div class="comments-section">
            <h4>{{ $t('community.comments') }}</h4>
            <div class="comment-input-section">
              <input
                v-model="newComment"
                type="text"
                placeholder="{{ $t('community.addComment') }}"
                class="comment-input"
                @keyup.enter="submitComment"
              />
              <button
                class="comment-submit-btn"
                :disabled="!newComment.trim()"
                @click="submitComment"
              >
                {{ $t('common.send') }}
              </button>
            </div>
            <div class="comments-list">
              <div v-for="comment in currentPost.comments" :key="comment.id" class="comment-item">
                <img :src="comment.user.avatar" alt="Commenter Avatar" class="commenter-avatar" />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="commenter-name">{{ comment.user.name }}</span>
                    <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useCommunityStore } from '../stores/community';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import Footer from '../components/Footer.vue';
import BottomNavBar from '../components/BottomNavBar.vue';

export default {
  name: 'CommunityShare',
  components: {
    NavBar,
    Footer,
    BottomNavBar
  },
  setup() {
    const communityStore = useCommunityStore();
    const { t } = useI18n();
    
    const loading = ref(false);
    const posts = ref([]);
    const showCreatePostModal = ref(false);
    const showPostDetailModal = ref(false);
    const currentPost = ref(null);
    
    const newPost = ref({
      title: '',
      content: '',
      category: 'tips'
    });
    
    const newComment = ref('');

    // 获取帖子列表
    const fetchPosts = async () => {
      try {
        loading.value = true;
        await communityStore.fetchPosts();
        posts.value = communityStore.getPosts;
      } catch (error) {
        console.error('获取帖子失败:', error);
      } finally {
        loading.value = false;
      }
    };

    // 创建新帖子
    const submitPost = async () => {
      try {
        await communityStore.createPost(newPost.value);
        await fetchPosts();
        closeCreatePostModal();
      } catch (error) {
        console.error('创建帖子失败:', error);
      }
    };

    // 查看帖子详情
    const viewPostDetail = async (postId) => {
      try {
        await communityStore.fetchPostDetail(postId);
        currentPost.value = communityStore.getCurrentPost;
        showPostDetailModal.value = true;
      } catch (error) {
        console.error('获取帖子详情失败:', error);
      }
    };

    // 点赞帖子
    const likePost = async (postId) => {
      try {
        await communityStore.likePost(postId);
        // 更新当前显示的帖子数据
        if (currentPost.value && currentPost.value.id === postId) {
          currentPost.value = communityStore.getCurrentPost;
        }
        await fetchPosts(); // 刷新帖子列表
      } catch (error) {
        console.error('点赞失败:', error);
      }
    };

    // 判断帖子是否已点赞
    const isPostLiked = (postId) => {
      return communityStore.isPostLiked(postId);
    };

    // 获取帖子点赞数
    const getPostLikesCount = (postId) => {
      return communityStore.getPostLikesCount(postId);
    };

    // 提交评论
    const submitComment = async () => {
      if (!newComment.value.trim() || !currentPost.value) return;
      
      try {
        await communityStore.addComment(currentPost.value.id, newComment.value);
        // 更新当前显示的帖子数据
        currentPost.value = communityStore.getCurrentPost;
        newComment.value = '';
      } catch (error) {
        console.error('提交评论失败:', error);
      }
    };

    // 关闭创建帖子弹窗
    const closeCreatePostModal = () => {
      showCreatePostModal.value = false;
      // 重置表单
      newPost.value = {
        title: '',
        content: '',
        category: 'tips'
      };
    };

    // 关闭帖子详情弹窗
    const closePostDetailModal = () => {
      showPostDetailModal.value = false;
      currentPost.value = null;
      newComment.value = '';
    };

    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 60) {
        return `${diffMins} ${$t('common.minutesAgo')}`;
      } else if (diffHours < 24) {
        return `${diffHours} ${$t('common.hoursAgo')}`;
      } else if (diffDays < 30) {
        return `${diffDays} ${$t('common.daysAgo')}`;
      } else {
        return date.toLocaleDateString();
      }
    };

    // 组件挂载时获取帖子列表
    onMounted(() => {
      communityStore.initializeCommunity();
      fetchPosts();
    });

    return {
      loading,
      posts,
      showCreatePostModal,
      showPostDetailModal,
      currentPost,
      newPost,
      newComment,
      fetchPosts,
      submitPost,
      viewPostDetail,
      likePost,
      isPostLiked,
      getPostLikesCount,
      submitComment,
      closeCreatePostModal,
      closePostDetailModal,
      formatDate
    };
  }
};
</script>

<style scoped>
.community-share-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-secondary);
  padding-bottom: 80px;
}

.community-main {
  flex: 1;
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.community-header {
  text-align: center;
  margin-bottom: 30px;
}

.community-header h1 {
  font-size: 28px;
  margin-bottom: 10px;
  color: var(--primary-text-color);
}

.community-subtitle {
  font-size: 16px;
  color: var(--secondary-text-color);
}

.create-post-section {
  text-align: center;
  margin-bottom: 30px;
}

.create-post-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.create-post-btn:hover {
  background-color: var(--primary-color-hover);
}

.posts-section {
  margin-bottom: 30px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-item {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: bold;
  font-size: 14px;
  color: var(--primary-text-color);
}

.post-time {
  font-size: 12px;
  color: var(--secondary-text-color);
}

.post-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--primary-text-color);
}

.post-content {
  font-size: 16px;
  line-height: 1.6;
  color: var(--secondary-text-color);
  margin-bottom: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.post-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: var(--secondary-text-color);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.stat-item:hover {
  color: var(--primary-color);
}

.stat-item .liked {
  color: var(--primary-color);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--secondary-text-color);
}

.create-first-post-btn {
  margin-top: 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.create-first-post-btn:hover {
  background-color: var(--primary-color-hover);
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--secondary-text-color);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.post-detail-modal-content {
  background-color: white;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background-color: var(--primary-color);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.modal-close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

/* Form styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: var(--primary-text-color);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Button styles */
.cancel-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background-color: white;
  color: var(--primary-text-color);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background-color: #f5f5f5;
}

.submit-btn {
  padding: 10px 20px;
  border: none;
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--primary-color-hover);
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Post detail styles */
.post-detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.post-detail-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--secondary-text-color);
  margin-bottom: 20px;
}

.post-detail-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: var(--secondary-text-color);
  margin-bottom: 30px;
}

/* Comments styles */
.comments-section {
  margin-top: 30px;
}

.comments-section h4 {
  font-size: 18px;
  margin-bottom: 15px;
  color: var(--primary-text-color);
}

.comment-input-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.comment-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
}

.comment-submit-btn {
  padding: 10px 20px;
  border: none;
  background-color: var(--primary-color);
  color: white;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.comment-submit-btn:hover:not(:disabled) {
  background-color: var(--primary-color-hover);
}

.comment-submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  display: flex;
  gap: 10px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 12px;
}

.commenter-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.commenter-name {
  font-weight: bold;
  font-size: 14px;
  color: var(--primary-text-color);
}

.comment-time {
  font-size: 12px;
  color: var(--secondary-text-color);
}

.comment-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--secondary-text-color);
}

/* Responsive styles */
@media (max-width: 768px) {
  .community-main {
    padding: var(--spacing-md);
  }
  
  .modal-content,
  .post-detail-modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .post-title {
    font-size: 16px;
  }
  
  .post-content {
    font-size: 14px;
  }
}
</style>