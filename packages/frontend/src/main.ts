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
import 'jqwidgets-framework/jqwidgets/jqxgrid.columnsresize.js'
import 'jqwidgets-framework/jqwidgets/jqxgrid.sort.js'

// Helpers, load it here so we can globally expose it
import RMSOperations from './helpers/RMSOperations'
import Formatters from './helpers/Formatters'
import ExecuteR from './helpers/ExecuteR'
import helpers from './helpers'
import http from './services/http'
import Risks from './helpers/Risks'
import PageControls from './helpers/PageControls'

const accountProperties: IAccountVar = {
  bookIDMap: [],
  bookIDMapRev: [],
  books: [],
  calculateRisksLive: true,
  configTags: [],
  editingRowID: -1,
  editingRowQty: null,
  excecuteR: new ExecuteR(),
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
  vue: {},
}

const accounts = ['EE02', 'EE04', 'FIXUAT', 'JCMA', 'KRIBMA', 'KRMA']
// Global variable to store and hold each account variable
window.accountsVar = {}
// Initialize current account with first account
window.currentAccount = accounts[0]

// Global string variables
;['cutOrderP', 'cutOrderQ', 'ORDER_GENERATION_CODE'].forEach(
  (_var) => (window[_var] = '')
)

// Populate accountsVar
for (const account of accounts) {
  window.accountsVar[account] = {
    ...accountProperties,
  }
}

// Initialize strategies
window.strategies = []

// Initialize context menu
window.contextMenu = $('#menu').jqxMenu({
  width: 200,
  height: 116,
  autoOpenPopup: false,
  mode: 'popup',
})

// Context menu handler
contextMenu.on('itemclick', async function ({ args: menuITem }) {
  const action = menuITem.dataset.action

  const accountVar = helpers.getAccountVar(currentAccount)
  const selection = $(`#${accountVar.treeGridID}`).jqxTreeGrid('getSelection')
  const row: IRMSBook = selection[0]

  if (!['copy', 'paste', 'delete'].includes(action)) {
    return
  }

  if (action == 'copy') {
    cutOrderQ = row.orderQ
    cutOrderP = row.orderP
    return
  } else if (action == 'paste') {
    row.orderQ = cutOrderQ
    row.orderP = cutOrderP
  } else if (action == 'delete') {
    if (row.rowType == 'contract') {
      alert('Only works on contract rows')
      return
    }
    row.orderQ = null
    row.orderP = null
  }

  const cellData = {
    id: row.id,
    contract: row.contract,
    extension: row.extension || null,
    order_qty: row.orderQ || null,
    order_p: row.orderP || null,
  }

  await http
    .post(`save_cell/${currentAccount}/${accountVar.tradeDate}`, cellData)
    .then(({ data }) => {
      if (parseInt(data.id) == -1) {
        // TODO: Notify failure
        console.error('Data is not saved')
        return
      }
      const index = Risks.GetBookIndexByID(data.id)
      const book = accountVar.books[index]
      book.orderQ = row.orderQ
      book.orderP = row.orderP
      //ComputeRisksRow(index);
      Risks.ComputeRisks()
      $(`#${accountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
      accountVar.editingRowID = -1
      PageControls.success('Risks Updated')
      //if(editingRowID!=-1)
      //$("#treeGrid").jqxTreeGrid('beginRowEdit', editingRowID);
    })
})

window.ignoreStrategies = ''

// Expose RMSOperations functions to global
for (const [prop, val] of Object.entries(RMSOperations)) {
  window[prop] = val
}

window.autoScrollToFirstLine = true
window.filterNonNullCommo = Formatters.filterNonNullCommo

window.IRMS_APP = new Vue({
  render: (h) => h(App),
}).$mount('#app')

http.irms
  .get('get_irms_config/ORDER_GENERATION_CODE')
  .then(({ data }) => {
    ORDER_GENERATION_CODE = data.content
  })
  .catch((error) => {
    console.error('Failed to fetch ORDER_GENERATION_CODE config', error)
  })
