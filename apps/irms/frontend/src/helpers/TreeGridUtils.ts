// Traverse tree grid to do a full "expand" or "collapse"
function traverseTreeGrid(treeGrid, action) {
  function traverseRows(rows) {
    var idValue
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].records) {
        idValue = rows[i][idColumn]
        treeGrid.jqxTreeGrid(action + 'Row', idValue)
        traverseRows(rows[i].records)
      }
    }
  }

  var idColumn = treeGrid.jqxTreeGrid('source')._source.id
  traverseRows(treeGrid.jqxTreeGrid('getRows'))
}

function showTree(treeGrid, rowType, action) {
  function traverseRows2(rows) {
    var idValue
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].records) {
        idValue = rows[i][idColumn]
        if (rows[i].rowType == rowType)
          treeGrid.jqxTreeGrid(action + 'Row', idValue)
        traverseRows2(rows[i].records)
      }
    }
  }

  var idColumn = treeGrid.jqxTreeGrid('source')._source.id
  traverseRows2(treeGrid.jqxTreeGrid('getRows'))
}

function GetColumnIndex(data, columnName) {
  return data.indexOf(
    $.grep(data, function (ele, index) {
      return ele.dataField === columnName
    })[0]
  )
}
function getCell(key: string, cellNum: number) {
  const a = $(`${currentAccountVar.treeGridID} tr`)
  const b = a.filter(`tr[data-key=${key}]`)
  return $($(b).children()[cellNum])
}

function getRow(key) {
  a = $(`#${currentAccountVar.treeGridID} tr`)
  b = a.filter('tr[data-key=' + key + ']')
  return $(b[0])
}

function ExpandAllRows() {
  //    $.each($.grep(book,function(n,i){return n.rowType=="sector"}), function (i, row) {
  //            $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid("expandRow", row.id)
  //    });
  $.each(book, function (i, row) {
    $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('expandRow', row.id)
  })
}

function Expand(rowType) {
  $.each(
    $.grep(book, function (n, i) {
      return n.rowType == rowType
    }),
    function (i, row) {
      setTimeout(function () {
        $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('expandRow', row.id)
      }, 100)
    }
  )
}

function ExpandRow(row, callback) {
  if (row.rowType != 'contract')
    $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('expandRow', row.id)
  callback()
}

function CollapseAllRows() {
  $.each(book, function (i, row) {
    if (row.rowType != 'contract')
      $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('collapseRow', row.id)
  })
}

function ParallelExpand() {
  // async.map(book, ExpandRow, function (err) {
  //   alert(err)
  // })
}

export default {
  getCell,
}