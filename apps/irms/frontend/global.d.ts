/* eslint-disable no-var */
declare global {
  interface Window {
    accountsVar: IAccountsVarMap
    currentAccountVar: IAccountVar
  }

  var strategies: Array<string>

  interface IAccountVar {
    bookIDMap: Array<number>
    bookIDMapRev: Array<number>
    books: Array<any>
    calculateRisksLive: boolean
    configTags: []
    forceRenderedOnce: boolean
    indLevel: []
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

  var accountsVar: IAccountsVarMap
  var currentAccountVar: IAccountVar
  var accounting: any
  var moment: any
}

export {}
