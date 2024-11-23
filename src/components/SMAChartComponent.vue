<template>
  <div>
    <h2>Bitcoin SMA Chart</h2>
    <canvas id="smaChart"></canvas>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

export default {
  name: 'SMAChart',
  setup() {
    const smaData = ref([]);
    const chartInstance = ref(null);

    const fetchSMAData = async (window) => {
      try {
        const response = await axios.get(`/api/bitcoin/sma/${window}`);
        smaData.value = response.data;
        renderChart();
      } catch (error) {
        console.error('Failed to fetch SMA data:', error);
      }
    };

    const renderChart = () => {
      const ctx = document.getElementById('smaChart').getContext('2d');
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }
      chartInstance.value = new Chart(ctx, {
        type: 'line',
        data: {
          labels: smaData.value.map(item => item.date),
          datasets: [
            {
              label: 'Max Price',
              data: smaData.value.map(item => item.max_price),
              borderColor: 'blue',
              fill: false
            },
            {
              label: `SMA`,
              data: smaData.value.map(item => item.sma),
              borderColor: 'red',
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day'
              }
            }
          }
        }
      });
    };

    onMounted(() => {
      fetchSMAData(50); // Example window size
    });

    return {
      smaData
    };
  }
};
</script>

<style scoped>
canvas {
  max-width: 100%;
}
</style>
