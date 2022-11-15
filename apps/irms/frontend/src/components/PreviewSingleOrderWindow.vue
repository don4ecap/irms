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
        <div class="orders-container flex-grow">
          <div v-for="(order, index) in orders" :key="index" class="item">
            <input v-model="order.qty" type="number" placeholder="Quantity" />
            <input
              v-model="order.strategy"
              type="text"
              placeholder="Strategy"
              autocomplete="order_strategy"
            />
            <input v-model="order.price" type="number" placeholder="Price" />
            <input
              v-model="order.freetext"
              type="text"
              placeholder="Freetext"
            />
            <jqxButton class="btn-delete" theme="office" @click="remove(index)">
              DELETE
            </jqxButton>
          </div>

          <form
            id="some"
            class="item"
            style="margin-top: 0.5rem"
            @submit.prevent="add"
          >
            <input
              v-model="newOrder.qty"
              type="number"
              placeholder="Quantity"
            />
            <input
              v-model="newOrder.strategy"
              type="text"
              placeholder="Strategy"
              name="order_strategy"
            />
            <input v-model="newOrder.price" type="number" placeholder="Price" />
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
            <jqxButton
              type="submit"
              class="btn-add"
              theme="office"
              @click="add"
            >
              ADD
            </jqxButton>
          </form>

          <div class="order-details">
            <div>Quantity: {{ quantities }}</div>
            <div style="margin-top: 1rem">Strategy: {{ strategies }}</div>
          </div>
        </div>

        <div>
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

const newOrder = {
  qty: '',
  strategy: '',
  price: '',
  freetext: '',
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
      orders: [],
      newOrder: { ...newOrder },
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

      const currentBook = accountVar.books.find((book) => book.id === rowID)

      this.origin.quantity = currentBook.orderQ
      this.origin.strategy = currentBook.orderP

      this.orders =
        helpers.parseOrder(currentBook.orderQ, currentBook.orderP) || []
    },

    add() {
      this.orders.push({ ...this.newOrder })
      this.newOrder = { ...newOrder }
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

      http
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

    close() {
      this.$refs.currentWindow.close()
    },
  },
}
</script>
