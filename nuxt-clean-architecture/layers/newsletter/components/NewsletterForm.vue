<script setup lang="ts">
import { useNewsletter } from '../composables/useNewsletter'

const { isButtonDisabled, email, subscribe, message } = useNewsletter()
</script>

<template>
  <section class="mt-8">
    <form
      class="flex gap-4 peer"
      data-testid="newsletter-form"
      novalidate
      @submit.prevent="subscribe"
    >
      <input
        v-model="email"
        required
        type="email"
        placeholder="Enter your email"
        data-testid="newsletter-email"
        class="w-full border px-4 py-2 rounded invalid:[&:not(:focus)]:text-red-500"
      >
      <button
        type="submit"
        data-testid="newsletter-submit"
        class="border px-4 py-2 rounded bg-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isButtonDisabled"
      >
        Subscribe
      </button>
    </form>
    <p
      data-testid="newsletter-message"
      class="py-2 h-6 text-red-500 peer-focus-within:opacity-0 transition-opacity ease-out duration-200"
    >
      {{ message }}
    </p>
  </section>
</template>
