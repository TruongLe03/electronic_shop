<script setup>
import Header from "@/components/client/Header.vue";
import Footer from "@/components/client/Footer.vue";
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <Header />

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
