import Vue from 'vue'
import App from './App.vue'
import './styles/main.scss'

const accountProperties: IAccountVar = {
  books: [],
  bookIDMap: [],
  bookIDMapRev: [],
  calculateRisksLive: true,
  configTags: [],
  forceRenderedOnce: true,
  indLevel: [],
  pnlUSD: {},
  showNonNull: false,
  spdRisks: {},
  portfolio: {},
  spdRiskOffsets: {},
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

new Vue({
  render: (h) => h(App),
}).$mount('#app')
