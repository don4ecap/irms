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

export default {
  formatNavData,
  getDateFromISO,
}
