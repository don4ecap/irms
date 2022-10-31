export interface GetNavRequestParams {
  account: string
  trade_date: string
}

export interface DeleteSingleParams extends GetNavRequestParams {
  contract: string
  extension: string
}

export interface AccountOnlyParams {
  account: string
}

export interface SaveCellBody {
  id: number
  contract: string
  extension: string
  order_qty: string
  order_p: string
}
