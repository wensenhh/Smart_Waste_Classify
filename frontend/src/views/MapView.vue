<template>
  <div class="map-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-content">
        <button 
          class="toolbar-btn"
          @click="locateUser"
          :disabled="loading || locating"
          title="定位当前位置"
        >
          <span v-if="!locating">📍 定位</span>
          <span v-else>📍 定位中...</span>
        </button>
        
        <div class="filter-container">
          <select 
            v-model="currentFilter"
            class="filter-select"
            @change="applyFilter"
            :disabled="loading"
          >
            <option value="all">全部显示</option>
            <option value="trash">仅垃圾桶</option>
            <option value="station">仅垃圾站</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- 移动端折叠工具栏 -->
    <div class="mobile-toolbar">
      <button 
        class="mobile-toolbar-btn"
        @click="toggleMobileToolbar"
        title="显示菜单"
      >
        <span>{{ mobileToolbarOpen ? '✕' : '☰' }}</span>
      </button>
      
      <div v-if="mobileToolbarOpen" class="mobile-toolbar-content">
        <button 
          class="toolbar-btn mobile"
          @click="locateUser"
          :disabled="loading || locating"
        >
          <span v-if="!locating">📍 定位</span>
          <span v-else>📍 定位中...</span>
        </button>
        
        <select 
          v-model="currentFilter"
          class="filter-select mobile"
          @change="applyFilter"
          :disabled="loading"
        >
          <option value="all">全部显示</option>
          <option value="trash">仅垃圾桶</option>
          <option value="station">仅垃圾站</option>
        </select>
      </div>
    </div>
    
    <!-- 地图容器 -->
    <div id="map" class="map">
      <!-- 地图加载失败时的回退显示 -->
      <div v-if="mapFallback" class="map-fallback">
        <div class="map-fallback-content">
          <div class="map-fallback-icon">🗺️</div>
          <h3>Google地图服务暂时不可用</h3>
          <p>由于API密钥配置问题或服务暂时不可用，无法加载地图。</p>
          <p style="font-size: 14px; color: #888; margin-top: -5px;">（常见原因：未启用计费功能或API密钥无效）</p>
          <div class="map-fallback-placeholder">
            <!-- 简单的静态地图占位符 -->
            <div class="static-map"></div>
            <!-- 标记点 - 使用模拟数据中的位置 -->
            <template v-for="location in mockLocations" :key="location.id">
              <div class="static-marker" :style="{ top: getRandomPosition('top'), left: getRandomPosition('left') }" @click="showStaticMarkerInfo(location)">
                {{ location.type === 'trash' ? '🗑️' : '🏢' }}
              </div>
            </template>
            <!-- 静态地图标记信息窗口 -->
            <div v-if="staticMarkerInfo" class="static-marker-info" :style="{ top: staticMarkerInfo.position?.top || '30%', left: staticMarkerInfo.position?.left || '40%' }">
              <div class="static-marker-info-content">
                <h4>{{ staticMarkerInfo.name }}</h4>
                <p><strong>类型:</strong> {{ staticMarkerInfo.type === 'trash' ? '垃圾桶' : '垃圾站' }}</p>
                <p><strong>地址:</strong> {{ staticMarkerInfo.address }}</p>
                <p><strong>开放时间:</strong> {{ staticMarkerInfo.openTime }}</p>
                <button class="close-static-info" @click="closeStaticMarkerInfo">&times;</button>
              </div>
            </div>
          </div>
          <button class="retry-btn" @click="refreshMap">重新加载地图</button>
        </div>
      </div>
    </div>
    
    <!-- 加载指示器 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载地图中...</div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-overlay">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <div class="error-message">{{ error }}</div>
        <button class="retry-btn" @click="refreshMap">重试</button>
      </div>
    </div>
    
    <!-- 信息窗口 -->
    <div v-if="selectedMarker" class="info-window" ref="infoWindow">
      <div class="info-header">
        <h3>{{ selectedMarker.name }}</h3>
        <button class="close-btn" @click="closeInfoWindow">&times;</button>
      </div>
      <div class="info-body">
        <div class="info-item">
          <strong>类型:</strong> {{ selectedMarker.type === 'trash' ? '垃圾桶' : '垃圾站' }}
        </div>
        <div class="info-item">
          <strong>地址:</strong> {{ selectedMarker.address }}
        </div>
        <div class="info-item">
          <strong>开放时间:</strong> {{ selectedMarker.openTime }}
        </div>
        <div v-if="selectedMarker.additionalInfo" class="info-item">
          <strong>额外信息:</strong> {{ selectedMarker.additionalInfo }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 状态管理
const loading = ref(true);
const error = ref('');
const map = ref(null);
const markers = ref([]);
const currentFilter = ref('all');
const selectedMarker = ref(null);
const infoWindow = ref(null);
const locating = ref(false);
const mobileToolbarOpen = ref(false);
const mapFallback = ref(false);

// 模拟数据 - 垃圾桶和垃圾站点位
const mockLocations = [
  // 垃圾桶数据
  {
    id: 1,
    name: '环保垃圾桶 A',
    type: 'trash',
    lat: 3.1390,
    lng: 101.6869,
    address: '吉隆坡市中心公园',
    openTime: '全天开放',
    additionalInfo: '可回收物和普通垃圾双桶'
  },
  {
    id: 2,
    name: '环保垃圾桶 B',
    type: 'trash',
    lat: 3.1412,
    lng: 101.6948,
    address: '吉隆坡中央车站',
    openTime: '全天开放',
    additionalInfo: '四分类垃圾桶'
  },
  {
    id: 3,
    name: '环保垃圾桶 C',
    type: 'trash',
    lat: 3.1488,
    lng: 101.7071,
    address: '双子塔购物中心',
    openTime: '10:00-22:00',
    additionalInfo: '智能感应垃圾桶'
  },
  // 垃圾站数据
  {
    id: 101,
    name: '城市垃圾处理站',
    type: 'station',
    lat: 3.1280,
    lng: 101.6697,
    address: '吉隆坡工业区',
    openTime: '06:00-22:00',
    additionalInfo: '大型垃圾中转站'
  },
  {
    id: 102,
    name: '生态垃圾处理中心',
    type: 'station',
    lat: 3.1586,
    lng: 101.7119,
    address: '吉隆坡东部',
    openTime: '08:00-18:00',
    additionalInfo: '可回收物分拣中心'
  },
  {
    id: 103,
    name: '社区垃圾收集站',
    type: 'station',
    lat: 3.1330,
    lng: 101.7008,
    address: '吉隆坡住宅区',
    openTime: '全天开放',
    additionalInfo: '居民日常垃圾收集点'
  }
];

// 初始化地图
const initMap = async () => {
  loading.value = true;
  error.value = '';
  
  try {
      // 加载Google Maps API
      try {
        await loadGoogleMapsScript();
        await waitForGoogleMaps();
        mapFallback.value = false;
      } catch (apiError) {
        console.error('Google Maps API加载失败:', apiError);
        // 检查是否是API密钥或账单问题
        if (apiError.message && (
          apiError.message.includes('403') || 
          apiError.message.includes('billing') || 
          apiError.message.includes('BillingNotEnabled') || 
          apiError.message.includes('InvalidKey') ||
          apiError.message.includes('认证失败')
        )) {
          mapFallback.value = true;
          console.warn('Google Maps API配置问题，显示回退地图');
        } else {
          error.value = '无法加载地图服务，请检查网络连接或稍后重试';
        }
        loading.value = false;
        return;
      }
    
    // 获取用户当前位置（如果可用），否则使用默认位置
    let center = { lat: 3.1390, lng: 101.6869 }; // 默认位置：吉隆坡
    
    try {
      const userLocation = await getUserLocation();
      if (userLocation) {
        center = userLocation;
      }
    } catch (locationError) {
      console.log('无法获取用户位置，使用默认位置', locationError);
    }
    
    try {
      // 创建地图实例
      map.value = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 14,
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        clickableIcons: false
      });
      
      // 渲染地图标记
      renderMarkers();
      
      // 监听地图点击事件，关闭信息窗口
      google.maps.event.addListener(map.value, 'click', () => {
        closeInfoWindow();
      });
      
      // 响应式地图大小
      google.maps.event.addListenerOnce(map.value, 'idle', () => {
        resizeMap();
        loading.value = false;
      });
      
      // 监听窗口大小变化
      window.addEventListener('resize', resizeMap);
      
    } catch (mapError) {
      console.error('地图实例创建失败:', mapError);
      // 更具体的错误信息
      if (mapError.message && mapError.message.includes('BillingNotEnabled')) {
        mapFallback.value = true;
      } else if (mapError.message && (mapError.message.includes('InvalidKey') || mapError.message.includes('403'))) {
        mapFallback.value = true;
      } else {
        error.value = '地图初始化失败，请刷新页面重试';
      }
      loading.value = false;
    }
    
  } catch (err) {
    console.error('地图初始化失败:', err);
    mapFallback.value = true;
    loading.value = false;
  }
};

// 刷新地图（用于错误重试）
const refreshMap = () => {
  error.value = '';
  mapFallback.value = false;
  staticMarkerInfo.value = null;
  // 清理可能存在的Google Maps脚本
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    existingScript.remove();
  }
  // 重置Google对象
  delete window.google;
  delete window.initGoogleMaps;
  delete window.gm_authFailure;
  initMap();
};

// 为静态地图标记生成随机位置
const getRandomPosition = (type) => {
  // 使用简单的随机位置生成器
  if (type === 'top') {
    return `${20 + Math.random() * 60}%`;
  } else {
    return `${20 + Math.random() * 60}%`;
  }
};

// 静态地图标记信息
const staticMarkerInfo = ref(null);

// 显示静态地图标记信息
const showStaticMarkerInfo = (location) => {
  // 创建一个包含位置信息的新对象
  staticMarkerInfo.value = {
    ...location,
    position: {
      top: getRandomPosition('top'),
      left: getRandomPosition('left')
    }
  };
};

// 关闭静态地图标记信息
const closeStaticMarkerInfo = () => {
  staticMarkerInfo.value = null;
};

// 加载Google Maps脚本
const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    // 检查是否已加载
    if (window.google && window.google.maps) {
      return resolve();
    }
    
    // 创建脚本标签
    const script = document.createElement('script');
    // 从环境变量读取API密钥，或者使用默认值
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBiUckGX-1dXfVYLBqzt28AdSesMG0uFP0';
      console.log('Google Maps API密钥:', apiKey);
      // 添加loading=async参数以符合最佳实践
      // 同时添加 libraries=marker 参数以确保 AdvancedMarkerElement 可用
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps&loading=async&libraries=marker`;
    script.async = true;
    script.defer = true;
    
    // 设置回调函数
    window.initGoogleMaps = resolve;
    
    // 处理脚本加载错误
    script.onerror = () => {
      reject(new Error('无法加载Google Maps脚本'));
    };

    // 全局错误处理函数，捕获Google Maps API错误
    window.gm_authFailure = () => {
      console.error('Google Maps API认证失败');
      reject(new Error('Google Maps API认证失败（InvalidKey或BillingNotEnabled）'));
    };

    // 监听全局错误事件，捕获可能的403错误
    const handleGlobalError = (event) => {
      if (event.message && (event.message.includes('Google Maps') || event.message.includes('403'))) {
        console.error('Google Maps API加载错误:', event.message);
        reject(new Error(`Google Maps API加载错误: ${event.message}`));
      }
    };

    window.addEventListener('error', handleGlobalError);
    
    // 添加脚本到DOM
    document.head.appendChild(script);
    
    // 清理函数
    const cleanup = () => {
      window.removeEventListener('error', handleGlobalError);
    };
    
    // 确保清理函数被调用
    return () => cleanup;
  });
};

// 等待Google Maps API加载完成
const waitForGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Google Maps加载超时'));
    }, 10000);
    
    const checkLoaded = () => {
      if (window.google && window.google.maps) {
        clearTimeout(timeout);
        resolve();
      } else {
        setTimeout(checkLoaded, 100);
      }
    };
    
    checkLoaded();
  });
};

// 获取用户位置
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

// 渲染地图标记
const renderMarkers = () => {
  // 清除现有标记
  markers.value.forEach(marker => {
    if (marker.setMap) {
      marker.setMap(null); // 兼容旧的Marker
    } else if (marker.map) {
      marker.map = null; // AdvancedMarkerElement 使用不同的方式移除
    }
  });
  markers.value = [];
  
  // 根据筛选条件过滤点位
  let filteredLocations = mockLocations;
  if (currentFilter.value === 'trash') {
    filteredLocations = mockLocations.filter(loc => loc.type === 'trash');
  } else if (currentFilter.value === 'station') {
    filteredLocations = mockLocations.filter(loc => loc.type === 'station');
  }
  
  // 创建新标记
  filteredLocations.forEach(location => {
    try {
      // 优先使用 AdvancedMarkerElement（推荐的新API）
      if (window.google && window.google.maps && window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        // 创建SVG图标
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" 
                fill="${location.type === 'trash' ? '#4CAF50' : '#FF9800'}" 
                stroke="#FFFFFF" 
                stroke-width="2"/>
        </svg>`;
        
        // 创建图标元素
        const iconElement = document.createElement('div');
        iconElement.innerHTML = svgString;
        
        // 创建 AdvancedMarkerElement
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: location.lat, lng: location.lng },
          map: map.value,
          title: location.name,
          content: iconElement.firstElementChild
        });
        
        // 添加点击事件
        marker.addListener('click', () => {
          selectMarker(location);
        });
        
        markers.value.push(marker);
      } else {
        // 回退使用旧的 Marker（为了兼容性）
        let icon = {
          path: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z',
          scale: 2,
          fillColor: location.type === 'trash' ? '#4CAF50' : '#FF9800',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        };
        
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map.value,
          title: location.name,
          icon: icon
        });
        
        marker.addListener('click', () => {
          selectMarker(location);
        });
        
        markers.value.push(marker);
      }
    } catch (error) {
      console.error('创建标记失败:', error);
    }
  });
};

// 选择标记，显示信息窗口
const selectMarker = async (location) => {
  selectedMarker.value = location;
  
  await nextTick();
  
  // 定位信息窗口到标记上方
  if (infoWindow.value && map.value) {
    const markerPosition = new google.maps.LatLng(location.lat, location.lng);
    const projection = map.value.getProjection();
    const point = projection.fromLatLngToDivPixel(markerPosition);
    
    infoWindow.value.style.top = `${point.y - 150}px`;
    infoWindow.value.style.left = `${point.x - infoWindow.value.offsetWidth / 2}px`;
  }
};

// 关闭信息窗口
const closeInfoWindow = () => {
  selectedMarker.value = null;
};

// 定位用户
const locateUser = async () => {
  if (locating.value || !map.value) return;
  
  locating.value = true;
  
  try {
    const userLocation = await getUserLocation();
    
    // 平滑过渡到用户位置
    map.value.panTo({
      lat: userLocation.lat,
      lng: userLocation.lng
    });
    
    // 设置缩放级别
    map.value.setZoom(16);
    
    // 显示一个临时标记表示用户位置
    let userMarker = null;
    
    try {
      // 优先使用 AdvancedMarkerElement
      if (window.google && window.google.maps && window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        // 创建SVG图标
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#4285F4" stroke="#FFFFFF" stroke-width="2"/>
        </svg>`;
        
        // 创建图标元素
        const iconElement = document.createElement('div');
        iconElement.innerHTML = svgString;
        
        // 添加动画效果
        iconElement.classList.add('user-marker-animation');
        
        // 创建 AdvancedMarkerElement
        userMarker = new google.maps.marker.AdvancedMarkerElement({
          position: userLocation,
          map: map.value,
          title: '您的位置',
          content: iconElement.firstElementChild
        });
      } else {
        // 回退使用旧的 Marker
        userMarker = new google.maps.Marker({
          position: userLocation,
          map: map.value,
          title: '您的位置',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          },
          animation: google.maps.Animation.BOUNCE
        });
      }
      
      // 5秒后移除用户位置标记
      setTimeout(() => {
        if (userMarker) {
          if (userMarker.setMap) {
            userMarker.setMap(null); // 旧的Marker
          } else if (userMarker.map) {
            userMarker.map = null; // AdvancedMarkerElement
          }
        }
      }, 5000);
    } catch (error) {
      console.error('创建用户位置标记失败:', error);
    }
    
  } catch (error) {
    console.error('定位失败:', error);
    // 根据错误类型显示不同提示
    if (error.code === error.PERMISSION_DENIED) {
      alert('请允许获取您的位置权限以使用定位功能');
    } else {
      alert('定位失败，请确保您的设备定位功能已开启');
    }
  } finally {
    locating.value = false;
  }
};

// 应用筛选器
const applyFilter = () => {
  if (map.value) {
    renderMarkers();
  }
};

// 调整地图大小
const resizeMap = () => {
  if (map.value) {
    google.maps.event.trigger(map.value, 'resize');
  }
};

// 切换移动端工具栏
const toggleMobileToolbar = () => {
  mobileToolbarOpen.value = !mobileToolbarOpen.value;
};

// 组件挂载时初始化地图
onMounted(() => {
  initMap();
});

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', resizeMap);
  // 清理地图实例
  if (map.value) {
    map.value = null;
  }
});
</script>

<style scoped>
.map-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  font-family: 'Arial', sans-serif;
}

/* 地图容器 */
.map {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

/* 顶部工具栏 */
.toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px 20px;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
}

.toolbar-content {
  display: flex;
  gap: 20px;
  align-items: center;
  max-width: 800px;
  width: 100%;
}

.toolbar-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(102, 126, 234, 0.3);
}

.toolbar-btn:hover:not(:disabled) {
  background: #764ba2;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
}

.toolbar-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 筛选器 */
.filter-container {
  flex: 1;
}

.filter-select {
  width: 100%;
  max-width: 200px;
  padding: 10px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 25px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.filter-select:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

/* 移动端工具栏 */
.mobile-toolbar {
  display: none;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 101;
}

.mobile-toolbar-btn {
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.mobile-toolbar-btn:hover {
  background: white;
  transform: scale(1.05);
}

.mobile-toolbar-content {
  position: absolute;
  top: 60px;
  right: 0;
  background: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toolbar-btn.mobile {
  width: 100%;
}

.filter-select.mobile {
  max-width: none;
}

/* 加载指示器 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: white;
  font-size: 18px;
  font-weight: bold;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 用户位置标记动画 */
.user-marker-animation {
  animation: bounce 1.5s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 地图回退显示样式 */
.map-fallback {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.map-fallback-content {
  text-align: center;
  padding: 20px;
  max-width: 500px;
}

.map-fallback-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.map-fallback-content h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 24px;
}

.map-fallback-content p {
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
}

.map-fallback-placeholder {
  position: relative;
  width: 100%;
  height: 300px;
  background: #e3f2fd;
  border-radius: 10px;
  margin-bottom: 30px;
  overflow: hidden;
}

.static-map {
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
/* 静态标记 */
.static-marker {
  position: absolute;
  font-size: 24px;
  transform: translate(-50%, -50%);
  animation: marker-bounce 2s infinite;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.static-marker:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

/* 静态地图标记信息窗口 */
.static-marker-info {
  position: absolute;
  background: white;
  border-radius: 10px;
  padding: 0;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
  max-width: 250px;
  z-index: 10;
  transform: translate(-50%, -100%);
  margin-top: -15px;
}

.static-marker-info-content {
  padding: 15px;
}

.static-marker-info-content h4 {
  margin: 0 0 10px 0;
  color: #667eea;
  font-size: 16px;
}

.static-marker-info-content p {
  margin: 5px 0;
  font-size: 14px;
  color: #333;
}

.close-static-info {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-static-info:hover {
  background: #f5f5f5;
  color: #333;
}

@keyframes marker-bounce {
  0%, 100% {
    transform: translate(-50%, -50%);
  }
  50% {
    transform: translate(-50%, -70%);
  }
}

/* 错误提示 */
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.error-content {
  background: white;
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-message {
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.5;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #764ba2;
}

/* 信息窗口 */
.info-window {
  position: absolute;
  background: white;
  border-radius: 10px;
  padding: 0;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
  max-width: 300px;
  z-index: 200;
  transform: translateZ(0);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-header {
  background: #667eea;
  color: white;
  padding: 15px 20px;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.info-body {
  padding: 20px;
}

.info-item {
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item strong {
  color: #667eea;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    display: none;
  }
  
  .mobile-toolbar {
    display: block;
  }
  
  .info-window {
    max-width: 250px;
    left: 50% !important;
    transform: translateX(-50%) translateZ(0);
  }
}
</style>