import PageControls from './PageControls'

export default class ExecuteR {
  private host = 'ws://10.153.64.97:8008/xr-web/ws/ep'
  private socket: WebSocket

  public script: string
  public scripts = { calculate: null }

  connect(id: string, script: string) {
    try {
      this.socket = new WebSocket(this.host)
      //PageControls. log('Socket Status: '+socket.readyState);
      //success('Socket Status: '+socket.readyState+' (open)');
      this.socket.onopen = () => this.send(id, script)

      this.socket.onmessage = this.onMessage.bind(this)
      this.socket.onclose = this.onClose
    } catch (exception) {
      PageControls.error(`Error: ${exception}`)
    }
  }

  send(id: string, script: string) {
    const engine = 'rserve'
    try {
      const checkSource =
        "if(!exists('sourceLoaded')) source('/mnt/public/Libs/source4E.r');"
      // const checkSource2 = "source('/mnt/public/Libs/source4E.r');"
      this.socket.send(id + '~~' + engine + '~~' + checkSource + script)
      this.scripts[id] = 'sent'
      PageControls.log(`Sent: ${script}`)
    } catch (exception) {
      PageControls.error(exception)
    }
  }

  onMessage(message) {
    const rec = message.data.split('~~')
    const id = rec[0]
    const xmlmsg = rec[1]
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlmsg, 'text/xml')

    if (
      xmlDoc.getElementsByTagName('output')[0].getAttribute('status') == 'fail'
    ) {
      this.scripts[id] = 'fail'
      PageControls.error(`Script ${id} failed`)
      return
    }
    const result =
      xmlDoc.getElementsByTagName('result')[0].childNodes[0].childNodes[0]
    this.scripts[id] = result
    PageControls.success(`Received: ${message.data}`)
  }

  onClose() {
    PageControls.log(`Socket Status: ${this.socket.readyState} (Closed)`)
  }

  disconnect() {
    this.socket.close()
  }
}
