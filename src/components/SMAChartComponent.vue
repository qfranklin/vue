<template>
  <div class="chart-container">
    <div class="top-container">
      <div class="crypto-buttons">
        <button
          v-for="(valueCrypto, displayCrypto) in cryptoMapping"
          :key="valueCrypto"
          :class="{ active: activeCrypto === valueCrypto }"
          @click="handleCryptoClick(valueCrypto)"
          :disabled="loading"
        >
          {{ displayCrypto }}
        </button>
      </div>

      <div class="time-buttons">
        <button
          v-for="(valueTime, displayTime) in timeMapping"
          :key="valueTime"
          :class="{ active: activeTime === valueTime }"
          @click="handleTimeClick(valueTime)"
          :disabled="loading"
        >
          {{ displayTime }}
        </button>
      </div>

    </div>

    <canvas id="cryptoChart"></canvas>

    <div class="bottom-container">

      <div class="chart-toggles">
        <span
          :class="{ hidden: !showPrice }"
          @click="showPrice = !showPrice"
        >
          Price
        </span>
        <span
          :class="{ hidden: !showRSI }"
          @click="showRSI = !showRSI"
        >
          RSI
        </span>
        <span
          :class="{ hidden: !showMA10 }"
          @click="showMA10 = !showMA10"
        >
          MA10
        </span>
        <span
          :class="{ hidden: !showMA50 }"
          @click="showMA50 = !showMA50"
        >
          MA50
        </span>
      </div>


      <div id="chartTooltip" class="tooltip-container" :style="{ opacity: tooltipState.isVisible ? 1 : 0 }" v-if="tooltipState.data">
        <div class="tooltip-content">
          <p class="tooltip-date">{{ tooltipState.formattedDate }}</p>
          <p v-if="showPrice" class="tooltip-item">
            <span class="tooltip-label">Price:</span>
            {{ tooltipState.data.current_price.toFixed(2) }}
          </p>
          <p v-if="showPrice" class="tooltip-item">
            <span class="tooltip-label">24h High:</span>
            {{ tooltipState.data.high_24h.toFixed(2) }}
          </p>
          <p v-if="showPrice" class="tooltip-item">
            <span class="tooltip-label">24h Low:</span>
            {{ tooltipState.data.low_24h.toFixed(2) }}
          </p>
          <p v-if="showMA10" class="tooltip-item">
            <span class="tooltip-label">MA10:</span>
            {{ tooltipState.data.ma_10.toFixed(2) }}
          </p>
          <p v-if="showMA50" class="tooltip-item">
            <span class="tooltip-label">MA50:</span>
            {{ tooltipState.data.ma_50.toFixed(2) }}
          </p>
          <p v-if="showRSI" class="tooltip-item">
            <span class="tooltip-label">RSI:</span>
            {{ tooltipState.data.rsi.toFixed(2) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import { ref, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import { Chart, registerables, Tooltip } from 'chart.js'
import type { TooltipItem, TooltipModel, ActiveElement, ChartConfiguration } from 'chart.js'
import { CandlestickController, CandlestickElement, OhlcElement } from 'chartjs-chart-financial'
import annotationPlugin from 'chartjs-plugin-annotation';
import type { AnnotationOptions } from 'chartjs-plugin-annotation';
import { format } from 'date-fns'
import 'chartjs-adapter-date-fns'
import { debounce } from 'lodash'

import {
  CRYPTO_MAPPING,
  TIME_MAPPING,
  type CryptoType,
  type TimeType,
  type CryptoDataPoint,
  type ApiResponseItem,
  type FetchCryptoDataParams,
  type TooltipData
} from '@/types/chart'

declare module 'chart.js' {
  interface TooltipPositionerMap {
    custom: (items: TooltipItem<'line'>[], eventPosition: { x: number; y: number }) => { x: number; y: number; xAlign: string; yAlign: string } | false
  }
}

Chart.register(...registerables, CandlestickController, CandlestickElement, OhlcElement, annotationPlugin)

Tooltip.positioners.custom = function (items: TooltipItem<'line'>[], eventPosition: { x: number; y: number }) {
  const pos = Tooltip.positioners.average.call(this as unknown as TooltipModel<'line'>, items as unknown as ActiveElement[], eventPosition)

  if (!pos) {
    return false
  }

  const chart = (this as unknown as TooltipModel<'line'>).chart
  const dataPointY = items[0].element.y
  const chartHeight = chart.chartArea.bottom - chart.chartArea.top

  const yAlign = dataPointY > chartHeight / 2 ? 'top' : 'bottom'
  const y = yAlign === 'top' ? chart.chartArea.top : chart.chartArea.bottom

  return {
    x: pos.x,
    y: y,
    xAlign: 'center',
    yAlign: yAlign,
  }
}

interface CandlestickData {
  x: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

interface LineData {
  x: number;
  y: number;
}

export default {
  name: 'SMAChartComponent',
  setup() {
    const activeCrypto: Ref<CryptoType> = ref('bitcoin')
    const activeTime: Ref<TimeType> = ref('hourly')
    const responseData = ref<CryptoDataPoint[]>([])
    const selectedDataPoint = ref<CryptoDataPoint | null>(null)
    let chartInstance: Chart | null = null
    const loading = ref(false)

    const showPrice = ref(true)
    const showRSI = ref(true)
    const showMA10 = ref(false)
    const showMA50 = ref(false)

    const fetchCryptoDataDebounced = debounce(
      (params: FetchCryptoDataParams) => fetchCryptoData(params),
      300
    ) as (params: FetchCryptoDataParams) => Promise<void>

    const tooltipState = ref<TooltipData>({
      isVisible: false,
      formattedDate: '',
      data: null
    })
    const formatDate = (timestamp: string, timeFormat: TimeType): string => {
      if (timeFormat === 'hourly') {
        return format(new Date(timestamp), 'ha').toLowerCase()
      }
      const date = new Date(timestamp)
      const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
      return format(utcDate, 'MM/dd')
    }

    const fetchCryptoData = async ({
      crypto,
      time,
      pageLoad
    }: FetchCryptoDataParams): Promise<void> => {
      if (activeCrypto.value === crypto &&
          activeTime.value === time &&
          !pageLoad){
       return;
      }

      try {

        loading.value = true
        activeCrypto.value = crypto
        activeTime.value = time

        const response = await axios.get(`/api/crypto/get-prices`, {
          params: {
            crypto: crypto.toLowerCase(),
            range: time
          }
        });

        responseData.value = response.data.map((item: ApiResponseItem): CryptoDataPoint => ({
          timestamp: time === 'hourly'
            ? format(
                new Date(item.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' }),
                'yyyy-MM-dd HH:mm:ss'
              )
            : item.timestamp,
          current_price: parseFloat(item.current_price),
          high_24h: parseFloat(item.high_24h),
          low_24h: parseFloat(item.low_24h),
          ma_10: parseFloat(item.ma_10),
          ma_50: parseFloat(item.ma_50),
          rsi: parseFloat(item.rsi)
        }));


        if (chartInstance) {
          updateChartData();
        } else {
          renderChart();
        }

        if (responseData.value.length > 0) {
          displayTooltip(responseData.value[responseData.value.length - 1]);
        }

      } catch (error) {
        console.error(`Failed to fetch ${crypto} data:`, error)
      } finally {
        loading.value = false
      }
    }

    const displayTooltip = (data: CryptoDataPoint) => {
      tooltipState.value = {
        isVisible: true,
        formattedDate: formatDate(data.timestamp, activeTime.value),
        data
      }
    }

    const renderChart = () => {
      const canvas = document.getElementById('cryptoChart') as HTMLCanvasElement
      if (!canvas) {
        console.error('Canvas element not found')
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('Canvas context not found')
        return
      }

      // Calculate boundaries for y-axis
      const low24hValues = responseData.value
        .map(item => item.low_24h)
        .filter(value => !isNaN(value))
      const high24hValues = responseData.value
        .map(item => item.high_24h)
        .filter(value => !isNaN(value))

      const chartConfiguration: ChartConfiguration = {
        type: 'candlestick',
        data: {
          labels: responseData.value.map(item => item.timestamp),
          datasets: [
            {
              label: 'Price',
              type: 'candlestick',
              data: responseData.value.map((item, index): CandlestickData => ({
                x: new Date(item.timestamp).getTime(),
                o: index === 0 ? item.current_price : responseData.value[index - 1].current_price,
                h: item.high_24h,
                l: item.low_24h,
                c: item.current_price,
              })),
              borderColor: '#333333',
              backgroundColor: '#333333',
              hidden: !showPrice.value,
            },
            {
              label: 'MA 10',
              type: 'line',
              data: responseData.value.map((item): LineData => ({
                x: new Date(item.timestamp).getTime(),
                y: item.ma_10,
              })),
              borderColor: 'rgba(51, 51, 51, 0.5)',
              backgroundColor: 'rgba(51, 51, 51, 0.5)',
              fill: false,
              pointRadius: 0,
              borderWidth: 1,
              tension: 0.4,
              hidden: !showMA10.value,
            },
            {
              label: 'MA 50',
              type: 'line',
              data: responseData.value.map((item): LineData => ({
                x: new Date(item.timestamp).getTime(),
                y: item.ma_50,
              })),
              borderColor: 'rgba(51, 51, 51, 0.25)',
              backgroundColor: 'rgba(51, 51, 51, 0.25)',
              fill: false,
              pointRadius: 0,
              borderWidth: 1,
              tension: 0.4,
              hidden: !showMA50.value,
            },
            {
              label: 'RSI',
              type: 'line',
              yAxisID: 'y-rsi',
              data: responseData.value.map((item): LineData => ({
                x: new Date(item.timestamp).getTime(),
                y: item.rsi,
              })),
              borderColor: '#666666',
              backgroundColor: '#666666',
              fill: false,
              pointRadius: 0,
              borderWidth: 1,
              tension: 0.4,
              hidden: !showRSI.value,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              display: false
            },
            y: {
              beginAtZero: false,
              min: Math.min(...low24hValues) * 0.95,
              max: Math.max(...high24hValues) * 1.05,
              display: false
            },
            'y-rsi': {
              position: 'right',
              beginAtZero: false,
              min: 0,
              max: 100,
              ticks: {
                display: false
              },
              grid: {
                drawTicks: true,
                drawOnChartArea: true,
                color: (context) => {
                  return context.tick.value === 30 || context.tick.value === 70
                    ? 'rgba(0, 0, 0, 0.4)'
                    : 'transparent'
                },
              },
              border: {
                display: false
              },
            },
          },
          interaction: {
            intersect: false,
            mode: 'nearest',
            axis: 'x',
          },
          onHover: (event) => {
            if (chartInstance) {
              const xScale = chartInstance.scales.x;
              const mouseX = event.x;

              // Convert mouse position to value on x-axis
              if (mouseX !== null) {
                const timestamp = xScale.getValueForPixel(mouseX);

                if(timestamp){
                  const nearestPoint = responseData.value.reduce((prev, curr) => {
                    const currTime = new Date(curr.timestamp).getTime();
                    const prevTime = new Date(prev.timestamp).getTime();
                    return Math.abs(currTime - timestamp) < Math.abs(prevTime - timestamp) ? curr : prev;
                  });
                  const nearestTimestamp = new Date(nearestPoint.timestamp).getTime();
                  const annotations = chartInstance?.options?.plugins?.annotation?.annotations as Record<string, AnnotationOptions<'line'>>;
                  if (annotations?.verticalLine) {
                    annotations.verticalLine.xMin = nearestTimestamp;
                    annotations.verticalLine.xMax = nearestTimestamp;
                    chartInstance.update('none');
                  }
                }
              }
            }
          },
          plugins: {
            tooltip: {
              enabled: false,
              external: (context) => {
                const { tooltip } = context
                if (tooltip.dataPoints && tooltip.dataPoints.length > 0) {
                  const dataIndex = tooltip.dataPoints[0].dataIndex
                  const dataPoint = responseData.value[dataIndex]
                  displayTooltip(dataPoint)
                  selectedDataPoint.value = dataPoint
                } else {
                  tooltipState.value.isVisible = false
                  selectedDataPoint.value = null
                }
              },
              position: 'custom',
            },
            legend: {
              display: false,
            },
            annotation: {
              animations: {
                numbers: {
                  duration: 0
                }
              },
              annotations: {
                verticalLine: {
                  type: 'line' as const,
                  xMin: selectedDataPoint.value ? new Date(selectedDataPoint.value.timestamp).getTime() : '',
                  xMax: selectedDataPoint.value ? new Date(selectedDataPoint.value.timestamp).getTime() : '',
                  borderColor: 'rgba(0, 0, 0, 0.5)',
                  borderWidth: 1,
                  borderDash: [5, 5],
                  label: {
                    display: false
                  }
                }
              }
            }
          },
        },
      }

      chartInstance = new Chart(ctx, chartConfiguration)
    }

    const handleCryptoClick = (crypto: CryptoType) => {
      fetchCryptoDataDebounced({
        crypto,
        time: activeTime.value,
        pageLoad: false
      });
    };

    const handleTimeClick = (time: TimeType) => {
      fetchCryptoDataDebounced({
        crypto: activeCrypto.value,
        time,
        pageLoad: false
      });
    };

    onMounted(async () => {
      await fetchCryptoData({
        crypto: activeCrypto.value,
        time: activeTime.value,
        pageLoad: true
      })

      if (responseData.value.length > 0 && chartInstance) {
        const lastPoint = responseData.value[responseData.value.length - 1]
        const lastTimestamp = new Date(lastPoint.timestamp).getTime()
        
        const annotations = chartInstance?.options?.plugins?.annotation?.annotations as Record<string, AnnotationOptions<'line'>>
        if (annotations?.verticalLine) {
          annotations.verticalLine.xMin = lastTimestamp
          annotations.verticalLine.xMax = lastTimestamp
          chartInstance.update('none')
        }
        
        selectedDataPoint.value = lastPoint
      }

    })

    const updateChartData = () => {
      if (chartInstance) {

        const low24hValues = responseData.value.map(item => item.low_24h);
        const high24hValues = responseData.value.map(item => item.high_24h);

        chartInstance.data.labels = responseData.value.map(item => item.timestamp)
        chartInstance.data.datasets.forEach((dataset) => {
          if (dataset.label === 'Price') {
            dataset.data = responseData.value.map((item, index): CandlestickData => ({
              x: new Date(item.timestamp).getTime(),
              o: index === 0 ? item.current_price : responseData.value[index - 1].current_price,
              h: item.high_24h,
              l: item.low_24h,
              c: item.current_price,
            }))
          } else if (dataset.label === 'MA 10') {
            dataset.data = responseData.value.map((item): LineData => ({
              x: new Date(item.timestamp).getTime(),
              y: item.ma_10,
            }))
          } else if (dataset.label === 'MA 50') {
            dataset.data = responseData.value.map((item): LineData => ({
              x: new Date(item.timestamp).getTime(),
              y: item.ma_50,
            }))
          } else if (dataset.label === 'RSI') {
            dataset.data = responseData.value.map((item): LineData => ({
              x: new Date(item.timestamp).getTime(),
              y: item.rsi,
            }))
          }
        })

        if (chartInstance.options.scales && chartInstance.options.scales.y) {
          chartInstance.options.scales.y.min = Math.min(...low24hValues) * 0.95;
          chartInstance.options.scales.y.max = Math.max(...high24hValues) * 1.05;
        }

        chartInstance.update('none')
      }
    }

    const updateChart = () => {
      if (chartInstance) {
        chartInstance.data.datasets.forEach((dataset) => {
          if (dataset.label === 'Price') {
            dataset.hidden = !showPrice.value
          } else if (dataset.label === 'MA 10') {
            dataset.hidden = !showMA10.value
          } else if (dataset.label === 'MA 50') {
            dataset.hidden = !showMA50.value
          } else if (dataset.label === 'RSI') {
            dataset.hidden = !showRSI.value
          }
        })

        if (chartInstance.options.scales && chartInstance.options.scales['y-rsi']) {
          chartInstance.options.scales['y-rsi'].display = showRSI.value
        }

        chartInstance.update('none')
      }
    }

    watch([showPrice, showRSI, showMA10, showMA50], updateChart)

    return {
      responseData,
      cryptoMapping: CRYPTO_MAPPING,
      timeMapping : TIME_MAPPING,
      activeCrypto,
      activeTime,
      fetchCryptoDataDebounced,
      loading,
      selectedDataPoint,
      fetchCryptoData,
      tooltipState,
      handleCryptoClick,
      handleTimeClick,
      showPrice,
      showRSI,
      showMA10,
      showMA50
    }
  },
}
</script>

<style>

.chart-container {
  position: relative;
  max-width: 100%;
}

.top-container, .bottom-container {
  display: flex;
  justify-content: space-between;
}

.top-container {
  margin-bottom: 5px;
}

.bottom-container {
  margin-top: 5px;
}

.crypto-buttons button, .time-buttons button {
  border: none;
  background: none;
  cursor: pointer;
  transition: color 0.3s;
  padding: 3px;
}

.crypto-buttons button {
  font-size: 16px;
}

.crypto-buttons button.active, .time-buttons button.active {
  color: blue;
  text-decoration: underline;
  text-decoration-thickness: 2px;
}

.time-buttons, .crypto-buttons {
  display: flex;
}

canvas {
  max-width: 100%;
}

body {
    background-color: #f5f5f5;
}

.chart-toggles {
  display: flex;
  gap: 5px;
  font-size: 12px;
}

.chart-toggles span {
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.3s;
}

.chart-toggles span.hidden {
  opacity: 0.5;
}

.tooltip-container {
  display: flex;
  pointer-events: none;
  transition: opacity 0.3s;
}

.tooltip-content {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  max-width: 200px;
  font-family: Arial, sans-serif;
  font-size: 14px;
  color: #333;
}

.tooltip-date {
  font-weight: bold;
  margin-bottom: 5px;
}

.tooltip-item {
  margin: 5px 0;
}

.tooltip-label {
  font-weight: bold;
  color: #555;
}
</style>
