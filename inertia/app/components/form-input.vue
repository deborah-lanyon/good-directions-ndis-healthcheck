<template>
  <div class="font-karla">
    <label :for="id" :class="[styles[theme].label, 'block text-2xl leading-[30px] font-normal']">{{
      label
    }}</label>
    <div class="mt-2 relative">
      <input
        :type="computedType"
        :id="id"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        v-bind="$attrs"
        :class="[
          'w-full rounded-md border-2 border-white p-3 text-2xl leading-[30px] font-normal focus:ring-0 focus:outline-none',
          showPasswordToggle ? 'pr-12' : '',
          styles[theme].input,
        ]"
      />
      <button
        v-if="showPasswordToggle"
        type="button"
        @click="togglePasswordVisibility"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
      >
        <svg
          v-if="!isPasswordVisible"
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    id?: string
    type?: string
    placeholder?: string
    theme?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary' | 'senary'
    showPasswordToggle?: boolean
  }>(),
  {
    theme: 'primary',
    showPasswordToggle: false,
  }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()

const isPasswordVisible = ref(false)

const computedType = computed(() => {
  if (props.type === 'password' && isPasswordVisible.value) {
    return 'text'
  }
  return props.type
})

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const styles: Record<string, { label: string; input: string }> = {
  primary: {
    label: 'text-senary',
    input: 'bg-white border-secondary focus:border-secondary focus:text-quinary text-quinary',
  },
  secondary: {
    label: 'text-senary',
    input: 'bg-white border-secondary focus:border-secondary focus:text-quinary text-quinary',
  },
  tertiary: {
    label: 'text-white',
    input:
      'bg-tertiary border-secondary focus:border-quaternary focus:text-quaternary text-secondary',
  },
}
</script>

<style scoped></style>
