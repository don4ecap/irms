export interface CommonRequestParams {
  account: string
  trade_date: string
}

export interface DeleteSingleParams extends CommonRequestParams {
  contract: string
  extension: string
}

export interface DeleteCommodityParams extends CommonRequestParams {
  commodity: string
  extension: string
}

export interface AccountOnlyParams {
  account: string
}

export interface GetConfigField {
  config_field_name: string
}

export interface SaveCellBody {
  id: number
  contract: string
  extension: string
  order_qty: string
  order_p: string
}

export interface OrderContractsBody {
  contract1: string
  contract2: string
  extension: string
}
