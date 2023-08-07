<template>
  <JqxWindow
    ref="jqxWindow"
    :auto-open="false"
    :width="400"
    :height="415"
    :resizable="false"
    theme="office"
    :is-modal="true"
  >
    <div>
      <b>Edit Commodity Fees</b>
    </div>
    <div class="window-body">
      <form ref="form" class="flex flex-column h-full" @submit.prevent="save">
        <div class="flex-grow">
          <table class="w-full overflow-auto" style="max-width: 97%">
            <tr>
              <td><label for="commodity-2" class="block">Name</label></td>
              <td style="width: 55%">
                <input
                  id="commodity-2"
                  v-model="commission.commodity"
                  name="commodity-2"
                  type="text"
                  disabled
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="extension-2" class="block">Extension</label>
              </td>
              <td>
                <input
                  id="extension-2"
                  v-model="commission.extension"
                  name="extension-2"
                  type="text"
                  disabled
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="instrument-2" class="block">Instrument</label>
              </td>
              <td>
                <input
                  id="instrument-2"
                  v-model="commission.instrument"
                  name="instrument-2"
                  type="text"
                  disabled
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="account-2" class="block">Account</label>
              </td>
              <td>
                <input
                  id="account-2"
                  v-model="commission.account"
                  name="account-2"
                  type="text"
                  disabled
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="sle-2" class="block">SLE Server</label>
              </td>
              <td>
                <input
                  id="sle-2"
                  v-model="commission.sle"
                  name="sle-2"
                  type="text"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="currency-2" class="block">Currency</label>
              </td>
              <td>
                <input
                  id="currency-2"
                  v-model="commission.currency"
                  name="currency-2"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="viaVoice-2" class="block">Via Voice</label>
              </td>
              <td>
                <input
                  id="viaVoice-2"
                  v-model="commission.viaVoice"
                  name="viaVoice-2"
                  type="number"
                  step="any"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="viaGL-2" class="block">Via GL</label>
              </td>
              <td>
                <input
                  id="viaGL-2"
                  v-model="commission.viaGL"
                  name="viaGL-2"
                  type="number"
                  step="any"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="clearingOnly-2" class="block">Clearing Only</label>
              </td>
              <td>
                <input
                  id="clearingOnly-2"
                  v-model="commission.clearingOnly"
                  name="clearingOnly-2"
                  type="number"
                  step="any"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="phoneExFees-2" class="block">
                  Phone (ex. Exchange Fees)
                </label>
              </td>
              <td>
                <input
                  id="phoneExFees-2"
                  v-model="commission.phoneExcludingFees"
                  name="phoneExFees-2"
                  type="number"
                  step="any"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="dmaExcludingFees-2" class="block">
                  DMA (ex. Exchange Fees)
                </label>
              </td>
              <td>
                <input
                  id="dmaExcludingFees-2"
                  v-model="commission.dmaExcludingFees"
                  name="dmaExcludingFees-2"
                  type="number"
                  step="any"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="exchangeFees-2" class="block">
                  Exchange Fees
                </label>
              </td>
              <td>
                <input
                  id="exchangeFees-2"
                  v-model="commission.exchangeFees"
                  name="exchangeFees-2"
                  type="number"
                  step="any"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
          </table>
        </div>
        <div class="window-buttons-container flex">
          <jqxButton
            ref="buttonSubmit"
            class="ml-auto"
            type="submit"
            theme="office"
            @click="save"
          >
            Save
          </jqxButton>
        </div>
      </form>
    </div>
  </JqxWindow>
</template>

<script lang="ts">
import type { ICMSCommissionsData } from 'irms-shared-types'
import JqxWindow from 'jqwidgets-framework/jqwidgets-vue/vue_jqxwindow.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'
import http from '../../services/http'
import PageControls from '../../helpers/PageControls'

const initialICMSCommissionsData: ICMSCommissionsData = {
  commodity: '',
  extension: '',
  instrument: '',
  account: '',
  sle: '',
  currency: '',
  viaVoice: 0,
  viaGL: 0,
  clearingOnly: 0,
  phoneExcludingFees: 0,
  dmaExcludingFees: 0,
  exchangeFees: 0,
  phoneIncludingFees: 0,
  dmaIncludingFees: 0,
  effectiveDate: null,
}

export default {
  name: 'AddCommissionsWindow',

  components: {
    JqxWindow,
    JqxButton,
  },

  data() {
    return {
      commission: {
        ...initialICMSCommissionsData,
      },
      onSuccessFn: null as () => void,
      state: false,
    }
  },

  methods: {
    open(existingCommission: ICMSCommissionsData, onSuccessFn: () => void) {
      this.commission = JSON.parse(JSON.stringify(existingCommission))
      this.onSuccessFn = onSuccessFn
      this.$refs.jqxWindow.open()
      this.$refs.jqxWindow.setTitle(
        `<b>Edit Commodity Fees - ${this.commission.commodity}</b>`
      )
      setTimeout(() => this.$el.querySelector('#sle-2').focus(), 200)
    },

    save() {
      if (!this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity()
        return
      }
      this.setActionButtonsDisabledState(true)
      const feesData = JSON.parse(JSON.stringify(this.commission))
      return http.icms
        .put('updateCommission', feesData)
        .then(({ data }) => {
          this.commissions = initialICMSCommissionsData
          if ('message' in data) {
            PageControls.log(data.message)
          }
          this.$refs.jqxWindow.close()
          if (this.onSuccessFn && typeof this.onSuccessFn === 'function') {
            this.onSuccessFn()
          }
          return Promise.resolve()
        })
        .catch((error) => {
          console.error('Failed to update comodity fees', error)
          if ('message' in error.response.data) {
            PageControls.error(error.response.data.message)
          }
          return Promise.reject()
        })
        .finally(() => {
          this.setActionButtonsDisabledState(false)
        })
    },

    onInputKeypress(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        this.save()
      }
    },

    setActionButtonsDisabledState(disabled) {
      $(this.$refs.buttonSubmit.$el).jqxButton({ disabled })
    },

    onClose() {
      this.commissions = initialICMSCommissionsData
    },
  },
}
</script>

<style lang="scss" scoped>
.window-body {
  padding: 0.3rem;
  .window-buttons-container {
    padding: 0.45rem;
    gap: 0.5rem;
  }
  input,
  button {
    padding: 0.1rem;
  }

  input {
    width: 100%;
  }
}
</style>
