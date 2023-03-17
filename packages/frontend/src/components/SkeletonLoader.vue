<template>
  <div class="skeleton-loader flex flex-column animate-pulse">
    <div class="bg-gray-200 rounded-full w-full h-3.5"></div>
    <div class="bg-gray-200 rounded-full w-full h-3"></div>
    <div class="bg-gray-200 rounded-full w-full h-3"></div>
    <div class="bg-gray-200 rounded-full w-full h-3"></div>
    <div class="bg-gray-200 rounded-full w-full h-3"></div>
    <div class="bg-gray-200 rounded-full w-full h-3"></div>
    <div class="bg-gray-200 rounded-full w-full h-3"></div>
    <div class="bg-gray-200 rounded-full w-full h-3"></div>
    <div class="bg-gray-200 rounded-full w-full h-3"></div>
    <div class="bg-gray-200 rounded-full w-full h-3"></div>
    <h4 class="caption">{{ caption }}</h4>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SkeletonLoader',

  props: {
    caption: {
      type: String,
      default: 'Loading',
    },
  },
}
</script>
