<template>
  <div id="dynacontainer">
    <JqxWindow
      ref="currentWindow"
      theme="office"
      :min-width="1200"
      :min-height="500"
      :auto-open="false"
    >
      <h2 id="preview-single-window-header" style="margin: 0">Order Details</h2>
      <div class="preview-window-content single-order-preview">
        <div class="orders-container flex-grow overflow-hidden">
          <form ref="formAddOrder" class="item" @submit.prevent="add">
            <input type="checkbox" disabled />
            <input
              ref="addOrderQuantityField"
              v-model="newOrder.qty"
              type="number"
              step="any"
              placeholder="Quantity"
              required
            />
            <input
              v-model="newOrder.strategy"
              type="text"
              placeholder="Strategy"
              name="order_strategy"
              required
            />
            <input
              v-model="newOrder.price"
              type="number"
              step="any"
              placeholder="Price"
            />
            <input
              v-model="newOrder.freetext"
              type="text"
              placeholder="Freetext"
            />
            <input
              type="submit"
              hidden
              aria-hidden="true"
              style="display: none"
              value=""
            />
            <div>
              <div style="min-width: 800px"></div>
              <jqxButton
                type="submit"
                class="btn-add"
                theme="office"
                @click="add"
              >
                ADD
              </jqxButton>
            </div>
          </form>
          <hr class="hr" />

          <div class="orders-container orders-list">
            <div v-for="(order, index) in orders" :key="index" class="item">
              <input v-model="order.selected" type="checkbox" />
              <input
                v-model="order.qty"
                type="number"
                step="any"
                placeholder="Quantity"
              />
              <input
                v-model="order.strategy"
                type="text"
                placeholder="Strategy"
                autocomplete="order_strategy"
              />
              <input
                v-model="order.price"
                type="number"
                placeholder="Price"
                step="any"
              />
              <input
                v-model="order.freetext"
                type="text"
                placeholder="Freetext"
              />
              <div class="flex" style="gap: 0.4rem">
                <jqxButton
                  class="btn-split w-full"
                  theme="office"
                  @click="split(order)"
                >
                  SPLIT
                </jqxButton>
                <jqxButton
                  class="btn-duplicate w-full"
                  theme="office"
                  @click="duplicate(order)"
                >
                  DUPLICATE
                </jqxButton>
                <jqxButton
                  class="btn-delete w-full"
                  theme="office"
                  @click="remove(index)"
                >
                  DELETE
                </jqxButton>
              </div>
            </div>
          </div>

          <hr class="hr" />

          <div class="order-details mt-auto">
            <input
              type="text"
              :value="quantities"
              disabled
              placeholder="Quantities"
              title="Quantities"
            />
            <input
              type="text"
              :value="strategies"
              disabled
              placeholder="Strategies"
              title="Strategies"
            />
          </div>
        </div>

        <div class="orders-buttons-container flex">
          <jqxButton
            theme="office"
            title="Reset the orders to the original one"
            @click="reset"
          >
            RESET
          </jqxButton>
          <jqxButton theme="office" @click="save">
            {{ loading.update ? 'UPDATING...' : 'UPDATE' }}
          </jqxButton>
        </div>
      </div>
    </JqxWindow>
  </div>
</template>

<script lang="ts">
import JqxWindow from 'jqwidgets-framework/jqwidgets-vue/vue_jqxwindow.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'
import helpers from '../helpers'
import Risks from '../helpers/Risks'
import http from '../services/http'
import PageControls from '../helpers/PageControls'
import type { IRMSOrder } from 'irms-shared-types'

const initialNewOrder: IRMSOrder = {
  qty: 1,
  strategy: '',
  price: 1,
  freetext: '',
}

function formatOrder(order: IRMSOrder): IRMSOrder {
  return {
    ...order,
    selected: false,
  }
}

function formatOrders(orders: Array<IRMSOrder>): Array<IRMSOrder> {
  return orders.map(formatOrder)
}

export default {
  name: 'PreviewSingleDialog',

  components: {
    JqxWindow,
    JqxButton,
  },

  data() {
    return {
      rowID: 0,
      origin: {
        strategy: '',
        quantity: '',
      },
      originalOrders: [],
      orders: [],
      newOrder: { ...initialNewOrder },
      loading: {
        update: false,
      },
    }
  },

  computed: {
    quantities() {
      return helpers.getOrderStrategyString(this.orders).quantity
    },

    strategies() {
      return helpers.getOrderStrategyString(this.orders).strategy
    },
  },

  methods: {
    open(rowID: number) {
      this.$refs.currentWindow.open()
      this.rowID = rowID
      const accountVar = helpers.getAccountVar(currentAccount)

      if (!accountVar.books.length) return

      const currentBook = accountVar.books.find(
        (book) => book.id === rowID.toString()
      )

      this.origin.quantity = currentBook.orderQ
      this.origin.strategy = currentBook.orderP

      const parsedOrders =
        helpers.parseOrder(currentBook.orderQ, currentBook.orderP) || []

      this.orders = formatOrders(parsedOrders)
      this.originalOrders = formatOrders(parsedOrders)

      setTimeout(() => this.$refs.addOrderQuantityField.focus(), 100)
    },

    validateOrder(order: IRMSOrder) {
      return order.qty !== 0 && order.strategy.trim().length
    },

    add() {
      const newOrderToAdd = formatOrder(this.newOrder)
      const formAddOrder = this.$refs.formAddOrder as HTMLFormElement
      if (!this.validateOrder(newOrderToAdd) || !formAddOrder.checkValidity()) {
        formAddOrder.reportValidity()
        return
      }
      this.orders.push(newOrderToAdd)
      this.newOrder = formatOrder(initialNewOrder)
    },

    duplicate(order: IRMSOrder) {
      this.orders.push(formatOrder(order))
    },

    split(order: IRMSOrder) {
      const newOrder = formatOrder(order)

      if (Math.abs(order.qty) === 1) {
        this.duplicate(newOrder)
        return
      } else if (order.qty % 2 === 0) {
        const divided = order.qty / 2
        order.qty = Math.round(divided) || 1
        newOrder.qty = Math.round(divided) || 1
      } else {
        const firstQty = order.qty - Math.round(order.qty / 2)
        const secondQty = order.qty - firstQty
        order.qty = Math.round(firstQty) || 1
        newOrder.qty = Math.round(secondQty) || 1
      }

      this.duplicate(newOrder)
    },

    save() {
      this.loading.update = true
      const accountVar = helpers.getAccountVar(currentAccount)
      const bookIndex = Risks.GetBookIndexByID(this.rowID)
      const book = accountVar.books[bookIndex]

      const cellData = {
        id: book.id,
        contract: book.contract,
        extension: book.extension || null,
        order_qty: this.quantities || null,
        order_p: this.strategies || null,
      }

      http.irms
        .post(`save_cell/${currentAccount}/${accountVar.tradeDate}`, cellData)
        .then(({ data }) => {
          if (parseInt(data.id) == -1) {
            // TODO: Notify failure
            console.error('Data is not saved')
            return
          }
          book.orderQ = this.quantities
          book.orderP = this.strategies
          //ComputeRisksRow(bookIndex);
          console.time('Saving data')
          Risks.ComputeRisks()
          $(`#${accountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
          console.timeEnd('Saving data')
          PageControls.success('Risks updated')
          this.close()
        })
        .catch((error) => {
          console.error('Failed to save cell.', '\nError:', error)
        })
        .finally(() => {
          this.loading.update = false
        })
    },

    remove(index: number) {
      this.orders.splice(index, 1)
    },

    reset() {
      this.orders = formatOrders(this.originalOrders)
    },

    close() {
      this.$refs.currentWindow.close()
    },
  },
}
</script>
