<template>
  <div class="icms-nav-grid-container w-full overflow-hidden">
    <div class="flex p-2 gap-2">
      <JqxButton theme="office" @click="getICMSNavData">Reload</JqxButton>
    </div>
    <JqxGrid
      ref="ICMSNavGrid"
      class="icms-nav-grid"
      :altrows="true"
      :columns="columns"
      :columnsheight="25"
      :columnsmenuwidth="0"
      :columnsresize="true"
      editmode="dblclick"
      :enabletooltip="true"
      height="94.6%"
      :rowsheight="24"
      selectionmode="singlerow"
      :sortable="true"
      theme="office"
      width="100%"
      @rowdoubleclick="openEditICMSNavWindow"
    />
  </div>
</template>

<script lang="ts">
import Formatters from '../../helpers/Formatters'
import type { ICMSNavData } from 'irms-shared-types'
import type { UpdateICMSNavRequestBody } from 'irms-shared-types/REST'

import JqxGrid from 'jqwidgets-framework/jqwidgets-vue/vue_jqxgrid.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'
import http from '../../services/http'
import helpers from '../../helpers'
import PageControls from '../../helpers/PageControls'

function navGridColumnHeaderRenderer({ context }) {
  const { datafield, text } = this
  context.title = `${text}\nDBField: ${datafield}`
}

export default {
  name: 'ICMSNavGrid',

  components: {
    JqxGrid,
    JqxButton,
  },

  props: {
    account: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      columns: [
        {
          text: 'Date',
          datafield: 'date',
          width: 95,
          rendered: navGridColumnHeaderRenderer,
          cellsRenderer: Formatters.dateFormatter,
        },
        {
          text: 'Daily Perf',
          datafield: 'daily_perf',
          width: 90,
          rendered: navGridColumnHeaderRenderer,
          cellsRenderer: Formatters.percentFormatter,
        },
        {
          text: 'NAV',
          datafield: 'nav',
          width: 120,
          rendered: navGridColumnHeaderRenderer,
          cellsRenderer: Formatters.currencyFormatter,
        },
        {
          text: 'PnL',
          datafield: 'pnl',
          width: 120,
          rendered: navGridColumnHeaderRenderer,
          cellsRenderer: Formatters.currencyFormatter,
        },
        {
          text: 'Commissions',
          datafield: 'brokerCommissions',
          width: 120,
          rendered: navGridColumnHeaderRenderer,
          cellsRenderer: Formatters.currencyFormatter,
        },
        {
          text: 'Miscellaneous',
          datafield: 'misc',
          width: 120,
          rendered: navGridColumnHeaderRenderer,
          cellsRenderer: Formatters.currencyFormatter,
        },
        {
          text: 'SUB / RED',
          datafield: 'subred',
          width: 120,
          rendered: navGridColumnHeaderRenderer,
          cellsRenderer: Formatters.subRedFormatter,
        },
        {
          text: 'Admin Fee',
          datafield: 'fee1',
          width: 120,
          rendered: navGridColumnHeaderRenderer,
          cellsRenderer: Formatters.currencyFormatter,
        },
        {
          text: 'Management Fee',
          datafield: 'fee2',
          width: 120,
          rendered: navGridColumnHeaderRenderer,
          cellsRenderer: Formatters.currencyFormatter,
        },
        {
          text: 'Incentive Fee',
          datafield: 'fee3',
          width: 120,
          rendered: navGridColumnHeaderRenderer,
          cellsRenderer: Formatters.currencyFormatter,
        },
        {
          text: 'FX Adjustment',
          datafield: 'fxAdj',
          width: 120,
          rendered: navGridColumnHeaderRenderer,
          cellsRenderer: Formatters.currencyFormatter,
        },
        {
          text: 'Administrator NAV',
          datafield: 'chNav',
          width: 130,
          rendered: navGridColumnHeaderRenderer,
          cellsRenderer: Formatters.currencyFormatter,
        },
      ],
    }
  },

  mounted() {
    this.getICMSNavData()
  },

  methods: {
    getICMSNavData() {
      this.$refs.ICMSNavGrid.showloadelement()
      this.$refs.ICMSNavGrid.removesort()
      return http.icms
        .get(`get_navs/${this.account}`)
        .then(({ data: iCMSNavData }) => {
          this.$refs.ICMSNavGrid.source = {
            localdata: iCMSNavData,
            datatype: 'array',
          }
          this.$refs.ICMSNavGrid.updatebounddata('data')
        })
        .catch((error) => {
          console.error(
            'Failed to fetch iCMS Nav data for account',
            this.account,
            error
          )
        })
        .finally(() => {
          this.$refs.ICMSNavGrid.hideloadelement()
        })
    },

    openEditICMSNavWindow({ args }) {
      const AppVue = window.IRMS_APP.$children[0]
      if (AppVue) {
        AppVue.openEditICMSNavWindow(args.row.bounddata, this)
      }
    },

    update(updatedNav: ICMSNavData, propagate = false) {
      const tradeDate = helpers.getDateFromISO(updatedNav.date).split(' ')[0]
      const navRequestBody: UpdateICMSNavRequestBody = {
        admin: updatedNav.fee1,
        adminnav: updatedNav.chNav,
        comissions: updatedNav.brokerCommissions,
        comments: updatedNav.comments,
        fxadj: updatedNav.fxAdj,
        incentive: updatedNav.fee3,
        management: updatedNav.fee2,
        misc: updatedNav.misc,
        nav: updatedNav.nav,
        pnl: updatedNav.pnl,
        propagate,
        subred: updatedNav.subred,
      }

      return http.icms
        .put(`update_nav/${updatedNav.account}/${tradeDate}`, navRequestBody)
        .then(({ data }) => {
          if ('message' in data && window.confirm(data.message)) {
            this.getICMSNavData()
          }
          return Promise.resolve()
        })
        .catch((error) => {
          const errorMessage = 'Failed to update iCMS NAV'
          PageControls.error(errorMessage)
          console.error(errorMessage, error)
          return Promise.reject(error)
        })
    },
  },
}
</script>

<style lang="scss">
.icms-nav-grid div:is([role='row']) {
  &:has(.chnav-not-empty) .jqx-grid-cell {
    background-color: lightblue;
    color: maroon;
  }

  .jqx-grid-cell {
    &:has(.subred-gt-0) {
      background-color: green !important;
    }
    &:has(.subred-lt-0) {
      background-color: red !important;
    }
    &:has(.subred-gt-0, .subred-lt-0) {
      color: #fff !important;
    }
  }
}
</style>
