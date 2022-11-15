import helpers from '.'
import cellRenderers from './CellRenderers'

const gridColumns = [
  {
    text: 'Contract',
    dataField: 'display',
    width: 230,
    cellsRenderer: cellRenderers.contractRenderer,
    cellClassName: cellRenderers.colorType,
    align: 'center',
    editable: false,
  },
  {
    text: 'Extension',
    dataField: 'extension',
    width: 75,
    cellsRenderer: cellRenderers.extensionRenderer,
    cellClassName: cellRenderers.colorType,
    hidden: true,
    align: 'center',
    editable: false,
  },
  {
    text: 'Instrument',
    dataField: 'instrument',
    width: 75,
    cellsRenderer: cellRenderers.extensionRenderer,
    cellClassName: cellRenderers.colorType,
    hidden: true,
    align: 'center',
    editable: false,
  },

  {
    text: 'Percent',
    dataField: 'positions_pct_target',
    cellsRenderer: cellRenderers.pct_renderer,
    width: 67,
    columnGroup: 'exposure',
    cellClassName: cellRenderers.colorType,
    align: 'center',
    editable: false,
    cellsAlign: 'center',
  },
  {
    text: 'Lots',
    dataField: 'qty',
    width: 75,
    columnGroup: 'exposure',
    cellsRenderer: cellRenderers.lots_renderer,
    cellClassName: cellRenderers.colorType,
    align: 'center',
    editable: false,
    cellsAlign: 'center',
  },

  {
    text: 'Percent',
    dataField: 'current_allocation_pct',
    cellsRenderer: cellRenderers.pct_renderer,
    width: 67,
    columnGroup: 'current_allocation',
    cellClassName: cellRenderers.colorType,
    align: 'center',
    editable: false,
    cellsAlign: 'center',
  },
  {
    text: 'Lots',
    dataField: 'current_allocation_lots',
    width: 90,
    columnGroup: 'current_allocation',
    cellsRenderer: cellRenderers.lots_renderer_decimal,
    cellClassName: cellRenderers.colorType,
    align: 'center',
    editable: false,
    cellsAlign: 'center',
  },
  {
    text: 'Δ',
    dataField: 'current_allocation_delta',
    width: 67,
    columnGroup: 'current_allocation',
    cellsRenderer: cellRenderers.lots_renderer_decimal,
    cellClassName: cellRenderers.colorType,
    align: 'center',
    editable: false,
    cellsAlign: 'center',
  },

  {
    text: 'Percent',
    dataField: 'target_allocation_pct',
    cellsRenderer: cellRenderers.pct_renderer,
    width: 67,
    columnGroup: 'target_allocation',
    cellClassName: cellRenderers.colorType,
    align: 'center',
    editable: false,
    cellsAlign: 'center',
  },
  {
    text: 'Lots',
    dataField: 'target_allocation_lots',
    width: 70,
    columnGroup: 'target_allocation',
    cellsRenderer: cellRenderers.lots_renderer_decimal,
    cellClassName: cellRenderers.colorType,
    align: 'center',
    editable: false,
    cellsAlign: 'center',
  },
  {
    text: 'Δ',
    dataField: 'target_allocation_delta',
    width: 67,
    columnGroup: 'target_allocation',
    cellsRenderer: cellRenderers.lots_renderer_decimal,
    cellClassName: cellRenderers.colorType,
    align: 'center',
    editable: false,
    cellsAlign: 'center',
  },

  {
    text: 'Current',
    dataField: 'current_risks_pre',
    width: 58,
    columnGroup: 'risks_pre',
    cellsRenderer: cellRenderers.pct_renderer,
    cellClassName: cellRenderers.cellClass,
    align: 'center',
    editable: false,
    cellsAlign: 'center',
  },
  {
    text: 'Target',
    dataField: 'target_risks_pre',
    width: 58,
    columnGroup: 'risks_pre',
    cellsRenderer: cellRenderers.pct_renderer,
    cellClassName: cellRenderers.cellClass,
    align: 'center',
    editable: false,
    cellsAlign: 'center',
  },
  {
    text: 'Current',
    dataField: 'current_risks_post',
    width: 58,
    columnGroup: 'risks_post',
    cellsRenderer: cellRenderers.pct_renderer,
    cellClassName: cellRenderers.cellClass,
    align: 'center',
    editable: false,
    cellsAlign: 'center',
  },
  {
    text: 'Target',
    dataField: 'target_risks_post',
    width: 58,
    columnGroup: 'risks_post',
    cellsRenderer: cellRenderers.pct_renderer,
    cellClassName: cellRenderers.cellClass,
    align: 'center',
    editable: false,
    cellsAlign: 'center',
  },

  {
    text: 'Order Qty',
    dataField: 'orderQ',
    width: 150,
    columnGroup: 'orders',
    cellsRenderer: cellRenderers.qRenderer,
    cellClassName: cellRenderers.colorType,
    align: 'center',
  },

  {
    text: 'Order Strategy',
    dataField: 'orderP',
    width: 350,
    columnGroup: 'orders',
    cellsRenderer: cellRenderers.pRenderer,
    align: 'center',
    cellClassName: cellRenderers.colorType,
    columnType: 'template',
    createEditor(row, cellvalue, editor, cellText, width, height) {
      const accountVar = helpers.getAccountVar(currentAccount)
      accountVar.inputEl = $('<input />')
      // @ts-ignore
      accountVar.inputEl.prependTo(editor).jqxInput({
        placeHolder: 'Strategy',
        theme: 'office',
        height: '100%',
        width: width,
        source(query, response) {
          const item = query.split(/;/).pop()
          // update the search query.
          if (item.indexOf('#') != -1) {
            const a = item.indexOf('#')
            // @ts-ignore
            accountVar.inputEl.jqxInput({ query: item.substr(a + 1) })
            const arr = []
            let j = 0
            for (let i = 0; i < accountVar.books.length; i++) {
              const book = accountVar.books[i]
              if (book.rowType == 'contract') {
                const contract = book.contract
                arr[j] = item.substr(0, a + 1) + contract
                j++
              }
            }
            response(arr)
          } else {
            // @ts-ignore
            accountVar.inputEl.jqxInput({ query: item })
            response(strategies)
          }
        },
        renderer(itemValue, inputValue) {
          const terms = inputValue.split(/;/)
          terms.pop()
          terms.push(itemValue)
          terms.push('')
          const value = terms.join(';')
          return value
        },
      })
    },
    initEditor(row, cellvalue, editor /* , celltext, width, height */) {
      editor.find('input').jqxInput('val', cellvalue)
    },
    getEditorValue: function (row, cellvalue, editor) {
      return editor.find('input').jqxInput('val')
    },
  },
  {
    text: '',
    dataField: 'action',
    cellsRenderer: cellRenderers.aRenderer,
    width: 80,
    align: 'center',
    columnGroup: 'orders',
    cellClassName: cellRenderers.colorType,
    editable: false,
    cellsAlign: 'center',
  },
  {
    text: '',
    dataField: 'order_size',
    width: 10,
    columnGroup: 'orders',
    cellsRenderer: cellRenderers.size_renderer,
    hidden: true,
    cellClassName: cellRenderers.colorType,
    align: 'center',
    editable: false,
  },
]

export default gridColumns
