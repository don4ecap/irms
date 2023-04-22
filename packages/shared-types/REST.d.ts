/** Request body structure to update iCMS NAV */
export interface UpdateICMSNavRequestBody {
  admin: number
  adminnav: number
  comissions: number
  comments: string
  fxadj: number
  incentive: number
  management: number
  misc: number
  nav: number
  pnl: number
  propagate: boolean
  subred: number
}

export interface GetPortfolioResponseBody {
  positions_pct_target: number
  qty: number
  current_allocation_pct: number
  current_allocation_lots: number
  target_allocation_pct: number
  target_allocation_lots: number
  current_risks_pre: number
  target_risks_pre: number

  // Extended fields, added in frontend side
  display?: string
  rowType?: string
  parent?: any
}
