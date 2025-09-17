// 社区分享状态管理store
import { defineStore } from 'pinia';

export const useCommunityStore = defineStore('community', {
  state: () => ({
    posts: [],
    currentPost: null,
    loading: false,
    error: null,
    postLikes: new Map() // 存储用户点赞的帖子ID
  }),

  getters: {
    // 获取帖子列表
    getPosts: (state) => state.posts,
    // 获取当前帖子
    getCurrentPost: (state) => state.currentPost,
    // 获取帖子点赞数
    getPostLikesCount: (state) => (postId) => {
      const post = state.posts.find(p => p.id === postId);
      return post ? post.likesCount || 0 : 0;
    },
    // 判断帖子是否已点赞
    isPostLiked: (state) => (postId) => {
      return state.postLikes.has(postId);
    }
  },

  actions: {
    // 初始化社区状态
    initializeCommunity() {
      const savedPosts = localStorage.getItem('communityPosts');
      if (savedPosts) {
        this.posts = JSON.parse(savedPosts);
      } else {
        // 如果没有保存的帖子，生成模拟数据
        this.generateMockPosts();
      }

      const savedLikes = localStorage.getItem('postLikes');
      if (savedLikes) {
        const likes = JSON.parse(savedLikes);
        likes.forEach(postId => this.postLikes.set(postId, true));
      }
    },

    // 生成模拟帖子数据
    generateMockPosts() {
      const mockUsers = [
        { id: 'user1', name: '环保达人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1' },
        { id: 'user2', name: '垃圾分类小能手', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2' },
        { id: 'user3', name: '绿色生活家', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3' },
        { id: 'user4', name: '循环经济爱好者', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4' }
      ];

      const mockPosts = [
        {
          id: 'post1',
          user: mockUsers[0],
          title: '分享一个家庭垃圾分类的实用技巧',
          content: '我发现使用不同颜色的垃圾桶来区分不同类型的垃圾非常有效！蓝色放可回收物，绿色放厨余垃圾，红色放有害垃圾，灰色放其他垃圾。这样家庭成员都能轻松区分，再也不会搞错了！',
          category: 'tips',
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1天前
          likesCount: 42,
          commentsCount: 12,
          views: 356,
          comments: [
            {
              id: 'comment1_1',
              user: mockUsers[1],
              text: '这个方法真不错！我也要试试看。',
              createdAt: new Date(Date.now() - 43200000 * 1).toISOString() // 12小时前
            },
            {
              id: 'comment1_2',
              user: mockUsers[2],
              text: '我们家也是这样做的，效果很好！',
              createdAt: new Date(Date.now() - 21600000 * 1).toISOString() // 6小时前
            }
          ]
        },
        {
          id: 'post2',
          user: mockUsers[1],
          title: '我用废弃塑料瓶做了一个小花盆',
          content: '大家看看我用废弃塑料瓶做的小花盆！只需要简单的剪裁和装饰，就能变废为宝。这样既环保又省钱，何乐而不为呢？',
          category: 'experience',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2天前
          likesCount: 78,
          commentsCount: 24,
          views: 521,
          comments: [
            {
              id: 'comment2_1',
              user: mockUsers[0],
              text: '太有创意了！能分享详细的制作过程吗？',
              createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString() // 1.5天前
            }
          ]
        },
        {
          id: 'post3',
          user: mockUsers[2],
          title: '请问废电池应该怎么处理才最环保？',
          content: '家里攒了一些废电池，直接扔垃圾桶担心污染环境，想知道正确的处理方法是什么？',
          category: 'question',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3天前
          likesCount: 15,
          commentsCount: 8,
          views: 189,
          comments: [
            {
              id: 'comment3_1',
              user: mockUsers[3],
              text: '很多超市和便利店都有废电池回收箱，可以送到那里去。',
              createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString() // 2.5天前
            }
          ]
        },
        {
          id: 'post4',
          user: mockUsers[3],
          title: '我市将实施新的垃圾分类政策',
          content: '根据最新消息，我市将于下个月开始实施新的垃圾分类政策，增加了一些可回收物的种类，并优化了回收流程。大家可以提前了解一下，做好准备。',
          category: 'news',
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), // 4天前
          likesCount: 63,
          commentsCount: 31,
          views: 742,
          comments: [
            {
              id: 'comment4_1',
              user: mockUsers[1],
              text: '具体增加了哪些种类呢？能详细说说吗？',
              createdAt: new Date(Date.now() - 86400000 * 3.5).toISOString() // 3.5天前
            }
          ]
        },
        {
          id: 'post5',
          user: mockUsers[0],
          title: '分享我的厨余垃圾处理经验',
          content: '我在家里用厨余垃圾制作堆肥已经半年了，效果非常好！制作的堆肥用来种花种菜，既环保又实用。推荐给大家！',
          category: 'experience',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5天前
          likesCount: 95,
          commentsCount: 43,
          views: 876,
          comments: [
            {
              id: 'comment5_1',
              user: mockUsers[2],
              text: '能分享一下堆肥的具体方法吗？我也想尝试一下。',
              createdAt: new Date(Date.now() - 86400000 * 4.5).toISOString() // 4.5天前
            }
          ]
        }
      ];

      this.posts = mockPosts;
      this.savePostsToLocalStorage();
    },

    // 获取帖子列表
    async fetchPosts() {
      try {
        this.loading = true;
        this.error = null;
        
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 从本地存储加载数据
        this.initializeCommunity();
        
        return this.posts;
      } catch (error) {
        this.error = error.message || '获取帖子列表失败';
        return [];
      } finally {
        this.loading = false;
      }
    },

    // 获取帖子详情
    async fetchPostDetail(postId) {
      try {
        this.loading = true;
        this.error = null;
        
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 查找帖子
        const post = this.posts.find(p => p.id === postId);
        if (!post) {
          throw new Error('帖子不存在');
        }
        
        this.currentPost = post;
        
        // 增加浏览量
        if (post.views) {
          post.views += 1;
        } else {
          post.views = 1;
        }
        
        this.savePostsToLocalStorage();
        
        return post;
      } catch (error) {
        this.error = error.message || '获取帖子详情失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 创建新帖子
    async createPost(postData) {
      try {
        this.loading = true;
        this.error = null;
        
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 创建新帖子对象
        const newPost = {
          id: `post_${Date.now()}`,
          user: {
            id: 'current_user',
            name: '当前用户',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser'
          },
          title: postData.title,
          content: postData.content,
          category: postData.category,
          createdAt: new Date().toISOString(),
          likesCount: 0,
          commentsCount: 0,
          views: 1,
          comments: []
        };
        
        // 添加到帖子列表开头
        this.posts.unshift(newPost);
        
        // 保存到本地存储
        this.savePostsToLocalStorage();
        
        return newPost;
      } catch (error) {
        this.error = error.message || '创建帖子失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 点赞帖子
    async likePost(postId) {
      try {
        this.loading = true;
        this.error = null;
        
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 查找帖子
        const post = this.posts.find(p => p.id === postId);
        if (!post) {
          throw new Error('帖子不存在');
        }
        
        // 切换点赞状态
        if (this.postLikes.has(postId)) {
          // 取消点赞
          this.postLikes.delete(postId);
          if (post.likesCount) {
            post.likesCount -= 1;
          }
        } else {
          // 点赞
          this.postLikes.set(postId, true);
          if (post.likesCount) {
            post.likesCount += 1;
          } else {
            post.likesCount = 1;
          }
        }
        
        // 更新当前帖子
        if (this.currentPost && this.currentPost.id === postId) {
          this.currentPost.likesCount = post.likesCount;
        }
        
        // 保存到本地存储
        this.savePostsToLocalStorage();
        this.saveLikesToLocalStorage();
        
        return { success: true, likesCount: post.likesCount };
      } catch (error) {
        this.error = error.message || '点赞失败';
        return { success: false };
      } finally {
        this.loading = false;
      }
    },

    // 添加评论
    async addComment(postId, commentText) {
      try {
        this.loading = true;
        this.error = null;
        
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 查找帖子
        const post = this.posts.find(p => p.id === postId);
        if (!post) {
          throw new Error('帖子不存在');
        }
        
        // 创建新评论
        const newComment = {
          id: `comment_${Date.now()}`,
          user: {
            id: 'current_user',
            name: '当前用户',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser'
          },
          text: commentText,
          createdAt: new Date().toISOString()
        };
        
        // 添加到评论列表
        if (!post.comments) {
          post.comments = [];
        }
        post.comments.push(newComment);
        
        // 更新评论数
        if (post.commentsCount) {
          post.commentsCount += 1;
        } else {
          post.commentsCount = 1;
        }
        
        // 更新当前帖子
        if (this.currentPost && this.currentPost.id === postId) {
          this.currentPost.comments = post.comments;
          this.currentPost.commentsCount = post.commentsCount;
        }
        
        // 保存到本地存储
        this.savePostsToLocalStorage();
        
        return newComment;
      } catch (error) {
        this.error = error.message || '添加评论失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 保存帖子到本地存储
    savePostsToLocalStorage() {
      localStorage.setItem('communityPosts', JSON.stringify(this.posts));
    },

    // 保存点赞状态到本地存储
    saveLikesToLocalStorage() {
      const likesArray = Array.from(this.postLikes.keys());
      localStorage.setItem('postLikes', JSON.stringify(likesArray));
    }
  }
});