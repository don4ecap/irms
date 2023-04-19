// function InitializeControlsSingle() {
//   $('#calculate').jqxButton({ width: '120px', height: '25px', theme: 'office' })
//   $('#book_date ').jqxDateTimeInput({
//     formatString: 'yyyy-MM-dd',
//     width: '100px',
//     height: '30px',
//     animationType: 'fade',
//     theme: 'office',
//   })
//   api.getcts(function (response) {
//     $('#book_date ').jqxDateTimeInput('setDate', new Date(response.result))
//   })
//   api.getaccounts(function (response) {
//     ht = ''
//     arr = JSON.parse(response.result)
//     for (var i = 0; i < arr.length; i++) {
//       ht += '<option value="' + arr[i] + '">' + arr[i] + '</option>'
//     }
//     $('#accounts').html(ht)
//     if ($.getUrlVar('account') != null) {
//       $('#accounts').val($.getUrlVar('account'))
//       $('#accounts').attr('disabled', 'disabled')
//       $('#accounts').css('background-color', 'silver')
//       $('#accounts').hide()
//       loadedInsideTab = true
//     } else loadedInsideTab = false
//   })
//   $('#showFilters').jqxButtonGroup({ mode: 'radio', theme: 'office' })
//   $('#showNonNull').jqxToggleButton({
//     height: 25,
//     width: 50,
//     toggled: true,
//     theme: 'office',
//   })
//   $('#mainSplitter').jqxSplitter({
//     width: 1600,
//     height: 860,
//     orientation: 'horizontal',
//     theme: 'office',
//     panels: [{ size: 100 }, { size: 760 }],
//   })
//   $('#showNonNull').on('click', function () {
//     buildGrid()
//   })
//   $('#export_html')
//     .jqxButton({ theme: theme })
//     .click(function () {
//       $('#treeGrid').jqxTreeGrid('exportData', 'html')
//     })
//   $('#export_xls')
//     .jqxButton({ theme: theme })
//     .click(function () {
//       $('#treeGrid').jqxTreeGrid('exportData', 'xls')
//     })
//   $('#generateAll').jqxButton({ theme: theme })
//   $('#previewAll').jqxButton({ theme: theme })
//   $('#deleteAll').jqxButton({ theme: theme })
//   $('#config').jqxButton({ theme: theme })
//   $('#btn_comments').jqxButton({ theme: theme })
//   $('#configid').jqxButton({ theme: theme })

//   setInterval(function () {
//     api.checklastcalculated(account, function (response) {
//       $('#book_last_calculated').text(
//         'Last Book Calculation(scheduler): ' +
//           moment(response.result).format('LLL')
//       )
//     })
//   }, 5000)
//   $('.custombutton').jqxButton({ theme: 'office' })
// }

function CreateGenerateButtons() {
  const configTagsButtonContainer = document.querySelector(
    `#${currentAccount}-config-tags-button-container`
  )

  const accountVar = accountsVar[currentAccount]

  Array.from(configTagsButtonContainer.children || []).forEach((child) =>
    child.remove()
  )

  for (let i = 0; i < accountVar.configTags.length; i++) {
    const configTag = accountVar.configTags[i]

    const button = document.createElement('button')
    // button.className = 'custombutton'
    button.name = 'generate'
    button.setAttribute('tag', '')
    button.setAttribute('section', configTag)
    button.setAttribute('onclick', 'Generate(this)')
    button.textContent = `Gen ${configTag}`

    configTagsButtonContainer.appendChild(button)
    $(button).jqxButton({ theme: 'office' })
  }

  // TODO: Get Custom Buttons
  // custombuttons = api.getconfigbuttons(account)
  // for (var p in custombuttons) {
  //   ht +=
  //     "<button class='custombutton' name='generate' script=" +
  //     custombuttons[p] +
  //     " onclick='SendCustomScript(this);'>" +
  //     p +
  //     '</button>'
  // }
  // $('#btnContainer').html(ht)
}

function decimalPlaces(num: number) {
  const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/)
  if (!match) return 0

  return Math.max(
    0,
    // Number of digits right of decimal point.
    (match[1] ? match[1].length : 0) -
      // Adjust for scientific notation.
      (match[2] ? +match[2] : 0)
  )
}
//var console = {};
//console.log = function (stat) { $("#livestatus").text(stat); };

function log(text: string, delay = 2000) {
  alertify.set({ delay })
  alertify.log(text)
}

function success(text: string) {
  // alertify.set({ delay: 2000 })
  //alertify.success(text);
  small_success(text, 10000)
}

function error(text: string) {
  alertify.set({ delay: 5000 })
  alertify.error(text)
}

function small_success(text: string, timeout: number) {
  const accountVar = accountsVar[currentAccount]
  accountVar.vue.showSmallSuccess(text, timeout)
}

/** Add new line to log query view */
function logQuery(timestamp: string, query: string) {
  const logsEl = document.body.querySelector('#logs')
  const line = document.createElement('div')
  const timestampEl = document.createElement('div')
  const queryEl = document.createElement('div')

  line.classList.add('flex')
  timestampEl.style.marginRight = '0.9rem'

  timestampEl.textContent = `[${timestamp}]`
  queryEl.textContent = query

  line.appendChild(timestampEl)
  line.appendChild(queryEl)
  logsEl.prepend(line)
  //@ts-ignore
  if (IRMS_APP.$children[0].showQueryLog && window.autoScrollToFirstLine) {
    logsEl.scrollTop = 0
  }
}

export default {
  CreateGenerateButtons,
  decimalPlaces,
  error,
  log,
  logQuery,
  success,
}
