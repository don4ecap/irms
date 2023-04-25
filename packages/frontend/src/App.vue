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
    <div class="query-log flex flex-column" :class="{ active: showQueryLog }">
      <button
        class="button cursor-pointer"
        @click="showQueryLog = !showQueryLog"
      >
        <img src="/img/query-analysis.png" width="18" height="18" alt="" />
        {{ showQueryLog ? 'hide' : 'show' }} query logs
      </button>
      <div class="flex items-center db-info">
        <div class="bold" style="margin-left: 0.2rem">
          DB SERVER: {{ dbInfo.host }}; DB PORT: {{ dbInfo.port }}
        </div>
        <label
          class="ml-auto flex items-center"
          style="font-size: 0.76rem"
          title="Enable automatic scroll to first line when in the middle of the logs"
        >
          <input
            v-model="autoScrollToFirstLine"
            type="checkbox"
            @change="updateGlobal"
          />
          <div style="margin: 0 0.3rem; font-size: 11.7px">
            auto scroll to first line
          </div>
        </label>
      </div>
      <pre id="logs" class="logs flex flex-column"></pre>
    </div>
    <PreviewAllOrdersWindow ref="previewAllOrdersWindow" />
    <PreviewSingleOrderWindow ref="previewSingleOrderWindow" />
    <AlarmWindow ref="alarmWindow" />
    <EditICMSNavWindow ref="editICMSNavWindow" />
    <AddICMSCommissionsWindow ref="addICMSCommissionsWindow" />
    <EditICMSCommissionsWindow ref="editICMSCommissionsWindow" />
  </div>
</template>

<script lang="ts">
import type { ICMSCommissionsData, ICMSNavData } from 'irms-shared-types'

import http from './services/http'
import JqxTabs from 'jqwidgets-framework/jqwidgets-vue/vue_jqxtabs.vue'
import MainPanel from './components/MainPanel.vue'
import PreviewAllOrdersWindow from './components/PreviewAllOrdersWindow.vue'
import PreviewSingleOrderWindow from './components/PreviewSingleOrderWindow.vue'
import AlarmWindow from './components/AlarmWindow.vue'
import EditICMSNavWindow from './components/icms/EditNavWindow.vue'
import AddICMSCommissionsWindow from './components/icms/AddCommissionsWindow.vue'
import EditICMSCommissionsWindow from './components/icms/EditCommissionsWindow.vue'

export default {
  name: 'AppRoot',

  components: {
    JqxTabs,
    MainPanel,
    PreviewAllOrdersWindow,
    PreviewSingleOrderWindow,
    AlarmWindow,
    EditICMSNavWindow,
    AddICMSCommissionsWindow,
    EditICMSCommissionsWindow,
  },

  data() {
    return {
      accounts: ['EE02', 'EE04', 'FIXUAT', 'JCMA', 'KRIBMA', 'KRMA'],
      currentIndex: 0,
      currentAccount: 'EE02',
      showQueryLog: false,
      autoScrollToFirstLine: true,
      dbInfo: {
        host: '0.0.0.0',
        port: 3306,
      },
    }
  },

  mounted() {
    this.onTabSelected()

    // Expose it so can be accessed globally
    window.previewAllOrdersWindow = this.$refs.previewAllOrdersWindow
    window.previewSingleOrderWindow = this.$refs.previewSingleOrderWindow
    window.autoScrollToFirstLine = this.autoScrollToFirstLine
    window.alarmWindow = this.$refs.alarmWindow

    this.fetchDatabaseInfo()
  },

  methods: {
    updateGlobal() {
      window.autoScrollToFirstLine = this.autoScrollToFirstLine
    },

    onTabClick() {
      this.$refs.mainTabs.focus()
    },

    onTabSelected() {
      this.currentIndex = this.$refs.mainTabs.val()
      this.currentAccount = this.accounts[this.currentIndex]
      document.title = this.currentAccount + ' - ' + ' iRMS'
      // this.$refs.previewAllOrdersWindow.initialize()

      currentAccount = this.currentAccount
    },

    openPreviewWindow() {
      this.$refs.previewAllOrdersWindow.open()
    },

    openEditICMSNavWindow(ICMSNavDataToUpdate: ICMSNavData, grid) {
      this.$refs.editICMSNavWindow.open(ICMSNavDataToUpdate, grid)
    },

    openAddICMSCommissionsWindow(account: string, onSuccessFn: () => void) {
      this.$refs.addICMSCommissionsWindow.open(account, onSuccessFn)
    },

    openEditICMSCommissionsWindow(
      commission: ICMSCommissionsData,
      onSuccessFn: () => void
    ) {
      this.$refs.editICMSCommissionsWindow.open(commission, onSuccessFn)
    },
    /** Fetch database info from server and shot it under query logs */
    fetchDatabaseInfo() {
      http.irms
        .get('get_db_info')
        .then(({ data: databaseInfo }) => {
          this.dbInfo.host = databaseInfo.DB_HOST
          this.dbInfo.port = databaseInfo.DB_PORT
        })
        .catch((error) => {
          console.error('Error when trying to get database info', error)
        })
    },
  },
}
</script>
