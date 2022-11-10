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
        <span id="tag1"></span>
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
import API from '../services/api'

import JqxWindow from 'jqwidgets-framework/jqwidgets-vue/vue_jqxwindow.vue'
import JqxGrid from 'jqwidgets-framework/jqwidgets-vue/vue_jqxgrid.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'

export default {
  name: 'PreviewAllOrdersWindow',

  components: {
    JqxWindow,
    JqxButton,
    // eslint-disable-next-line vue/no-unused-components
    JqxGrid,
  },

  data() {
    return {
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
        .then(async ({ data }) => {
          const orders = await this.buildPreview(this.sector || '', data)

          this.$refs.currentWindow.open()

          const sourcePreview = {
            localdata: orders,
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

    async buildPreview(sector: string, existingOrders: Array<any>) {
      let sectorRows

      if (sector === '') {
        sectorRows = currentAccountVar.books
      } else {
        sectorRows = currentAccountVar.books.filter(
          (book) => book.sector === sector
        )
      }

      let ignoreStrategies = 'CHECK'
      let excluded = 0
      let excludedStrategy = 0

      const orders = []

      let j = 0
      for (let i = 0; i < sectorRows.length; i++) {
        const sectorRow = sectorRows[i]

        if (sectorRow.orderQ == '' || sectorRow.orderQ == null) {
          continue
        }

        const quantities = sectorRow.orderQ.split(';')
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
          const account = sectorRow.account
          const { commo, extension, instrument } = sectorRow
          let contract = sectorRow.contract
          let contract_twodigit = sectorRow.contract_twodigit

          const qty = quantities[k]
          let strategy: string, price: string

          if (strategies[k].indexOf('@') != -1) {
            strategy = strategies[k].split('@')[0]
            price = strategies[k].split('@')[1]
          } else {
            strategy = strategies[k]
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

          if (strategy.indexOf('#') != -1) {
            if (strategy.split('#')[1] == '') {
              contract = sectorRow.contract + '-' + strategy.split('#')[1]
            } else {
              let ordered = await API.postOrderContracts(
                sectorRow.contract,
                strategy.split('#')[1],
                extension
              )
              contract =
                ordered[0].contract_onedigit +
                '-' +
                ordered[1].contract_onedigit
              contract_twodigit =
                ordered[0].contract_twodigit +
                '-' +
                ordered[1].contract_twodigit
            }
            strategy = strategy.replace('#' + strategy.split('#')[1], '')
          }

          if (strategy === ignoreStrategies) continue

          let flag = false
          for (let l = 0; l < existingOrders.length; l++) {
            const existingOrder = existingOrders[l]
            if (
              existingOrder.contract == contract &&
              existingOrder.extension == extension &&
              existingOrder.price == price &&
              existingOrder.strategy == strategy
            ) {
              flag = true
              break
            }
          }

          if (flag) {
            excluded++
            continue
          }

          if (strategies.indexOf(strategy) == -1) {
            excludedStrategy++
            // continue
          }

          orders[j] = {
            account,
            commo,
            contract_twodigit,
            contract,
            extension,
            freetext,
            instrument,
            price,
            qty,
            strategy,
          }
          j++
        }
      }

      if (excluded > 0) {
        alert(
          excluded + ' orders have been excluded as they are already in iTrade.'
        )
      }

      console.log(orders)

      return orders
    },

    selectAllRows() {
      $('#preview-orders-grid').jqxGrid('selectallrows')
    },

    open(sector: string) {
      this.sector = sector
      this.initialize()
      const sectorNameEl = this.$refs.currentWindow.$el.querySelector('#tag1')
      if (this.sector?.length) {
        sectorNameEl.textContent = `- ${this.sector}`
      } else {
        sectorNameEl.textContent = ''
      }
    },

    close() {
      this.$refs.currentWindow.close()
    },
  },
}
</script>
