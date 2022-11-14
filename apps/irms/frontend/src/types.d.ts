declare type RendererCallback = (
  row: number,
  dataField: string,
  cellValue: string,
  rowData: IRMSBook,
  cellText: string
) => string

declare interface IRMSBook {
  account: string
  ccy: string
  comment: string
  commo: string
  contract: string
  current_allocation_delta: number
  current_allocation_lots: number
  current_allocation_pct_notional: number
  current_allocation_pct: number
  current_option_delta: number
  current_risks_post: number
  current_risks_pre: number
  current_sigma: number
  display: string
  expiry4E: string
  extension: string
  first_notice_date: string
  gamma: number
  gl_factor: number
  hedge_ratio: number
  id: string | number
  instrument: string
  last_fx: number
  last_nav: number
  last_price: number
  last_trade_date: string
  live_fx: number
  live_nav: number
  marketStatus: string
  month: string
  notice4E: string
  orderNo: number
  orderP: string
  orderQ: string
  parent: string | number
  positions_pct_current: number
  positions_pct_target_notional: number
  positions_pct_target: number
  qty: number
  rowType: string
  sector: string
  settlement_available: string
  settlement: number
  target_allocation_delta: number
  target_allocation_lots: number
  target_allocation_pct_notional: number
  target_allocation_pct: number
  target_option_delta: number
  target_risks_post: number
  target_risks_pre: number
  target_sigma: number
  td: string
  ticker: string
  underlying: string
  valid: boolean
  valuept: string
  vega: number
  year: number
}