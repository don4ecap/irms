<template>
  <JqxWindow
    ref="jqxWindow"
    :auto-open="false"
    :width="400"
    :height="415"
    :resizable="false"
    theme="office"
  >
    <div>
      <b>Add New Commodity Fees</b>
    </div>
    <div class="window-body">
      <form ref="form" class="flex flex-column h-full" @submit.prevent="submit">
        <div class="flex-grow">
          <table class="w-full overflow-auto" style="max-width: 97%">
            <tr>
              <td><label for="commodity-1" class="block">Name</label></td>
              <td style="width: 55%">
                <input
                  id="commodity-1"
                  v-model="commission.commodity"
                  name="commodity-1"
                  type="text"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="extension-1" class="block">Extension</label>
              </td>
              <td>
                <input
                  id="extension-1"
                  v-model="commission.extension"
                  name="extension-1"
                  type="text"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="instrument-1" class="block">Instrument</label>
              </td>
              <td>
                <input
                  id="instrument-1"
                  v-model="commission.instrument"
                  name="instrument-1"
                  type="text"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="account-1" class="block">Account</label>
              </td>
              <td>
                <input
                  id="account-1"
                  v-model="commission.account"
                  name="account-1"
                  type="text"
                  disabled
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="sle-1" class="block">SLE Server</label>
              </td>
              <td>
                <input
                  id="sle-1"
                  v-model="commission.sle"
                  name="sle-1"
                  type="text"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="currency-1" class="block">Currency</label>
              </td>
              <td>
                <input
                  id="currency-1"
                  v-model="commission.currency"
                  name="currency-1"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="viaVoice-1" class="block">Via Voice</label>
              </td>
              <td>
                <input
                  id="viaVoice-1"
                  v-model="commission.viaVoice"
                  name="viaVoice-1"
                  type="number"
                  step="any"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="viaGL-1" class="block">Via GL</label>
              </td>
              <td>
                <input
                  id="viaGL-1"
                  v-model="commission.viaGL"
                  name="viaGL-1"
                  type="number"
                  step="any"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="clearingOnly-1" class="block">Clearing Only</label>
              </td>
              <td>
                <input
                  id="clearingOnly-1"
                  v-model="commission.clearingOnly"
                  name="clearingOnly-1"
                  type="number"
                  step="any"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="phoneExFees-1" class="block">
                  Phone (ex. Exchange Fees)
                </label>
              </td>
              <td>
                <input
                  id="phoneExFees-1"
                  v-model="commission.phoneExcludingFees"
                  name="phoneExFees-1"
                  type="number"
                  step="any"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="dmaExcludingFees-1" class="block">
                  DMA (ex. Exchange Fees)
                </label>
              </td>
              <td>
                <input
                  id="dmaExcludingFees-1"
                  v-model="commission.dmaExcludingFees"
                  name="dmaExcludingFees-1"
                  type="number"
                  step="any"
                  required
                  @keypress="onInputKeypress"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label for="exchangeFees-1" class="block">
                  Exchange Fees
                </label>
              </td>
              <td>
                <input
                  id="exchangeFees-1"
                  v-model="commission.exchangeFees"
                  name="exchangeFees-1"
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
            @click="submit"
          >
            Submit
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
    open(account: string, onSuccessFn: () => void) {
      this.onSuccessFn = onSuccessFn
      this.commission.account = account
      this.$refs.jqxWindow.open()
      setTimeout(() => this.$el.querySelector('input').focus(), 200)
    },

    submit() {
      if (!this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity()
        return
      }
      this.setActionButtonsDisabledState(true)
      const feesData = JSON.parse(JSON.stringify(this.commission))
      return http.icms
        .post('addCommission', feesData)
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
          console.error('Failed to add comodity fees', error)
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
        this.submit()
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
