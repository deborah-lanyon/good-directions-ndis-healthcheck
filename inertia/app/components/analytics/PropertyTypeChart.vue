<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  sold: number
  rented: number
}>()

const chartData = computed(() => ({
  labels: ['Sold', 'Rented'],
  datasets: [
    {
      data: [props.sold, props.rented],
      backgroundColor: ['#10b981', '#8b5cf6'], // emerald-500, purple-500
      borderWidth: 0,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
      },
    },
    tooltip: {
      callbacks: {
        label: (context: { label: string; parsed: number; dataset: { data: number[] } }) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0
          return `${context.label}: ${context.parsed} (${percentage}%)`
        },
      },
    },
  },
  cutout: '60%',
}
</script>
