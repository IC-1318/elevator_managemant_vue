<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <RouterView />
</template>

<style>
:root {
  --primary-color: #4CAF50;
  --error-color: #e74c3c;
  --background-color: #121212;
  --surface-color: #1e1e1e;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
}

.panel {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.tech-text {
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.5px;
}
</style>
