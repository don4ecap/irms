<template>
  <div class="flex flex-column" style="height: calc(100% - 0.75rem)">
    <JqxSplitter
      height="calc(100% - 10rem)"
      width="100%"
      :panels="panels"
      class="main-panel"
      orientation="horizontal"
    >
      <div class="main-panel-top">
        <div class="col-1 flex-grow" style="max-width: 250px">
          <div class="flex" style="gap: 0.3rem">
            <JqxButton class="inline-block" theme="office">Sector</JqxButton>
            <JqxButton class="inline-block" theme="office">Common</JqxButton>
            <JqxButton class="inline-block" theme="office">All</JqxButton>
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
              id="show-non-null"
              type="button"
              value="Non-Null"
              role="button"
              class="jqx-rc-all jqx-rc-all-office jqx-button jqx-button-office jqx-widget jqx-widget-office jqx-fill-state-normal jqx-fill-state-normal-office inline-block"
              aria-disabled="tru"
              aria-checked="true"
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
      <div>Panel Two</div>
    </JqxSplitter>
    <div class="end-panel jqx-widget-content flex-grow items-start">
      <div class="flex items-center" style="gap: 0.3rem">
        <div class="permission bold text-center">RWX</div>
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
    </div>
  </div>
</template>

<script lang="ts">
import httpService from '../services/http'
import JqxSplitter from 'jqwidgets-framework/jqwidgets-vue/vue_jqxsplitter.vue'
import JqxButton from 'jqwidgets-framework/jqwidgets-vue/vue_jqxbuttons.vue'
import JqxDateTimeInput from 'jqwidgets-framework/jqwidgets-vue/vue_jqxdatetimeinput.vue'

export default {
  name: 'MainPanel',

  components: {
    JqxSplitter,
    JqxButton,
    JqxDateTimeInput,
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
    }
  },

  computed: {
    isNotEE04Account() {
      return this.account !== 'EE04'
    },
  },

  mounted() {
    document
      .querySelectorAll('.main-panel')
      .forEach((mainPanel) => (mainPanel.style.width = null))

    this.loadNav()
  },

  methods: {
    loadIRMS() {
      this.loadNav()
    },

    loadNav() {
      const tradeDate = this.bookDate.toISOString().split('T').at(0)
      // console.log(this.account, tradeDate)
      httpService
        .get(`get_nav/${this.account}/${tradeDate}`)
        .then(({ data }) => {
          const symbol = this.account !== 'EE04' ? '$' : '€'

          this.nav = {
            ...data,

            // Formatted
            live_nav: accounting.formatMoney(parseFloat(data.live_nav), symbol),
            subred: accounting.formatMoney(data.subred, symbol),
            live_pnl_decorated: `${accounting.formatMoney(
              data.live_pnl,
              symbol
            )}
              (${((data.live_pnl_pct || 0) * 100).toFixed(2)}%)`,
            last_nav: accounting.formatMoney(data.last_nav, symbol),
            last_calculated: moment(data.timestamp).format('LLL'),

            // Original data convert to int
            live_pnl: parseInt(data.live_pnl),
            last_nav_estimated: parseInt(data.last_nav_estimated),

            // New data
            live_pnl_status:
              data.last_nav_estimated === 0 ? 'reconciled' : 'estimated',
            live_pnl_status_title: `Last PNL: ${accounting.formatMoney(
              data.last_pnl,
              symbol
            )}`,
          }

          if (this.account !== 'EE04') {
            this.labels.riskRate = 'Risk Ratio'
            // if (this.account === 'DBPM') {
            //   this.labels.riskRate = 'Drawdown'
            // }
          }

          // TODO: GET RATIO
          // TODO: Getcurrencyhedging
        })
    },
  },
}
</script>
