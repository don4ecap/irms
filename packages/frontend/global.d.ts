import ExecuteR from './src/helpers/ExecuteR'
import * as Vue from 'vue/types/umd'

/* eslint-disable no-var */

interface Alarm {
  alertHigh: number
  alertLow: number
  contract: string
  currentValue: string
  enabled: boolean
  field: string
  highDirty: string
  lowDirty: string
  numTriggers: number
  reached: boolean
  tablerownames: string
}

// interface Contract {
//   some: string
// }

declare global {
  // interface Window {
  //   accountsVar: IAccountsVarMap
  //   currentAccountVar: IAccountVar
  // }

  /** Vue instance of main app. Need to be exposed at
   * the global object so easier to access from anywhere
   */
  var IRMS_APP: Vue

  var autoScrollToFirstLine: boolean

  var strategies: Array<string>

  var alarms: Array<Alarm>

  // var contracts: Array<Contract>

  interface IAccountVar {
    bookIDMap: Array<number>
    bookIDMapRev: Array<number>
    books: Array<IRMSBook>
    calculateRisksLive: boolean
    configTags: []
    editingRowID: number
    editingRowQty: any
    excecuteR: ExecuteR
    fixings: []
    forceRenderedOnce: boolean
    indLevel: []
    inputEl: HTMLInputElement
    isEdited: boolean
    pnlUSD: any
    portfolio: any
    showNonNull: boolean
    spdRiskOffsets: any
    spdRisks: any
    tradeDate: Date | string
    treeGridID: string
    vue: any
  }

  interface IAccountsVarMap {
    [key: string]: IAccountVar
  }

  var $: any
  var accounting: any
  var accountsVar: IAccountsVarMap
  var alertify: any
  var contextMenu: any
  var currentAccount: string
  // var currentAccountVar: IAccountVar
  var ignoreStrategies: string
  var moment: any
  var previewAllOrdersWindow: any
  var previewSingleOrderWindow: any
  var alarmWindow: any
  var cutOrderQ: string
  var cutOrderP: string
  var ORDER_GENERATION_CODE: string

  // Global functions
  function DeleteSector(sector: string)
  function DeleteSingle(contract: string, extension: string, id: string)
  function DeleteCommodity(
    commodity: string,
    extension: string,
    instrument: string
  )
  function filterNonNullCommo(commo, extension, instrument, expandEl)
}

export {}
