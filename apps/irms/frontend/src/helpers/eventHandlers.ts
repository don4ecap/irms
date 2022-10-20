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

  if (clickEvent.ctrlKey) {
    // TODO:
    // console.log(`Chart for ${row.contract} ${row.extension}`)
    // $('#chart').fadeIn(500)
    // $('#if_chart').attr(
    //   'src',
    //   'chart.aspx?contract=' + row.contract + '&extension=' + row.extension
    // )
  } else {
    // TODO:
    // if ($('#if_chart').attr('src') != 'about:blank') {
    //   $('#if_chart').attr('src', 'about:blank')
    //   $('#chart').fadeOut(500)
    // }

    if (
      clickEvent.target.classList.contains('editable')
      // TODO:
      // &&
      // currentAccountVar.editingRowID == -1
    ) {
      if (args.row.rowType != 'contract') return
      currentAccountVar.isEdited = true
      currentAccountVar.editingRowQty = args.row.orderQ
      currentAccountVar.editingRowID = args.row.id
      $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid(
        'beginRowEdit',
        args.row.id
      )
      console.log(`Editing row id: ${args.row.id}`)
    }
  }
}

export default {
  onRowClick,
}
