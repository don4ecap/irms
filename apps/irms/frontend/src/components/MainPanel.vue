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

          <div class="flex field">JPY Equity</div>
          <div class="flex field">JPY CCY Futures</div>
          <div class="flex field">Strategy Allocation</div>
          <div class="flex field">Risk</div>
        </div>
        <div class="col-2">
          <div class="flex flex-column" style="gap: 0.3rem">
            <JqxDateTimeInput width="110" height="28" />
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
          <JqxButton theme="office">Load iRMS</JqxButton>
          <JqxButton theme="office">Calculate</JqxButton>
        </div>
        <div class="col-4 flex flex-column">
          <table>
            <tbody>
              <tr width="200px">
                <td style="table-layout: fixed">Last Nav:</td>
                <td class="text-left">
                  <span class="text-large"> $14,892,863.92</span>
                  <span class="oblique bold" style="font-size: 0.7rem">
                    (reconciled)
                  </span>
                </td>
              </tr>
              <tr>
                <td>Live PNL:</td>
                <td class="text-left">
                  <span class="text-large" style="color: green">
                    $31,356.91(+0.21 %)
                  </span>
                </td>
              </tr>
              <tr>
                <td>Sub/Red:</td>
                <td class="text-left">
                  <span class="text-large"> Sub/Red: $0.00 </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-5 flex flex-column">
          <table>
            <tbody>
              <tr width="200px">
                <td style="table-layout: fixed">Risk Ratio:</td>
                <td class="text-left">
                  <span class="text-large">0.00 %</span>
                </td>
              </tr>
              <tr>
                <td>Live NAV:</td>
                <td class="text-left">
                  <span
                    class="text-large"
                    style="
                      background-color: #7cb342;
                      color: #fff;
                      padding: 0.2rem;
                      padding-inline: 0.4rem;
                      border-radius: 0.2rem;
                    "
                  >
                    $31,356.91(+0.21 %)
                  </span>
                </td>
              </tr>
              <tr>
                <td>Last Calculated:</td>
                <td class="text-left">
                  <span>October 7 2022 3:31 PM</span>
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
  data() {
    return {
      panels: [
        { size: 150, min: 150, max: 150, collapsible: true },
        { size: '50%', min: '5%', collapsible: false },
      ],
    }
  },
  mounted() {
    document
      .querySelectorAll('.main-panel')
      .forEach((mainPanel) => (mainPanel.style.width = null))
  },
}
</script>
