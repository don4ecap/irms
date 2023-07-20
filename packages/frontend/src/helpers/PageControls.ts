function CreateGenerateButtons() {
  const configTagsButtonContainer = document.querySelector(
    `#${currentAccount}-config-tags-button-container`
  )

  const accountVar = accountsVar[currentAccount]

  Array.from(configTagsButtonContainer.children || []).forEach((child) =>
    child.remove()
  )

  for (const configTag of accountVar.configTags) {
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

function log(text: string, delay = 2000) {
  alertify.set({ delay })
  alertify.log(text)
}

function success(text: string, delay = 10000) {
  small_success(text, delay)
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
function logQuery(timestamp: string, query: string, url: string) {
  const logsEl = document.body.querySelector('#logs')
  const line = document.createElement('div')
  const timestampEl = document.createElement('div')
  const queryEl = document.createElement('div')
  const urlEl = document.createElement('a')

  line.classList.add('flex')
  urlEl.classList.add('api-endpoint')
  if (!window.showAPIEndpoint) {
    urlEl.classList.add('hidden')
  }
  timestampEl.style.marginRight = queryEl.style.marginRight = '0.9rem'

  timestampEl.textContent = `[${timestamp}]`
  queryEl.textContent = query
  urlEl.textContent = url
  urlEl.href = url

  line.appendChild(timestampEl)
  line.appendChild(queryEl)
  line.appendChild(urlEl)
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
