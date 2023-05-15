<template>
  <JqxWindow
    ref="currentWindow"
    theme="office"
    :min-width="1200"
    :min-height="500"
    :auto-open="false"
    @close="clearIntervals"
  >
    <h2 id="preview-single-window-header" style="margin: 0">Alarms</h2>
    <div class="preview-window-content single-order-preview">
      <div class="orders-container flex-grow">
        <SkeletonLoader
          v-if="loading.load"
          caption="Loading alarms..."
          style="min-height: 200px; padding-top: 0.1rem"
        />
        <div v-else>
          <div class="text-right relative">
            <span :class="{ timer: countdown <= 5 && countdown > 0 }">{{
              countdown
            }}</span>
            seconds to auto-refresh
          </div>
          <table class="alarms-table w-full">
            <caption>
              <h3 v-if="contract" class="text-left">
                Set alarm for contract {{ contract }}
              </h3>
              <h3 v-else class="text-left">Showing all working alarms</h3>
            </caption>
            <thead class="bold">
              <td>Contract</td>
              <td>Field</td>
              <td
                style="width: 10rem"
                :class="{ 'not-visible': !(alarms && alarms.length) }"
              >
                Down
              </td>
              <td :class="{ 'not-visible': !(alarms && alarms.length) }">
                Current
              </td>
              <td
                style="width: 10rem"
                :class="{ 'not-visible': !(alarms && alarms.length) }"
              >
                Up
              </td>
              <td
                class="w-0"
                :class="{ 'not-visible': !(alarms && alarms.length) }"
              >
                Enabled
              </td>
              <td class="w-0">Action</td>
            </thead>
            <tbody>
              <AlarmRow
                v-for="(alarm, index) in alarms"
                :key="index"
                :index="index"
                :alarm="alarm"
                @delete="deleteAlarm"
                @update-enabled="updateEnabledAlarm"
                @submit="updateAlarm"
              />
              <!-- v-if="contract" -->
              <AlarmAddRow
                ref="addAlarmRow"
                :contract="contract"
                :extension="extension"
                :disable="loading.delete || loading.addAlarm"
                @add="addAlarm"
              />
            </tbody>
          </table>
          <p>* Press enter to update</p>
        </div>
      </div>
      <div>
        <jqxButton theme="office" @click="close"> close </jqxButton>
      </div>
    </div>
  </JqxWindow>
</template>

<script lang="ts">
import JqxWindow from 'jqwidgets-framework/jqwidgets-vue/vue_jqxwindow.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import AlarmRow from '../components/AlarmRow.vue'
import AlarmAddRow from '../components/AlarmAddRow.vue'
import http from '../services/http'
import PageControls from '../helpers/PageControls'
import { Alarm } from 'irms-shared-types'

export default {
  name: 'AlarmWindow',

  components: {
    JqxWindow,
    JqxButton,
    SkeletonLoader,
    AlarmRow,
    AlarmAddRow,
  },

  data() {
    return {
      account: '',
      contract: '',
      alarms: [],
      loading: {
        load: false,
        addAlarm: false,
        delete: false,
      },
      extension: '',
      fetchIntervalTime: 30000,
      fetchInterval: null,
      countdown: 0,
      countdownInterval: null,
      endTime: 0,
    }
  },

  methods: {
    async open(contract: string, extension: string, account: string) {
      this.$refs.currentWindow.open()
      this.contract = contract
      this.extension = extension
      this.account = account
      this.countdown = this.fetchIntervalTime / 1000
      await this.fetchAlarms()
      this.fetchInterval = setInterval(
        this.fetchAlarmsNoLoading,
        this.fetchIntervalTime
      )
      this.countdownInterval = setInterval(this.updateRemainingTime, 1000)
      this.$refs.addAlarmRow.focus()
    },

    updateRemainingTime() {
      const remainingTime = this.endTime - Date.now()
      this.countdown = (remainingTime / 1000).toFixed(0)
    },

    fetchAlarmsNoLoading() {
      this.fetchAlarms(false)
    },

    fetchAlarms(showLoading = true) {
      this.endTime = Date.now() + this.fetchIntervalTime
      this.alarms = []
      if (showLoading) this.loading.load = true
      const contract = this.contract
      const account = this.account
      return http.irms
        .get(`get_alarms/${account}/${contract}`)
        .then(({ data: alarms }) => {
          this.alarms = alarms.map((alarm) => ({
            ...alarm,
            loading: {
              delete: false,
            },
          }))
        })
        .catch((error) => {
          console.error('Failed to fetch alarms of contract', contract, error)
        })
        .finally(() => {
          if (showLoading) this.loading.load = false
        })
    },

    addAlarm(contractDetails) {
      this.loading.addAlarm = true
      contractDetails = {
        ...contractDetails,
        contract: `${contractDetails.contract} ${contractDetails.extension}`,
        account: this.account,
      }
      http.irms
        .post('/add_alert', contractDetails)
        .then(({ data: addedAlarm }) => {
          addedAlarm = {
            ...addedAlarm,
            loading: {
              delete: false,
            },
          }
          this.alarms.push(addedAlarm)
        })
        .catch((error) => {
          console.error('Failed when add alarm', contractDetails, error)
          if (error.response.data?.message) {
            PageControls.error(error.response.data.message)
          }
        })
        .finally(() => {
          this.loading.addAlarm = false
        })
    },

    deleteAlarm(contractDetails, index) {
      const alarmToDelete = this.alarms[index]
      alarmToDelete.loading.delete = true
      this.loading.delete = true
      const account = this.account
      http.irms
        .delete(
          `delete_alert/${account}/${alarmToDelete.contract}/${alarmToDelete.field}`
        )
        .then((/* { data } */) => {
          this.fetchAlarms(false)
        })
        .finally(() => {
          this.loading.delete = false
        })
    },

    updateEnabledAlarm(alarm: Alarm) {
      http.irms.put(`update_enabled_alert/${alarm.contract}/${alarm.field}`, {
        enabled: alarm.enabled,
        numTriggers: alarm.numTriggers,
      })
    },

    updateAlarm(alarm: Alarm) {
      const account = this.account
      http.irms
        .put(`update_alert/${account}/${alarm.contract}/${alarm.field}`, {
          alertHigh: alarm.alertHigh,
          alertLow: alarm.alertLow,
        })
        .then(() => {
          this.fetchAlarms(false)
        })
    },

    clearIntervals() {
      clearInterval(this.fetchInterval)
      clearInterval(this.countdownInterval)
    },

    close() {
      this.alarms = []
      this.clearIntervals()
      this.$refs.currentWindow.close()
    },
  },
}
</script>
