import helpers from '.'

// Traverse tree grid to do a full "expand" or "collapse"
// function traverseTreeGrid(treeGrid, action) {
//   function traverseRows(rows) {
//     let idValue
//     for (let i = 0; i < rows.length; i++) {
//       if (rows[i].records) {
//         idValue = rows[i][idColumn]
//         treeGrid.jqxTreeGrid(action + 'Row', idValue)
//         traverseRows(rows[i].records)
//       }
//     }
//   }

//   const idColumn = treeGrid.jqxTreeGrid('source')._source.id
//   traverseRows(treeGrid.jqxTreeGrid('getRows'))
// }

// function showTree(treeGrid, rowType, action) {
//   function traverseRows2(rows) {
//     let idValue
//     for (let i = 0; i < rows.length; i++) {
//       if (rows[i].records) {
//         idValue = rows[i][idColumn]
//         if (rows[i].rowType == rowType)
//           treeGrid.jqxTreeGrid(action + 'Row', idValue)
//         traverseRows2(rows[i].records)
//       }
//     }
//   }

//   const idColumn = treeGrid.jqxTreeGrid('source')._source.id
//   traverseRows2(treeGrid.jqxTreeGrid('getRows'))
// }

// function GetColumnIndex(data, columnName) {
//   return data.indexOf(
//     $.grep(data, function (ele, index) {
//       return ele.dataField === columnName
//     })[0]
//   )
// }

function getCell2(key: string, cellNum: number) {
  const row = getRow2(key)
  if (!row) return null
  return row.children[cellNum]
}

function getCell(key: string, cellNum: number) {
  const accountVar = helpers.getAccountVar(currentAccount)
  const a = $(`#${accountVar.treeGridID} tr`)
  const b = a.filter(`tr[data-key=${key}]`)
  return $($(b).children()[cellNum])
}

function getRow(key: string) {
  const accountVar = helpers.getAccountVar(currentAccount)
  const a = $(`#${accountVar.treeGridID} tr[data-key='${key}']`)
  return $(a[0])
}

function getRow2(key: string) {
  const accountVar = helpers.getAccountVar(currentAccount)
  return document.body.querySelector(
    `#${accountVar.treeGridID} tr[data-key='${key}']`
  )
}

// function ExpandAllRows() {
//   //    $.each($.grep(book,function(n,i){return n.rowType=="sector"}), function (i, row) {
//   //            $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid("expandRow", row.id)
//   //    });
//   $.each(book, function (i, row) {
//     $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('expandRow', row.id)
//   })
// }

// function Expand(rowType) {
//   $.each(
//     $.grep(book, function (n, i) {
//       return n.rowType == rowType
//     }),
//     function (i, row) {
//       setTimeout(function () {
//         $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('expandRow', row.id)
//       }, 100)
//     }
//   )
// }

// function ExpandRow(row, callback) {
//   if (row.rowType != 'contract')
//     $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('expandRow', row.id)
//   callback()
// }

// function CollapseAllRows() {
//   $.each(book, function (i, row) {
//     if (row.rowType != 'contract')
//       $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('collapseRow', row.id)
//   })
// }

// function ParallelExpand() {
// async.map(book, ExpandRow, function (err) {
//   alert(err)
// })
// }

export default {
  getCell,
  getRow,
  getRow2,
  getCell2,
}
