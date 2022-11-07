<template>
  <div id="dynacontainer">
    <JqxWindow
      ref="currentWindow"
      theme="office"
      :min-width="1200"
      :min-height="500"
      :auto-open="false"
    >
      <h2 id="preview-window-header" style="margin: 0">
        Preview Orders
        <span v-show="tag?.length">- {{ tag }}</span>
      </h2>
      <div class="preview-window-content">
        <div class="flex" style="padding: 5px; gap: 0.3rem">
          <JqxButton theme="office" @click="selectAllRows">
            Select All
          </JqxButton>
          <!-- TODO -->
          <JqxButton theme="office">Send to iTrade</JqxButton>
        </div>
        <div id="preview-orders-grid"></div>
      </div>
    </JqxWindow>
  </div>
</template>

<script lang="ts">
import http from '../services/http'

import JqxWindow from 'jqwidgets-framework/jqwidgets-vue/vue_jqxwindow.vue'
import JqxGrid from 'jqwidgets-framework/jqwidgets-vue/vue_jqxgrid.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'

export default {
  name: 'PreviewAllOrdersWindow',

  components: {
    JqxWindow,
    JqxGrid,
    JqxButton,
  },

  data() {
    return {
      tag: '',
      sector: '',
      loading: {
        get: false,
      },
    }
  },

  methods: {
    initialize() {
      if (!currentAccountVar.books.length) return
      this.loading.get = true
      http
        .get(`get_working/${currentAccount}/${currentAccountVar.tradeDate}`)
        .then(({ data }) => {
          this.existingOrders = data
          const orders = this.buildPreview()
          const sourcePreview = {
            localdata: orders ?? [],
            datafields: [
              {
                name: 'contract',
                type: 'number',
              },
              {
                name: 'extension',
                type: 'string',
              },
              {
                name: 'qty',
                type: 'string',
              },
              {
                name: 'strategy',
                type: 'string',
              },
              {
                name: 'price',
                type: 'number',
              },
              {
                name: 'account',
                type: 'number',
              },
              {
                name: 'freetext',
                type: 'number',
              },
              {
                name: 'contract_twodigit',
                type: 'number',
              },
              {
                name: 'commo',
                type: 'string',
              },
              {
                name: 'instrument',
                type: 'string',
              },
            ],
            datatype: 'array',
          }

          const dataAdapter = new $.jqx.dataAdapter(sourcePreview)
          $('#preview-orders-grid').jqxGrid({
            // width: 1150,
            // autoheight: true,
            autowidth: true,
            theme: 'office',
            source: dataAdapter,
            columns: [
              {
                text: 'Contract',
                datafield: 'contract',
              },
              {
                text: 'Extension',
                datafield: 'extension',
              },
              {
                text: 'Quantity',
                datafield: 'qty',
              },
              {
                text: 'Strategy',
                datafield: 'strategy',
                cellsalign: 'center',
                width: 200,
              },
              {
                text: 'Price',
                datafield: 'price',
              },
              {
                text: 'FreeText',
                datafield: 'freetext',
                width: 150,
              },
              {
                text: 'Account',
                datafield: 'account',
                width: 150,
              },
            ],
            selectionmode: 'multiplerowsextended',
          })

          $('#jqxwindow').on('close', (event) => {
            $('#preview-orders-grid').jqxGrid('destroy')
          })
        })
        .finally(() => {
          this.loading.get = false
        })
    },

    buildPreview() {
      const sector = this.sector
      let sectorRows = currentAccountVar.books.filter(
        (book) => book.sector === this.sector
      )
      if (this.sector === '') {
        sectorRows = currentAccountVar.books
      }

      // ignoreStrategies = 'CHECK'
      let excluded = 0
      let excludedStrategy = 0
      const existingOrders = this.existingOrders

      const orders = []
      let j = 0
      for (let i = 0; i < sectorRows.length; i++) {
        const sectorRow = sectorRows[i]
        let quantities = sectorRow.orderQ

        if (quantities == '' || quantities == null) {
          continue
        }

        quantities = quantities.split(';')
        const strategies = sectorRow.orderP.split(';')

        if (quantities.length > strategies.length) {
          const msg = `You have more quantities than strategies for ${sectorRow.contract} ${sectorRow.extension}`
          alert(msg)
          console.log(msg)
          return
        }

        if (quantities.length < strategies.length) {
          const msg = `You have more strategies than quantities for ${sectorRow.contract} ${sectorRow.extension}`
          alert(msg)
          console.log(msg)
          return
        }

        for (let k = 0; k < quantities.length; k++) {
          const account = currentAccount
          const { commo, extension, instrument } = sectorRow
          let contract = sectorRow.contract
          let contract_twodigit = sectorRow.contract_twodigit

          const q = quantities[k]
          let strat, price

          if (strategies[k].indexOf('@') != -1) {
            strat = strategies[k].split('@')[0]
            price = strategies[k].split('@')[1]
          } else {
            strat = strategies[k]
            price = '0'
          }

          let freetext
          if (price.indexOf('/') != -1) {
            freetext = price.split('/')[1]
            price = price.split('/')[0]
          } else {
            freetext = ''
          }

          if (isNaN(parseFloat(price))) {
            freetext = price
            price = '0'
          }

          let ordered
          if (strat.indexOf('#') != -1) {
            //contract = sectorRow.contract + "-" + strat.split('#')[1];
            if (strat.split('#')[1] == '') {
              contract = sectorRow.contract + '-' + strat.split('#')[1]
            } else {
              // TODO:
              ordered = this.existingOrders
              // ordered = JSON.parse(
              //   api.ordercontracts(sectorRow.contract, strat.split('#')[1]),
              //   extension
              // )
              if (ordered.length) {
                contract =
                  ordered[0].contract_onedigit +
                  '-' +
                  ordered[1].contract_onedigit
                contract_twodigit =
                  ordered[0].contract_twodigit +
                  '-' +
                  ordered[1].contract_twodigit
              }
            }
            strat = strat.replace('#' + strat.split('#')[1], '')
          }
          const a: any = {}
          if (strat === window.ignoreStrategies) continue
          let flag = false
          // @ts-ignore
          for (let l = 0; l < existingOrders.length; l++) {
            const existingOrder = existingOrders[l]
            if (
              existingOrder.contract == contract &&
              existingOrder.extension == extension &&
              existingOrder.price == price &&
              existingOrder.strategy == strat
            ) {
              flag = true
              break
            }
          }

          if (flag) {
            excluded++
            continue
          }

          if (strategies.indexOf(strat) == -1) {
            excludedStrategy++
            continue
          }

          a.contract = contract
          a.extension = extension
          a.account = account
          a.qty = q
          a.strategy = strat
          a.price = price
          a.freetext = freetext
          a.contract_twodigit = contract_twodigit
          a.commo = commo
          a.instrument = instrument
          orders[j] = a
          j = j + 1
        }
      }

      if (excluded > 0) {
        alert(
          excluded + ' orders have been excluded as they are already in iTrade.'
        )
      }
      return orders
    },

    selectAllRows() {
      $('#preview-orders-grid').jqxGrid('selectallrows')
    },

    open() {
      this.$refs.currentWindow.open()
      this.initialize()
    },

    close() {
      this.$refs.currentWindow.close()
    },
  },
}
</script>
