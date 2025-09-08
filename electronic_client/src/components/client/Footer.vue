<template>
  <footer class="bg-gray-800 text-white py-8 mt-8 bottom-0">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Company Info -->
        <div>
          <h3 class="text-xl font-bold mb-4">Electronic Shop</h3>
          <p class="text-gray-300">
            Your one-stop destination for electronic devices and accessories.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li>
              <router-link
                to="/"
                class="text-gray-300 hover:text-blue-400 transition-colors"
                >Home</router-link
              >
            </li>
            <li>
              <router-link
                to="/products"
                class="text-gray-300 hover:text-blue-400 transition-colors"
                >Products</router-link
              >
            </li>
            <li>
              <router-link
                to="/about"
                class="text-gray-300 hover:text-blue-400 transition-colors"
                >About Us</router-link
              >
            </li>
            <li>
              <router-link
                to="/contact"
                class="text-gray-300 hover:text-blue-400 transition-colors"
                >Contact</router-link
              >
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Contact Info</h4>
          <div class="space-y-2 text-gray-300">
            <p>Email: info@electronicshop.com</p>
            <p>Phone: (555) 123-4567</p>
            <p>Address: 123 Tech Street, Digital City</p>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
        <p>&copy; {{ currentYear }} Electronic Shop. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear();
</script>
