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
      <div class="main-panel-top" style="overflow-x: auto">
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
            <JqxDropDownList
              theme="office"
              width="130"
              :source="sessions"
              :selected-index="0"
              title="iRMS book session"
              @change="onChangeSession"
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
              title="Hides the contract rows of the iRMS which have 0 Positions, 0 Allocation and No Orders"
              @click="onShowNonNullClicked"
            />
          </div>
        </div>
        <div
          class="col-3 flex flex-column"
          style="min-width: 8.3rem; gap: 0.3rem"
        >
          <JqxButton
            ref="loadButton"
            theme="office"
            title="Fetches the recently calculated iRMS data from the database"
            @click="loadIRMS"
          >
            {{ labels.loadBooks }}
          </JqxButton>
          <JqxButton
            ref="btnCalculate"
            theme="office"
            title="Launches the R Script to calculate the iRMS via ExecuteR. Waits for it to finish and then executes Load iRMS"
            onclick="Calculate(this)"
          >
            Calculate
          </JqxButton>
        </div>
        <div class="col-4 flex flex-column" style="min-width: 17rem">
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
                    v-show="!!nav.live_pnl_status"
                    :class="{
                      'oblique bold': true,
                      'text-purple': nav.last_nav_estimated,
                    }"
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
        <div class="col-5 flex flex-column" style="min-width: 17rem">
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
                    v-show="!!nav.live_nav"
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
        <div
          class="col-5 flex flex-column min-w-fit-content"
          style="gap: 0.3rem"
        >
          <div class="flex" style="gap: 0.3rem">
            <JqxButton
              class="inline-block"
              theme="office"
              tag
              section
              title="Launches the R Script to generate orders for the iRMS via ExecuteR. Waits for it to finish and then executes Load iRMS"
              onclick="Generate(this)"
              >Generate</JqxButton
            >
            <JqxButton
              ref="btnPreview"
              class="inline-block"
              theme="office"
              title="Parses the existing orders in the iRMS and Displays them in the Preview Orders pane"
              @click="$emit('btn-preview-clicked')"
            >
              Preview
            </JqxButton>
            <JqxButton
              class="inline-block"
              theme="office"
              title="Deletes all orders from the iRMS"
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
            v-show="!loadingBooks"
            :id="`${account}-config-tags-button-container`"
            class="flex"
            style="gap: 0.3rem"
          ></div>
        </div>
        <div
          class="col-5 flex flex-column ml-auto"
          style="gap: 0.3rem; margin-right: 1em"
        >
          <div>
            <a :href="gitBranchLink" target="_blank">{{ version }}</a>
          </div>
        </div>
      </div>
      <div ref="mainContainer" class="main-container">
        <!-- iRMS Book  -->
        <div
          v-show="currentViewIndex === 0"
          ref="IRMSBookTreeGridContainer"
          class="irms-book-tree-grid-container flex w-full"
        >
          <div
            v-show="!bookIsError"
            :id="IRMSBookTreeGridID"
            ref="IRMSBookTreeGrid"
            class="irms-book-tree-grid"
          />
          <div
            v-show="bookIsError && !loadingBooks"
            class="book-error-msg flex flex-column flex-grow items-center justify-center"
          >
            {{ bookErrorMsg }}
          </div>
        </div>

        <!-- iCMS NAV -->
        <ICMSNavGrid
          v-show="currentViewIndex === 1"
          ref="ICMSNavGrid"
          :account="account"
        />

        <!-- iCMS Commissions -->
        <ICMSCommissionsGrid
          v-show="currentViewIndex === 2"
          ref="ICMSCommissionsGrid"
          :account="account"
        />

        <!-- iAlarms View -->
        <IAlarmsView
          v-show="currentViewIndex === 3"
          ref="IAlarmsView"
          :account="account"
        />
      </div>
    </JqxSplitter>
    <div
      class="end-panel jqx-widget-content items-start overflow-x-auto"
      style="min-width: -webkit-fill-available"
    >
      <div class="flex min-w-max-content" style="gap: 0.3rem">
        <!-- BUTTONS -->
        <div class="flex self-baseline" style="gap: 0.3rem">
          <!-- <JqxButton
            class="inline-block"
            theme="office"
            onclick="LoadConfig('directional','Config')"
          >
            Directional Config
          </JqxButton> -->
          <!-- <JqxButton
            class="inline-block"
            theme="office"
            onclick="LoadConfig('intraday','Config')"
          >
            Intraday Config
          </JqxButton> -->
          <JqxToggleButton
            ref="IRMSBookViewButton"
            class="inline-block bottom-tab-button"
            theme="office"
            :toggled="currentViewIndex === 0"
            @click="loadIRMS"
          >
            iRMS Book
          </JqxToggleButton>
          <JqxToggleButton
            ref="ICMSNavViewButton"
            class="inline-block bottom-tab-button"
            theme="office"
            :toggled="currentViewIndex === 1"
            @click="loadICMSNavGrid"
          >
            iCMS NAV
          </JqxToggleButton>
          <JqxToggleButton
            ref="ICMSCommissionViewButton"
            class="inline-block bottom-tab-button"
            theme="office"
            :toggled="currentViewIndex === 2"
            @click="loadICMSCommissionsGrid"
          >
            iCMS Commissions
          </JqxToggleButton>
          <JqxToggleButton
            ref="IAlarmsViewButton"
            class="inline-block bottom-tab-button"
            theme="office"
            title="List of working alarms for this account"
            :toggled="currentViewIndex === 3"
            @click="loadAlarmsView"
          >
            Working Alarms
          </JqxToggleButton>
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
          v-show="!bookIsError"
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
          <div v-show="bookLoadedDate?.length && !bookIsError">
            Book Loaded: <span>{{ bookLoadedDate }}</span>
          </div>
          <div class="permission bold text-center self-center cursor-default">
            <span title="Read">R</span>
            <span title="Write">W</span>
            <span title="Excecute">X</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import http from '../services/http'
import gridColumns from '../helpers/gridOptions'
import Risks from '../helpers/Risks'
import helpers from '../helpers'
import Formatters from '../helpers/Formatters'
import EventHandlers from '../helpers/eventHandlers'
import PageControls from '../helpers/PageControls'
import type { Alarm } from 'irms-shared-types'

import JqxSplitter from 'jqwidgets-framework/jqwidgets-vue/vue_jqxsplitter.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'
import JqxToggleButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxtogglebutton.vue'
import JqxDateTimeInput from 'jqwidgets-framework/jqwidgets-vue/vue_jqxdatetimeinput.vue'
import JqxTreeGrid from 'jqwidgets-framework/jqwidgets-vue/vue_jqxtreegrid.vue'
import JqxDropDownList from 'jqwidgets-framework/jqwidgets-vue/vue_jqxdropdownlist.vue'
import ICMSNavGrid from '../components/icms/NavGrid.vue'
import ICMSCommissionsGrid from '../components/icms/CommisionsGrid.vue'
import IAlarmsView from '../components/AlarmView.vue'

let smallSuccessTimeout = {} as NodeJS.Timer

const navInitialData = {
  account: 'EE02',
  td: '',
  last_recon_date: '',
  last_nav: '',
  last_nav_estimated: '',
  last_pnl: '',
  last_subred: '',
  last_pnl_pct: '',
  live_nav: '',
  live_pnl: undefined,
  live_pnl_pct: '',
  subred: '',
}

export default {
  name: 'MainPanel',

  components: {
    JqxSplitter,
    JqxButton,
    JqxDateTimeInput,
    // eslint-disable-next-line vue/no-unused-components
    JqxTreeGrid,
    JqxDropDownList,
    JqxToggleButton,
    ICMSNavGrid,
    ICMSCommissionsGrid,
    IAlarmsView,
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
      nav: { ...navInitialData },
      labels: {
        riskRate: 'Risk Rate',
        loadBooks: 'Load iRMS',
      },
      sessions: ['EOD', 'MORNING', 'AFTERNOON', 'EVENING'],
      panels: [
        { size: 103, min: 103, max: 103, collapsible: true },
        { size: '50%', min: '50%', collapsible: false },
      ],
      bookLoadedDate: '',
      lastBookCalculationScheduler: '',
      lastBookCalculation: '',
      lastBookCalculationSchedulerInterval: {} as NodeJS.Timer,
      calculateRisksLive: true,
      forceRenderedOnce: true,
      showNonNull: true,
      version: import.meta.env.VITE_IRMS_VERSION,
      gitBranchLink: import.meta.env.VITE_IRMS_GIT_BRANCH_LINK,
      selectedSessionIndex: 0,
      bookIsError: false,
      bookErrorMsg: '',
      loadingBooks: false,
      /** Current view index to indicate track which view is opened right now
       * 0 for iRMS book, 1 for iCMS NAV, and 2 for iCMS Commissions
       */
      currentViewIndex: 0,
      IRMSBookTreeGridID: 'irms-book-tree-grid-' + this.account.toLowerCase(),
    }
  },

  computed: {
    // isNotEE04Account() {
    //   return this.account !== 'EE04'
    // },

    selectedSession() {
      return this.sessions[this.selectedSessionIndex] || ''
    },

    tradeDate() {
      return helpers.getDateFromISO(this.bookDate.toISOString())
    },
  },

  watch: {
    currentViewIndex(index: number, prevIndex: number) {
      const buttonRefs = [
        this.$refs.IRMSBookViewButton,
        this.$refs.ICMSNavViewButton,
        this.$refs.ICMSCommissionViewButton,
        this.$refs.IAlarmsViewButton,
      ]

      if (index < buttonRefs.length) {
        const toggleButton = buttonRefs[index]
        buttonRefs.splice(index, 1)
        toggleButton.setOptions({ disabled: true })
        for (const otherButton of buttonRefs) {
          otherButton.setOptions({ disabled: false })
          otherButton.unCheck()
        }
      }

      const prevToggleButton = buttonRefs[prevIndex]
      prevToggleButton?.setOptions({ disabled: false })

      if (index === 3) {
        this.$refs.IAlarmsView.start()
      } else if (prevIndex === 3) {
        this.$refs.IAlarmsView.clearIntervals()
      }
    },
  },

  mounted() {
    // Remove each main panel element width assigned by jqwidgets
    this.$el.querySelector('.main-panel').style.width = null

    const accountVar = helpers.getAccountVar(this.account)
    accountVar.vue = this
    accountVar.treeGridID = this.IRMSBookTreeGridID
    accountVar.tradeDate = this.tradeDate

    // Prevent right click
    this.$refs.mainContainer.addEventListener('contextmenu', (e) =>
      e.preventDefault()
    )

    this.initialize(accountVar)
    this.$refs.IRMSBookViewButton.setOptions({ disabled: true })
  },

  methods: {
    initialize(accountVar: IAccountVar) {
      const IRMSBookDataAdapter = new $.jqx.dataAdapter({
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
        localData: [],
      })

      $(this.$refs.IRMSBookTreeGrid).jqxTreeGrid({
        source: IRMSBookDataAdapter,
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
        ready() {
          accountVar.forceRenderedOnce = false
        },
        rendered() {
          if (accountVar.calculateRisksLive && accountVar.books.length > 1) {
            Formatters.filterNonNull()
          }
        },
        columns: gridColumns,
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
      })

      // Attach event listeners
      $(this.$refs.IRMSBookTreeGrid).on('rowClick', EventHandlers.onRowClick)
      $(this.$refs.IRMSBookTreeGrid).on(
        'rowEndEdit',
        EventHandlers.onRowEndEdit
      )
    },

    async loadIRMS() {
      if (this.currentViewIndex !== 0) {
        this.currentViewIndex = 0
        return
      }

      this.showLoadingBooks()
      this.bookLoadedDate = moment().format('LLL')

      await this.loadCommoIndicatorLevel()
      await this.loadStrategies()
      await this.loadAlarms()
      // this.loadContracts()
      await this.loadConfigTags()

      await this.loadBooks()
      await this.loadNav()

      const date = await this.getLastBookCalculation()
      this.lastBookCalculation = moment(date).format('LLL')
      // Attach last book calclulation scheduler, runs every one minute
      this.updateLastBookCalculationScheduler()
      if (!this.lastBookCalculationSchedulerInterval) {
        console.debug('Check last book calculation scheduler has been attached')
        this.lastBookCalculationSchedulerInterval = setInterval(
          this.updateLastBookCalculationScheduler,
          60000
        )
      }
      return Promise.resolve()
    },

    async loadStrategies() {
      const { data } = await http.irms.get('get_strategies')
      data.unshift('CHECK')
      strategies = data
    },

    async loadConfigTags() {
      try {
        const { data } = await http.irms.get(`get_configtags/${this.account}`)
        const accountVar = helpers.getAccountVar(this.account)
        accountVar.configTags = data
        PageControls.CreateGenerateButtons()
      } catch (error) {
        console.error('Failed to fetch config tags', error)
      }
    },

    async loadNav() {
      console.time(`Load ${this.account} nav`)
      const accountVar = helpers.getAccountVar(this.account)
      const { data } = await http.irms.get(
        `get_nav/${this.account}/${accountVar.tradeDate}`
      )
      this.nav = helpers.formatNavData(data, this.account)
      if (this.account !== 'EE04') {
        this.labels.riskRate = 'Risk Ratio'
      }
    },

    async loadBooks() {
      console.time(`Load ${this.account} books`)
      const accountVar = helpers.getAccountVar(this.account)

      this.showLoadingBooks()
      this.loadingBooks = true

      try {
        const { data: books } = await http.irms.get(
          `get_book/${this.account}/${this.tradeDate}?session=${this.selectedSession}`
        )
        $(this.$refs.IRMSBookTreeGrid).jqxTreeGrid('clear')
        accountVar.books = books
        accountVar.bookIDMap = []
        accountVar.bookIDMapRev = []

        this.bookIsError = false
        await this.loadPortfolio()

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

        const newDataAdapter = new $.jqx.dataAdapter({
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
        $(this.$refs.IRMSBookTreeGrid).jqxTreeGrid({ source: newDataAdapter })

        // Reset editingRowID
        accountVar.editingRowID = -1
        return await Promise.resolve()
      } catch (error) {
        if (error.response.status !== 404) {
          console.error('Failed to fetch books', this.account, error)
        }
        this.bookIsError = true
        if (!error?.response?.data?.message) {
          this.bookErrorMsg = `Failed to fetch books of ${
            this.account
          } account with ${this.sessions[this.selectedSessionIndex]} session`
        } else {
          console.error(error.response.data.message)
          this.bookErrorMsg = error.response.data.message
        }
        clearInterval(this.lastBookCalculationSchedulerInterval)
        this.resetNavData()
        this.resetConfigTagsButton()
        return await Promise.reject()
      } finally {
        this.loadingBooks = false
        this.unshowLoadingBooks()
        console.timeEnd(`Load ${this.account} books`)
      }
    },

    async loadPortfolio() {
      const tradeDate = helpers.getDateFromISO(this.bookDate.toISOString())
      try {
        const { data: portfolio } = await http.irms.get(
          `get_portfolio/${this.account}/${tradeDate}`
        )
        const accountVar = helpers.getAccountVar(this.account)
        accountVar.portfolio = portfolio
        accountVar.portfolio.display = 'PORTFOLIO'
        accountVar.portfolio.rowType = 'sector'
        accountVar.portfolio.parent = null
        accountVar.books.unshift(accountVar.portfolio)
      } catch (error) {
        console.error('Failed to get portfolio', error)
      }
    },

    async loadCommoIndicatorLevel() {
      const accountVar = helpers.getAccountVar(this.account)
      const { data } = await http.irms.get('get_commo_indicator_level')
      return (accountVar.indLevel = data)
    },

    buildGrid() {
      if (helpers.getAccountVar(this.account).calculateRisksLive) {
        Formatters.filterNonNull()
      }
    },

    onShowNonNullClicked() {
      this.showNonNull = helpers.getAccountVar(this.account).showNonNull =
        !this.showNonNull
      this.buildGrid()
    },

    showContract() {
      const accountVar = helpers.getAccountVar(this.account)
      if (!accountVar.bookIDMap.length) {
        const message = 'There is no data yet. Please Load iRMS data first'
        PageControls.error(message)
      }

      for (const book of accountVar.books) {
        if (book.rowType == 'sector') book.expanded = true
        if (book.rowType == 'commodity') book.expanded = true
      }
      $(this.$refs.IRMSBookTreeGrid).jqxTreeGrid('updateBoundData')
    },

    showSector() {
      const accountVar = helpers.getAccountVar(this.account)
      for (const book of accountVar.books) {
        if (book.rowType == 'sector') {
          book.expanded = false
        }
      }
      $(this.$refs.IRMSBookTreeGrid).jqxTreeGrid('updateBoundData')
    },

    showCommodity() {
      const accountVar = helpers.getAccountVar(this.account)
      Promise.resolve().then(() => {
        for (const book of accountVar.books) {
          if (book.rowType == 'sector') {
            book.expanded = true
          } else if (book.rowType == 'commodity') {
            book.expanded = false
          }
        }
        $(this.$refs.IRMSBookTreeGrid).jqxTreeGrid('updateBoundData')
      })
    },

    async getLastBookCalculation() {
      try {
        const { data } = await http.irms.get(
          `check_last_calculated/${this.account}`
        )
        return data.value
      } catch (error) {
        console.error(
          `Failed to fetch last calculation date for ${this.account}`,
          error
        )
        return new Date()
      }
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
        $(this.$refs.IRMSBookTreeGrid).jqxTreeGrid('updateBoundData')
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

    onChangeSession(event) {
      this.selectedSessionIndex = event.args.index || 0
    },

    showLoadingBooks() {
      this.labels.loadBooks = 'Loading...'
      $(this.$refs.loadButton.$el).jqxButton({ disabled: true })
      $(this.$refs.btnPreview.$el).jqxButton({ disabled: true })
    },

    unshowLoadingBooks() {
      this.labels.loadBooks = 'Load iRMS'
      $(this.$refs.loadButton.$el).jqxButton({ disabled: false })
      $(this.$refs.btnPreview.$el).jqxButton({ disabled: false })
    },

    resetNavData() {
      this.nav = { ...navInitialData }
    },

    resetConfigTagsButton() {
      const configTagsButtonContainer = document.querySelector(
        `#${this.account}-config-tags-button-container`
      )
      Array.from(configTagsButtonContainer.children || []).forEach((child) =>
        child.remove()
      )
    },

    async loadAlarms() {
      try {
        const { data: alarms } = await http.irms.get('get_alarms')
        window.alarms = alarms as Array<Alarm>
      } catch (error) {
        console.error('Failed to load alarms', error)
      }
    },

    loadICMSNavGrid() {
      if (this.currentViewIndex !== 1) {
        this.currentViewIndex = 1
        return
      }
      this.$refs.ICMSNavGrid.getICMSNavData()
    },

    loadICMSCommissionsGrid() {
      if (this.currentViewIndex !== 2) {
        this.currentViewIndex = 2
        return
      }
      this.$refs.ICMSCommissionsGrid.getICMSCommissionsData()
    },

    loadAlarmsView() {
      if (this.currentViewIndex !== 3) {
        this.currentViewIndex = 3
      }
    },
  },
}
</script>
