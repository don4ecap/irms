<template>
  <tr>
    <form :id="id" class="hidden" @submit="emitSubmitEvent">
      <button class="hidden" type="submit"></button>
    </form>
    <td>{{ alarmData.contract }}</td>
    <td>{{ alarmData.field }}</td>
    <td class="field">
      <input
        v-model="alarmData.alertLow"
        :form="id"
        type="number"
        step="any"
        placeholder="Click to edit"
        @change="emitChanged"
      />
    </td>
    <td>{{ alarmData.currentValue }}</td>
    <td class="field">
      <input
        v-model="alarmData.alertHigh"
        :form="id"
        type="number"
        step="any"
        placeholder="Click to edit"
        @change="emitChanged"
      />
    </td>
    <td class="field">
      <input
        v-model="alarmData.comment"
        :form="id"
        type="text"
        placeholder="Comment"
        @change="emitChanged"
      />
    </td>
    <td class="enable">
      <button
        class="button-custom w-full flex justify-center items-center"
        :title="alarmStatus"
        @click="emitUpdateEnabledEvent"
      >
        <img
          v-if="alarmStatus.toLowerCase() === 'once'"
          width="20"
          height="20"
          src="/img/on_once.png"
        />
        <img
          v-else-if="alarmStatus.toLowerCase() === 'multiple'"
          width="20"
          height="20"
          src="/img/on_multiple.png"
        />
        <img v-else width="20" height="20" src="/img/stopped.png" />
      </button>
    </td>
    <td class="delete">
      <button
        class="button-custom button-delete-alarm block w-full no-select"
        title="Delete alarm"
        :disabled="alarm.loading.delete"
        @click="emitDeleteEvent"
      >
        <div v-if="alarm.loading.delete">...</div>
        <img v-else class="no-select" width="16" src="/img/trash-can.svg" />
      </button>
    </td>
  </tr>
</template>

<script lang="ts">
let instance = 1

export default {
  name: 'AlarmRow',

  props: {
    alarm: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      alarmData: JSON.parse(JSON.stringify(this.alarm)),
      id: `form-alarm-row-${this.alarm.account}-${this.index}-${instance++}`,
    }
  },

  computed: {
    alarmStatus() {
      if (this.alarmData.enabled) {
        return this.alarmData.numTriggers == 1 ? 'Once' : 'Multiple'
      } else {
        return 'Disabled'
      }
    },
  },

  methods: {
    emitSubmitEvent(event) {
      event.preventDefault()
      this.$emit('submit', this.index, this.alarmData)
    },

    emitDeleteEvent() {
      this.$emit('delete', this.alarmData, this.index)
    },

    emitUpdateEnabledEvent() {
      if (this.alarmData.numTriggers == 0) {
        this.alarmData.numTriggers = 1
        this.alarmData.enabled = true
      } else if (this.alarmData.numTriggers == 1) {
        this.alarmData.numTriggers = -1
        this.alarmData.enabled = true
      } else {
        this.alarmData.numTriggers = 0
        this.alarmData.enabled = false
      }
      this.$emit('update-enabled', this.alarmData)
    },

    emitChanged() {
      this.$emit('changed', this.index, this.alarmData)
    },
  },
}
</script>
