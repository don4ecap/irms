<template>
  <div>
    <jqxTabs
      ref="mainTabs"
      class="main-tabs"
      width="100%"
      height="100%"
      position="top"
      theme="office"
      @tabclick="onTabClick()"
      @selected="onTabSelected()"
    >
      <!-- TAB HEADER -->
      <ul>
        <li v-for="(account, index) in accounts" :key="index">
          {{ account }}
        </li>
      </ul>

      <img src="/img/frontlogo.gif" class="logo" />

      <!-- TAB BODY -->
      <div v-for="(account, index) in accounts" :key="index">
        <main-panel
          :account="account"
          @btn-preview-clicked="openPreviewWindow()"
        />
      </div>
    </jqxTabs>
    <PreviewAllOrdersWindow ref="previewAllOrdersWindow" />
    <PreviewSingleOrderWindow ref="previewSingleOrderWindow" />
  </div>
</template>

<script lang="ts">
import JqxTabs from 'jqwidgets-framework/jqwidgets-vue/vue_jqxtabs.vue'
import MainPanel from './components/MainPanel.vue'
import PreviewAllOrdersWindow from './components/PreviewAllOrdersWindow.vue'
import PreviewSingleOrderWindow from './components/PreviewSingleOrderWindow.vue'

export default {
  name: 'AppRoot',

  components: {
    JqxTabs,
    MainPanel,
    PreviewAllOrdersWindow,
    PreviewSingleOrderWindow,
  },

  data() {
    return {
      accounts: ['EE02', 'EE04', 'FIXUAT', 'JCMA', 'KRIBMA', 'KRMA'],
      currentIndex: 0,
      currentAccount: 'EE02',
    }
  },

  mounted() {
    this.onTabSelected()

    // Expose it so can be accessed globally
    window.previewAllOrdersWindow = this.$refs.previewAllOrdersWindow
    window.previewSingleOrderWindow = this.$refs.previewSingleOrderWindow
  },

  methods: {
    onTabClick() {
      this.$refs.mainTabs.focus()
    },

    onTabSelected() {
      this.currentIndex = this.$refs.mainTabs.val()
      this.currentAccount = this.accounts[this.currentIndex]
      document.title = this.currentAccount + ' - ' + ' iRMS'
      // this.$refs.previewAllOrdersWindow.initialize()

      currentAccount = this.currentAccount
      currentAccountVar = accountsVar[this.currentAccount]
    },

    openPreviewWindow() {
      this.$refs.previewAllOrdersWindow.open()
    },
  },
}
</script>
