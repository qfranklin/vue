<template>
  <div>
    <h2>Bitcoin Quarterly Max Price Chart</h2>
    <div class="quarter-selector">
      <button @click="prevQuarter" :disabled="!hasPrevQuarter">Previous</button>
      <select v-model="selectedQuarter" @change="fetchQuarterlyData">
        <option v-for="quarter in quarters" :key="quarter.value" :value="quarter.value">{{ quarter.text }}</option>
      </select>
      <button @click="nextQuarter" :disabled="!hasNextQuarter">Next</button>
    </div>
    <div class="chart-container">
      <canvas id="smaChart"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import debounce from 'lodash/debounce';

Chart.register(...registerables);

export interface BitcoinData {
  date: string;
  max_price: number;
  sma_50: number;
  sma_200: number;
}

export default {
  name: 'SMAChart',
  setup() {
    const bitcoinData = ref<BitcoinData[]>([]);
    const chartInstance = ref<Chart<'line', any[], any> | null>(null);
    const selectedQuarter = ref(`${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`);
    const quarters = ref<{ value: string; text: string }[]>([]);

    const fetchAvailableQuarters = async () => {
      try {
        const response = await axios.get('/api/bitcoin/available-quarters');
        const { minYear, maxYear, minQuarter, maxQuarter } = response.data;

        const quarterList = [];
        for (let year = minYear; year <= maxYear; year++) {
          const startQuarter = year === minYear ? minQuarter : 1;
          const endQuarter = year === maxYear ? maxQuarter : 4;
          for (let quarter = startQuarter; quarter <= endQuarter; quarter++) {
            quarterList.push({ value: `${year}-Q${quarter}`, text: `Q${quarter} ${year}` });
          }
        }

        quarters.value = quarterList;
      } catch (error) {
        console.error('Failed to fetch available quarters:', error);
      }
    };

    const fetchQuarterlyData = debounce(async () => {
      const [year, quarter] = selectedQuarter.value.split('-Q');
      try {
        const response = await axios.get(`/api/bitcoin/quarterly-max-price/${year}/${quarter}`);
        bitcoinData.value = response.data;
        renderChart();
      } catch (error) {
        console.error('Failed to fetch Bitcoin data:', error);
      }
    }, 300);

    const renderChart = () => {
      const ctx = document.getElementById('smaChart') as HTMLCanvasElement | null;
      if (!ctx) {
        console.error('Failed to get canvas context');
        return;
      }
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }

      const labels = bitcoinData.value.map(item => new Date(item.date));
      const maxPriceData = bitcoinData.value.map(item => item.max_price);
      const sma50Data = bitcoinData.value.map(item => item.sma_50);
      const sma200Data = bitcoinData.value.map(item => item.sma_200);

      const annotations = detectCrossEvents(bitcoinData.value);

      chartInstance.value = new Chart(ctx.getContext('2d')!, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Max Price',
              data: maxPriceData,
              borderColor: 'blue',
              fill: false
            },
            {
              label: '50-day SMA',
              data: sma50Data,
              borderColor: 'orange',
              fill: false
            },
            {
              label: '200-day SMA',
              data: sma200Data,
              borderColor: 'red',
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day'
              }
            },
            y: {
              beginAtZero: false
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const data = bitcoinData.value[context.dataIndex];
                  return [
                    `Date: ${data.date}`,
                    `Max Price: ${data.max_price}`,
                    `50-day SMA: ${data.sma_50}`,
                    `200-day SMA: ${data.sma_200}`
                  ];
                }
              }
            },
            annotation: {
              annotations: annotations
            }
          }
        }
      });
    };

    const detectCrossEvents = (data: BitcoinData[]) => {
      const annotations: any[] = [];
      let goldenCrossCount = 0;
      let deathCrossCount = 0;

      for (let i = 1; i < data.length; i++) {
        const prev = data[i - 1];
        const curr = data[i];

        if (prev.sma_50 < prev.sma_200 && curr.sma_50 > curr.sma_200) {
          goldenCrossCount++;
          deathCrossCount = 0;
          if (goldenCrossCount >= 3) {
            annotations.push({
              type: 'line',
              mode: 'vertical',
              scaleID: 'x',
              value: curr.date,
              borderColor: 'green',
              borderWidth: 2,
              label: {
                content: 'Golden Cross (3+ days)',
                enabled: true,
                position: 'top'
              }
            });
          } else {
            annotations.push({
              type: 'line',
              mode: 'vertical',
              scaleID: 'x',
              value: curr.date,
              borderColor: 'green',
              borderWidth: 1,
              label: {
                content: 'Golden Cross',
                enabled: true,
                position: 'top'
              }
            });
          }
        } else if (prev.sma_50 > prev.sma_200 && curr.sma_50 < curr.sma_200) {
          deathCrossCount++;
          goldenCrossCount = 0;
          if (deathCrossCount >= 3) {
            annotations.push({
              type: 'line',
              mode: 'vertical',
              scaleID: 'x',
              value: curr.date,
              borderColor: 'red',
              borderWidth: 2,
              label: {
                content: 'Death Cross (3+ days)',
                enabled: true,
                position: 'top'
              }
            });
          } else {
            annotations.push({
              type: 'line',
              mode: 'vertical',
              scaleID: 'x',
              value: curr.date,
              borderColor: 'red',
              borderWidth: 1,
              label: {
                content: 'Death Cross',
                enabled: true,
                position: 'top'
              }
            });
          }
        } else {
          goldenCrossCount = 0;
          deathCrossCount = 0;
        }
      }

      return annotations;
    };

    const prevQuarter = () => {
      const [year, quarter] = selectedQuarter.value.split('-Q').map(Number);
      let newYear = year;
      let newQuarter = quarter - 1;
      if (newQuarter < 1) {
        newQuarter = 4;
        newYear -= 1;
      }
      selectedQuarter.value = `${newYear}-Q${newQuarter}`;
      fetchQuarterlyData();
    };

    const nextQuarter = () => {
      const [year, quarter] = selectedQuarter.value.split('-Q').map(Number);
      let newYear = year;
      let newQuarter = quarter + 1;
      if (newQuarter > 4) {
        newQuarter = 1;
        newYear += 1;
      }
      selectedQuarter.value = `${newYear}-Q${newQuarter}`;
      fetchQuarterlyData();
    };

    const hasPrevQuarter = computed(() => {
      const currentIndex = quarters.value.findIndex(quarter => quarter.value === selectedQuarter.value);
      return currentIndex > 0;
    });

    const hasNextQuarter = computed(() => {
      const currentIndex = quarters.value.findIndex(quarter => quarter.value === selectedQuarter.value);
      return currentIndex < quarters.value.length - 1;
    });

    onMounted(() => {
      fetchAvailableQuarters();
      fetchQuarterlyData();
    });

    return {
      bitcoinData,
      selectedQuarter,
      quarters,
      prevQuarter,
      nextQuarter,
      fetchQuarterlyData,
      hasPrevQuarter,
      hasNextQuarter
    };
  }
};
</script>

<style scoped>
.quarter-selector {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.quarter-selector button {
  margin: 0 10px;
}
.chart-container {
  position: relative;
  width: 100%;
  height: 600px;
}
canvas {
  max-width: 100%;
}
</style>
