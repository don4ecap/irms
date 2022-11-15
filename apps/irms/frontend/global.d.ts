import ExecuteR from './src/helpers/ExecuteR'

/* eslint-disable no-var */
declare global {
  // interface Window {
  //   accountsVar: IAccountsVarMap
  //   currentAccountVar: IAccountVar
  // }

  var strategies: Array<string>

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
  var cutOrderQ: string
  var cutOrderP: string

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
