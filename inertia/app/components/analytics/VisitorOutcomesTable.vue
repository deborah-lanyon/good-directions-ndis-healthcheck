<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Visitor
          </th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total
          </th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              Welcomed
            </span>
          </th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              Pack Left
            </span>
          </th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              Reschedule
            </span>
          </th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-red-500"></span>
              Not Interested
            </span>
          </th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-purple-500"></span>
              Not Home
            </span>
          </th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-gray-400"></span>
              Not Visited
            </span>
          </th>
          <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Completion
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="visitor in visitors" :key="visitor.visitorName" class="hover:bg-gray-50">
          <td class="px-4 py-3 whitespace-nowrap">
            <span class="font-medium text-gray-900">{{ visitor.visitorName }}</span>
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-center text-gray-700">
            {{ visitor.totalAssigned }}
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-center">
            <span v-if="visitor.outcomes.welcomed > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {{ visitor.outcomes.welcomed }}
            </span>
            <span v-else class="text-gray-300">-</span>
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-center">
            <span v-if="visitor.outcomes.packLeft > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ visitor.outcomes.packLeft }}
            </span>
            <span v-else class="text-gray-300">-</span>
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-center">
            <span v-if="visitor.outcomes.reschedule > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              {{ visitor.outcomes.reschedule }}
            </span>
            <span v-else class="text-gray-300">-</span>
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-center">
            <span v-if="visitor.outcomes.notInterested > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {{ visitor.outcomes.notInterested }}
            </span>
            <span v-else class="text-gray-300">-</span>
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-center">
            <span v-if="visitor.outcomes.notHome > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {{ visitor.outcomes.notHome }}
            </span>
            <span v-else class="text-gray-300">-</span>
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-center">
            <span v-if="visitor.outcomes.notVisited > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {{ visitor.outcomes.notVisited }}
            </span>
            <span v-else class="text-gray-300">-</span>
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-center">
            <div class="flex items-center justify-center gap-2">
              <div class="w-16 bg-gray-200 rounded-full h-2">
                <div
                  class="bg-green-500 h-2 rounded-full"
                  :style="{ width: `${getCompletionRate(visitor)}%` }"
                ></div>
              </div>
              <span class="text-xs text-gray-600">{{ getCompletionRate(visitor) }}%</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface OutcomeStats {
  welcomed: number
  packLeft: number
  reschedule: number
  notInterested: number
  notHome: number
  notVisited: number
}

interface VisitorOutcome {
  visitorName: string
  totalAssigned: number
  outcomes: OutcomeStats
}

defineProps<{
  visitors: VisitorOutcome[]
}>()

const getCompletionRate = (visitor: VisitorOutcome): number => {
  if (visitor.totalAssigned === 0) return 0
  // "Completed" means any status that's not "Not Visited"
  const completed = visitor.outcomes.welcomed + visitor.outcomes.packLeft +
    visitor.outcomes.reschedule + visitor.outcomes.notInterested + visitor.outcomes.notHome
  return Math.round((completed / visitor.totalAssigned) * 100)
}
</script>
