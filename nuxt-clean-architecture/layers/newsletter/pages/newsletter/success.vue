<script setup lang="ts">
import { SUCCESS } from '../../composables/useNewsletter'
</script>

<template>
  <div class="container mx-auto grid items-center place-items-center h-screen">
    <div class="max-w-4xl text-center  border rounded p-8 shadow-lg">
      <h1 class="text-5xl font-bold py-8">
        Thank you for <span class="text-xp-light-pink">subscribing!</span>
      </h1>
      <p class="text-2xl">
        {{ SUCCESS }}
      </p>
      <NuxtLink
        to="/"
        class="mt-16 text-lg inline-block hover:underline"
      >
        <Icon
          name="heroicons:arrow-left"
          class="me-1"
        /> Return to Homepage
      </NuxtLink>
    </div>
  </div>
</template>
