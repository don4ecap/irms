import TreeGridUtils from './TreeGridUtils'

function GetOrderSize(i: number) {
  const row = currentAccountVar.books[i]

  if (row.rowType == 'contract') {
    let value: number, valueSector: number
    const orderSize = row.orderQ
    if (
      (orderSize == null || orderSize == '') &&
      currentAccountVar.spdRiskOffsets[row.contract] == null
    ) {
      row.current_risks_post = row.current_risks_pre
      row.target_risks_post = row.target_risks_pre
      value = 0
      valueSector = 0
      row.order_size = 0
    } else {
      let totalQ = 0
      if (currentAccountVar.spdRiskOffsets[row.contract] != null) {
        totalQ += currentAccountVar.spdRiskOffsets[row.contract]
        TreeGridUtils.getCell(row.id, 14).addClass('spreadadjustment')
      }
      if (orderSize != null && orderSize != '') {
        const numLots = orderSize.toString().split(';')
        $.each(numLots, function () {
          totalQ += parseFloat(this) || 0
        })
      }

      value =
        (totalQ * row.valuept * row.last_price) / row.live_fx / row.live_nav
      //valueSector = value * row.hedge_ratio
      valueSector = value
      row.current_risks_post = row.current_risks_pre + value
      row.target_risks_post = row.target_risks_pre + value
      row.order_size = value
      if (row.instrument != 'Future') {
        const underlyingPrice = GetUnderlyingLastPrice(row)
        value =
          ((totalQ * row.valuept * underlyingPrice) /
            row.live_fx /
            row.live_nav) *
          row.target_option_delta
        row.current_risks_post = row.current_risks_pre + value
        row.target_risks_post = row.target_risks_pre + value
        row.order_size = value
      }
    }

    //update commo
    let parent_index = GetParent(row.parent)
    currentAccountVar.books[parent_index].current_risks_post =
      currentAccountVar.books[parent_index].current_risks_pre + value
    currentAccountVar.books[parent_index].target_risks_post =
      currentAccountVar.books[parent_index].target_risks_pre + value
    currentAccountVar.books[parent_index].order_size =
      currentAccountVar.books[parent_index].order_size + value

    //update sector
    parent_index = GetParent(currentAccountVar.books[parent_index].parent)
    currentAccountVar.books[parent_index].current_risks_post =
      currentAccountVar.books[parent_index].current_risks_pre + valueSector
    currentAccountVar.books[parent_index].target_risks_post =
      currentAccountVar.books[parent_index].target_risks_pre + valueSector
    currentAccountVar.books[parent_index].order_size =
      currentAccountVar.books[parent_index].order_size + valueSector
  } else if (row.rowType == 'commodity') {
    if (row.order_size == null) {
      row.current_risks_post = row.current_risks_pre
      row.target_risks_post = row.target_risks_pre
    } else {
      row.current_risks_post = row.current_risks_pre + row.order_size
      row.target_risks_post = row.target_risks_pre + row.order_size
    }
  } else if (row.rowType == 'sector') {
    if (row.order_size == null) {
      row.current_risks_post = row.current_risks_pre
      row.target_risks_post = row.target_risks_pre
    } else {
      row.current_risks_post = row.current_risks_pre + row.order_size
      row.target_risks_post = row.target_risks_pre + row.order_size
    }
  }

  // currentAccountVar.books[i] = row
}

function UpdateOrderSize(index) {
  if (book[index].rowType == 'contract') {
    if (book[index].orderQ == '' || book[index].orderQ == null) {
      book[index].current_risks_post = book[index].current_risks_pre
      book[index].target_risks_post = book[index].target_risks_pre
      book[index].order_size = 0
    } else {
      numLots = book[index].orderQ.toString().split(';')
      var totalQ = 0
      $.each(numLots, function () {
        totalQ += parseFloat(this) || 0
      })

      value =
        (totalQ * book[index].valuept * book[index].last_price) /
        book[index].live_fx /
        book[index].live_nav
      book[index].current_risks_post = book[index].current_risks_pre + value
      book[index].target_risks_post = book[index].target_risks_pre + value
      book[index].order_size = value
    }
  } else if (book[index].rowType == 'commodity') {
    book[index].current_risks_post = book[index].current_risks_pre
    book[index].target_risks_post = book[index].target_risks_pre
    book[index].order_size = 0
  } else {
    book[index].current_risks_post = book[index].current_risks_pre
    book[index].target_risks_post = book[index].target_risks_pre
    book[index].order_size = 0
  }
}

function UpdateOrderCommoditySector(contractID, contractIndex) {
  parentIndex = GetParent(contractID)
  book[parentIndex].order_size =
    book[parentIndex].order_size + book[contractIndex].order_size
  book[parentIndex].current_risks_post =
    book[parentIndex].current_risks_pre + book[parentIndex].order_size
  book[parentIndex].target_risks_post =
    book[parentIndex].target_risks_pre + book[parentIndex].order_size

  sectorIndex = GetParent(book[parentIndex].id)
  book[sectorIndex].order_size =
    book[sectorIndex].order_size + book[parentIndex].order_size
  book[sectorIndex].current_risks_post =
    book[sectorIndex].current_risks_pre + book[sectorIndex].order_size
  book[sectorIndex].target_risks_post =
    book[sectorIndex].target_risks_pre + book[sectorIndex].order_size
}

// function GetUnderlyingLastPrice(row) {
//

//   const month = row.month
//   const year = row.year
//   const commo = row.commo
//   const extension = row.extension
//   for (let i = 0; i < currentAccountVar.books.length; i++) {
//     if (
//       currentAccountVar.books[i].rowType == 'contract' &&
//       currentAccountVar.books[i].commo == commo
//     ) {
//       if (
//         currentAccountVar.books[i].contract_twodigit == row.underlying &&
//         currentAccountVar.books[i].extension == extension
//       )
//         return currentAccountVar.books[i].last_price
//     }
//   }
//   return row.last_price
// }

function GetUnderlyingLastPrice(row) {
  const { /* mont, year, */ commo, extension } = row
  for (let i = 0; i < currentAccountVar.books.length; i++) {
    const book = currentAccountVar.books[i]
    const { commo: bookCommo, rowType } = book
    if (rowType === 'contract' && bookCommo === commo) {
      const { contract_twodigit, extension: bookExtension } = book
      if (contract_twodigit === row.underlying && bookExtension === extension)
        return book.last_price
    }
  }
  return row.last_price - 0
}

function CR() {
  for (var i = 0; i < book.length; i++) {
    UpdateOrderSize(i)
  }
  $('#treeGrid').jqxTreeGrid('updateBoundData')
  //    for (var i = 0; i < book.length; i++) {
  //        if(book[i].rowType=="contract")
  //            UpdateOrderCommoditySector(book[i].id,i);
  //    }
}

function ComputeRisks() {
  console.log('Compute Risks Called')
  currentAccountVar.spdRiskOffsets = {}
  $.each(currentAccountVar.books, function (i, e) {
    const book = currentAccountVar.books[i]
    if (book.rowType == 'commodity' || book.rowType == 'sector') {
      book.order_size = null
    } else {
      if (book.orderQ != null)
        if (book.orderP != null)
          if (book.orderP.indexOf('#') != -1) {
            console.log('Spread found on ' + book.contract)
            const q = book.orderQ.split(';')
            const p = book.orderP.split(';')
            for (let i = 0; i < q.length; i++) {
              if (p[i].indexOf('#') != -1) {
                let cont2 = p[i].split('#')[1]
                if (cont2.indexOf('@') != -1) {
                  cont2 = cont2.split('@')[0]
                }
                const qty2 = -parseInt(q[i])
                if (currentAccountVar.spdRiskOffsets[cont2] == null) {
                  currentAccountVar.spdRiskOffsets[cont2] = qty2
                } else {
                  currentAccountVar.spdRiskOffsets[cont2] =
                    qty2 + currentAccountVar.spdRiskOffsets[cont2]
                }
              }
            }
          }
    }
  })
  let total_post_current_risk = 0
  let total_post_target_risk = 0
  for (let i = 0; i < currentAccountVar.books.length; i++) {
    GetOrderSize(i)
    const book = currentAccountVar.books[i]
    if (book.rowType == 'sector' && book.display != 'PORTFOLIO') {
      total_post_current_risk += book.order_size
      total_post_target_risk += book.order_size
    }

    const firstBook = currentAccountVar.books[0]
    firstBook.target_risks_post =
      firstBook.target_risks_pre + total_post_target_risk
    firstBook.current_risks_post =
      firstBook.current_risks_pre + total_post_current_risk
  }

  currentAccountVar.spdRisks = SpreadRisks()
}

function ComputeRisksRow(id) {
  var row = $('#treeGrid').jqxTreeGrid('getRow', id)
  var commodityRow = $('#treeGrid').jqxTreeGrid('getRow', row.parent)
  var sectorRow = $('#treeGrid').jqxTreeGrid('getRow', commodityRow.parent)
}

function SpreadRisks() {
  const a = []
  for (let i = 0; i < currentAccountVar.books.length; i++) {
    const row = currentAccountVar.books[i]
    if (row.rowType == 'contract') {
      const commo = row.commo
      if (a[commo] == null) {
        a[commo] = []
        a[commo] = {
          current_risks_pre: Math.abs(row.current_risks_pre),
          target_risks_pre: Math.abs(row.target_risks_pre),
          current_risks_post: Math.abs(row.current_risks_post),
          target_risks_post: Math.abs(row.target_risks_post),
        }
      } else {
        const val = a[commo]
        val.current_risks_pre =
          val.current_risks_pre + Math.abs(row.current_risks_pre)
        val.target_risks_pre =
          val.target_risks_pre + Math.abs(row.target_risks_pre)
        val.current_risks_post =
          val.current_risks_post + Math.abs(row.current_risks_post)
        val.target_risks_post =
          val.target_risks_post + Math.abs(row.target_risks_post)

        a[commo] = val
      }
    }
  }
  return a
}

function GetParent(id: number) {
  for (let i = 0; i < currentAccountVar.books.length; i++) {
    if (currentAccountVar.books[i].id == id) {
      return i
    }
  }
}

function GetBookIndexByID(id: number | string) {
  return currentAccountVar.bookIDMapRev[id]
  //    for (var i = 0; i < book.length; i++) {
  //        if (book[i].id == id) {
  //            return i;
  //        }
  //    }
}

export default {
  GetOrderSize,
  UpdateOrderSize,
  UpdateOrderCommoditySector,
  GetUnderlyingLastPrice,
  CR,
  ComputeRisks,
  ComputeRisksRow,
  SpreadRisks,
  GetParent,
  GetBookIndexByID,
}
