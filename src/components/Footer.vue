<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-logo">
        <h3>{{ $t('footer.title') }}</h3>
        <p>{{ $t('footer.subtitle') }}</p>
      </div>
      
      <div class="footer-links">
        <div class="footer-column">
          <h4>{{ $t('footer.navigation') }}</h4>
          <ul>
            <li><a href="/" class="footer-link">{{ $t('footer.home') }}</a></li>
            <li><a href="/education" class="footer-link">{{ $t('footer.education') }}</a></li>
            <li><a href="/knowledge-base" class="footer-link">{{ $t('footer.knowledge') }}</a></li>
            <li><a href="/interaction" class="footer-link">{{ $t('footer.interaction') }}</a></li>
          </ul>
        </div>
        
        <div class="footer-column">
          <h4>{{ $t('footer.contact') }}</h4>
          <ul>
            <li class="footer-contact-item">
              <span class="footer-contact-icon">✉️</span>
              <span>{{ $t('footer.email') }}</span>
            </li>
            <li class="footer-contact-item">
              <span class="footer-contact-icon">📞</span>
              <span>{{ $t('footer.phone') }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>{{ $t('footer.copyright') }}</p>
    </div>
  </footer>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // 组件挂载时的逻辑
});
</script>

<style scoped>
.footer {
  background-color: #f8f9fa;
  padding: 2rem 0;
  border-top: 1px solid #e9ecef;
  margin-top: 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 2rem;
}

.footer-logo h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.footer-logo p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  max-width: 300px;
}

.footer-links {
  display: flex;
  gap: 3rem;
}

.footer-column h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.footer-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-column li {
  margin-bottom: 0.5rem;
}

.footer-link {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
  font-size: 0.9rem;
}

.footer-link:hover {
  color: #007bff;
}

.footer-contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.footer-contact-icon {
  font-size: 1rem;
}

.footer-bottom {
  text-align: center;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid #e9ecef;
  color: #666;
  font-size: 0.85rem;
}

.footer-bottom p {
  margin: 0;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .footer-links {
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    width: 100%;
  }
  
  .footer-column {
    width: 100%;
    max-width: 200px;
  }
}
</style>