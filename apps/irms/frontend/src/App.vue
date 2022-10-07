<template>
  <jqxTabs
    ref="mainTabs"
    class="main-tabs"
    width="100%"
    height="100%"
    position="top"
    theme="office"
    @tabclick="onTabClick()"
  >
    <ul>
      <li>EE02</li>
      <li>EE04</li>
      <li>FIXUAT</li>
      <li>JCMA</li>
      <li>KRIBMA</li>
      <li>KRMA</li>
    </ul>
    <div>
      <main-panel />
    </div>
    <div>
      <main-panel />
    </div>
    <div>
      <main-panel />
    </div>
    <div>
      <main-panel />
    </div>
    <div>
      <main-panel />
    </div>
    <div>
      <main-panel />
    </div>
  </jqxTabs>
</template>

<script lang="ts">
import JqxTabs from 'jqwidgets-framework/jqwidgets-vue/vue_jqxtabs.vue'
import MainPanel from './components/MainPanel.vue'

export default {
  components: {
    JqxTabs,
    MainPanel,
  },

  // data() {
  //   return {}
  // },

  methods: {
    onTabClick() {
      this.$refs.mainTabs.focus()
    },
  },
}
</script>
