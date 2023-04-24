import TreeGridUtils from './TreeGridUtils'
import helpers from '../helpers'
import type { IRMSBook } from 'irms-shared-types/Data'

async function filterNonNull() {
  console.time('filterNonNull')
  const accountVar = helpers.getAccountVar(currentAccount)

  for (const book of accountVar.books) {
    if (book.rowType == 'sector' && book.id) {
      const cell = TreeGridUtils.getCell2(book.id, 16)
      if (cell) cell.style.textAlign = 'right'
      setTimeout(createSectorToolTip, 500, book)
    }

    if (book.rowType == 'contract') {
      const row = TreeGridUtils.getRow2(book.id)
      if (accountVar.showNonNull) {
        if (
          (isNaN(book.qty) || helpers.isNullOrEmpty(book.qty)) &&
          (isNaN(book.current_allocation_lots) ||
            helpers.isNullOrEmpty(book.current_allocation_lots)) &&
          (isNaN(book.current_allocation_lots) ||
            helpers.isNullOrEmpty(book.target_allocation_lots)) &&
          helpers.isNullOrEmpty(book.orderQ) &&
          helpers.isNullOrEmpty(book.target_risks_post)
        ) {
          if (row) Promise.resolve().then(() => (row.style.display = 'none'))
        }
      } else {
        if (row) Promise.resolve().then(() => (row.style.display = null))
      }

      // if (!book.valid && book.instrument != 'Cash' && book.id) {
      // const cell = TreeGridUtils.getCell2(book.id, 0)
      // TreeGridUtils.getCell(book.id, 0).css('background-color', '#ff1b1b')
      // @ts-ignore
      // cell.style.backgroundColor = '#ff1b1b'
      // }

      Promise.resolve().then(() => colorExpiries(book))
      Promise.resolve().then(() => createToolTip(book))
    }
  }

  render()
  console.timeEnd('filterNonNull')
}

function filterNonNullCommo(
  commodity: string,
  extension: string,
  instrument: string,
  expandEl: HTMLSpanElement
) {
  const accountVar = helpers.getAccountVar(currentAccount)
  for (const book of accountVar.books) {
    if (
      book.rowType == 'contract' &&
      book.commo == commodity &&
      book.extension == extension &&
      book.instrument == instrument
    ) {
      const row = TreeGridUtils.getRow2(book.id)
      if (expandEl.getAttribute('val') == 'true') {
        if (
          helpers.isNullOrEmpty(book.qty) &&
          helpers.isNullOrEmpty(book.current_allocation_lots) &&
          helpers.isNullOrEmpty(book.target_allocation_lots) &&
          helpers.isNullOrEmpty(book.orderQ) &&
          helpers.isNullOrEmpty(book.target_risks_post)
        ) {
          if (row) Promise.resolve().then(() => (row.style.display = 'none'))
        }
      } else {
        if (row) Promise.resolve().then(() => (row.style.display = null))
      }
    }
  }

  render()

  if (expandEl.innerHTML == '+') {
    expandEl.innerHTML = '-'
    expandEl.setAttribute('val', 'true')
  } else {
    expandEl.innerHTML = '+'
    expandEl.setAttribute('val', 'false')
  }
}

function render() {
  const accountVar = helpers.getAccountVar(currentAccount)
  if (!accountVar.forceRenderedOnce && !accountVar.showNonNull) {
    accountVar.forceRenderedOnce = true
    $(`#${accountVar.treeGridID}`).jqxTreeGrid('render')
  }
}

function colorExpiries(row: IRMSBook) {
  const a = moment(row.notice4E)
  const accountVar = helpers.getAccountVar(currentAccount)
  const b = moment(row.expiry4E)
  const c = moment(accountVar.tradeDate)

  let cell
  if (c - b == 0) {
    for (let i = 0; i < 17; i++) {
      cell = TreeGridUtils.getCell2(row.id, i)
      if (
        cell &&
        getComputedStyle(cell).backgroundColor == 'rgb(255, 255, 255)'
      ) {
        cell.style.backgroundColor = 'purple'
        cell.style.color = 'white'
      }
    }
  } else if (c > b) {
    //Expiry4E
    for (let i = 0; i < 17; i++) {
      cell = TreeGridUtils.getCell2(row.id, i)
      if (
        cell &&
        getComputedStyle(cell).backgroundColor == 'rgb(255, 255, 255)'
      ) {
        cell.style.backgroundColor = 'red'
        cell.style.color = 'white'
      }
    }
  }
  //
  else if (c >= a) {
    //Notice4E
    /* for (var i = 0; i < 17; i++) {
      cell = TreeGridUtils.TreeGridUtils.getCell(row.id, i)
      if (cell.css('background-color') == 'rgb(255, 255, 255)') {
        cell.css('background-color', 'orange')
        cell.css('color', 'blue')
      }
    } */
  } else {
    //
  }

  if (row.settlement_available == 'FALSE') {
    try {
      cell = TreeGridUtils.getCell2(row.id, 0)
      cell.style.backgroundColor = 'brown'
      cell.style.color = 'yellow'
    } catch (error) {
      console.warn('cannot find first cell element of book with id', row.id)
    }
  }
}

function createSectorToolTip(row: IRMSBook) {
  if (!('id' in row)) return

  const cell = TreeGridUtils.getCell2(row.id, 4)
  if (!cell) return

  $(cell).jqxTooltip({
    content:
      `<div id="tooltip2-${currentAccount}-${row.id}" style="text-align:left;background-color:black;color:yellow">` +
      '<b>Abs by Commdity: </b>' +
      accounting.formatNumber(row.last_price, 4) * 100 +
      '</div>',
    position: 'mouse',
    name: 'contractToolTip',
    theme: 'office',
    opacity: 1,
  })
}

function createToolTip(row: IRMSBook) {
  const cell = TreeGridUtils.getCell2(row.id, 0)
  if (!cell) return

  let comment = ''
  if (row.comment != null && row.comment != '') {
    comment = '<b>Comment: ' + row.comment + '</b></br><br/>'
    const cell17 = TreeGridUtils.getCell2(row.id, 17)
    if (cell17) cell17.style.backgroundColor = '#000'

    const cell16 = TreeGridUtils.getCell2(row.id, 17)
    if (cell16) cell16.style.backgroundColor = '#000'
  }

  let option = ''
  if (row.instrument.indexOf('Option') != -1) {
    option =
      '<b>Notional Exposure: ' +
      accounting.formatNumber(row.positions_pct_target_notional * 100, 2) +
      ' %<br/><b>Notional Current Alloc: ' +
      accounting.formatNumber(row.current_allocation_pct_notional * 100, 2) +
      ' %<br/><b>Notional Target Alloc: ' +
      accounting.formatNumber(row.target_allocation_pct_notional * 100, 2) +
      ' %<br/><br/><b>Current Delta(δ)</b>: ' +
      accounting.formatNumber(row.current_option_delta * 100, 4) +
      ' %<br/>' +
      '<b>Target Delta(δ)</b>: ' +
      accounting.formatNumber(row.target_option_delta * 100, 4) +
      ' %<br/>' +
      '<b>Current Sigma(σ)</b>: ' +
      accounting.formatNumber(row.current_sigma * 100, 4) +
      ' %<br/>' +
      '<b>Target Sigma(σ)</b>: ' +
      accounting.formatNumber(row.target_sigma * 100, 4) +
      ' %<br/>' +
      '<b>Live Gamma(γ)</b>: ' +
      accounting.formatNumber(row.gamma * 100, 4) +
      ' %<br/>' +
      '<b>Live Vega(v)</b>: ' +
      accounting.formatNumber(row.vega * 100, 4) +
      ' %<br/><br/>'
  }

  $(cell).jqxTooltip({
    content:
      `<br/><div id="tooltip-${currentAccount}-${row.id}" style="text-align:left;background-color:black;color:yellow">` +
      comment +
      option +
      '<b>Instrument: </b>' +
      row.instrument +
      '<br/><b>Extension: </b>' +
      row.extension +
      '<br/><br/><b>Settlement:</b>' +
      row.settlement +
      '<br /><br/><b>Last Trade Date: </b> ' +
      moment(row.last_trade_date).format('Do-MMM-YYYY') +
      '<br /><b>First Notice Date: </b> ' +
      moment(row.first_notice_date).format('Do-MMM-YYYY') +
      '<br /><b>Expiry4E: </b> ' +
      moment(row.expiry4E).format('Do-MMM-YYYY') +
      '</div>',
    position: 'mouse',
    name: 'contractToolTip',
    theme: 'office',
    opacity: 1,
    autoHideDelay: 15000,
  })
}

type CellElementHorizontalAlign = 'left' | 'middle' | 'right'

/** Create common cell element and its styles */
function createCellElement(
  initialTextContent = '',
  horizontalAlign: CellElementHorizontalAlign = 'left'
) {
  const cellElement = document.createElement('div')
  cellElement.textContent = initialTextContent
  cellElement.classList.add(`jqx-grid-cell-${horizontalAlign}-align`)
  cellElement.style.marginTop = '0.35em'
  return cellElement
}

function currencyFormatter(
  rowID: number,
  columnfield: string,
  value: number
  // defaulthtml: string,
  // columnproperties,
) {
  const currency = accounting.formatMoney(value)
  const cellElement = createCellElement(currency)
  if (columnfield == 'chNav' && value != 0) {
    cellElement.classList.add('chnav-not-empty')
  }
  if (value == 0) {
    cellElement.style.color = 'silver'
  }
  return cellElement.outerHTML
}

function dateFormatter(
  rowID: number,
  columnfield: string,
  value: string
  // defaulthtml: string
  // columnproperties
) {
  const date = moment(value).format('DD-MMM-YYYY')
  const cellElement = createCellElement(date, 'middle')
  return cellElement.outerHTML
}

function percentFormatter(
  rowID: number,
  columnfield: string,
  value: number
  // defaulthtml: string
  // columnproperties
) {
  const percent = (value * 100).toFixed(4)
  let color: string
  if (value > 0) {
    color = 'green'
  } else if (value < 0) {
    color = 'red'
  } else {
    color = 'blue'
  }
  const cellElement = createCellElement(percent + ' %')
  cellElement.style.color = color
  return cellElement.outerHTML
}

function subRedFormatter(
  rowID: number,
  columnfield: string,
  value: number
  // defaulthtml: string
  // columnproperties
) {
  if (value == 0) {
    // @ts-ignore
    return currencyFormatter(rowID, columnfield, value, 0, 0)
  }
  const currency = accounting.formatMoney(value)
  const cellElement = createCellElement(currency)
  if (value > 0) {
    cellElement.classList.add('subred-gt-0')
  } else {
    cellElement.classList.add('subred-lt-0')
  }
  return cellElement.outerHTML
}

export default {
  filterNonNull,
  filterNonNullCommo,
  currencyFormatter,
  dateFormatter,
  percentFormatter,
  subRedFormatter,
}
