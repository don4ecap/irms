import { IRMSBook } from 'irms-shared-types'

export type RendererCallback = (
  row: number,
  dataField: string,
  cellValue: string,
  rowData: IRMSBook,
  cellText: string
) => string

// declare interface PreviewTableRow {
//   account: string
//   commo: string
//   contract: string
//   contract_twodigit: string
//   extension: string
//   freetext: string
//   instrument: string
//   price: number
//   qty: string
//   strategy: string
//   uid: number
// }
