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
    <PreviewWindow ref="previewWindow" />
  </div>
</template>

<script lang="ts">
import JqxTabs from 'jqwidgets-framework/jqwidgets-vue/vue_jqxtabs.vue'
import MainPanel from './components/MainPanel.vue'
import PreviewWindow from './components/PreviewWindow.vue'

export default {
  name: 'AppRoot',

  components: {
    JqxTabs,
    MainPanel,
    PreviewWindow,
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
  },

  methods: {
    onTabClick() {
      this.$refs.mainTabs.focus()
    },

    onTabSelected() {
      this.currentIndex = this.$refs.mainTabs.val()
      this.currentAccount = this.accounts[this.currentIndex]
      document.title = this.currentAccount + ' - ' + ' iRMS'

      currentAccount = this.currentAccount
      currentAccountVar = accountsVar[this.currentAccount]
    },

    openPreviewWindow() {
      this.$refs.previewWindow.open()
    },
  },
}
</script>
