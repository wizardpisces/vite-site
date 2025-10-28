<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero" ref="heroRef">
      <div class="hero-content">
        <h1 class="hero-title">
          探索技术的
          <span class="highlight">深度思考</span>
        </h1>
        <p class="hero-subtitle">
          分享AI、前端、机器学习等领域的见解与实践，记录技术成长的每一步
        </p>
        <div class="hero-actions">
          <router-link to="/blog/AiNotes" class="cta-primary">
            开始阅读博客
            <span class="arrow">→</span>
          </router-link>
          <router-link to="/machine-learning" class="cta-secondary">
            查看项目
          </router-link>
        </div>
      </div>
    </section>

    <!-- Featured Blog Posts -->
    <section class="featured-posts">
      <h2 class="section-title">精选文章</h2>
      <div class="posts-grid">
        <router-link to="/blog/AiNotes" class="post-card">
          <div class="post-content">
            <div class="post-category">AI 笔记</div>
            <h3 class="post-title">AI 技术思考与实践</h3>
            <p class="post-excerpt">深入探讨AI技术的发展趋势、应用场景，以及个人对AI未来的思考...</p>
            <div class="post-meta">
              <span class="read-time">5 分钟阅读</span>
            </div>
          </div>
        </router-link>
        
        <router-link to="/blog/TechNotes" class="post-card">
          <div class="post-content">
            <div class="post-category">技术</div>
            <h3 class="post-title">技术学习笔记</h3>
            <p class="post-excerpt">记录在技术学习过程中的心得体会，包括前端、后端等各个方向...</p>
            <div class="post-meta">
              <span class="read-time">3 分钟阅读</span>
            </div>
          </div>
        </router-link>

        <router-link to="/blog/DailyReflections" class="post-card">
          <div class="post-content">
            <div class="post-category">思考</div>
            <h3 class="post-title">日常思考与感悟</h3>
            <p class="post-excerpt">分享日常工作和学习中的思考，以及对技术和人生的感悟...</p>
            <div class="post-meta">
              <span class="read-time">4 分钟阅读</span>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Projects Section -->
    <section class="projects">
      <h2 class="section-title">技术项目</h2>
      <div class="projects-grid">
        <a href="https://github.com/wizardpisces/tiny-sass-compiler" target="_blank" class="project-card">
          <div class="project-content">
            <h3 class="project-title">Tiny Sass Compiler</h3>
            <p class="project-desc">轻量级的 Sass 编译器实现</p>
            <div class="project-tech">
              <span class="tech-tag">JavaScript</span>
              <span class="tech-tag">编译器</span>
            </div>
          </div>
        </a>
        
        <router-link to="/machine-learning" class="project-card">
          <div class="project-content">
            <h3 class="project-title">Machine Learning</h3>
            <p class="project-desc">Web端机器学习模型部署示例</p>
            <div class="project-tech">
              <span class="tech-tag">ML</span>
              <span class="tech-tag">WebGL</span>
            </div>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>
<script type="ts">
import { onMounted, onUnmounted, ref } from 'vue';

export default {
  name: 'Home',
  setup() {
    
    const heroRef = ref(null);
    const cardsRef = ref([]);
    let observer = null;
    
    onMounted(() => {
      // 视差滚动效果
      window.addEventListener('scroll', handleParallaxScroll);
      
      // 卡片进入视窗动画
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            entry.target.style.animationDelay = `${index * 0.1}s`;
            entry.target.classList.add('fade-in-up');
          }
        });
      }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      // 观察所有卡片
      setTimeout(() => {
        document.querySelectorAll('.post-card, .project-card').forEach(card => {
          observer.observe(card);
        });
      }, 100);
    });
    
    onUnmounted(() => {
      window.removeEventListener('scroll', handleParallaxScroll);
      if (observer) observer.disconnect();
    });
    
    function handleParallaxScroll() {
      const scrolled = window.pageYOffset;
      const hero = heroRef.value;
      
      if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translate3d(0, ${rate}px, 0)`;
      }
      
      // 添加鼠标悬停时的粒子效果
      document.querySelectorAll('.post-card, .project-card').forEach(card => {
        if (!card.classList.contains('particles-added')) {
          card.addEventListener('mouseenter', createParticles);
          card.classList.add('particles-added');
        }
      });
    }
    
    function createParticles(e) {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      
      for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(37, 99, 235, 0.6);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1000;
          left: ${Math.random() * rect.width}px;
          top: ${Math.random() * rect.height}px;
        `;
        
        card.appendChild(particle);
        
        // 动画粒子
        particle.animate([
          { 
            transform: 'translate(0, 0) scale(0)',
            opacity: 0
          },
          { 
            transform: `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px) scale(1)`,
            opacity: 1
          },
          { 
            transform: `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px) scale(0)`,
            opacity: 0
          }
        ], {
          duration: 1200 + Math.random() * 800,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => particle.remove();
      }
    }
    
      return {
      heroRef,
      cardsRef,
        proxyClick:(e)=>{
          console.log('hehe');
        }
      }
  }
}
</script>
<style lang="scss">
.home {
  background: #fafafa;
  min-height: calc(100vh - 70px);
  position: relative;
  
  // Hero Section
  .hero {
    background: linear-gradient(135deg, rgba(250, 250, 250, 0.95) 0%, rgba(241, 245, 249, 0.98) 100%);
    padding: 5rem 2rem 4rem;
    text-align: center;
    position: relative;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    
    // 与header呼应的装饰性背景
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(ellipse 1200px 300px at 30% 0%, rgba(37, 99, 235, 0.06) 0%, transparent 60%),
        radial-gradient(ellipse 800px 200px at 70% 100%, rgba(14, 165, 233, 0.04) 0%, transparent 60%),
        linear-gradient(0deg, rgba(37, 99, 235, 0.02) 0%, transparent 30%);
      z-index: 0;
    }
    
    // 添加顶部装饰线呼应header
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 10%;
      right: 10%;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(37, 99, 235, 0.2) 30%, 
        rgba(14, 165, 233, 0.3) 70%, 
        transparent 100%
      );
      z-index: 1;
    }
    
    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }
    
    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      color: $color-text-primary;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      letter-spacing: -0.02em;
      
      .highlight {
        background: linear-gradient(135deg, $color-primary, $color-accent);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        position: relative;
      }
      
      @media (max-width: 768px) {
        font-size: 2.5rem;
      }
    }
    
    .hero-subtitle {
      font-size: 1.3rem;
      color: $color-text-secondary;
      line-height: 1.6;
      margin-bottom: 2.5rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      
      .cta-primary {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 2rem;
        background: $color-primary;
        color: white;
        text-decoration: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.3);
        
        .arrow {
          transition: transform 0.3s ease;
        }
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.4);
          
          .arrow {
            transform: translateX(4px);
          }
        }
      }
      
      .cta-secondary {
        display: inline-flex;
        align-items: center;
        padding: 1rem 2rem;
        background: transparent;
        color: $color-primary;
        text-decoration: none;
        border: 2px solid $color-border-light;
        border-radius: 12px;
        font-weight: 600;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        
        &:hover {
          background: $color-primary;
          color: white;
          border-color: $color-primary;
          transform: translateY(-2px);
        }
      }
    }
  }
  
  // Section Styles
  .featured-posts, .projects {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: $color-text-primary;
    text-align: center;
    margin-bottom: 3rem;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -12px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 4px;
      background: linear-gradient(135deg, $color-primary, $color-accent);
      border-radius: 2px;
    }
  }
  
  // Posts Grid
  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .post-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 20px;
    overflow: hidden;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 
      0 4px 20px rgba(37, 99, 235, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    
    &:hover {
      transform: translateY(-12px) scale(1.02);
      box-shadow: 
        0 20px 60px rgba(37, 99, 235, 0.15),
        0 8px 30px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
      border-color: rgba(37, 99, 235, 0.3);
      background: rgba(255, 255, 255, 0.95);
    }
    
    .post-content {
      padding: 2rem;
    }
    
    .post-category {
      display: inline-block;
      background: rgba(37, 99, 235, 0.1);
      color: $color-primary;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }
    
    .post-title {
      font-size: 1.4rem;
      font-weight: 600;
      color: $color-text-primary;
      margin-bottom: 0.75rem;
      line-height: 1.3;
    }
    
    .post-excerpt {
      color: $color-text-secondary;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      font-size: 1rem;
    }
    
    .post-meta {
      display: flex;
      align-items: center;
      color: $color-text-muted;
      font-size: 0.9rem;
      
      .read-time {
        font-weight: 500;
      }
    }
  }
  
  // Projects Grid
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }
  
  .project-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2.5rem;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 
      0 4px 20px rgba(37, 99, 235, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: $gradient-primary;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }
    
    &:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 
        0 20px 50px rgba(37, 99, 235, 0.15),
        0 8px 25px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
      background: rgba(255, 255, 255, 0.95);
    }
    
    .project-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: $color-text-primary;
      margin-bottom: 0.75rem;
    }
    
    .project-desc {
      color: $color-text-secondary;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    
    .project-tech {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .tech-tag {
      background: $color-bg-subtle;
      color: $color-text-secondary;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
    font-weight: 500;
      border: 1px solid $color-border-light;
    }
  }
  
  // 独特的动画效果
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .fade-in-up {
    animation: fade-in-up 0.8s cubic-bezier(0.23, 1, 0.32, 1) both;
  }
  
  // 微妙的悬停粒子效果
  .post-card,
  .project-card {
    position: relative;
    overflow: hidden;
    
    &:hover {
      // 添加微妙的光效
      &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
        transform: scale(0);
        transition: transform 0.6s ease;
        pointer-events: none;
      }
      
      &:hover::before {
        transform: scale(1);
      }
    }
  }
  
  // Hero区域的独特装饰
  .hero {
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: 10%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%);
      border-radius: 50%;
      animation: pulse-glow 4s ease-in-out infinite;
      pointer-events: none;
    }
  }
  
  @keyframes pulse-glow {
    0%, 100% { 
      transform: scale(1) translateY(0px);
      opacity: 0.6;
    }
    50% { 
      transform: scale(1.1) translateY(-10px);
      opacity: 0.8;
    }
  }
  
  // 增强的按钮动画
  .cta-primary {
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.6s ease;
    }
    
    &:hover::before {
      left: 100%;
    }
  }
  
  // 文字打字机效果（可选）
  .hero-title {
    .highlight {
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        right: -2px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: $color-primary;
        animation: blink 1.2s infinite;
      }
    }
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
  
  // Responsive adjustments
  @media (max-width: 768px) {
    .hero {
      padding: 2rem 1rem;
      
      .hero-title {
        font-size: 2.5rem;
      }
      
      .hero-subtitle {
        font-size: 1.1rem;
      }
      
      &::after {
        display: none; // 移动端隐藏装饰元素
      }
    }
    
    .featured-posts, .projects {
      padding: 2rem 1rem;
    }
    
    .section-title {
      font-size: 2rem;
    }
  }
}
</style>
