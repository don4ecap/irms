<template>
  <JqxWindow
    ref="currentWindow"
    theme="office"
    :min-width="1200"
    :min-height="500"
    :auto-open="false"
    :is-modal="true"
    @close="close"
  >
    <h3 id="alarm-window-header" style="margin: 0">
      Alarms - <span id="alarm-window-contract-name"></span>
    </h3>
    <div class="preview-window-content" style="padding: 0.5rem">
      <div class="window-content-container flex-grow">
        <SkeletonLoader
          v-if="loading.load"
          caption="Loading alarms..."
          style="min-height: 200px; padding-top: 0.1rem"
        />
        <div v-else>
          <div class="text-right relative mb-2">
            <span :class="{ timer: countdown <= 5 && countdown > 0 }">{{
              countdown
            }}</span>
            seconds to auto-refresh
          </div>
          <table class="alarms-table w-full">
            <thead class="bold">
              <td style="width: 12rem">Contract</td>
              <td style="width: 6rem">Field</td>
              <td
                style="width: 6rem"
                :class="{ 'not-visible': !(alarms && alarms.length) }"
              >
                Down
              </td>
              <td
                :class="{ 'not-visible': !(alarms && alarms.length) }"
                style="width: 6rem"
              >
                Current
              </td>
              <td
                style="width: 6rem"
                :class="{ 'not-visible': !(alarms && alarms.length) }"
              >
                Up
              </td>
              <td>Comment</td>
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
                @changed="updateAlarmsToUpdateBeforeClose"
              />
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
        <jqxButton theme="office" @click="() => close(true)"> close </jqxButton>
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
      alarmsToUpdateBeforeClose: [],
    }
  },

  methods: {
    async open(contract: string, extension: string, account: string) {
      this.$refs.currentWindow.open()

      this.contract = contract
      this.extension = extension
      this.account = account

      const alarmContractNameEl = this.$el.querySelector(
        '#alarm-window-contract-name'
      ) as HTMLSpanElement
      alarmContractNameEl.textContent = contract

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
        .get(`getAlarms/${account}/${contract}`)
        .then(({ data }) => {
          const alarms = data.data as Array<Alarm>
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
      const contract = contractDetails.contract || ''
      const extension = contractDetails.extension || ''
      const alarmData = {
        account: this.account,
        contract: `${contract} ${extension}`.trim(),
        field: contractDetails.field,
        comment: contractDetails.comment,
      }
      http.irms
        .post('addAlarm', alarmData)
        .then(({ data }) => {
          contractDetails = {
            ...data.data,
            loading: {
              delete: false,
            },
          }
          this.alarms.push(contractDetails)
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
          `deleteAlarm/${account}/${alarmToDelete.contract}/${alarmToDelete.field}`
        )
        .then((/* { data } */) => {
          this.fetchAlarms(false)
        })
        .finally(() => {
          this.loading.delete = false
        })
    },

    updateEnabledAlarm(alarm: Alarm) {
      const account = this.account
      http.irms.put(
        `updateEnabledAlarm/${account}/${alarm.contract}/${alarm.field}`,
        {
          enabled: alarm.enabled,
          numTriggers: alarm.numTriggers,
        }
      )
    },

    updateAlarm(index: number, alarm: Alarm) {
      const account = this.account
      return http.irms
        .put(`updateAlarm/${account}/${alarm.contract}/${alarm.field}`, {
          alertHigh: alarm.alertHigh,
          alertLow: alarm.alertLow,
          comment: alarm.comment,
        })
        .then(() => {
          this.fetchAlarms(false)
        })
    },

    clearIntervals() {
      clearInterval(this.fetchInterval)
      clearInterval(this.countdownInterval)
    },

    updateAlarmsToUpdateBeforeClose(index: number, alarm: Alarm) {
      this.alarmsToUpdateBeforeClose[index] = alarm
    },

    updateChangedAlarms() {
      return Promise.race(
        this.alarmsToUpdateBeforeClose.map((alarm, index) => {
          if (alarm) {
            return this.updateAlarm(index, alarm).then(() => {
              this.alarmsToUpdateBeforeClose.splice(index, 1)
              return Promise.resolve()
            })
          } else {
            this.alarmsToUpdateBeforeClose.splice(index, 1)
            return Promise.resolve()
          }
        })
      )
    },

    async close() {
      if (this.alarmsToUpdateBeforeClose?.length) {
        await this.updateChangedAlarms()
      }
      this.alarms = []
      this.clearIntervals()
      if (this.$refs.currentWindow.isOpen()) {
        this.$refs.currentWindow.close()
      }
    },
  },
}
</script>
