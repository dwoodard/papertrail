<template>
  <div class="default-module">
    <div class="module-header">
      <div class="logo">📎</div>
      <div class="title">Papertrail</div>
    </div>
    <div class="module-content">
      <div class="module-message">
        <div class="icon">📍</div>
        <div class="heading">Google Maps Module</div>
        <div class="description">
          Navigate to <a href="https://www.google.com/maps" target="_blank" rel="noopener">Google Maps</a> to start collecting listings and data.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.default-module {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.logo {
  font-size: 20px;
}

.title {
  font-weight: 600;
  font-size: 16px;
  color: #1a73e8;
}

.module-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.module-message {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 32px 24px;
  text-align: center;
  max-width: 300px;
}

.icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.heading {
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 12px;
}

.description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.description a {
  color: #1a73e8;
  text-decoration: none;
  font-weight: 500;
}

.description a:hover {
  text-decoration: underline;
}
</style>
