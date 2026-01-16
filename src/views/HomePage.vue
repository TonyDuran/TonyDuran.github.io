<script lang="ts" setup>
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="gradient-text">security engineer</span><br />
            <span class="text-muted">by day</span>
          </h1>
          <p class="hero-subtitle">
            building secure systems and exploring exploit development
          </p>
          <div class="hero-cta">
            <router-link to="/projects" class="btn">explore projects</router-link>
            <router-link to="/thoughts" class="btn btn-secondary">read thoughts</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about">
      <div class="container">
        <h2>about</h2>
        <div class="about-grid">
          <div class="about-card">
            <h3><span class="accent-primary">→</span> software engineer</h3>
            <p>
              Full-stack developer with experience in TypeScript, Vue.js, and modern web
              architectures. Passionate about clean code and scalable systems.
            </p>
          </div>
          <div class="about-card">
            <h3><span class="accent-secondary">→</span> security hobbyist</h3>
            <p>
              CTF competitor and exploit development enthusiast. Exploring vulnerabilities,
              writing exploits, and learning the darker arts of security.
            </p>
          </div>
          <div class="about-card">
            <h3><span class="accent-tertiary">→</span> always learning</h3>
            <p>
              Currently exploring Three.js, WebAssembly, and advanced exploit techniques.
              Believer in continuous growth and hands-on experimentation.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest Projects Section -->
    <section class="latest-projects">
      <div class="container">
        <div class="section-header">
          <h2>latest projects</h2>
          <router-link to="/projects" class="view-all">view all →</router-link>
        </div>
        <p class="section-intro">
          selected works showcasing my journey as both an engineer and security enthusiast
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
}

/* Hero Section */
.hero {
  padding: 6rem 0;
  background: linear-gradient(
    135deg,
    rgba(0, 217, 255, 0.05) 0%,
    rgba(180, 19, 245, 0.05) 100%
  );
  border-bottom: 1px solid var(--border-color);
}

.hero-content {
  display: flex;
  align-items: center;
  min-height: 400px;
}

.hero-text {
  max-width: 800px;
}

.hero-title {
  margin-bottom: 1.5rem;
  font-size: 4rem;
  line-height: 1.1;
  letter-spacing: -2px;
}

.gradient-text {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 600px;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.875rem 2rem;
  border: 2px solid var(--accent-primary);
  color: var(--accent-primary);
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: lowercase;
  display: inline-block;
}

.btn:hover {
  background: var(--accent-primary);
  color: var(--bg-primary);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
  transform: translateY(-2px);
}

.btn-secondary {
  border-color: var(--accent-secondary);
  color: var(--accent-secondary);
}

.btn-secondary:hover {
  background: var(--accent-secondary);
  box-shadow: 0 0 20px rgba(180, 19, 245, 0.4);
}

/* About Section */
.about {
  padding: 4rem 0;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.about-card {
  padding: 2rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.about-card:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.2);
  transform: translateY(-4px);
}

.about-card h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.about-card p {
  color: var(--text-secondary);
  line-height: 1.8;
}

/* Latest Projects Section */
.latest-projects {
  padding: 4rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.view-all {
  color: var(--accent-tertiary);
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.view-all:hover {
  color: var(--accent-primary);
  transform: translateX(4px);
}

.section-intro {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 3rem 0;
  }

  .hero-content {
    min-height: 300px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

