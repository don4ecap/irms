<template>
  <tr style="border-top-width: 3px">
    <form :id="formID" class="hidden" @submit="emitSubmitEvent">
      <button class="hidden" type="submit"></button>
    </form>
    <td class="uppercase field">
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
    <td></td>
    <td class="field">
      <input
        v-model="alarm.comment"
        :form="formID"
        type="text"
        placeholder="Comment"
      />
    </td>
    <td></td>
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
        comment: '',
      },
      contractOnly: `${this.contract} ${this.extension}`.toUpperCase().trim(),
      formID: `form-add-alarm-${instanceCount++}`,
    }
  },

  methods: {
    emitSubmitEvent(event) {
      event.preventDefault()
      const splitedContract = this.contractOnly.trim().split(' ')
      const contract = splitedContract.slice(0, -1).join(' ')
      const extension = splitedContract.slice(-1).toString()
      this.$emit('add', {
        contract: contract || null,
        extension: extension || null,
        field: this.alarm.field,
        comment: this.alarm.comment,
      })
    },

    focus() {
      setTimeout(() => this.$refs.inputContract.focus(), 300)
    },
  },
}
</script>
