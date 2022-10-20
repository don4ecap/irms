import Vue from 'vue'
//@ts-ignore
import App from './App.vue'
import './styles/jqwidgets/jqx.base.css'
import './styles/jqwidgets/jqx.four-elements.css'
import './styles/main.scss'

const accountProperties: IAccountVar = {
  bookIDMap: [],
  bookIDMapRev: [],
  books: [],
  calculateRisksLive: true,
  configTags: [],
  fixings: [],
  forceRenderedOnce: false,
  indLevel: [],
  pnlUSD: {},
  portfolio: {},
  showNonNull: true,
  spdRiskOffsets: {},
  spdRisks: {},
  tradeDate: '',
  treeGridID: '',
}

const accounts = ['EE02', 'EE04', 'FIXUAT', 'JCMA', 'KRIBMA', 'KRMA']
// Global variable to store and hold each account variable
window.accountsVar = {}

// Then initialize and fill them
for (const account of accounts) {
  accountsVar[account] = {
    ...accountProperties,
  }
}

window.currentAccountVar = accountsVar[accounts.at(0)]
window.strategies = []

new Vue({
  render: (h) => h(App),
}).$mount('#app')
