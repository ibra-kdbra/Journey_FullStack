<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="masthead">
    <div>
      <h1>Lending library</h1>
      <p class="tagline">Clean Architecture in plain Vue 3 — no meta-framework.</p>
    </div>

    <nav>
      <RouterLink to="/">Catalogue</RouterLink>
      <RouterLink to="/loans">My loans</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.masthead {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--color-border);
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-heading);
}

.tagline {
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.8;
}

nav {
  display: flex;
  gap: 8px;
}

nav a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--color-text);
  text-decoration: none;
}

nav a:hover {
  background: var(--color-background-mute);
}

nav a:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Active state pairs colour with a border and weight change, never colour alone. */
nav a.router-link-exact-active {
  border-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: 600;
}
</style>
