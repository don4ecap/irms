<template>
  <tr style="border-top-width: 3px">
    <form :id="formID" class="hidden" @submit="emitSubmitEvent">
      <button class="hidden" type="submit"></button>
    </form>
    <td class="uppercase down">
      <input
        ref="inputContract"
        v-model="contractOnly"
        class="input-contract"
        :form="formID"
        type="text"
        spellcheck="false"
        placeholder="Contract"
      />
    </td>
    <td class="field">
      <select v-model="alarm.field" :form="formID">
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
        :form="formID"
        type="number"
        placeholder="Click to edit"
      /> -->
    </td>
    <td class="enable">
      <!-- <input
        v-model="alarm.enabled"
        :form="formID"
        class="enable-alarm-checkbox block mx-auto"
        type="checkbox"
      /> -->
    </td>
    <td class="delete" style="background-color: #0075ff">
      <button
        :disabled="disable"
        class="button-custom button-delete-alarm block w-full bold"
        style="color: #fff"
        :form="formID"
        type="submit"
      >
        ADD
      </button>
    </td>
  </tr>
</template>

<script lang="ts">
let instanceCount = 1

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
      contractOnly: `${this.contract} ${this.extension}`.toUpperCase().trim(),
      formID: `form-add-alarm-${instanceCount++}`,
    }
  },

  methods: {
    emitSubmitEvent(event) {
      event.preventDefault()
      const splitedContract = this.contractOnly.trim().split(' ')
      const contract = splitedContract[0]
      const extension = splitedContract[splitedContract.length - 1]
      this.$emit('add', {
        contract: contract || null,
        extension: extension || null,
        field: this.alarm.field,
      })
    },

    focus() {
      setTimeout(() => this.$refs.inputContract.focus(), 300)
    },
  },
}
</script>
