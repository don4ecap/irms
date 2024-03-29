import TreeGridUtils from './TreeGridUtils'
import helpers from '../helpers'

function filterNonNull(/* datum, action */) {
  // console.log('Filter Non Null Called')
  console.time('filterNonNull')
  // console.log('caller is ' + arguments.callee.caller.toString())
  const accountVar = helpers.getAccountVar(currentAccount)
  for (let i = 0; i < accountVar.books.length; i++) {
    const data = accountVar.books[i]
    if (data.rowType == 'sector' && data.id) {
      const cell = TreeGridUtils.getCell2(data.id, 16)
      // @ts-ignore
      cell.style.textAlign = 'right'
      setTimeout(createSectorToolTip, 500, data)
    }

    if (data.rowType == 'contract') {
      const row = TreeGridUtils.getRow2(data.id)
      if (accountVar.showNonNull) {
        if (
          helpers.isNullOrEmpty(data.qty) &&
          helpers.isNullOrEmpty(data.current_allocation_lots) &&
          helpers.isNullOrEmpty(data.target_allocation_lots) &&
          helpers.isNullOrEmpty(data.orderQ) &&
          helpers.isNullOrEmpty(data.target_risks_post)
        ) {
          // @ts-ignore
          if (row) Promise.resolve().then(() => (row.style.display = 'none'))
        }
      } else {
        // @ts-ignore
        if (row) Promise.resolve().then(() => (row.style.display = 'table-row'))
      }

      // if (!data.valid && data.instrument != 'Cash' && data.id) {
      // const cell = TreeGridUtils.getCell2(data.id, 0)
      // TreeGridUtils.getCell(data.id, 0).css('background-color', '#ff1b1b')
      // @ts-ignore
      // cell.style.backgroundColor = '#ff1b1b'
      // }
      // setTimeout(colorExpiries, 100, data)
      Promise.resolve().then(() => colorExpiries(data))
      // setTimeout(createToolTip, 0, data)
      Promise.resolve().then(() => createToolTip(data))
    }
  }

  render()
  console.timeEnd('filterNonNull')
}

async function filterNonNullCommo(
  commo: string,
  extension: string,
  instrument: string,
  expandEl
) {
  const accountVar = helpers.getAccountVar(currentAccount)
  for (let i = 0; i < accountVar.books.length; i++) {
    const book = accountVar.books[i]
    if (
      book.rowType == 'contract' &&
      book.commo == commo &&
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
          // @ts-ignore
          // if (row) setTimeout(() => (row.style.display = 'none'), 10)
          if (row) Promise.resolve().then(() => (row.style.display = 'none'))
        }
      } else {
        // if (row) setTimeout(() => (row.style.display = 'table-row'), 10)
        if (row)
          // @ts-ignore
          Promise.resolve().then(() => (row.style.display = 'table-row'))
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

// function colorFixings(row) {
//   if (fixings.indexOf(row.contract) != -1) {
//     TreeGridUtils.getCell2(row.id, 12)
//       .css('border-width', '3px')
//       .css('border-color', 'lightslategray')
//     TreeGridUtils.getCell2(row.id, 14)
//       .css('border-width', '3px')
//       .css('border-color', 'lightslategray')
//   }
// }

function colorExpiries(row: IRMSBook) {
  // const a = moment(row.notice4E)
  const accountVar = helpers.getAccountVar(currentAccount)
  const b = moment(row.expiry4E)
  const c = moment(accountVar.tradeDate)

  let cell
  if (c - b == 0) {
    for (let i = 0; i < 17; i++) {
      cell = TreeGridUtils.getCell2(row.id, i)
      if (cell && cell.style.backgroundColor !== 'purple') {
        cell.style.backgroundColor = 'purple'
        cell.style.color = 'white'
      }
    }
  } else if (c > b) {
    //Expiry4E
    for (let i = 0; i < 17; i++) {
      cell = TreeGridUtils.getCell2(row.id, i)
      if (cell && cell.style.backgroundColor !== 'purple') {
        cell.style.backgroundColor = 'red'
        cell.style.color = 'white'
        // cell.css('background-color', 'red')
        // cell.css('color', 'white')
      }
    }
  }

  /*  else if (c >= a) {
    //Notice4E
    for (var i = 0; i < 17; i++) {
            cell = TreeGridUtils. TreeGridUtils. getCell(row.id, i)
            if (cell.css('background-color') == 'rgb(255, 255, 255)') {
                cell.css('background-color', 'orange');
                cell.css('color', 'blue');
            }
        }
  }
  else {

  } */

  if (row.settlement_available == 'FALSE') {
    cell = TreeGridUtils.getCell2(row.id, 0)
    cell.style.backgroundColor = 'brown'
    cell.style.color = 'yellow'
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
    // @ts-ignore
    if (cell17) cell17.style.backgroundColor = '#000'

    const cell16 = TreeGridUtils.getCell2(row.id, 17)
    // @ts-ignore
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

// $.extend({
//   getUrlVars: function () {
//     var vars = [],
//       hash
//     var hashes = window.location.href
//       .slice(window.location.href.indexOf('?') + 1)
//       .split('&')
//     for (var i = 0; i < hashes.length; i++) {
//       hash = hashes[i].split('=')
//       vars.push(hash[0])
//       vars[hash[0]] = hash[1]
//     }

//     return vars
//   },
//   getUrlVar: function (name) {
//     a = $.getUrlVars()[name]
//     if (a[a.length - 1] == '#') a = a.substr(0, a.length - 1)
//     return a
//   },
// })

// function showSector() {
//   setTimeout(function () {
//     for (i = 0; i < book.length; i++) {
//       if (book[i].rowType == 'sector') book[i].expanded = false
//     }
//     $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
//   }, 500)
// }

// function showCommodity() {
//   setTimeout(function () {
//     for (i = 0; i < book.length; i++) {
//       if (book[i].rowType == 'sector') book[i].expanded = true
//       if (book[i].rowType == 'commodity') book[i].expanded = false
//     }
//     $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
//   }, 500)
// }

// function showContract() {
//   setTimeout(function () {
//     for (let i = 0; i < currentAccountVar.books.length; i++) {
//       const book = currentAccountVar.books[i]
//       if (book.rowType == 'sector') book.expanded = true
//       if (book.rowType == 'commodity') book.expanded = true
//     }
//     $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
//   }, 500)
// }

export default {
  filterNonNull,
  filterNonNullCommo,
}
