<script lang="ts">
export default {
  data() {
    return {
      h1: 'Hey there...',
      text: 'Hello world',
    }
  },
}
</script>

<template>
  <div>
    <h1>{{ h1 }}</h1>
    <p>{{ text }}</p>
  </div>
</template>

<style scoped>
h1 {
  color: blueviolet;
}
</style>
