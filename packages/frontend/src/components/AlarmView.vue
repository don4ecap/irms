<template>
  <div class="flex flex-column flex-grow">
    <div class="single-order-preview">
      <div class="orders-container flex-grow">
        <div class="text-right relative">
          <span :class="{ timer: countdown <= 5 && countdown > 0 }">{{
            countdown
          }}</span>
          seconds to auto-refresh
        </div>
        <h4>Showing all working alarms for {{ account }} account</h4>
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
            />
            <!-- v-if="contract" -->
            <AlarmAddRow
              ref="alarmAddRow"
              :disable="loading.delete || loading.addAlarm"
              @add="addAlarm"
            />
          </tbody>
        </table>
        <p>* Press enter to update</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AlarmRow from '../components/AlarmRow.vue'
import AlarmAddRow from '../components/AlarmAddRow.vue'
import http from '../services/http'
import PageControls from '../helpers/PageControls'
import type { Alarm } from 'irms-shared-types'

export default defineComponent({
  name: 'IAlarm',

  components: {
    AlarmRow,
    AlarmAddRow,
  },

  props: {
    account: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      contract: '',
      alarms: [],
      loading: {
        // load: false,
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

  async mounted() {
    await this.fetchAlarms()
  },

  methods: {
    async start() {
      this.countdown = this.fetchIntervalTime / 1000
      await this.fetchAlarms(false)
      this.fetchInterval = setInterval(this.fetchAlarms, this.fetchIntervalTime)
      this.countdownInterval = setInterval(this.updateRemainingTime, 1000)
      this.$refs.alarmAddRow.focus()
    },

    updateRemainingTime() {
      const remainingTime = this.endTime - Date.now()
      this.countdown = (remainingTime / 1000).toFixed(0)
    },

    // fetchAlarmsNoLoading() {
    //   this.fetchAlarms(false)
    // },

    fetchAlarms(/* showLoading = true */) {
      this.endTime = Date.now() + this.fetchIntervalTime
      this.alarms = []
      // if (showLoading) this.loading.load = true
      const url = `get_alarms?account=${this.account}`
      return http.irms
        .get(url)
        .then(({ data: alarms }) => {
          this.alarms = alarms.map((alarm) => ({
            ...alarm,
            loading: {
              delete: false,
            },
          }))
        })
        .catch((error) => {
          console.error(
            'Failed to fetch alarms of account',
            this.account,
            error
          )
        })
      // .finally(() => {
      // if (showLoading) this.loading.load = false
      // })
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
      const account = this.account
      http.irms.put(
        `update_enabled_alert/${account}/${alarm.contract}/${alarm.field}`,
        {
          enabled: alarm.enabled,
          numTriggers: alarm.numTriggers,
        }
      )
    },

    updateAlarm(index: number, alarm: Alarm) {
      const account = this.account
      http.irms
        .put(`update_alert/${account}/${alarm.contract}/${alarm.field}`, {
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
  },
})
</script>
