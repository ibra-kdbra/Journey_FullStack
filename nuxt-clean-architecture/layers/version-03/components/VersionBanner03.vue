<script lang="ts" setup>
const { isVisible, version, close } = useVersion()
</script>

<template>
  <VersionBannerUI
    :is-visible="isVisible"
    :version="version"
    @close="close"
  />
</template>
