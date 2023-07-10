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

export interface CommonAlertData {
  contract: string
  field: string
  account: string
  comment: string
}

export interface UpdateAlertEnabledBody {
  numTriggers: number
  enabled: boolean
}

export interface UpdateAlertBody {
  alertLow: string
  alertHigh: string
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

export interface SendToITradeBody {
  index: number
  commo: string
  contract_twodigit: string
  contract: string
  extension: string
  freetext: string
  instrument: string
  price: string
  qty: number
  strategy: string
}

export interface GetAlarmsParams {
  account: string
  contract: string
}

export interface GetBookQueries {
  session: 'eod' | 'morning' | 'afternoon' | 'evening' | '' | string
}

export interface GetRawConfigParams {
  account: string
  config_type: 'intraday' | 'directional'
}
