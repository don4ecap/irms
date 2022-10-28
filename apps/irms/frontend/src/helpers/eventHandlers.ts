import http from '../services/http'
import Risks from './Risks'

function onRowClick(event) {
  const { args, key, row } = event
  const clickEvent = args.originalEvent
  clickEvent.preventDefault()

  // Handler right click
  if (clickEvent.button == 2) {
    const scrollTop = $(window).scrollTop()
    const scrollLeft = $(window).scrollLeft()
    contextMenu.jqxMenu(
      'open',
      clickEvent.clientX + 5 + scrollLeft,
      clickEvent.clientY + 5 + scrollTop
    )
    return false
  }

  if (clickEvent.ctrlKey) {
    // TODO:
    // console.log(`Chart for ${row.contract} ${row.extension}`)
    // $('#chart').fadeIn(500)
    // $('#if_chart').attr(
    //   'src',
    //   'chart.aspx?contract=' + row.contract + '&extension=' + row.extension
    // )
  } else {
    // TODO:
    // if ($('#if_chart').attr('src') != 'about:blank') {
    //   $('#if_chart').attr('src', 'about:blank')
    //   $('#chart').fadeOut(500)
    // }

    if (
      clickEvent.target.classList.contains('editable')
      // &&
      // currentAccountVar.editingRowID === -1
    ) {
      if (args.row.rowType != 'contract') return
      currentAccountVar.isEdited = true
      currentAccountVar.editingRowQty = args.row.orderQ
      currentAccountVar.editingRowID = args.row.id
      $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid(
        'beginRowEdit',
        args.row.id
      )
      console.log(`Editing row id: ${args.row.id}`)
    }
  }
}

function onRowEndEdit(event) {
  const { args } = event
  const { key } = args
  const row = $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('getRow', key)
  const indexOfBookDataBeforeChange = Risks.GetBookIndexByID(row.id)
  const bookToUpdate = currentAccountVar.books[indexOfBookDataBeforeChange]

  if (row.orderP) {
    row.orderP = row.orderP.trim()
    if (row.orderP.endsWith(';')) {
      row.orderP = row.orderP.substr(0, row.orderP.length - 1)
    }

    // Check/validate order strategies
    const orderStrategies = row.orderP.split(';')
    for (let i = 0; i < orderStrategies.length; i++) {
      let orderStrategy = orderStrategies[i]
      if (orderStrategy === '') continue
      orderStrategy = orderStrategy.split('@')[0].split('#')[0]
      if (orderStrategy === '') continue
      if (strategies.indexOf(orderStrategy) === -1) {
        alert(`Strategy ${orderStrategy} not valid`)
      }
    }
  }

  // Format order quantity value
  if (row.orderQ) {
    row.orderQ = row.orderQ.trim()
    if (row.orderQ.endsWith(';')) {
      row.orderQ = row.orderQ.substr(0, row.orderQ.length - 1)
    }
  }

  // Empty order quantity and order strtategy
  // if order quantity value is empty
  if (row.orderQ?.trim() === '' || row.orderP?.trim() === '') {
    row.orderQ = null
    row.orderP = null
    // TODO: Notify failure
    return
  }

  // Only save if value changes
  if (
    row.orderQ === bookToUpdate.orderQ &&
    row.orderP === bookToUpdate.orderP
  ) {
    // TODO: Notify failure
    console.log("Don't need to save cell data since there is no changes")
    return
  }

  const cellData = {
    id: row.id,
    contract: row.contract,
    extension: row.extension || null,
    order_qty: row.orderQ || null,
    order_p: row.orderP || null,
  }

  // Send request to server for save cell
  http
    .post(
      `save_cell/${currentAccount}/${currentAccountVar.tradeDate}`,
      cellData
    )
    .then(({ data }) => {
      if (parseInt(data.id) == -1) {
        // TODO: Notify failure
        console.error('Data is not saved')
        return
      }
      bookToUpdate.orderQ = row.orderQ
      bookToUpdate.orderP = row.orderP
      //ComputeRisksRow(index);
      if (currentAccountVar.calculateRisksLive) {
        console.time('Saving data')
        Risks.ComputeRisks()
        $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
        console.timeEnd('Saving data')
      }
      currentAccountVar.editingRowID = -1
      // TODO: Show success notification
      //  success('Risks Updated')
    })
    .catch((error) => {
      console.error('Failed to save cell.', '\nError:', error)
    })
}

export default {
  onRowClick,
  onRowEndEdit,
}
