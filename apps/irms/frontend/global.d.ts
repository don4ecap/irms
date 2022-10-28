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
    books: Array<any>
    calculateRisksLive: boolean
    configTags: []
    editingRowID: number
    editingRowQty: any
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
  }

  interface IAccountsVarMap {
    [key: string]: IAccountVar
  }

  var $: any
  var accounting: any
  var accountsVar: IAccountsVarMap
  var contextMenu: any
  var currentAccount: string
  var currentAccountVar: IAccountVar
  var moment: any
}

export {}
