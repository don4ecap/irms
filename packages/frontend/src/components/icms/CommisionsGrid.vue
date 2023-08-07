<template>
  <div
    class="icms-commissions-grid-container w-full flex flex-column overflow-hidden"
  >
    <div class="flex p-2 gap-2">
      <JqxButton
        ref="btnInsert"
        theme="office"
        @click="openAddICMSCommissionWindow"
      >
        Insert Commodity Fees
      </JqxButton>
      <JqxButton ref="btnReload" theme="office" @click="getICMSCommissionsData">
        Reload
      </JqxButton>
      <JqxButton ref="btnExport" theme="office" @click="exportToXLS">
        Export as XLS
      </JqxButton>
    </div>
    <JqxGrid
      ref="ICMSCommissionsGrid"
      class="icms-commissions-grid"
      :altrows="true"
      :columns="columns"
      :columnsheight="25"
      :columnsmenuwidth="0"
      :columnsresize="true"
      editmode="dblclick"
      :enabletooltip="true"
      height="100%"
      :rowsheight="24"
      selectionmode="singlerow"
      :sortable="true"
      theme="office"
      width="100%"
      @rowdoubleclick="openEditICMSCommissionWindow"
    />
  </div>
</template>

<script lang="ts">
import http from '../../services/http'
import JqxGrid from 'jqwidgets-framework/jqwidgets-vue/vue_jqxgrid.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'

function columnHeaderRenderer({ context }) {
  const { datafield, text } = this
  context.title = `${text}\nDBField: ${datafield}`
}

export default {
  name: 'ICMSCommissionsGrid',

  components: {
    JqxButton,
    JqxGrid,
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
          text: 'Commo',
          datafield: 'commodity',
          width: 65,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
        {
          text: 'Extension',
          datafield: 'extension',
          width: 85,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
        {
          text: 'Instrument',
          datafield: 'instrument',
          width: 200,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
        {
          text: 'SLE',
          datafield: 'sle',
          width: 85,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
        {
          text: 'Currency',
          datafield: 'currency',
          width: 65,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
        {
          text: 'Voice Exec',
          datafield: 'viaVoice',
          width: 75,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
        {
          text: 'GL Exec',
          datafield: 'viaGL',
          width: 65,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
        {
          text: 'Clearing Only',
          datafield: 'clearingOnly',
          width: 85,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
        {
          text: 'Phone(Ex. Fees)',
          datafield: 'phoneExcludingFees',
          width: 100,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
        {
          text: 'DMA (Ex. Fees)',
          datafield: 'dmaExcludingFees',
          width: 100,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
        {
          text: 'Exchange Fees',
          datafield: 'exchangeFees',
          width: 100,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
        {
          text: 'Phone (Incl. Fees)',
          datafield: 'phoneIncludingFees',
          width: 100,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
        {
          text: 'DMA (Incl. Fees)',
          datafield: 'dmaIncludingFees',
          width: 100,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
        {
          text: 'Account',
          datafield: 'account',
          width: 65,
          cellsalign: 'center',
          rendered: columnHeaderRenderer,
        },
      ],
    }
  },

  mounted() {
    this.getICMSCommissionsData()
  },

  methods: {
    getICMSCommissionsData() {
      this.$refs.ICMSCommissionsGrid.showloadelement()
      this.disableComponents()
      this.$refs.ICMSCommissionsGrid.removesort()
      return http.icms
        .get(`getCommissions/${this.account}`)
        .then(({ data }) => {
          const ICMSCommissionsData = data.data
          this.$refs.ICMSCommissionsGrid.source = {
            localdata: ICMSCommissionsData,
            datatype: 'array',
          }
          this.$refs.ICMSCommissionsGrid.updatebounddata('data')
        })
        .catch((error) => {
          console.error(
            'Failed to fetch iCMS Commissions data for account',
            this.account,
            error
          )
        })
        .finally(() => {
          this.$refs.ICMSCommissionsGrid.hideloadelement()
          this.enableComponents()
        })
    },

    openAddICMSCommissionWindow() {
      const AppVue = window.IRMS_APP.$children[0]
      AppVue?.openAddICMSCommissionsWindow(
        this.account,
        this.getICMSCommissionsData
      )
    },

    openEditICMSCommissionWindow({ args }) {
      const AppVue = window.IRMS_APP.$children[0]
      AppVue?.openEditICMSCommissionsWindow(
        args.row.bounddata,
        this.getICMSCommissionsData
      )
    },

    exportToXLS() {
      const date = moment(Date.now()).format('DD MMM YYYY')
      $(this.$refs.ICMSCommissionsGrid.$el).jqxGrid(
        'exportdata',
        'xls',
        `iCMS Commission Data for ${this.account} - ${date}`,
        true,
        null,
        true,
        `${import.meta.env.VITE_IRMS_BACKEND_URL}/exportFile`
      )
    },

    enableComponents() {
      this.$refs.btnInsert.disabled = false
      this.$refs.btnReload.disabled = false
      this.$refs.btnExport.disabled = false
      this.$refs.ICMSCommissionsGrid.disabled = false
    },

    disableComponents() {
      this.$refs.btnInsert.disabled = true
      this.$refs.btnReload.disabled = true
      this.$refs.btnExport.disabled = true
      this.$refs.ICMSCommissionsGrid.disabled = true
    },
  },
}
</script>

<style lang="scss">
.icms-commissions-grid .jqx-grid-column-header-office > div > div > span {
  text-align: center;
  display: block;
}
</style>
