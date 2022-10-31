import Vue from 'vue'
//@ts-ignore
import App from './App.vue'
import './styles/jqwidgets/jqx.base.css'
import './styles/jqwidgets/jqx.four-elements.css'
import './styles/main.scss'
import 'jqwidgets-framework/jqwidgets/jqxmenu.js'
import 'jqwidgets-framework/jqwidgets/jqxinput.js'
import 'jqwidgets-framework/jqwidgets/jqxwindow.js'
import 'jqwidgets-framework/jqwidgets/jqxgrid.js'
import 'jqwidgets-framework/jqwidgets/jqxgrid.selection.js'

const accountProperties: IAccountVar = {
  bookIDMap: [],
  bookIDMapRev: [],
  books: [],
  calculateRisksLive: true,
  configTags: [],
  editingRowID: -1,
  editingRowQty: null,
  fixings: [],
  forceRenderedOnce: false,
  indLevel: [],
  inputEl: null,
  isEdited: false,
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
// Initialize current account with first account
window.currentAccount = accounts[0]

// Populate accountsVar
for (const account of accounts) {
  window.accountsVar[account] = {
    ...accountProperties,
  }
}

// Initialize currentAccountVar with first account
window.currentAccountVar = window.accountsVar[accounts[0]]
// Initialize strategies
window.strategies = []
// Initialize context menu
window.contextMenu = $('#menu').jqxMenu({
  width: 200,
  height: 116,
  autoOpenPopup: false,
  mode: 'popup',
})
window.ignoreStrategies = ''

new Vue({
  render: (h) => h(App),
}).$mount('#app')
