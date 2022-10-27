import TreeGridUtils from './TreeGridUtils'
import helpers from '../helpers'

function filterNonNull(datum /* , action */) {
  console.log('Filter Non Null Called')
  // console.log('caller is ' + arguments.callee.caller.toString())
  for (let i = 0; i < datum.length; i++) {
    const data = datum[i]
    if (data.rowType == 'sector') {
      TreeGridUtils.getCell(data.id, 16).css('text-align', 'right')
      setTimeout(createSectorToolTip, 500, data)
    }

    if (data.rowType == 'contract') {
      if (
        currentAccountVar.showNonNull &&
        helpers.isNullOrEmpty(data.qty) &&
        helpers.isNullOrEmpty(data.current_allocation_lots) &&
        helpers.isNullOrEmpty(data.target_allocation_lots) &&
        helpers.isNullOrEmpty(data.orderQ) &&
        helpers.isNullOrEmpty(data.target_risks_post)
      ) {
        TreeGridUtils.getRow(data.id).css('display', 'none')

        if (!data?.valid && data.instrument != 'Cash') {
          TreeGridUtils.getCell(data.id, 0).css('background-color', '#ff1b1b')
        }
        setTimeout(colorExpiries, 100, data)
        setTimeout(createToolTip, 0, data)
      } else {
        TreeGridUtils.getRow(data.id).css('display', 'table-row')
      }
    }

    if (
      !currentAccountVar.forceRenderedOnce &&
      !currentAccountVar.showNonNull
    ) {
      currentAccountVar.forceRenderedOnce = true
      $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('render')
    }
  }
}

// function filterNonNullCommo(data, commo, extension, instrument, obj) {
//   for (var i = 0; i < data.length; i++) {
//     if (
//       data[i].rowType == 'contract' &&
//       data[i].commo == commo &&
//       data[i].extension == extension &&
//       data[i].instrument == instrument
//     ) {
//       TreeGridUtils.getRow(data[i].id).css('display', 'table-row')
//       if ($(obj).attr('val') == 'true') {
//         if (isNaN(data[i].qty) || data[i].qty == null || data[i].qty == '')
//           if (
//             isNaN(data[i].current_allocation_lots) ||
//             data[i].current_allocation_lots == null ||
//             data[i].current_allocation_lots == ''
//           )
//             if (
//               isNaN(data[i].target_allocation_lots) ||
//               data[i].target_allocation_lots == null ||
//               data[i].target_allocation_lots == ''
//             )
//               if (data[i].orderQ == null || data[i].orderQ == '')
//                 if (
//                   data[i].target_risks_post == null ||
//                   data[i].target_risks_post == ''
//                 )
//                   TreeGridUtils.getRow(data[i].id).css('display', 'none')
//       }
//     }
//     if (
//       !currentAccountVar.forceRenderedOnce &&
//       !currentAccountVar.showNonNull
//     ) {
//       currentAccountVar.forceRenderedOnce = true
//       $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('render')
//     }
//   }
//   if ($(obj).html() == '+') {
//     $(obj).html('-')
//     $(obj).attr('val', 'true')
//   } else {
//     $(obj).html('+')
//     $(obj).attr('val', 'false')
//   }
// }

// function colorFixings(row) {
//   if (fixings.indexOf(row.contract) != -1) {
//     TreeGridUtils.getCell(row.id, 12)
//       .css('border-width', '3px')
//       .css('border-color', 'lightslategray')
//     TreeGridUtils.getCell(row.id, 14)
//       .css('border-width', '3px')
//       .css('border-color', 'lightslategray')
//   }
// }

function colorExpiries(row) {
  // const a = moment(row.notice4E)
  const b = moment(row.expiry4E)
  const c = moment(currentAccountVar.tradeDate)

  let cell
  if (c - b == 0) {
    for (let i = 0; i < 17; i++) {
      cell = TreeGridUtils.getCell(row.id, i)
      if (cell.css('background-color') == 'rgb(255, 255, 255)') {
        cell.css('background-color', 'purple')
        cell.css('color', 'white')
      }
    }
  } else if (c > b) {
    //Expiry4E
    for (let i = 0; i < 17; i++) {
      cell = TreeGridUtils.getCell(row.id, i)
      if (cell.css('background-color') == 'rgb(255, 255, 255)') {
        cell.css('background-color', 'red')
        cell.css('color', 'white')
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
    cell = TreeGridUtils.getCell(row.id, 0)
    cell.css('background-color', 'brown')
    cell.css('color', 'yellow')
  }
}

function createSectorToolTip(row) {
  if (!('id' in row)) {
    return
  }

  const cell = TreeGridUtils.getCell(row.id, 4)

  cell.jqxTooltip({
    content:
      '<div style="text-align:left;background-color:black;color:yellow">' +
      '<b>Abs by Commdity: </b>' +
      accounting.formatNumber(row.last_price, 4) * 100 +
      '</div>',
    position: 'mouse',
    name: 'contractToolTip',
    theme: 'office',
    opacity: 1,
  })
}

function createToolTip(row) {
  const cell = TreeGridUtils.getCell(row.id, 0)
  if (cell.length == 0) return
  let comment = ''
  if (row.comment != null && row.comment != '') {
    comment = '<b>Comment: ' + row.comment + '</b></br><br/>'
    TreeGridUtils.getCell(row.id, 17).css('background-color', 'black')
    TreeGridUtils.getCell(row.id, 16).css('background-color', 'black')
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
  cell.jqxTooltip({
    content:
      '<br/><div style="text-align:left;background-color:black;color:yellow">' +
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
    theme: 'metro',
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
}
