function onRowClick(event) {
  const { args, key, row } = event
  const clickEvent = args.originalEvent
  clickEvent.preventDefault()

  // Handler right click
  if (clickEvent.button == 2) {
    const scrollTop = $(window).scrollTop()
    const scrollLeft = $(window).scrollLeft()
    contextMenu.jqxMenu(
      'open',
      clickEvent.clientX + 5 + scrollLeft,
      clickEvent.clientY + 5 + scrollTop
    )
    return false
  }
}

export default {
  onRowClick,
}
