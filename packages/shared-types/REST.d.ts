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
