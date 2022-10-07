<template>
  <JqxSplitter
    height="calc(100% - 0.75rem)"
    width="100%"
    :panels="panels"
    class="main-panel"
    orientation="horizontal"
  >
    <div class="main-panel-top">
      <div class="col-1">
        <div class="flex" style="gap: 0.2rem">
          <JqxButton class="inline-block" theme="office">Sector</JqxButton>
          <JqxButton class="inline-block" theme="office">Common</JqxButton>
          <JqxButton class="inline-block" theme="office">All</JqxButton>
        </div>

        <div class="flex field">JPY Equity</div>
        <div class="flex field">JPY CCY Futures</div>
        <div class="flex field">Strategy Allocation</div>
        <div class="flex field">Risk</div>
      </div>
    </div>
    <div>Panel Two</div>
  </JqxSplitter>
</template>

<script lang="ts">
import JqxSplitter from 'jqwidgets-framework/jqwidgets-vue/vue_jqxsplitter.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'

export default {
  name: 'MainPanel',
  components: {
    JqxSplitter,
    JqxButton,
  },
  data() {
    return {
      panels: [
        { size: 150, min: 150, max: 150, collapsible: true },
        { size: '50%', min: '5%', collapsible: false },
      ],
    }
  },
}
</script>
