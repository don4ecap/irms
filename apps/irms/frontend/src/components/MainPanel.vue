<template>
  <JqxSplitter
    height="calc(100% - 0.75rem)"
    width="100%"
    :panels="panels"
    orientation="horizontal"
  >
    <div>Panel One</div>
    <div>Panel Two</div>
  </JqxSplitter>
</template>

<script lang="ts">
import JqxSplitter from 'jqwidgets-framework/jqwidgets-vue/vue_jqxsplitter.vue'

export default {
  name: 'MainPanel',
  components: {
    JqxSplitter,
  },
  data() {
    return {
      panels: [
        { size: 120, min: 120, max: 120, collapsible: true },
        { size: '50%', min: '5%', collapsible: false },
      ],
    }
  },
}
</script>
