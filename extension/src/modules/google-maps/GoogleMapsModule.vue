<template>
  <div class="google-maps-module">
    <div class="header">
      <h2>Google Maps Scraper</h2>
    </div>
    <div class="content">
        <!--  -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

</script>

<style scoped>
.google-maps-module {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
  padding: 16px;
}

.header {
  margin-bottom: 16px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.content {
  flex: 1;
}

.controls {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

button {
  padding: 8px 16px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

button:hover {
  background: #f0f0f0;
}

button.active {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
}

button.primary {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
}

.status {
  padding: 12px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}
</style>
