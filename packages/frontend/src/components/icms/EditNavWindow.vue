<template>
  <JqxWindow
    ref="jqxWindow"
    :auto-open="false"
    :width="900"
    :height="220"
    :resizable="false"
    theme="office"
  >
    <div>
      <b>Edit Nav deails for</b>
    </div>
    <div class="window-body">
      <form ref="form" class="flex flex-column h-full" @submit.prevent="save">
        <table class="w-full flex-grow">
          <tr>
            <td><label for="adminfees" class="block">Admin Fees</label></td>
            <td>
              <input
                v-model="nav.fee1"
                type="number"
                step="any"
                required
                @keypress="onInputKeypress"
              />
            </td>
            <td>
              <label for="managementfees" class="block">Management Fees</label>
            </td>
            <td>
              <input
                v-model="nav.fee2"
                type="number"
                step="any"
                required
                @keypress="onInputKeypress"
              />
            </td>
            <td>
              <label for="incentivefees" class="block">Incentive Fees</label>
            </td>
            <td>
              <input
                v-model="nav.fee3"
                type="number"
                step="any"
                required
                @keypress="onInputKeypress"
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="fxadjustment" class="block">Fx Adjustment</label>
            </td>
            <td>
              <input
                v-model="nav.fxAdj"
                type="number"
                step="any"
                required
                @keypress="onInputKeypress"
              />
            </td>
            <td>
              <label for="brokercommissions" class="block">
                Broker Commissions
              </label>
            </td>
            <td>
              <input
                v-model="nav.brokerCommissions"
                type="number"
                step="any"
                required
                @keypress="onInputKeypress"
              />
            </td>
            <td><label for="misc" class="block">Miscellaneous</label></td>
            <td>
              <input
                v-model="nav.misc"
                type="number"
                step="any"
                required
                @keypress="onInputKeypress"
              />
            </td>
          </tr>
          <tr>
            <td><label for="pnl" class="block">PNL</label></td>
            <td>
              <input
                v-model="nav.pnl"
                type="number"
                step="any"
                required
                @keypress="onInputKeypress"
                disabled
              />
            </td>
            <td><label for="subred" class="block">Sub/Red</label></td>
            <td>
              <input
                v-model="nav.subred"
                type="number"
                step="any"
                required
                @keypress="onInputKeypress"
              />
            </td>
          </tr>
          <tr>
            <td><label for="fourecapnav" class="block">4ECAP NAV</label></td>
            <td>
              <input
                v-model="nav.nav"
                type="number"
                step="any"
                required
                @keypress="onInputKeypress"
                disabled
              />
            </td>
            <td>
              <label for="administratornav" class="block">
                Administrator NAV
              </label>
            </td>
            <td>
              <input
                v-model="nav.chNav"
                type="number"
                step="any"
                required
                @keypress="onInputKeypress"
              />
            </td>
          </tr>
          <tr>
            <td><label for="comments" class="block">Comments</label></td>
            <td colspan="6">
              <input type="text" style="width: 97%" size="100" />
            </td>
          </tr>
        </table>
        <div class="window-buttons-container flex">
          <jqxButton
            ref="buttonSaveChangesOnly"
            class="ml-auto"
            type="submit"
            theme="office"
            @click="() => save(false)"
          >
            Save Changes Only
          </jqxButton>
          <jqxButton
            ref="buttonSavePropagateChanges"
            theme="office"
            style="margin-right: 0.85rem"
            @click="() => save(true)"
          >
            Save and Propagate Changes
          </jqxButton>
        </div>
      </form>
    </div>
  </JqxWindow>
</template>

<script lang="ts">
import { ICMSNavData } from 'irms-shared-types'
import JqxWindow from 'jqwidgets-framework/jqwidgets-vue/vue_jqxwindow.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'

const initialICMSNavData: ICMSNavData = {
  account: 'EE02',
  brokerCommissions: 0,
  chNav: 0,
  comments: '',
  daily_perf: 0,
  date: '2023-04-03',
  fee1: 0,
  fee2: 0,
  fee3: 0,
  fxAdj: 0,
  lead_nav: 0,
  misc: 0,
  nav: 0,
  pnl: 0,
  subred: 0,
}

export default {
  name: 'EditNavWindow',

  components: {
    JqxWindow,
    JqxButton,
  },

  data() {
    return {
      nav: {
        ...initialICMSNavData,
      },
      grid: null,
      state: false,
    }
  },

  methods: {
    open(nav: ICMSNavData, grid) {
      if (this.state) {
        this.$refs.jqxWindow.close()
      }
      this.nav = JSON.parse(JSON.stringify(nav))
      this.grid = grid
      this.$refs.jqxWindow.open()
      const navDate = moment(nav.date).format('DD-MMM-YYYY')
      this.$refs.jqxWindow.setTitle(
        `Edit NAV deails for TD: <b>${navDate}</b> Account: <b>${this.nav.account}</b>`
      )
      setTimeout(() => this.$el.querySelector('input').focus(), 200)
    },

    save(propagate = false) {
      if (!this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity()
        return
      }
      this.setActionButtonsDisabledState(true)
      this.grid
        .update(this.nav, propagate)
        .then(() => {
          this.nav = initialICMSNavData
          this.$refs.jqxWindow.close()
        })
        .finally(() => {
          this.setActionButtonsDisabledState(false)
        })
    },

    onInputKeypress(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        this.save(false)
      }
    },

    setActionButtonsDisabledState(disabled) {
      $(this.$refs.buttonSaveChangesOnly.$el).jqxButton({ disabled })
      $(this.$refs.buttonSavePropagateChanges.$el).jqxButton({ disabled })
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
}
</style>
