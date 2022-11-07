function formatNavData(nav: any, account: string) {
  const symbol = account !== 'EE04' ? '$' : '€'

  return {
    ...nav,

    // Formatted
    live_nav: accounting.formatMoney(parseFloat(nav.live_nav), symbol),
    subred: accounting.formatMoney(nav.subred, symbol),
    live_pnl_decorated: `${accounting.formatMoney(nav.live_pnl, symbol)} 
              (${((nav.live_pnl_pct || 0) * 100).toFixed(2)}%)`,
    last_nav: accounting.formatMoney(nav.last_nav, symbol),
    //@ts-ignore
    last_calculated: moment(nav.timestamp).format('LLL'),

    // Original data convert to int
    live_pnl: parseInt(nav.live_pnl),
    last_nav_estimated: parseInt(nav.last_nav_estimated),

    // New data
    live_pnl_status: nav.last_nav_estimated === 0 ? 'reconciled' : 'estimated',
    live_pnl_status_title: `Last PNL: ${accounting.formatMoney(
      nav.last_pnl,
      symbol
    )}`,
  }
}

const getDateFromISO = (isoDate: string): string => isoDate.split('T').at(0)
const isNullOrEmpty = (val: any) => isNaN(val) || val == null || val == ''

function parseOrder(quantity: string, strategy: string) {
  if (
    quantity === '' ||
    quantity === null ||
    quantity === undefined ||
    strategy === '' ||
    strategy === null ||
    strategy === undefined
  ) {
    return
  }

  let quantities = []
  const orders = []

  let j = 0
  quantities = quantity.split(';')
  strategies = strategy.split(';')

  // if (quantities.length > strategies.length) {
  //   alert('You have more quantities than strategies')
  //   return
  // }
  // if (quantities.length < strategies.length) {
  //   alert('You have more strategies than quantities')
  //   return
  // }

  for (let i = 0; i < Math.max(quantities.length, strategies.length); i++) {
    const qty = quantities[i]
    let strat: string, price: string, freetext: string

    const currentStrategy = strategies[i]
    if (currentStrategy.indexOf('@') != -1) {
      strat = currentStrategy.split('@')[0]
      price = currentStrategy.split('@')[1]
    } else {
      strat = currentStrategy
      price = ''
    }

    if (price.indexOf('/') != -1) {
      freetext = price.split('/')[1]
      price = price.split('/')[0]
    } else freetext = ''
    if (isNaN(parseFloat(price))) {
      freetext = price
      price = '0'
    }

    if (strat.indexOf('#') != -1) {
      strat = strat.replace('#' + strat.split('#')[1], '')
    }

    orders[j] = {
      qty,
      strategy: strat,
      price,
      freetext,
    }
    j++
  }

  return orders
}

export default {
  formatNavData,
  getDateFromISO,
  isNullOrEmpty,
  parseOrder,
}
