<template>
  <tr style="border-top-width: 3px">
    <form id="form-add-alarm" class="hidden" @submit="emitSubmitEvent">
      <button class="hidden" type="submit"></button>
    </form>
    <td class="uppercase down">
      <!-- <div v-if="contract">{{ contract }} {{ extension }}</div> -->
      <!-- v-else -->
      <input
        v-model="contractOnly"
        class="input-contract"
        form="form-add-alarm"
        type="text"
        placeholder="Contract"
      />
      <!-- <select
        v-else
        v-model="alarm.contract"
        form="form-add-alarm"
        placeholder="Select contract"
      >
        <option selected default disabled value="">Select contract</option>
        <option
          v-for="(contractDetail, index) in contracts"
          :key="index"
          :value="contractDetail.contract_extension"
        >
          {{ contractDetail.contract_extension }}
        </option>
      </select> -->
    </td>
    <td class="field">
      <select v-model="alarm.field" form="form-add-alarm">
        <option value="Bid">Bid</option>
        <option value="Ask">Ask</option>
        <option value="Last">Last</option>
      </select>
    </td>
    <td class="down"></td>
    <td></td>
    <td class="up">
      <!-- <input
        v-model="alarm.alertHigh"
        form="form-add-alarm"
        type="number"
        placeholder="Click to edit"
      /> -->
    </td>
    <td class="enable">
      <!-- <input
        v-model="alarm.enabled"
        form="form-add-alarm"
        class="enable-alarm-checkbox block mx-auto"
        type="checkbox"
      /> -->
    </td>
    <td class="delete" style="background-color: #0075ff">
      <button
        :disabled="disable"
        class="button-custom button-delete-alarm block w-full bold"
        style="color: #fff"
        form="form-add-alarm"
        type="submit"
      >
        ADD
      </button>
    </td>
  </tr>
</template>

<script lang="ts">
export default {
  name: 'AlarmAddRow',

  props: {
    contract: {
      type: String,
      default: '',
      // required: true,
    },
    extension: {
      type: String,
      default: '',
      // required: true,
    },
    disable: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      alarm: {
        extension: this.extension,
        contract: this.contract,
        field: 'Bid',
      },
      contractOnly: '',
    }
  },

  methods: {
    emitSubmitEvent(event) {
      event.preventDefault()
      if (!this.contract) {
        const [contract, extension] = this.contractOnly.split(' ')
        this.$emit('add', {
          contract: contract || null,
          extension: extension || null,
          field: this.alarm.field,
        })
      } else {
        this.$emit('add', this.alarm)
      }
    },
  },
}
</script>
