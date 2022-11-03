import http from '../services/http'
import Risks from './Risks'

function preview(event) {
  const btn = event.target
  const tag = btn.getAttribute('tag') || ''
  // console.log(`Generating for sector: ${tag}`)
  $('#dynacontainer').html(
    `<div id="preview" style="width:1300px">
        <div id="windowHeader">
            <h2>Preview Orders - ${tag} </h2>
        </div>
        <div style="overflow: hidden" id="windowContent"></div>
    </div>`
  )
  $('#preview').jqxWindow({
    minHeight: '70vh',
    minWidth: '1200px',
    maxHeight: '85vh',
    autoOpen: true,
    isModal: true,
    animationType: 'slide',
    initContent() {
      const a = BuildPreview(tag)
      $('#windowContent').html('<div id="previewtable"></div>')
      const source_preview = {
        localdata: a,
        datafields: [
          {
            name: 'contract',
            type: 'number',
          },
          {
            name: 'extension',
            type: 'string',
          },
          {
            name: 'qty',
            type: 'string',
          },
          {
            name: 'strategy',
            type: 'string',
          },
          {
            name: 'price',
            type: 'number',
          },
          {
            name: 'account',
            type: 'number',
          },
          {
            name: 'freetext',
            type: 'number',
          },
          {
            name: 'contract_twodigit',
            type: 'number',
          },
          {
            name: 'commo',
            type: 'string',
          },
          {
            name: 'instrument',
            type: 'string',
          },
        ],
        datatype: 'array',
      }
      const dataAdapter_preview = new $.jqx.dataAdapter(source_preview)
      // initialize jqxGrid
      $('#previewtable').jqxGrid({
        width: 1150,
        height: 700,
        theme: 'office',
        source: dataAdapter_preview,
        columns: [
          {
            text: 'Contract',
            datafield: 'contract',
          },
          {
            text: 'Extension',
            datafield: 'extension',
          },
          {
            text: 'Quantity',
            datafield: 'qty',
          },
          {
            text: 'Strategy',
            datafield: 'strategy',
            cellsalign: 'center',
            width: 200,
          },
          {
            text: 'Price',
            datafield: 'price',
          },
          {
            text: 'FreeText',
            datafield: 'freetext',
            width: 150,
          },
          {
            text: 'Account',
            datafield: 'account',
            width: 150,
          },
        ],
        selectionmode: 'multiplerowsextended',
        showtoolbar: true,
        rendertoolbar: function (toolbar) {
          // const me = this
          const container = $("<div style='margin: 5px;'></div>")
          // const span = $(
          //   "<span style='float: left; margin-top: 5px; margin-right: 4px;'>Search City: </span>"
          // )
          const input = $(
            "<input class='jqx-input jqx-widget-content jqx-rc-all' id='selectAll' type='button' style='height: 23px; float: left; width: 150px;' value='Select All' />"
          )
          const input2 = $(
            "<input class='jqx-input jqx-widget-content jqx-rc-all' id='selectAll' type='button' style='height: 23px; float: left; width: 150px;' value='Send to iTrade' />"
          )
          toolbar.append(container)
          container.append(input)
          container.append(input2)
          // const theme = 'office'
          // if (theme != '') {
          //   input.addClass('jqx-widget-content-' + theme)
          //   input.addClass('jqx-rc-all-' + theme)
          //   input2.addClass('jqx-widget-content-' + theme)
          //   input2.addClass('jqx-rc-all-' + theme)
          // }
          // const oldVal = ''
          input.on('click', () => $('#previewtable').jqxGrid('selectallrows'))
          input2.on('click', () => {
            const selected = $('#previewtable').jqxGrid('getselectedrowindexes')
            // const rows = $('#previewtable').jqxGrid('getrows')
            // const j = 0
            for (let i = 0; i < selected.length; i++) {
              // api.sendtoitrade(
              //   selected[i],
              //   rows[selected[i]],
              //   td,
              //   function (response) {
              //     $('#previewtable').jqxGrid('unselectrow', response.result)
              //     $('#previewtable').jqxGrid('deleterow', response.result)
              //   }
              // )
            }
          })
        },
      })
    },
  })
  //   $('#preview').on('close', function (event) {
  //     $('#previewtable').jqxGrid('destroy')
  //     $('#preview').jqxWindow('destroy')
  //   })
}

// function Generate(btn) {
//   a = $(btn).text()
//   $(btn).text('Processing')
//   console.log('Generating for sector: ' + $(btn).attr('tag'))
//   key = 'generateSector' + $(btn).attr('tag')

//   section = '"' + $(btn).attr('section') + '"'
//   if ($(btn).attr('section') == '') section = 'NULL'
//   connect(
//     key,
//     'generateIRMSOrders("' +
//       td +
//       '","' +
//       account +
//       '","' +
//       $(btn).attr('tag') +
//       '",' +
//       section +
//       ',TRUE)'
//   )
//   xx = setInterval(function myfunction() {
//     if (scripts[key] == null) $(btn).text('Queued.')
//     else if (parseFloat(scripts[key].data) == 1) {
//       scripts[key] = null
//       $(btn).text('Done.')
//       SoftReload()
//       clearInterval(xx)
//     } else if (scripts[key].data == 'fail') {
//       $(btn).text(a)
//       SoftReload()
//       scripts[key] = null
//       clearInterval(xx)
//     }
//   }, 1000)
//   $(btn).text(a)
// }

// function GenerateID(btn) {
//   a = $(btn).text()
//   $(btn).text('Processing')
//   console.log('Generating ID for sector: ' + $(btn).attr('tag'))
//   key = 'generateSectorID' + $(btn).attr('tag')

//   section = '"' + $(btn).attr('section') + '"'
//   if ($(btn).attr('section') == '') section = 'NULL'
//   sector = '"' + $(btn).attr('tag') + '"'
//   if ($(btn).attr('tag') == '') sector = 'NULL'
//   code = 'generateIDOrders("' + account + '","irms",' + sector + ')'
//   connect(key, code)
//   console.log('Sending: ' + code)
//   xx = setInterval(function myfunction() {
//     if (scripts[key] == null) $(btn).text('Queued.')
//     else if (parseFloat(scripts[key].data) == 1) {
//       scripts[key] = null
//       $(btn).text('Done.')
//       SoftReload()
//       clearInterval(xx)
//     } else if (scripts[key].data == 'fail') {
//       $(btn).text(a)
//       SoftReload()
//       scripts[key] = null
//       clearInterval(xx)
//     }
//   }, 1000)
//   $(btn).text(a)
// }

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
  extension: string,
  instrument: string
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
          book.instrument == instrument &&
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

// function SoftReload() {
//   api.getbook(td, account, function (response) {
//     book = JSON.parse(response.result)
//     source.localdata = book
//     port = JSON.parse(api.getportfolio(td, account))[0]
//     port['display'] = 'PORTFOLIO'
//     port['rowType'] = 'sector'
//     port['parent'] = null
//     //port["id"] = 0;
//     book.unshift(port)
//     for (i = 0; i < book.length; i++) {
//       book[i].expanded = true
//       book[i].order_size = null
//     }

//     ComputeRisks()
//     spdRisks = SpreadRisks()

//     $('#treeGrid').jqxTreeGrid('updateBoundData')
//   })
// }
// function Reload() {
//   api.getbook(td, account, function (response) {
//     //        book = JSON.parse(response.result);
//     //        source.localdata = book
//     //        for (i = 0; i < book.length; i++) { book[i].expanded = true; book[i].order_size = null; }
//     //        ComputeRisks();
//     //spdRisks = SpreadRisks();
//     $('#myButton').click()
//     //$('#treeGrid').jqxTreeGrid('updateBoundData');
//   })
// }

// function Calculate(btn) {
//   a = $(btn).val()
//   $(btn).val('Processing')
//   $('#calculate').jqxButton({
//     disabled: true,
//   })
//   connect(
//     'calculate',
//     'iRMS.createBook(iRMS(account="' + $('#accounts').val() + '"),TRUE,FALSE)'
//   )
//   xx = setInterval(function myfunction() {
//     if (scripts['calculate'] == null) $(btn).val('Queued.')
//     else if (parseFloat(scripts['calculate'].data) == 1) {
//       scripts['calculate'] = null
//       $(btn).text('Done.')
//       //Reload();
//       $(btn).val(a)
//       $('#calculate').jqxButton({
//         disabled: false,
//       })
//       clearInterval(xx)
//       $('#myButton').click()
//     } else if (scripts['calculate'].data == 'fail') {
//       $(btn).text('Error')
//       Reload()
//       scripts['calculate'] = null
//       $(btn).val(a)
//       $('#calculate').jqxButton({
//         disabled: false,
//       })
//       clearInterval(xx)
//     }
//   }, 1000)
// }

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
// var popup = null
// function ODetails(rowid, qty, strat) {
//   //if(qty=="null") qty=null;
//   $('#odcontainer').html('<div tag="' + rowid + '" id="od"></div>')
//   $('#od').html(
//     "<div>Order Details</div><div><iframe width='500' height='500' id='win' src='orderdetails.aspx?q=" +
//       qty +
//       '&p=' +
//       strat +
//       "'></iframe><button onclick='saveod()'>Update</button></div>"
//   )
//   $('#od').jqxWindow({
//     theme: 'shinyblack',
//     width: 600,
//     height: 600,
//     isModal: true,
//   })
// }
// function saveod() {
//   qty = $('#win').contents().find('#odqty').text()
//   strat = $('#win').contents().find('#odstrat').text()
//   rowid = $('#od').attr('tag')
//   index = GetBookIndexByID(rowid)
//   book[index].orderQ = qty
//   book[index].orderP = strat

//   api.savecell(
//     td,
//     account,
//     book[index].contract,
//     book[index].extension,
//     book[index].orderQ,
//     book[index].orderP,
//     book[index].id,
//     function (response) {
//       index = GetBookIndexByID(response.result)
//       book[index].orderQ = qty
//       book[index].orderP = strat
//       //ComputeRisksRow(index);
//       ComputeRisks()
//       $('#treeGrid').jqxTreeGrid('updateBoundData')
//       $('#od').jqxWindow('destroy')
//       success('Risks Updated')
//       //if(editingRowID!=-1)
//       //$("#treeGrid").jqxTreeGrid('beginRowEdit', editingRowID);
//     }
//   )
// }

export default {
  preview,
  DeleteSector,
  DeleteSingle,
  DeleteCommodity,
}
