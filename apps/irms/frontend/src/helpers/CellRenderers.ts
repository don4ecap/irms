import PageControls from './PageControls'

const pct_renderer = function (row, dataField, cellValue, rowData, cellText) {
  if (
    cellValue === null ||
    cellValue === 'NA' ||
    parseFloat(cellValue) === 0 ||
    cellValue == ''
  )
    return ''

  return contractRenderer(
    row,
    dataField,
    accounting.formatNumber(parseFloat(cellValue) * 100, 2) + ' %',
    rowData,
    cellText
  )
}

const size_renderer = function (row, dataField, cellValue, rowData, cellText) {
  if (rowData.rowType != 'contract') return ''
  if (
    cellValue == null ||
    cellValue == 'NA' ||
    parseFloat(cellValue) == 0 ||
    cellValue == ''
  )
    return ''
  else
    return (
      "<span style='font-size:4pt'>" +
      accounting.formatNumber(parseFloat(cellValue) * 100, 2) +
      ' %</span>'
    )
}
const lots_renderer = function (row, dataField, cellValue, rowData, cellText) {
  if (
    cellValue == null ||
    cellValue == 'NA' ||
    parseFloat(cellValue) == 0 ||
    cellValue == ''
  )
    return ''
  else {
    if (rowData.rowType == 'sector' && dataField == 'qty')
      return pct_renderer(row, dataField, cellValue, rowData, cellText)
    else return contractRenderer(row, dataField, cellValue, rowData, cellText)
  }
}
const lots_renderer_decimal = function (
  row,
  dataField,
  cellValue,
  rowData,
  cellText
) {
  if (
    cellValue == null ||
    cellValue == 'NA' ||
    parseFloat(cellValue) == 0 ||
    cellValue == ''
  )
    return ''
  else {
    if (
      rowData.rowType == 'sector' &&
      (dataField == 'target_allocation_lots' ||
        dataField == 'current_allocation_lots')
    )
      return pct_renderer(row, dataField, cellValue, rowData, cellText)
    return contractRenderer(
      row,
      dataField,
      accounting.formatNumber(cellValue, 2),
      rowData,
      cellText
    )
  }
}

const contractRenderer = function (
  row,
  dataField,
  cellValue,
  rowData,
  cellText
) {
  if (rowData.rowType == 'sector') {
    // const key = currentAccountVar.bookIDMapRev[row]
    // const r = currentAccountVar.books[key]

    const pnlText = ''

    // if (r != null) {
    //   if (pnlUSD != null) pnl = pnlUSD[r.sector]
    //   else pnl = null

    //   if (pnl != null) {
    //     if (pnl > 0)
    //       pnlText =
    //         '   <span style="color:palegreen;font-weight: bold">  +' +
    //         pnl +
    //         'K  </span>'
    //     else
    //       pnlText =
    //         '   <span style="color:lightpink;font-weight: bold">  ' +
    //         pnl +
    //         'K  </span>'
    //   }
    // }

    if (
      dataField == 'qty' ||
      dataField == 'target_allocation_lots' ||
      dataField == 'current_allocation_lots'
    ) {
      return (
        "<span style='font-style: oblique;font-weight: bold;'>[" +
        cellValue +
        ']</span>'
      )
    } else {
      if (dataField == 'display') {
        return (
          "<span style='font-style: oblique;font-weight: bold;'>" +
          cellValue +
          '</span>  ' +
          pnlText
        )
      } else {
        return (
          "<span style='font-style: oblique;font-weight: bold;'>" +
          cellValue +
          '</span>'
        )
      }
    }
  }

  if (rowData.rowType == 'commodity') {
    let pnlText = ''
    let nonNullText = ''

    if (dataField == 'display') {
      const key = currentAccountVar.bookIDMapRev[row]
      const r = currentAccountVar.books[key]

      let pnl = null

      // if (pnlUSD != null) {
      //   pnl = pnlUSD[r.commo + ' ' + r.extension + ' ' + r.instrument]
      // } else {
      //   pnl = null
      // }

      if (pnl != null) {
        if (pnl > 0) {
          pnlText = '   <span style="color:green">+' + pnl + 'K</span>'
        } else {
          pnlText = '   <span style="color:red">' + pnl + 'K</span>'
        }
      }
      nonNullText =
        "  <a href='#' style='text-decoration: none;color:blue;font-weight:bold' val='false' onclick=\"filterNonNullCommo(book,'" +
        r.commo +
        "','" +
        r.extension +
        "','" +
        r.instrument +
        '\',this)">+</a>'
    }

    return (
      nonNullText +
      '  <span style="font-weight: bold";background-color:black>' +
      cellValue +
      pnlText +
      '</span>'
    )
  }

  if (rowData.rowType == 'contract') {
    let chg: any = '',
      position = cellValue

    if (dataField == 'display') {
      chg = parseFloat((rowData.last_price / rowData.settlement - 1) * 100)

      chg = chg.toFixed(2)

      if (chg > 0) {
        if (rowData.qty > 0) {
          position = "<span style='color:green'>" + cellValue + '</span>'
        }
        if (rowData.qty < 0) {
          position = "<span style='color:red'>" + cellValue + '</span>'
        }
      } else if (chg <= 0) {
        if (rowData.qty > 0) {
          position = "<span style='color:red'>" + cellValue + '</span>'
        }
        if (rowData.qty < 0) {
          position = "<span style='color:green'>" + cellValue + '</span>'
        }
      } else {
        position = '<span>' + cellValue + '</span>'
      }

      if (chg > 0) {
        chg =
          "<span style='color:green;font-weight:bold'>" +
          '  +' +
          chg +
          ' %' +
          '</span>'
      }
      if (chg <= 0) {
        chg =
          "<span style='color:red;font-weight:bold'>  " + chg + ' %' + '</span>'
        chg =
          "<span style='color:black;font-weight:bold'> &nbsp; " +
          accounting.formatNumber(
            rowData.last_price,
            PageControls.decimalPlaces(rowData.last_price)
          ) +
          '</span>' +
          chg
      }
    }
    return cellValue + chg
  }
}

const extensionRenderer = function (
  row,
  dataField,
  cellValue,
  rowData,
  cellText
) {
  if (rowData.rowType == 'sector') return ''
  if (rowData.rowType == 'commodity')
    return (
      '<span style="font-weight: bold;background-color:\'silver\'">' +
      cellValue +
      '</span>'
    )
}

const qRenderer = function (row, dataField, cellValue, rowData, cellText) {
  if (rowData.rowType == 'sector') return cellValue
  if (rowData.rowType == 'commodity') return cellValue
  if (rowData.rowType == 'contract') return cellValue // return ("<input type='text' value='manas' style='font-size: 6px;height: 10px;'/>");
}
const pRenderer = function (row, dataField, cellValue, rowData, cellText) {
  if (rowData.rowType == 'sector' && rowData.display != 'PORTFOLIO') {
    let genBtn = ''
    for (let i = 0; i < currentAccountVar.configTags.length; i++) {
      const configTag = currentAccountVar.configTags[i]
      genBtn +=
        "<button class='custombutton' name='generate' tag='" +
        rowData.sector +
        "' section='" +
        configTag +
        "' onclick='Generate(this)'>gen " +
        configTag +
        '</button>'
    }
    genBtn +=
      "<button class='custombutton' name='generate' tag='" +
      rowData.sector +
      "' onclick='GenerateID(this)'>gen id</button>"
    return (
      genBtn +
      "<button class='custombutton' name='preview' tag='" +
      rowData.sector +
      "'  onclick='Preview(this)'>prev</button>"
    )
  }
  if (rowData.rowType == 'commodity') return cellValue
  if (rowData.rowType == 'contract') return cellValue // return ("<input type='text' value='manas' style='font-size: 6px;height: 10px;'/>");
}
const aRenderer = function (row, dataField, cellValue, rowData, cellText) {
  if (rowData.rowType == 'sector' && rowData.display != 'PORTFOLIO') {
    return (
      "<a href='#' style='font-size:10pt;font-weight:bold;color:black' onclick='DeleteSector(\"" +
      rowData.sector +
      '");\'>X</a>'
    )
  }
  if (rowData.rowType == 'commodity')
    return (
      "<a href='#' style='font-size:10pt;font-weight:bold;color:blue' onclick='DeleteCommodity(\"" +
      rowData.commo +
      '","' +
      rowData.extension +
      '","' +
      rowData.instrument +
      '");\'>X</a>'
    )
  if (rowData.rowType == 'contract') {
    return (
      "<img src='img/glass.png' onclick='ODetails(\"" +
      rowData.id +
      '","' +
      rowData.orderQ +
      '","' +
      rowData.orderP +
      '");\'/>' +
      "<img src='img/trash.png' onclick='DeleteSingle(\"" +
      rowData.contract +
      '","' +
      rowData.extension +
      '",' +
      rowData.id +
      ");'/>"
    )
    //+"<a href='#' style='font-size:10pt;font-weight:bold;color:red' onclick='DeleteSingle(\"" + rowData.contract + "\",\"" + rowData.extension + "\"," + rowData.id + ");'>X</a>";
  }
}
const risksRenderer = function (row, dataField, cellValue, rowData, cellText) {
  if (cellValue == null || cellValue == 'NA' || cellValue == '') return ''
  else {
    cellValue = accounting.formatNumber(parseFloat(cellValue) * 100, 3) + ' %'
    if (rowData.rowType == 'commodity') {
      return '<span style="font-weight: bold">' + cellValue + '</span>'
    }
  }
}

function getCommoRisksColor(val) {
  if (val < 0.5) return 'nocommorisk'
  else if (val > 0.5 && val < 1) return 'lowcommorisk'
  else if (val > 1 && val < 1.5) return 'medcommorisk'
  else if (val > 1.5 && val < 2) return 'highcommorisk'
  else if (val > 2) return 'veryhighcommorisk'
}

function getDeltaColor(val) {
  if (val < 1) return 'white'
  else if (val > 1 && val < 2) return 'lowdelta'
  else if (val > 2 && val < 4) return 'meddelta'
  else if (val > 4) return 'veryhighdelta'
}

function getSpreadRisksColor(val) {
  if (val < 1.5) return 'nospdrisk'
  else if (val > 1.5 && val < 3) return 'lowspdrisk'
  else if (val > 3 && val < 4.5) return 'medspdrisk'
  else if (val > 4.5) return 'highspdrisk'
}

const cellClass = function (row, dataField, cellText, rowData) {
  if (rowData.rowType == 'sector' || rowData.rowType == 'commodity') {
    const cellValue = Math.abs(rowData[dataField] * 100)

    return getCommoRisksColor(cellValue)
  }
  if (rowData.rowType == 'contract') {
    return getSpreadRisksColor(
      currentAccountVar.spdRisks[rowData.commo][dataField] * 100
    )
  }
}
const colorType = function (row, dataField, cellText, rowData) {
  if (dataField == 'target_allocation_delta') {
    if (rowData.rowType == 'contract') return 'commo'
  }
  if (rowData.rowType == 'sector') {
    if (rowData.display == 'PORTFOLIO') return 'portfolio'
    else return 'sector'
  }

  if (rowData.rowType == 'commodity') {
    if (dataField.indexOf('current_allocation_delta') != -1) {
      return getDeltaColor(Math.abs(parseFloat(cellText)))
    }
    if (dataField.indexOf('display') != -1) {
      const key = currentAccountVar.bookIDMapRev[rowData.id]
      const row = currentAccountVar.books[key]
      if (row.marketStatus == 'FALSE') return 'marketclosed'
    }
    return 'commo'
  }

  if (rowData.rowType == 'contract') {
    // let nonnull = ''
    let commo = ''

    if (dataField == 'display') {
      const level = currentAccountVar.indLevel.find(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (item) => item.contract == rowData.contract
      )
      // @ts-ignore
      if (level != null) return 'level_' + level.maxLevel
    }
    if (dataField.indexOf('pct') != -1) {
      commo = 'commo'
    }
    if (dataField == 'orderQ' || dataField == 'orderP') {
      commo = 'editable'
    }
    if (dataField.indexOf('delta') != -1) {
      commo = 'white'
    }
    return commo
  }
}

export default {
  pct_renderer,
  size_renderer,
  lots_renderer,
  lots_renderer_decimal,
  contractRenderer,
  extensionRenderer,
  qRenderer,
  pRenderer,
  aRenderer,
  risksRenderer,
  getCommoRisksColor,
  getDeltaColor,
  getSpreadRisksColor,
  cellClass,
  colorType,
}
