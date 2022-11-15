import helpers from '.'
import http from '../services/http'
import Risks from './Risks'

// function preview(event) {
//   const btn = event.target
//   const tag = btn.getAttribute('tag') || ''
//   // console.log(`Generating for sector: ${tag}`)
//   $('#dynacontainer').html(
//     `<div id="preview" style="width:1300px">
//         <div id="windowHeader">
//             <h2>Preview Orders - ${tag} </h2>
//         </div>
//         <div style="overflow: hidden" id="windowContent"></div>
//     </div>`
//   )
//   $('#preview').jqxWindow({
//     minHeight: '70vh',
//     minWidth: '1200px',
//     maxHeight: '85vh',
//     autoOpen: true,
//     isModal: true,
//     animationType: 'slide',
//     initContent() {
//       const a = BuildPreview(tag)
//       $('#windowContent').html('<div id="previewtable"></div>')
//       const source_preview = {
//         localdata: a,
//         datafields: [
//           {
//             name: 'contract',
//             type: 'number',
//           },
//           {
//             name: 'extension',
//             type: 'string',
//           },
//           {
//             name: 'qty',
//             type: 'string',
//           },
//           {
//             name: 'strategy',
//             type: 'string',
//           },
//           {
//             name: 'price',
//             type: 'number',
//           },
//           {
//             name: 'account',
//             type: 'number',
//           },
//           {
//             name: 'freetext',
//             type: 'number',
//           },
//           {
//             name: 'contract_twodigit',
//             type: 'number',
//           },
//           {
//             name: 'commo',
//             type: 'string',
//           },
//           {
//             name: 'instrument',
//             type: 'string',
//           },
//         ],
//         datatype: 'array',
//       }
//       const dataAdapter_preview = new $.jqx.dataAdapter(source_preview)
//       // initialize jqxGrid
//       $('#previewtable').jqxGrid({
//         width: 1150,
//         height: 700,
//         theme: 'office',
//         source: dataAdapter_preview,
//         columns: [
//           {
//             text: 'Contract',
//             datafield: 'contract',
//           },
//           {
//             text: 'Extension',
//             datafield: 'extension',
//           },
//           {
//             text: 'Quantity',
//             datafield: 'qty',
//           },
//           {
//             text: 'Strategy',
//             datafield: 'strategy',
//             cellsalign: 'center',
//             width: 200,
//           },
//           {
//             text: 'Price',
//             datafield: 'price',
//           },
//           {
//             text: 'FreeText',
//             datafield: 'freetext',
//             width: 150,
//           },
//           {
//             text: 'Account',
//             datafield: 'account',
//             width: 150,
//           },
//         ],
//         selectionmode: 'multiplerowsextended',
//         showtoolbar: true,
//         rendertoolbar: function (toolbar) {
//           // const me = this
//           const container = $("<div style='margin: 5px;'></div>")
//           // const span = $(
//           //   "<span style='float: left; margin-top: 5px; margin-right: 4px;'>Search City: </span>"
//           // )
//           const input = $(
//             "<input class='jqx-input jqx-widget-content jqx-rc-all' id='selectAll' type='button' style='height: 23px; float: left; width: 150px;' value='Select All' />"
//           )
//           const input2 = $(
//             "<input class='jqx-input jqx-widget-content jqx-rc-all' id='selectAll' type='button' style='height: 23px; float: left; width: 150px;' value='Send to iTrade' />"
//           )
//           toolbar.append(container)
//           container.append(input)
//           container.append(input2)
//           // const theme = 'office'
//           // if (theme != '') {
//           //   input.addClass('jqx-widget-content-' + theme)
//           //   input.addClass('jqx-rc-all-' + theme)
//           //   input2.addClass('jqx-widget-content-' + theme)
//           //   input2.addClass('jqx-rc-all-' + theme)
//           // }
//           // const oldVal = ''
//           input.on('click', () => $('#previewtable').jqxGrid('selectallrows'))
//           input2.on('click', () => {
//             const selected = $('#previewtable').jqxGrid('getselectedrowindexes')
//             // const rows = $('#previewtable').jqxGrid('getrows')
//             // const j = 0
//             for (let i = 0; i < selected.length; i++) {
//               // api.sendtoitrade(
//               //   selected[i],
//               //   rows[selected[i]],
//               //   td,
//               //   function (response) {
//               //     $('#previewtable').jqxGrid('unselectrow', response.result)
//               //     $('#previewtable').jqxGrid('deleterow', response.result)
//               //   }
//               // )
//             }
//           })
//         },
//       })
//     },
//   })
//   //   $('#preview').on('close', function (event) {
//   //     $('#previewtable').jqxGrid('destroy')
//   //     $('#preview').jqxWindow('destroy')
//   //   })
// }

function Generate(btn) {
  const prevText = $(btn).text()
  $(btn).text('Processing')

  let tag = $(btn).attr('tag')

  console.log(`Generating for sector: ${tag}`)
  const key = `generateSector${tag}`

  tag = helpers.quoteStringOrNullString(tag)

  const account = currentAccount
  const accountVar = accountsVar[account]
  const tradeDate = accountVar.tradeDate
  const excecuteR = accountVar.excecuteR

  const section = helpers.quoteStringOrNullString($(btn).attr('section'))

  const code = `generateIRMSOrders('${tradeDate}', '${account}', ${tag}, ${section}, TRUE)`
  console.log(`Sending: ${code}`)
  excecuteR.connect(key, code)
  excecuteR.intervals.set(
    key,
    setInterval(function () {
      console.log('Checking status for', code)
      if (excecuteR.scripts[key] == null) {
        $(btn).text('Queued.')
      } else if (parseFloat(excecuteR.scripts[key].data) == 1) {
        excecuteR.scripts[key] = null
        $(btn).text('Done.')
        SoftReload()
        clearInterval(excecuteR.intervals.get(key))
      } else if (excecuteR.scripts[key].data == 'fail') {
        $(btn).text(prevText)
        SoftReload()
        excecuteR.scripts[key] = null
        clearInterval(excecuteR.intervals.get(key))
      }
    }, 1000)
  )
  $(btn).text(prevText)
}

function GenerateID(btn) {
  const prevText = $(btn).text()
  $(btn).text('Processing')

  const tag = $(btn).attr('tag')

  const sector = helpers.quoteStringOrNullString(tag)
  // const section = helpers.quoteStringOrNullString($(btn).attr('section'))

  console.log(`Generating ID for sector: ${sector}`)
  const key = `generateSectorID${sector}`

  const account = currentAccount
  const accountVar = accountsVar[account]
  const excecuteR = accountVar.excecuteR

  const code = `generateIDOrders('${account}','irms',' ${sector})`
  excecuteR.connect(key, code)
  console.log(`Sending: ${code}`)
  excecuteR.intervals.set(
    key,
    setInterval(function () {
      console.log('Checking status for', code)
      if (excecuteR.scripts[key] == null) {
        $(btn).text('Queued.')
      } else if (parseFloat(excecuteR.scripts[key].data) == 1) {
        excecuteR.scripts[key] = null
        $(btn).text('Done.')
        SoftReload()
        clearInterval(excecuteR.intervals.get(key))
      } else if (excecuteR.scripts[key].data == 'fail') {
        $(btn).text(prevText)
        SoftReload()
        excecuteR.scripts[key] = null
        clearInterval(excecuteR.intervals.get(key))
      }
    }, 1000)
  )
  $(btn).text(prevText)
}

// function Delete(btn) {
//   sector = $(btn).attr('tag')
//   DeleteSector(sector)
// }

function DeleteSector(sector: string) {
  return http
    .delete(
      `delete_all_orders/${currentAccount}/${currentAccountVar.tradeDate}`,
      //  @ts-ignore
      { sector }
    )
    .then((/* { data } */) => {
      for (let i = 0; i < currentAccountVar.books.length; i++) {
        const book = currentAccountVar.books[i]
        if (book.sector == sector && book.rowType == 'contract') {
          book.orderQ = null
          book.orderP = null
        }
        if (sector == '' && book.rowType == 'contract') {
          book.orderQ = null
          book.orderP = null
        }
      }
      Risks.ComputeRisks()
      $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
      // TODO: Success notification
    })
    .catch((error) => {
      console.error(error)
    })
}

function DeleteCommodity(
  commodity: string,
  extension: string
  // instrument: string
) {
  http
    .delete(
      `delete_commodity/${currentAccount}/${currentAccountVar.tradeDate}/${commodity}/${extension}`
    )
    .then((/* {data} */) => {
      for (let i = 0; i < currentAccountVar.books.length; i++) {
        const book = currentAccountVar.books[i]
        if (
          book.commo == commodity &&
          book.extension == extension &&
          // book.instrument == instrument &&
          book.rowType == 'contract'
        ) {
          book.orderQ = null
          book.orderP = null
        }
      }
      Risks.ComputeRisks()
      $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
      // TODO: what the code below do?
      // treeGrid.jqxTreeGrid('selectRow', row.id)
      // TODO: success notification
      // success('Deleted orders for: ' + commodity)
    })
    .catch((error) => {
      console.error(error)
    })
}

function DeleteSingle(contract: string, extension: string, id: string) {
  http
    .delete(
      `delete_single/${currentAccount}/${currentAccountVar.tradeDate}/${contract}/${extension}`
    )
    .then((/* { data } */) => {
      const index = Risks.GetBookIndexByID(id)
      const book = currentAccountVar.books[index]
      book.orderQ = null
      book.orderP = null
      $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
      $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('selectRow', book.id)
      // TODO: Success notification
      // success('Deleted orders for: ' + contract)
    })
    .catch((error) => {
      console.error('Failed to delete single', error)
    })
}

async function BuildPreview(sector) {
  let sectorRows = $.grep(
    currentAccountVar.books,
    (element) => element.sector == sector
  )
  if (sector == '') {
    sectorRows = currentAccountVar.books
  }
  // ignoreStrategies = 'CHECK'
  let excluded = 0
  let excludedStrategy = 0
  const existingOrders = await http.get(
    `get_working/${currentAccount}/${currentAccountVar.tradeDate}`
  )
  const orders = []
  let j = 0
  for (let i = 0; i < sectorRows.length; i++) {
    const sectorRow = sectorRows[i]
    let quantities = sectorRow.orderQ

    if (quantities == '' || quantities == null) {
      continue
    }

    quantities = quantities.split(';')
    const strategies = sectorRow.orderP.split(';')

    if (quantities.length > strategies.length) {
      const msg = `You have more quantities than strategies for ${sectorRow.contract} ${sectorRow.extension}`
      alert(msg)
      console.log(msg)
      return
    }

    if (quantities.length < strategies.length) {
      const msg = `You have more strategies than quantities for ${sectorRow.contract} ${sectorRow.extension}`
      alert(msg)
      console.log(msg)
      return
    }

    for (let k = 0; k < quantities.length; k++) {
      const account = currentAccount
      const { commo, extension, instrument } = sectorRow
      let contract = sectorRow.contract
      let contract_twodigit = sectorRow.contract_twodigit

      const q = quantities[k]
      let strat, price

      if (strategies[k].indexOf('@') != -1) {
        strat = strategies[k].split('@')[0]
        price = strategies[k].split('@')[1]
      } else {
        strat = strategies[k]
        price = '0'
      }

      let freetext
      if (price.indexOf('/') != -1) {
        freetext = price.split('/')[1]
        price = price.split('/')[0]
      } else {
        freetext = ''
      }

      if (isNaN(parseFloat(price))) {
        freetext = price
        price = '0'
      }

      let ordered
      if (strat.indexOf('#') != -1) {
        //contract = sectorRow.contract + "-" + strat.split('#')[1];
        if (strat.split('#')[1] == '')
          contract = sectorRow.contract + '-' + strat.split('#')[1]
        else {
          ordered = []
          // ordered = JSON.parse(
          //   api.ordercontracts(sectorRow.contract, strat.split('#')[1]),
          //   extension
          // )
          contract =
            ordered[0].contract_onedigit + '-' + ordered[1].contract_onedigit
          contract_twodigit =
            ordered[0].contract_twodigit + '-' + ordered[1].contract_twodigit
        }
        strat = strat.replace('#' + strat.split('#')[1], '')
      }
      const a: any = {}
      if (strat === ignoreStrategies) continue
      let flag = false
      // @ts-ignore
      for (let l = 0; l < existingOrders.length; l++) {
        if (
          existingOrders[l].contract == contract &&
          existingOrders[l].extension == extension &&
          existingOrders[l].price == price &&
          existingOrders[l].strategy == strat
        ) {
          flag = true
          break
        }
      }

      if (flag) {
        excluded++
        continue
      }

      if (strategies.indexOf(strat) == -1) {
        excludedStrategy++
        continue
      }

      a.contract = contract
      a.extension = extension
      a.account = account
      a.qty = q
      a.strategy = strat
      a.price = price
      a.freetext = freetext
      a.contract_twodigit = contract_twodigit
      a.commo = commo
      a.instrument = instrument
      orders[j] = a
      j = j + 1
    }
  }

  if (excluded > 0) {
    alert(
      excluded + ' orders have been excluded as they are already in iTrade.'
    )
  }
  //    if(excludedStrategy>0)
  //    {
  //        alert(excluded+" orders have been excluded as they have invalid strategies.");
  //    }
  return orders
}

function SoftReload() {
  const account = currentAccount
  const accountVar = accountsVar[account]

  http
    .get(`get_book/${account}/${accountVar.tradeDate}`)
    .then(async ({ data: books }) => {
      accountVar.books = books

      accountVar.portfolio = await http
        .get(`get_portfolio/${account}/${accountVar.tradeDate}`)
        .then(({ data }) => data)
        .catch((error) => console.error('Failed to get portfolio:', error))

      accountVar.portfolio.display = 'PORTFOLIO'
      accountVar.portfolio.rowType = 'sector'
      accountVar.portfolio.parent = null

      accountVar.books.unshift(accountVar.portfolio)
      for (let i = 0; i < accountVar.books.length; i++) {
        const book = accountVar.books[i]
        book.expanded = true
        book.order_size = null
      }

      Risks.ComputeRisks()
      accountVar.spdRisks = Risks.SpreadRisks()

      $(`#${accountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
    })
    .catch((error) => {
      console.error(`Failed to fetch books of ${account} account\n`, error)
    })
}

function Reload() {
  // api.getbook(td, account, function (response) {
  //        book = JSON.parse(response.result);
  //        source.localdata = book
  //        for (i = 0; i < book.length; i++) { book[i].expanded = true; book[i].order_size = null; }
  //        ComputeRisks();
  //spdRisks = SpreadRisks();
  // $('#myButton').click()
  currentAccountVar.vue.loadIRMS()
  //$('#treeGrid').jqxTreeGrid('updateBoundData');
  // })
}

function Calculate(btn) {
  const prevText = $(btn).val()
  $(btn).val('Processing')
  $(btn).jqxButton({ disabled: true })

  const account = currentAccount
  const accountVar = accountsVar[account]
  const excecuteR = accountVar.excecuteR

  const key = 'calculate'
  const code = `iRMS.createBook(iRMS(account='${account}'),TRUE,FALSE)`
  excecuteR.connect(key, code)
  console.log(`Sending: ${code}`)
  excecuteR.intervals.set(
    key,
    setInterval(function () {
      console.log('Checking status for', code)
      if (excecuteR.scripts[key] == null) {
        $(btn).val('Queued.')
      } else if (parseFloat(excecuteR.scripts[key].data) == 1) {
        excecuteR.scripts[key] = null
        $(btn).val('Done.')
        //Reload();
        $(btn).jqxButton({ disabled: false })
        clearInterval(excecuteR.intervals.get(key))
        $(btn).val(prevText)
      } else if (excecuteR.scripts[key].data == 'fail') {
        $(btn).val('Error')
        Reload()
        excecuteR.scripts[key] = null
        $(btn).val(prevText)
        $(btn).jqxButton({ disabled: false })
        clearInterval(excecuteR.intervals.get(key))
      }
    }, 1000)
  )
}

// function SendCustomScript(btn) {
//   a = $(btn).val()
//   scri = $(btn).attr('script')
//   $(btn).val('Processing')
//   $(btn).jqxButton({
//     disabled: true,
//   })
//   connect('custom', scri)
//   xx = setInterval(function myfunction() {
//     if (scripts['custom'] == null) $(btn).val('Queued.')
//     else if (parseFloat(scripts['custom'].data) == 1) {
//       scripts['custom'] = null
//       $(btn).text('Done.')
//       $(btn).val(a)
//       $(btn).jqxButton({
//         disabled: false,
//       })
//       clearInterval(xx)
//       SoftReload()
//     } else if (scripts['calculate'].data == 'fail') {
//       $(btn).text('Error')
//       Reload()
//       scripts['custom'] = null
//       $(btn).val(a)
//       $(btn).jqxButton({
//         disabled: false,
//       })
//       clearInterval(xx)
//     }
//   }, 1000)
// }

// function LoadConfig(type, what) {
//   if (account == null) {
//     alert('Please load the book first')
//     return
//   }
//   $('#configWindow').html(
//     '<div id="configWin" style="width:1300px"><div id="windowHeader2"><span><h2>' +
//       what +
//       ' - ' +
//       account +
//       '</h2></span></div><div style="overflow: hidden;" id="windowContent2"></div></div>'
//   )
//   $('#configWin').jqxWindow({
//     minHeight: '730px',
//     minWidth: '1200px',
//     autoOpen: true,
//     isModal: true,
//     animationType: 'slide',
//     initContent: function () {
//       $('#windowContent2').html(
//         "<textarea spellcheck='false' style='width:1300px;font-family: 'Open Sans', sans-serif;' id='ta' rows='35' cols=500 autofocus></textarea><input type='button' id='saveConfig' onclick=\"SaveConfig('" +
//           type +
//           "')\" value='Save " +
//           what +
//           "'/>"
//       )
//       $('#ta').val(api.getconfig(account, type))
//     },
//   })
//   $('#configWin').on('close', function (event) {
//     $('#configWin').jqxWindow('destroy')
//   })
// }

// function GetComments() {
//   comm = api.getconfig(account, 'tradercomments')
//   return comm
// }

// function LoadComments() {
//   comm = GetComments()
//   if (comm != '') $('#btn_comments').css('background-color', 'yellow')
//   else $('#btn_comments').css('background-color', '')
//   if (account == 'KRMA') {
//     $('#commentsarea').remove()
//     $('#contenttabletreeGrid').append(
//       "<TEXTAREA id='commentsarea' rows='10' cols='100' style='width:1550px;background-color:yellow;color:red' readonly>" +
//         comm +
//         '</TEXTAREA>'
//     )
//   }
// }

// function SaveConfig(type) {
//   api.sendconfig(account, $('#ta').val(), type, function () {
//     console.log('Config saved.')
//     LoadComments()
//     $('#configWin').jqxWindow('destroy')
//   })
// }

// const odContiner = $('#order-detail-container')
// const od = $('#od')
// const odIframe = $('#order-detail-iframe')
// const idSaveBtn = $('#save-order-button')

function openPreviewSingleOrderWindow(rowID: number) {
  window.previewSingleOrderWindow.open(rowID)
}

function openPreviewAllOrdersWindow(sector: string) {
  window.previewAllOrdersWindow.open(sector)
}

// function saveod() {
//   const qty = odIframe.contents().find('#odqty').text()
//   const strat = odIframe.contents().find('#odstrat').text()

//   const rowid = od.attr('tag')
//   const index = Risks.GetBookIndexByID(rowid)
//   const book = currentAccountVar.books[index]

//   book.orderQ = qty
//   book.orderP = strat

//   const cellData = {
//     id: book.id,
//     contract: book.contract,
//     extension: book.extension || null,
//     order_qty: book.orderQ || null,
//     order_p: book.orderP || null,
//   }

//   // Send request to server for save cell
//   http
//     .post(
//       `save_cell/${currentAccount}/${currentAccountVar.tradeDate}`,
//       cellData
//     )
//     .then(({ data }) => {
//       if (parseInt(data.id) == -1) {
//         // TODO: Notify failure
//         console.error('Data is not saved')
//         return
//       }
//       //ComputeRisksRow(index);
//       Risks.ComputeRisks()
//       $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
//       od.jqxWindow('destroy')
//       // success('Risks Updated')
//       // if(editingRowID!=-1)
//       // $("#treeGrid").jqxTreeGrid('beginRowEdit', editingRowID);
//     })
//     .catch((error) => {
//       console.error('Failed to save cell.', '\nError:', error)
//     })

//   // api.savecell(
//   //   td,
//   //   account,
//   //   book.contract,
//   //   book.extension,
//   //   book.orderQ,
//   //   book.orderP,
//   //   book.id,
//   //   function (response) {
//   //     index = GetBookIndexByID(response.result)
//   //     book.orderQ = qty
//   //     book.orderP = strat
//   //     //ComputeRisksRow(index);
//   //     ComputeRisks()
//   //     $('#treeGrid').jqxTreeGrid('updateBoundData')
//   //     $('#od').jqxWindow('destroy')
//   //     success('Risks Updated')
//   //     //if(editingRowID!=-1)
//   //     //$("#treeGrid").jqxTreeGrid('beginRowEdit', editingRowID);
//   //   }
//   // )
// }

export default {
  Calculate,
  DeleteCommodity,
  DeleteSector,
  DeleteSingle,
  Generate,
  GenerateID,
  openPreviewAllOrdersWindow,
  openPreviewSingleOrderWindow,
}
