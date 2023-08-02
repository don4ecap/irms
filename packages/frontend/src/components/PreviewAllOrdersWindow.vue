<template>
  <JqxWindow
    ref="currentWindow"
    :auto-open="false"
    :is-modal="true"
    :min-width="1200"
    :min-height="500"
    @close="onWindowClosed"
    theme="office"
  >
    <h3 id="preview-window-header" style="margin: 0">
      Preview All Orders - <span id="preview-window-account"></span>
      <span id="tag1"></span>
    </h3>
    <div class="preview-window-content">
      <div class="flex" style="padding: 5px; gap: 0.3rem">
        <JqxButton ref="btnSelectAl" theme="office" @click="selectAllRows">
          Select All
        </JqxButton>
        <JqxButton ref="btnSendToItrade" theme="office" @click="sendToItrade">
          Send to iTrade
        </JqxButton>
      </div>
      <JqxGrid
        ref="previewOrdersGrid"
        :altrows="true"
        :columns="columns"
        :columnsheight="25"
        height="100%"
        :rowsheight="24"
        selectionmode="multiplerowsextended"
        :source="adapter"
        theme="office"
        width="100%"
      />
    </div>
  </JqxWindow>
</template>

<script lang="ts">
import http from '../services/http'
import helpers from '../helpers'

import JqxWindow from 'jqwidgets-framework/jqwidgets-vue/vue_jqxwindow.vue'
import JqxGrid from 'jqwidgets-framework/jqwidgets-vue/vue_jqxgrid.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'
import PageControls from '../helpers/PageControls'
import type { IRMSBook } from 'irms-shared-types'

let previousSector = ''

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
      // @ts-ignore
      // eslint-disable-next-line no-undef
      adapter: new jqx.dataAdapter(this.source),
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
    }
  },

  beforeCreate() {
    // @ts-ignore
    this.source = {
      localdata: [],
      datatype: 'array',
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
    }
  },

  methods: {
    initialize(skipOrderedCountInfo = false) {
      const accountVar = helpers.getAccountVar(currentAccount)
      this.$refs.previewOrdersGrid.showloadelement()
      this.disableComponents()
      http.irms
        .get(`getWorkingOrders/${currentAccount}/${accountVar.tradeDate}`)
        .then(async ({ data }) => {
          const orders = await this.buildPreview(
            this.sector || '',
            data.data,
            skipOrderedCountInfo
          )
          this.$refs.previewOrdersGrid.source = {
            localdata: orders,
            datatype: 'array',
          }
          this.$refs.previewOrdersGrid.updatebounddata('data')
        })
        .finally(() => {
          this.$refs.previewOrdersGrid.hideloadelement()
          this.enableComponents()
        })
    },

    async buildPreview(
      sector: string,
      existingOrders: Array<any>,
      skipOrderedCountInfo = false
    ) {
      let sectorRows = [] as Array<IRMSBook>
      const accountVar = helpers.getAccountVar(currentAccount)

      let books = accountVar.books

      if (!books || books?.length < 1) {
        const getBookResp = await http.irms.get(
          `getBook/${currentAccount}/${accountVar.tradeDate}`
        )
        books = getBookResp.data?.data as Array<IRMSBook>
      }

      if (sector === '') {
        sectorRows = books
      } else {
        sectorRows = books.filter((book) => book.sector === sector)
      }

      let ignoreStrategies = 'CHECK'
      let excluded = 0
      // let excludedStrategy = 0

      const orders = []

      let j = 0
      for (let i = 0; i < sectorRows.length; i++) {
        const sectorRow = sectorRows[i]

        if (sectorRow.orderQ == '' || sectorRow.orderQ == null) {
          continue
        }

        if (typeof sectorRow.orderQ === 'number') {
          sectorRow.orderQ = (sectorRow.orderQ as number).toString()
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
            const frontContract = sectorRow.contract
            const backContract = strategy.split('#')[1]

            if (backContract == '') {
              contract = frontContract + '-' + backContract
            } else {
              let ordered = await http.irms.postOrderContracts(
                frontContract,
                backContract,
                extension
              )
              if (ordered.length < 2) {
                const errorMessage = `Post order contract of ${frontContract} failed, the data should have 2 rows but got ${ordered.length}`
                console.warn(errorMessage)
                continue
              }
              contract = `${frontContract}-${backContract}`

              const frontContract2 = ordered
                .filter((row) => row.contract_onedigit === frontContract)
                .map((row) => row.contract_twodigit)

              if (ordered.length > 1) {
                const backContract2 = ordered
                  .filter((row) => row.contract_onedigit === backContract)
                  .map((row) => row.contract_twodigit)

                contract_twodigit = `${frontContract2[0]}-${backContract2[0]}`
              } else {
                contract_twodigit = frontContract2
              }
            }
            strategy = strategy.replace('#' + backContract, '')
          }

          if (strategy === ignoreStrategies) continue

          let flag = false
          for (let l = 0; l < existingOrders.length; l++) {
            const existingOrder = existingOrders[l] as IRMSBook
            if (
              existingOrder.contract == contract &&
              existingOrder.extension == extension &&
              existingOrder.price.toString() == price &&
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

          // if (strategies.indexOf(strategy) == -1) {
          // excludedStrategy++
          // continue
          // }

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

      if (excluded > 0 && !skipOrderedCountInfo) {
        PageControls.log(
          `${excluded} orders have been excluded as they are already in iTrade`,
          6500
        )
      }

      return orders
    },

    selectAllRows() {
      this.$refs.previewOrdersGrid.selectallrows()
    },

    async sendToItrade() {
      const account = currentAccount
      const accountVar = accountsVar[account]
      const selected =
        this.$refs.previewOrdersGrid.getselectedrowindexes() as Array<number>

      if (selected.length < 1) {
        return
      }

      const rows = this.$refs.previewOrdersGrid.getrows() as Array<any>

      let sentOrdersCount = 0
      let unsentOrdersCount = 0
      // const indexesToRemove = []

      this.disableComponents()
      const sendOrderPromises = selected.map((selectedIndex) => {
        const order = rows[selectedIndex] as IRMSBook
        const dataToSend = {
          // index: selectedIndex,
          account: currentAccount,
          tradeDate: accountVar.tradeDate,
          commo: order.commo,
          contract: order.contract,
          contract_twodigit: order.contract_twodigit,
          extension: order.extension,
          freetext: order.freetext,
          instrument: order.instrument,
          price: order.price,
          qty: order.qty,
          strategy: order.strategy,
        }

        return http.irms
          .post('sendToItrade', dataToSend)
          .then(() => {
            sentOrdersCount++
          })
          .catch((error) => {
            unsentOrdersCount++
            console.error('Failed to send order to itrade', error)
          })
      })

      Promise.all(sendOrderPromises).finally(() => {
        let plural: string

        if (sentOrdersCount > 0) {
          plural = sentOrdersCount > 1 ? 'orders' : 'order'
          PageControls.log(
            `Successfuly sent ${sentOrdersCount} ${plural} to iTrade`,
            60000
          )
        }

        if (unsentOrdersCount > 0) {
          plural = unsentOrdersCount > 1 ? 'orders' : 'order'
          PageControls.error(
            `Failed to send ${unsentOrdersCount} ${plural} to iTrade`
          )
        }

        this.enableComponents()
        this.$refs.previewOrdersGrid.clearselection()
        this.initialize(true)
      })
    },

    disableComponents() {
      this.$refs.btnSelectAl.disabled = true
      this.$refs.btnSendToItrade.disabled = true
      this.$refs.previewOrdersGrid.disabled = true
    },

    enableComponents() {
      this.$refs.btnSelectAl.disabled = false
      this.$refs.btnSendToItrade.disabled = false
      this.$refs.previewOrdersGrid.disabled = false
    },

    open(sector: string) {
      this.sector = sector
      const sectorNameEl = this.$refs.currentWindow.$el.querySelector('#tag1')
      if (this.sector?.length) {
        sectorNameEl.textContent = ` - ${this.sector}`
      } else {
        sectorNameEl.textContent = ''
      }
      const previewWindowAccountEl = this.$refs.currentWindow.$el.querySelector(
        '#preview-window-account'
      )
      if (previewWindowAccountEl) {
        previewWindowAccountEl.textContent = currentAccount
      }
      this.$refs.currentWindow.open()
      this.initialize()
    },

    onWindowClosed() {
      this.$refs.previewOrdersGrid.clearselection()
    },

    // close() {
    //   this.$refs.currentWindow.close()
    // },
  },
}
</script>
