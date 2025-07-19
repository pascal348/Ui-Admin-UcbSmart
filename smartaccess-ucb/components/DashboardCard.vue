<template>
  <div class="stat-card h-100">
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <div class="stat-number">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
      </div>
      <div class="text-end">
        <i :class="icon" class="fs-1 opacity-75" :style="{ color: iconColor }"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: [Number, String],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: '#1e3a8a'
  }
})
</script>