import { RendererCallback } from '../types'
import helpers from '.'
import PageControls from './PageControls'

const isEmpty = (val: string) =>
  val === null || val === 'NA' || parseFloat(val) === 0 || val === ''

const pct_renderer: RendererCallback = function (
  row,
  dataField,
  cellValue,
  rowData,
  cellText
) {
  if (isEmpty(cellValue)) {
    return ''
  }

  return contractRenderer(
    row,
    dataField,
    accounting.formatNumber(parseFloat(cellValue) * 100, 2) + ' %',
    rowData,
    cellText
  )
}

const size_renderer: RendererCallback = function (
  row,
  dataField,
  cellValue,
  rowData
  // cellText
) {
  if (rowData.rowType != 'contract') {
    return ''
  }

  if (isEmpty(cellValue)) {
    return ''
  }

  const span = document.createElement('span')
  span.style.fontSize = '4pt'
  span.textContent = accounting.formatNumber(parseFloat(cellValue) * 100, 2)

  return span.outerHTML
}

const lots_renderer: RendererCallback = function (
  row,
  dataField,
  cellValue,
  rowData,
  cellText
) {
  if (isEmpty(cellValue)) {
    return ''
  }

  if (rowData.rowType === 'sector' && dataField === 'qty') {
    return pct_renderer(row, dataField, cellValue, rowData, cellText)
  } else {
    return contractRenderer(row, dataField, cellValue, rowData, cellText)
  }
}

const lots_renderer_decimal: RendererCallback = function (
  row,
  dataField,
  cellValue,
  rowData,
  cellText
) {
  if (isEmpty(cellValue)) {
    return ''
  }

  if (
    rowData.rowType == 'sector' &&
    (dataField == 'target_allocation_lots' ||
      dataField == 'current_allocation_lots')
  ) {
    return pct_renderer(row, dataField, cellValue, rowData, cellText)
  }

  return contractRenderer(
    row,
    dataField,
    accounting.formatNumber(cellValue, 2),
    rowData,
    cellText
  )
}

const contractRenderer: RendererCallback = function (
  row,
  dataField,
  cellValue,
  rowData
  // cellText
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

    const span = document.createElement('span')
    span.style.fontStyle = 'oblique'
    span.style.fontWeight = 'bold'
    span.textContent = cellValue

    if (
      dataField == 'qty' ||
      dataField == 'target_allocation_lots' ||
      dataField == 'current_allocation_lots'
    ) {
      span.textContent = `[${cellValue}]`
      return span.outerHTML
    }

    if (dataField == 'display') {
      return span.outerHTML + ' ' + pnlText
    }

    return span.outerHTML
  }

  if (rowData.rowType == 'commodity') {
    let pnlText = ''
    let nonNullText = ''

    if (dataField == 'display') {
      const accountVar = helpers.getAccountVar(currentAccount)
      const key = accountVar.bookIDMapRev[row]
      const r = accountVar.books[key]

      const pnl = null

      // if (pnlUSD != null) {
      //   pnl = pnlUSD[r.commo + ' ' + r.extension + ' ' + r.instrument]
      // } else {
      //   pnl = null
      // }

      if (pnl) {
        const pnlEl = document.createElement('span')
        pnlEl.textContent = pnl + 'K'
        pnlEl.style.color = pnl > 0 ? 'green' : 'red'
        pnlText = pnlEl.outerHTML
      }

      const showNonNullEl = document.createElement('button')
      showNonNullEl.classList.add('btn__reset')
      showNonNullEl.classList.add('btn__show-non-null')
      showNonNullEl.setAttribute('val', 'false')
      showNonNullEl.setAttribute(
        'onclick',
        `filterNonNullCommo('${r.commo}', '${r.extension}', '${r.instrument}', this)`
      )
      showNonNullEl.textContent = '+'
      nonNullText = showNonNullEl.outerHTML
    }

    const commoCellEl = document.createElement('span')
    commoCellEl.style.fontWeight = 'bold'
    commoCellEl.textContent = cellValue + pnlText

    return nonNullText + commoCellEl.outerHTML
  }

  if (rowData.rowType == 'contract') {
    let change: any = ''
    // position = cellValue

    if (dataField == 'display') {
      const calc = (rowData.last_price / rowData.settlement - 1) * 100
      change = parseFloat(calc.toString()).toFixed(2)

      const positionEl = document.createElement('span')
      positionEl.textContent = cellValue

      if (change > 0) {
        if (rowData.qty > 0) {
          positionEl.style.color = 'green'
        }
        if (rowData.qty < 0) {
          positionEl.style.color = 'red'
        }
      } else if (change <= 0) {
        if (rowData.qty > 0) {
          positionEl.style.color = 'red'
        }
        if (rowData.qty < 0) {
          positionEl.style.color = 'gree'
        }
      }

      // position = positionEl.outerHTML

      const changeEl = document.createElement('span')
      changeEl.style.fontWeight = 'bold'

      if (change > 0) {
        changeEl.style.color = 'green'
        changeEl.innerHTML = `&nbsp; +${change} %`
      } else if (change <= 0) {
        changeEl.style.color = 'red'
        changeEl.innerHTML = `&nbsp; ${change} %`
      }

      const finalEl = document.createElement('span')
      finalEl.style.color = 'black'
      finalEl.style.fontWeight = 'bold'
      finalEl.innerHTML = '&nbsp;'
      finalEl.innerHTML += accounting.formatNumber(
        rowData.last_price,
        PageControls.decimalPlaces(rowData.last_price)
      )

      change = finalEl.outerHTML + changeEl.outerHTML
    }

    return cellValue + change
  }
}

const extensionRenderer: RendererCallback = function (
  row,
  dataField,
  cellValue,
  rowData
  // cellText
) {
  if (rowData.rowType == 'sector') {
    return ''
  }

  if (rowData.rowType == 'commodity') {
    const extensionCellEl = document.createElement('span')
    extensionCellEl.style.fontWeight = 'bold'
    extensionCellEl.style.backgroundColor = 'silver'
    extensionCellEl.textContent = cellValue
    return extensionCellEl.outerHTML
  }
}

const qRenderer: RendererCallback = function (
  row,
  dataField,
  cellValue,
  rowData
  // cellText
) {
  if (
    rowData.rowType === 'sector' ||
    rowData.rowType === 'commodity' ||
    rowData.rowType === 'contract'
  ) {
    return cellValue
  }
  // return ("<input type='text' value='manas' style='font-size: 6px;height: 10px;'/ > ");
}

const pRenderer: RendererCallback = function (
  row,
  dataField,
  cellValue,
  rowData
  // cellText
) {
  if (rowData.rowType === 'commodity' || rowData.rowType === 'contract') {
    return cellValue
  }

  const accountVar = helpers.getAccountVar(currentAccount)

  if (rowData.rowType === 'sector' && rowData.display !== 'PORTFOLIO') {
    let generateButtons = ''
    for (let i = 0; i < accountVar.configTags.length; i++) {
      const configTag = accountVar.configTags[i]
      const generateButton = document.createElement('button')
      generateButton.classList.add('custombutton')
      generateButton.setAttribute('name', 'generate')
      generateButton.setAttribute('tag', rowData.sector)
      generateButton.setAttribute('section', configTag)
      generateButton.setAttribute('onclick', 'Generate(this)')
      generateButton.textContent = `gen ${configTag}`
      generateButtons += generateButton.outerHTML
    }

    const generateIDButton = document.createElement('button')
    generateIDButton.classList.add('custombutton')
    generateIDButton.setAttribute('name', 'generate')
    generateIDButton.setAttribute('tag', rowData.sector)
    generateIDButton.setAttribute('onclick', 'Generate(this)')
    generateIDButton.textContent = 'gen id'
    generateButtons += generateIDButton.outerHTML

    const previewOrderBySectorButton = document.createElement('button')
    previewOrderBySectorButton.classList.add('custombutton')
    previewOrderBySectorButton.setAttribute('name', 'preview')
    previewOrderBySectorButton.setAttribute(
      'onclick',
      `openPreviewAllOrdersWindow('${rowData.sector}')`
    )
    previewOrderBySectorButton.textContent = 'prev'
    generateButtons += previewOrderBySectorButton.outerHTML

    return generateButtons
  }

  // return ("<input type='text' value='manas' style='font-size: 6px;height: 10px;'/>");
}

const aRenderer: RendererCallback = function (
  row,
  dataField,
  cellValue,
  rowData
  // cellText
) {
  if (rowData.rowType === 'sector' && rowData.display !== 'PORTFOLIO') {
    const deleteSectorButton = document.createElement('button')
    deleteSectorButton.classList.add('btn__reset')
    deleteSectorButton.classList.add('btn__delete-sector')
    deleteSectorButton.setAttribute(
      'onclick',
      `DeleteSector('${rowData.sector}')`
    )
    deleteSectorButton.textContent = 'X'
    return deleteSectorButton.outerHTML
  }

  if (rowData.rowType === 'commodity') {
    const deleteCommodityButton = document.createElement('button')
    deleteCommodityButton.classList.add('btn__reset')
    deleteCommodityButton.classList.add('btn__delete-sector')
    deleteCommodityButton.setAttribute(
      'onclick',
      `DeleteCommodity('${rowData.commo}', '${rowData.extension}', '${rowData.instrument}')`
    )
    deleteCommodityButton.textContent = 'X'
    return deleteCommodityButton.outerHTML
  }

  if (rowData.rowType === 'contract') {
    const container = document.createElement('div')
    container.classList.add('flex')
    container.classList.add('justify-center')

    const previewButton = document.createElement('button')
    previewButton.classList.add('button-custom')
    previewButton.title = 'Order details'
    previewButton.setAttribute(
      'onclick',
      `openPreviewSingleOrderWindow('${rowData.id}')`
    )
    {
      const icon = document.createElement('img')
      icon.setAttribute('width', '18.5')
      icon.setAttribute('height', '18.5')
      icon.setAttribute('src', 'img/magnify.svg')
      previewButton.appendChild(icon)
    }
    container.appendChild(previewButton)

    // Don't show the alarm button under eur or usd
    if (
      !(
        ['usd', 'eur', 'eur loan', 'fund', 'usd cash'].indexOf(
          rowData.contract.toLocaleLowerCase()
        ) > -1
      )
    ) {
      const alarmButton = document.createElement('button')
      alarmButton.classList.add('button-custom', 'alarm-button')
      alarmButton.title = 'Set market data alarm'
      alarmButton.setAttribute(
        'onclick',
        `openAlarmWindow('${rowData.contract_twodigit}', '${rowData.extension}')`
      )
      {
        const icon = document.createElement('img')
        icon.setAttribute('width', '20')
        icon.setAttribute('height', '20')
        icon.setAttribute('src', 'img/alarm.svg')
        alarmButton.appendChild(icon)
      }
      container.appendChild(alarmButton)
      const dot = document.createElement('div')
      dot.classList.add('dot')
      for (let i = 0; i < window.alarms.length; i++) {
        const alarm = window.alarms[i]
        const [alarm_contract_twodigit, alarm_extension] = alarm.contract
          .toLowerCase()
          .split(' ')

        if (
          alarm_contract_twodigit == rowData.contract_twodigit.toLowerCase() &&
          alarm_extension == rowData.extension.toLowerCase()
        ) {
          if (alarm.reached && !dot.classList.contains('red')) {
            dot.classList.add('red')
            alarmButton.classList.add('swing')
            alarmButton.appendChild(dot)
          } else if (!dot.classList.contains('green')) {
            dot.classList.add('green')
            alarmButton.appendChild(dot)
          }
          if (!alarm.reached) continue
        }
      }
    }

    const deleteSingleButton = document.createElement('button')
    deleteSingleButton.classList.add('button-custom')
    deleteSingleButton.title = 'Delete order'
    deleteSingleButton.setAttribute(
      'onclick',
      `DeleteSingle('${rowData.contract}', '${rowData.extension}', '${rowData.id}')`
    )
    {
      const icon = document.createElement('img')
      icon.setAttribute('width', '20')
      icon.setAttribute('height', '20')
      icon.setAttribute('src', 'img/trash-can.svg')
      deleteSingleButton.appendChild(icon)
    }
    container.appendChild(deleteSingleButton)

    return container.outerHTML
    //+"<a href='#' style='font-size:10pt;font-weight:bold;color:red' onclick='DeleteSingle(\"" + rowData.contract + "\",\"" + rowData.extension + "\"," + rowData.id + ");'>X</a>";
  }
}

const risksRenderer: RendererCallback = function (
  row,
  dataField,
  cellValue,
  rowData
  // cellText
) {
  if (isEmpty(cellValue)) {
    return ''
  }

  if (rowData.rowType === 'commodity') {
    cellValue = accounting.formatNumber(parseFloat(cellValue) * 100, 3)
    return `<span style="font-weight: bold">${cellValue} %</span>`
  }
}

function getCommoRisksColor(val: number) {
  if (val < 0.5) return 'nocommorisk'
  else if (val > 0.5 && val < 1) return 'lowcommorisk'
  else if (val > 1 && val < 1.5) return 'medcommorisk'
  else if (val > 1.5 && val < 2) return 'highcommorisk'
  else if (val > 2) return 'veryhighcommorisk'
}

function getDeltaColor(val: number) {
  if (val < 1) return 'white'
  else if (val > 1 && val < 2) return 'lowdelta'
  else if (val > 2 && val < 4) return 'meddelta'
  else if (val > 4) return 'veryhighdelta'
}

function getSpreadRisksColor(val: number) {
  if (val < 1.5) return 'nospdrisk'
  else if (val > 1.5 && val < 3) return 'lowspdrisk'
  else if (val > 3 && val < 4.5) return 'medspdrisk'
  else if (val > 4.5) return 'highspdrisk'
}

const cellClass: RendererCallback = function (
  row,
  dataField,
  cellText,
  rowData
) {
  const accountVar = helpers.getAccountVar(currentAccount)

  if (rowData.rowType === 'sector' || rowData.rowType === 'commodity') {
    const cellValue = Math.abs(rowData[dataField] * 100)
    return getCommoRisksColor(cellValue)
  }
  if (rowData.rowType === 'contract') {
    return getSpreadRisksColor(
      accountVar.spdRisks[rowData.commo][dataField] * 100
    )
  }
}

const colorType: RendererCallback = function (
  row,
  dataField,
  cellText,
  rowData
) {
  const accountVar = helpers.getAccountVar(currentAccount)

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
      const key = accountVar.bookIDMapRev[rowData.id]
      const row = accountVar.books[key]
      if (row.marketStatus == 'FALSE') return 'marketclosed'
    }
    return 'commo'
  }

  if (rowData.rowType == 'contract') {
    // let nonnull = ''
    let commo = ''

    if (dataField == 'display') {
      const level = accountVar.indLevel.find(
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
      commo = 'editable wrap'
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
