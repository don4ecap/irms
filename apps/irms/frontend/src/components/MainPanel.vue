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
            <JqxButton class="inline-block" theme="office" @click="showSector">
              Sector
            </JqxButton>
            <JqxButton
              class="inline-block"
              theme="office"
              @click="showCommodity"
            >
              Commo
            </JqxButton>
            <JqxButton
              class="inline-block"
              theme="office"
              @click="showContract"
            >
              All
            </JqxButton>
          </div>

          <!-- <div v-show="isNotEE04Account" class="flex field">JPY Equity</div>
          <div v-show="isNotEE04Account" class="flex field">
            JPY CCY Futures
          </div>
          <div v-show="isNotEE04Account" class="flex field">
            Strategy Allocation
          </div>
          <div class="flex field">Risk</div> -->
        </div>
        <div class="col-2">
          <div class="flex flex-column" style="gap: 0.3rem">
            <JqxDateTimeInput
              v-model="bookDate"
              width="110"
              height="28"
              @input="updateTradeDate"
            />
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
          <JqxButton ref="loadButton" theme="office" @click="loadIRMS">
            {{ labels.loadBooks }}
          </JqxButton>
          <JqxButton
            ref="btnCalculate"
            theme="office"
            onclick="Calculate(this)"
          >
            Calculate
          </JqxButton>
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
            <JqxButton
              class="inline-block"
              theme="office"
              tag
              section
              onclick="Generate(this)"
              >Generate</JqxButton
            >
            <JqxButton
              ref="btnPreview"
              class="inline-block"
              theme="office"
              @click="$emit('btn-preview-clicked')"
            >
              Preview
            </JqxButton>
            <JqxButton
              class="inline-block"
              theme="office"
              onclick="DeleteSector('')"
            >
              Delete
            </JqxButton>
            <JqxButton
              class="inline-block"
              theme="office"
              onclick="GenerateID(this)"
            >
              Gen ID
            </JqxButton>
          </div>
          <div
            :id="`${account}-config-tags-button-container`"
            class="flex"
            style="gap: 0.3rem"
          ></div>
        </div>
      </div>
      <div
        :id="'tree-grid-container-' + account.toLowerCase()"
        ref="treeGridContainer"
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
    <div class="end-panel jqx-widget-content items-start overflow-y-auto">
      <div class="flex wrap" style="gap: 0.3rem">
        <!-- BUTTONS -->
        <div class="flex self-baseline wrap" style="gap: 0.3rem">
          <div class="permission bold text-center self-center">RWX</div>
          <JqxButton
            class="inline-block"
            theme="office"
            onclick="LoadConfig('directional','Config')"
          >
            Directional Config
          </JqxButton>
          <JqxButton
            class="inline-block"
            theme="office"
            onclick="LoadConfig('intraday','Config')"
          >
            Intraday Config
          </JqxButton>
          <label class="flex items-center">
            <input
              id="liverisks"
              type="checkbox"
              value="liverisks"
              style="scale: 1.15"
              checked
              @change="checkLiveRisks"
            />
            <div class="bold">Live Risks</div>
          </label>
        </div>

        <div>
          <span ref="smallSuccess" class="small-success" style="display: none">
            Risk Updated
          </span>
        </div>

        <!-- DATES -->
        <div
          class="ml-auto flex wrap items-center"
          style="gap: 1rem; margin-right: 0.3rem"
        >
          <div v-show="lastBookCalculation?.length">
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import httpService from '../services/http'
import gridColumns from '../helpers/gridOptions'
import Risks from '../helpers/Risks'
import helpers from '../helpers'
import Formatters from '../helpers/Formatters'
import EventHandlers from '../helpers/eventHandlers'

import JqxSplitter from 'jqwidgets-framework/jqwidgets-vue/vue_jqxsplitter.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'
import JqxDateTimeInput from 'jqwidgets-framework/jqwidgets-vue/vue_jqxdatetimeinput.vue'
import JqxTreeGrid from 'jqwidgets-framework/jqwidgets-vue/vue_jqxtreegrid.vue'
import PageControls from '../helpers/PageControls'

let smallSuccessTimeout = 0

export default {
  name: 'MainPanel',

  components: {
    JqxSplitter,
    JqxButton,
    JqxDateTimeInput,
    // eslint-disable-next-line vue/no-unused-components
    JqxTreeGrid,
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
        loadBooks: 'Load iRMS',
      },
      panels: [
        { size: 90, min: 90, max: 90, collapsible: true },
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

  // computed: {
  //   isNotEE04Account() {
  //     return this.account !== 'EE04'
  //   },
  // },

  mounted() {
    // Remove each main panel element width assigned by jqwidgets
    this.$el.querySelector('.main-panel').style.width = null

    const accountVar = helpers.getAccountVar(this.account)
    accountVar.vue = this

    accountVar.tradeDate = helpers.getDateFromISO(this.bookDate.toISOString())

    // Prevent right click
    this.$refs.treeGridContainer.addEventListener('contextmenu', (e) =>
      e.preventDefault()
    )

    // this.$refs.btnPreview.$el.addEventListener('click', RMSOperations.preview)

    this.loadNav()
    this.loadStrategies()
  },

  methods: {
    async loadIRMS() {
      this.labels.loadBooks = 'Loading...'
      // @ts-ignore
      $(this.$refs.loadButton.$el).jqxButton({ disabled: true })
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
      this.loadCommoIndicatorLevel()
        .then(() => this.loadConfigTags())
        .then(() => this.loadBooks())
    },

    loadStrategies() {
      return httpService.get('get_strategies').then(({ data }) => {
        data.unshift('CHECK')
        strategies = data
      })
    },

    loadConfigTags() {
      return httpService
        .get(`get_configtags/${this.account}`)
        .then(({ data }) => {
          const accountVar = helpers.getAccountVar(this.account)
          accountVar.configTags = data
        })
        .catch((error) => {
          console.error('Failed to fetch config tags', error)
        })
    },

    loadNav() {
      console.time(`Load ${this.account} nav`)
      const accountVar = helpers.getAccountVar(this.account)
      return httpService
        .get(`get_nav/${this.account}/${accountVar.tradeDate}`)
        .then(({ data }) => {
          this.nav = helpers.formatNavData(data, this.account)

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
      const accountVar = helpers.getAccountVar(this.account)
      accountVar.treeGridID = currentTreeGridID

      if (existingGridEl?.length) {
        existingGridEl.jqxTreeGrid('destroy')
      }

      PageControls.CreateGenerateButtons()

      // Create new grid element for attach the new tree grid
      const newGrid = document.createElement('div')
      newGrid.setAttribute('id', `${currentTreeGridID}`)
      gridContainer?.appendChild(newGrid)

      const tradeDate = helpers.getDateFromISO(this.bookDate.toISOString())
      return httpService
        .get(`get_book/${this.account}/${tradeDate}`)
        .then(async ({ data: books }) => {
          accountVar.books = books
          accountVar.bookIDMap = []
          accountVar.bookIDMapRev = []

          accountVar.portfolio = await httpService
            .get(`get_portfolio/${this.account}/${tradeDate}`)
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
            book.action = ''
            accountVar.bookIDMap[i] = parseInt(book.id)
            accountVar.bookIDMapRev[book.id] = i
            book.style = 'background-color:red'
          }

          Risks.ComputeRisks()
          accountVar.spdRisks = Risks.SpreadRisks()

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
            localData: accountVar.books,
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
              editSingleCell: false,
              enableHover: true,
              editOnDoubleClick: false,
              editOnF2: true,
            },
            enableHover: false,
            ready: () => {
              accountVar.forceRenderedOnce = false
              //alert("ready");
            },
            rendered: () => {
              if (accountVar.calculateRisksLive) {
                //@ts-ignore
                Formatters.filterNonNull()
              }
              // this.buildGrid()
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

          // Reset editingRowID
          accountVar.editingRowID = -1

          // Attach event listeners
          $(`#${currentTreeGridID}`).on('rowClick', EventHandlers.onRowClick)
          $(`#${currentTreeGridID}`).on(
            'rowEndEdit',
            EventHandlers.onRowEndEdit
          )
        })
        .catch((error) => {
          console.error(
            `Failed to fetch books of ${this.account} account\n`,
            error
          )
        })
        .finally(() => {
          this.labels.loadBooks = 'Load iRMS'
          // @ts-ignore
          $(this.$refs.loadButton.$el).jqxButton({ disabled: false })
          console.timeEnd(`Load ${this.account} books`)
        })
    },

    loadCommoIndicatorLevel() {
      const accountVar = helpers.getAccountVar(this.account)
      return httpService
        .get('get_commo_indicator_level')
        .then(({ data }) => (accountVar.indLevel = data))
    },

    buildGrid() {
      // const a = new Date()
      if (helpers.getAccountVar(this.account).calculateRisksLive) {
        Formatters.filterNonNull()
      }
      // const b = new Date()
      //@ts-ignore
      // const dif = b - a
      // console.log(`FilterNonNull took ${dif} secs to complete`)

      // InitializeControls();
    },

    onShowNonNullClicked() {
      //@ts-ignore
      this.showNonNull = helpers.getAccountVar(this.account).showNonNull =
        !this.showNonNull
      this.buildGrid()
    },

    showContract() {
      const accountVar = helpers.getAccountVar(this.account)
      if (!accountVar.treeGridID.length) {
        const msg = 'There is no data yet. Please Load iRMS data first'
        alert(msg)
        throw SyntaxError(msg)
      }

      setTimeout(function () {
        for (let i = 0; i < accountVar.books.length; i++) {
          const book = accountVar.books[i]
          if (book.rowType == 'sector') book.expanded = true
          if (book.rowType == 'commodity') book.expanded = true
        }
        $(`#${accountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
      }, 500)
    },

    showSector() {
      const accountVar = helpers.getAccountVar(this.account)
      Promise.resolve().then(() => {
        for (let i = 0; i < accountVar.books.length; i++) {
          const book = accountVar.books[i]
          if (book.rowType == 'sector') {
            book.expanded = false
          }
        }
        $(`#${accountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
      })
    },

    showCommodity() {
      const accountVar = helpers.getAccountVar(this.account)
      Promise.resolve().then(() => {
        for (let i = 0; i < accountVar.books.length; i++) {
          const book = accountVar.books[i]
          if (book.rowType == 'sector') {
            book.expanded = true
          } else if (book.rowType == 'commodity') {
            book.expanded = false
          }
        }
        $(`#${accountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
      })
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

    checkLiveRisks() {
      const accountVar = helpers.getAccountVar(this.account)
      accountVar.calculateRisksLive = this.calculateRisksLive
      if (this.calculateRisksLive) {
        Risks.ComputeRisks()
        $(`#${accountVar.treeGridID}`).jqxTreeGrid('updateBoundData')
      }
    },

    updateTradeDate() {
      helpers.getAccountVar(this.account).tradeDate = helpers.getDateFromISO(
        this.bookDate.toISOString()
      )
    },

    showSmallSuccess(text: string, timeout: number) {
      clearTimeout(smallSuccessTimeout)
      this.$refs.smallSuccess.textContent = text
      this.$refs.smallSuccess.style.display = 'flex'
      smallSuccessTimeout = setTimeout(
        () => (this.$refs.smallSuccess.style.display = 'none'),
        timeout
      )
    },
  },
}
</script>
