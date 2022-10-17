<template>
  <div class="flex flex-column" style="height: calc(100% - 0.75rem)">
    <JqxSplitter
      height="calc(100% - 10rem)"
      width="100%"
      :panels="panels"
      class="main-panel"
      theme="office"
      orientation="horizontal"
    >
      <div class="main-panel-top">
        <div class="col-1 flex-grow" style="max-width: 250px">
          <div class="flex" style="gap: 0.3rem">
            <JqxButton class="inline-block" theme="office">Sector</JqxButton>
            <JqxButton class="inline-block" theme="office">Common</JqxButton>
            <JqxButton
              class="inline-block"
              theme="office"
              @click="showContract"
            >
              All
            </JqxButton>
          </div>

          <div v-show="isNotEE04Account" class="flex field">JPY Equity</div>
          <div v-show="isNotEE04Account" class="flex field">
            JPY CCY Futures
          </div>
          <div v-show="isNotEE04Account" class="flex field">
            Strategy Allocation
          </div>
          <div class="flex field">Risk</div>
        </div>
        <div class="col-2">
          <div class="flex flex-column" style="gap: 0.3rem">
            <JqxDateTimeInput v-model="bookDate" width="110" height="28" />
            <input
              type="button"
              value="Non-Null"
              role="button"
              :class="
                'jqx-rc-all jqx-rc-all-office jqx-button jqx-button-office jqx-widget jqx-widget-office jqx-fill-state-normal jqx-fill-state-normal-office inline-block ' +
                (showNonNull ? 'jqx-fill-state-pressed-office' : '')
              "
              :aria-checked="showNonNull"
              @click="onShowNonNullClicked"
            />
          </div>
        </div>
        <div
          class="col-3 flex flex-column"
          style="min-width: 8.3rem; gap: 0.3rem"
        >
          <JqxButton theme="office" @click="loadIRMS">Load iRMS</JqxButton>
          <JqxButton theme="office">Calculate</JqxButton>
        </div>
        <div class="col-4 flex flex-column">
          <table>
            <tbody>
              <tr width="200px">
                <td style="table-layout: fixed">
                  {{ account === 'EE04' ? 'EUR NAV' : 'Last Nav' }}:
                </td>
                <td class="text-left">
                  <span class="text-large">
                    {{ nav.last_nav }}
                  </span>
                  <span
                    class="oblique bold"
                    style="font-size: 0.7rem"
                    :title="nav.live_pnl_status_title"
                  >
                    ({{ nav.live_pnl_status }})
                  </span>
                </td>
              </tr>
              <tr>
                <td>Live PNL:</td>
                <td class="text-left">
                  <span
                    :class="
                      'text-large ' +
                      (nav.live_pnl > 0 ? 'text-green' : 'text-red')
                    "
                  >
                    {{ nav.live_pnl_decorated }}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Sub/Red:</td>
                <td class="text-left">
                  <span class="text-large">{{ nav.subred }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-5 flex flex-column">
          <table>
            <tbody>
              <tr width="200px">
                <td style="table-layout: fixed">{{ labels.riskRate }}:</td>
                <td class="text-left">
                  <span class="text-large">0.00 %</span>
                </td>
              </tr>
              <tr>
                <td>Live NAV:</td>
                <td class="text-left">
                  <span
                    :class="
                      'text-large ' +
                      (nav.live_pnl > 0 ? 'bg-green-1' : 'bg-red-1')
                    "
                    style="
                      color: #fff;
                      padding: 0.2rem;
                      padding-inline: 0.4rem;
                      border-radius: 0.2rem;
                    "
                  >
                    {{ nav.live_nav }}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Last Calculated:</td>
                <td class="text-left">
                  <span>{{ nav.last_calculated }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-5 flex flex-column" style="gap: 0.3rem">
          <div class="flex" style="gap: 0.3rem">
            <JqxButton class="inline-block" theme="office">Generate</JqxButton>
            <JqxButton class="inline-block" theme="office">Preview</JqxButton>
            <JqxButton class="inline-block" theme="office">Delete</JqxButton>
            <JqxButton class="inline-block" theme="office">Gen ID</JqxButton>
          </div>
          <div class="flex" style="gap: 0.3rem">
            <JqxButton class="inline-block" theme="office">Gen MORN</JqxButton>
            <JqxButton class="inline-block" theme="office">Gen TOCOM</JqxButton>
            <JqxButton class="inline-block" theme="office"
              >Gen EVENING</JqxButton
            >
            <JqxButton class="inline-block" theme="office">Gen END</JqxButton>
          </div>
        </div>
      </div>
      <div
        :id="'tree-grid-container-' + account.toLowerCase()"
        class="tree-grid-container"
      >
        <!-- <JqxGrid
          ref="mainGrid"
          width="1580px"
          :source="dataAdapter"
          :column-groups="columnGroups"
          theme="office"
        /> -->
      </div>
    </JqxSplitter>
    <div class="end-panel jqx-widget-content flex-grow items-start">
      <div class="flex">
        <!-- BUTTONS -->
        <div class="flex self-baseline" style="gap: 0.3rem">
          <div class="permission bold text-center self-center">RWX</div>
          <JqxButton class="inline-block" theme="office">Export HTML</JqxButton>
          <JqxButton class="inline-block" theme="office">Export XLS</JqxButton>
          <JqxButton class="inline-block" theme="office">
            Directional Config
          </JqxButton>
          <JqxButton class="inline-block" theme="office">
            Intraday Config
          </JqxButton>
          <JqxButton class="inline-block" theme="office">
            Trader Comments
          </JqxButton>
          <label class="flex items-center">
            <input
              id="liverisks"
              type="checkbox"
              value="liverisks"
              style="scale: 1.15"
              checked
            />
            <div class="bold">Live Risks</div>
          </label>
        </div>

        <!-- DATES -->
        <table class="ml-auto">
          <tr v-show="lastBookCalculation?.length">
            <td>Last Book Calculated before loading:</td>
            <td>
              {{ lastBookCalculation }}
            </td>
          </tr>
          <tr v-show="lastBookCalculationScheduler?.length">
            <td>Last Book Calculation (scheduler):</td>
            <td>
              {{ lastBookCalculationScheduler }}
            </td>
          </tr>
          <tr v-show="bookLoadedDate?.length">
            <td>Book Loaded:</td>
            <td>{{ bookLoadedDate }}</td>
          </tr>
          <!-- <div v-show="lastBookCalculation?.length" style="display: table">
            Last Book Calculated before loading:
            <span>
              {{ lastBookCalculation }}
            </span>
          </div>
          <div v-show="lastBookCalculationScheduler?.length">
            Last Book Calculation (scheduler):
            <span>
              {{ lastBookCalculationScheduler }}
            </span>
          </div>
          <div v-show="bookLoadedDate?.length">
            Book Loaded: <span>{{ bookLoadedDate }}</span>
          </div> -->
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import httpService from '../services/http'
import gridColumns from '../helpers/gridOptions'
import Risks from '../helpers/Risks'
import utils from '../helpers'
import Formatters from '../helpers/Formatters'

import JqxSplitter from 'jqwidgets-framework/jqwidgets-vue/vue_jqxsplitter.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'
import JqxDateTimeInput from 'jqwidgets-framework/jqwidgets-vue/vue_jqxdatetimeinput.vue'
import JqxTreeGrid from 'jqwidgets-framework/jqwidgets-vue/vue_jqxtreegrid.vue'
import JqxTooltip from 'jqwidgets-framework/jqwidgets-vue/vue_jqxtooltip.vue'

export default {
  name: 'MainPanel',

  components: {
    JqxSplitter,
    JqxButton,
    JqxDateTimeInput,
    JqxTreeGrid,
    JqxTooltip,
  },

  props: {
    account: {
      type: String,
      default: 'E002',
    },
  },

  data() {
    return {
      bookDate: new Date(),
      ratioField: 'ratio',
      nav: {
        account: 'EE02',
        td: '2022-10-09T16:00:00.000Z',
        last_recon_date: '2022-10-06T16:00:00.000Z',
        last_nav: 0,
        last_nav_estimated: 0,
        last_pnl: 0,
        last_subred: 0,
        last_pnl_pct: 0,
        live_nav: 0,
        live_pnl: 0,
        live_pnl_pct: 0,
        subred: 0,
      },
      labels: {
        riskRate: 'Risk Rate',
      },
      panels: [
        { size: 150, min: 150, max: 150, collapsible: true },
        { size: '50%', min: '50%', collapsible: false },
      ],
      bookLoadedDate: '',
      lastBookCalculationScheduler: '',
      lastBookCalculation: '',
      lastBookCalculationSchedulerInterval: null,
      calculateRisksLive: true,
      forceRenderedOnce: true,
      showNonNull: true,
    }
  },

  computed: {
    isNotEE04Account() {
      return this.account !== 'EE04'
    },
  },

  mounted() {
    // Remove each main panel element width assigned by jqwidgets
    this.$el.querySelector('.main-panel').style.width = null

    this.loadNav()
    this.loadStrategies()
  },

  methods: {
    async loadIRMS() {
      this.bookLoadedDate = moment().format('LLL')
      this.getLastBookCalculation().then((date) => {
        this.lastBookCalculation = moment(date).format('LLL')
      })

      // Attach last book calclulation scheduler, runs every one minute
      this.updateLastBookCalculationScheduler()
      if (this.lastBookCalculationSchedulerInterval) {
        console.debug('Check last book calculation scheduler has been attached')
        this.lastBookCalculationSchedulerInterval = setInterval(
          this.updateLastBookCalculationScheduler,
          60000
        )
      }

      this.loadNav()
      this.loadCommoIndicatorLevel().then(() => this.loadBooks())
    },

    loadStrategies() {
      return httpService
        .get('get_strategies')
        .then(({ data }) => (strategies = data))
    },

    loadNav() {
      console.time(`Load ${this.account} nav`)
      const tradeDate = utils.getDateFromISO(this.bookDate.toISOString())
      return httpService
        .get(`get_nav/${this.account}/${tradeDate}`)
        .then(({ data }) => {
          this.nav = utils.formatNavData(data, this.account)

          if (this.account !== 'EE04') {
            this.labels.riskRate = 'Risk Ratio'
            // if (this.account === 'DBPM') {
            //   this.labels.riskRate = 'Drawdown'
            // }
          }

          // TODO: GET RATIO
          // TODO: Getcurrencyhedging
        })
        .finally(() => {
          console.timeEnd(`Load ${this.account} nav`)
        })
    },

    loadBooks() {
      console.time(`Load ${this.account} books`)
      const lowerAccountName = this.account.toLowerCase()
      const currentTreeGridID = `tree-grid-${lowerAccountName}`
      const containerSelector = `#tree-grid-container-${lowerAccountName}`
      const gridContainer = document.querySelector(containerSelector)
      const existingGridEl = $(`#${currentTreeGridID}`)
      currentAccountVar.treeGridID = currentTreeGridID

      if (existingGridEl?.length) {
        existingGridEl.jqxTreeGrid('destroy')
      }

      // Create new grid element for attach the new tree grid
      const newGrid = document.createElement('div')
      newGrid.setAttribute('id', `${currentTreeGridID}`)
      gridContainer?.appendChild(newGrid)

      const tradeDate = utils.getDateFromISO(this.bookDate.toISOString())
      return httpService
        .get(`get_book/${this.account}/${tradeDate}`)
        .then(async ({ data: books }) => {
          currentAccountVar.books = books
          currentAccountVar.bookIDMap = []
          currentAccountVar.bookIDMapRev = []

          currentAccountVar.portfolio = await httpService
            .get(`get_portfolio/${this.account}/${tradeDate}`)
            .then(({ data }) => data)
            .catch((error) => console.error('Failed to get portfolio:', error))

          currentAccountVar.portfolio.display = 'PORTFOLIO'
          currentAccountVar.portfolio.rowType = 'sector'
          currentAccountVar.portfolio.parent = null

          currentAccountVar.books.unshift(currentAccountVar.portfolio)
          for (let i = 0; i < currentAccountVar.books.length; i++) {
            const book = currentAccountVar.books[i]
            book.expanded = true
            book.order_size = null
            book.action = ''
            currentAccountVar.bookIDMap[i] = parseInt(book.id)
            currentAccountVar.bookIDMapRev[book.id] = i
            book.style = 'background-color:red'
          }

          Risks.ComputeRisks()
          currentAccountVar.spdRisks = Risks.SpreadRisks()

          const dataAdapter = new $.jqx.dataAdapter({
            dataType: 'json',
            dataFields: [
              { name: 'sector', type: 'string' },
              { name: 'commo', type: 'string' },
              { name: 'contract', type: 'string' },
              { name: 'contract_twodigit', type: 'string' },
              { name: 'extension', type: 'string' },
              { name: 'contract', type: 'string' },
              { name: 'qty', type: 'number' },
              { name: 'ccy', type: 'string' },
              { name: 'valuept', type: 'string' },
              { name: 'settlement', type: 'number' },
              { name: 'last_price', type: 'number' },
              { name: 'last_fx', type: 'number' },
              { name: 'live_fx', type: 'number' },
              { name: 'last_nav', type: 'number' },
              { name: 'target_allocation_pct', type: 'number' },
              { name: 'current_allocation_pct', type: 'number' },
              { name: 'positions_pct_target', type: 'number' },
              { name: 'positions_pct_current', type: 'number' },
              { name: 'target_allocation_lots', type: 'number' },
              { name: 'target_allocation_delta', type: 'number' },
              { name: 'current_allocation_lots', type: 'number' },
              { name: 'current_allocation_delta', type: 'number' },
              { name: 'current_risks_pre', type: 'number' },
              { name: 'target_risks_pre', type: 'number' },
              { name: 'current_risks_post', type: 'number' },
              { name: 'target_risks_post', type: 'number' },
              { name: 'rowType', type: 'string' },
              { name: 'first_notice_date', type: 'string' },
              { name: 'last_trade_date', type: 'string' },
              { name: 'expiry4E', type: 'string' },
              { name: 'notice4E', type: 'string' },
              { name: 'orderQ', type: 'string' },
              { name: 'orderP', type: 'string' },
              { name: 'id', type: 'number' },
              { name: 'parent', type: 'number' },
              { name: 'display', type: 'string' },
              { name: 'expanded', type: 'bool' },
              { name: 'action', type: 'string' },
              { name: 'order_size', type: 'number' },
              { name: 'style', type: 'string' },
            ],
            hierarchy: {
              keyDataField: { name: 'id' },
              parentDataField: { name: 'parent' },
            },
            id: 'id',
            localData: currentAccountVar.books,
          })

          $(`#${currentTreeGridID}`).jqxTreeGrid({
            source: dataAdapter,
            sortable: true,
            editable: true,
            editSettings: {
              saveOnPageChange: true,
              saveOnBlur: true,
              saveOnSelectionChange: true,
              cancelOnEsc: true,
              saveOnEnter: true,
              editSingleCell: true,
              editOnDoubleClick: false,
              editOnF2: true,
            },
            enableHover: false,
            ready: () => {
              currentAccountVar.forceRenderedOnce = false
              //alert("ready");
            },
            rendered: () => {
              this.buildGrid()
              // LoadComments()
              //alert("rendered");
            },
            columns: gridColumns,
            // width: (gridContainer?.clientWidth || 1580) + 'px',
            selectionMode: 'singleRow',
            columnGroups: [
              { text: 'Exposure', name: 'exposure', align: 'center' },
              {
                text: 'Current Allocation',
                name: 'current_allocation',
                align: 'center',
              },
              {
                text: 'Target Allocation',
                name: 'target_allocation',
                align: 'center',
              },
              {
                text: 'Risks Pre-Orders',
                name: 'risks_pre',
                align: 'center',
              },
              {
                text: 'Risks Post-Orders',
                name: 'risks_post',
                align: 'center',
              },
              { text: 'Orders', name: 'orders', align: 'center' },
            ],
            theme: 'office',
            showStatusbar: false,
            // renderStatusbar(toolbar) {
            //   const x = $("<div style='margin: 3px;'></div>")
            //   const span = $(
            //     "<span style='float: left; margin-top: 2px; margin-right: 2px;' id='livestatus'></span>"
            //   )
            //   toolbar.append(x)
            //   x.append(span)
            // },
          })
        })
        .catch((error) => {
          console.error(
            `Failed to fetch books of ${this.account} account\n`,
            error
          )
        })
        .finally(() => {
          console.timeEnd(`Load ${this.account} books`)
        })
    },

    loadCommoIndicatorLevel() {
      return httpService
        .get('get_commo_indicator_level')
        .then(({ data }) => (currentAccountVar.indLevel = data))
    },

    buildGrid() {
      const a = new Date()
      if (currentAccountVar.calculateRisksLive) {
        Formatters.filterNonNull(currentAccountVar.books)
      }
      const b = new Date()
      const dif = b - a
      console.log(`FilterNonNull took ${dif} secs to complete`)

      //InitializeControls();
    },

    onShowNonNullClicked() {
      //@ts-ignore
      this.showNonNull = window.showNonNull = !this.showNonNull
    },

    showContract() {
      if (!currentAccountVar.treeGridID.length) {
        const msg = 'There is no data yet. Please Load iRMS data first'
        alert(msg)
        throw SyntaxError(msg)
      }

      setTimeout(function () {
        for (let i = 0; i < currentAccountVar.books.length; i++) {
          const book = currentAccountVar.books[i]
          if (book.rowType == 'sector') book.expanded = true
          if (book.rowType == 'commodity') book.expanded = true
        }
        $(`#${currentAccountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
      }, 500)
    },

    getLastBookCalculation() {
      return httpService
        .get(`check_last_calculated/${this.account}`)
        .then(({ data }) => data.value)
        .catch((error) => {
          console.error(
            `Failed to fetch last calculation date for ${this.account}`,
            error
          )
          return new Date()
        })
    },

    updateLastBookCalculationScheduler() {
      this.getLastBookCalculation().then((date) => {
        this.lastBookCalculationScheduler = moment(date).format('LLL')
      })
    },
  },
}
</script>
