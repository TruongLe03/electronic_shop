import { ref, computed } from 'vue'

export function usePagination(itemsPerPage = 20) {
  const currentPage = ref(1)
  const totalItems = ref(0)
  
  const totalPages = computed(() => {
    return Math.ceil(totalItems.value / itemsPerPage)
  })

  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value
  })

  const hasPrevPage = computed(() => {
    return currentPage.value > 1
  })

  const visiblePages = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    const pages = []

    if (total <= 10) {
      // Show all pages if total is 10 or less
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Smart pagination for more than 10 pages
      if (current <= 3) {
        // Show first 3 pages
        for (let i = 1; i <= 3; i++) {
          pages.push(i)
        }
        if (total > 4) pages.push('...')
        pages.push(total)
      } else if (current >= total - 2) {
        // Show last 3 pages
        pages.push(1)
        if (total > 4) pages.push('...')
        for (let i = total - 2; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // Show current page with neighbors
        pages.push(1)
        if (current > 4) pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i)
        }
        if (current < total - 3) pages.push('...')
        pages.push(total)
      }
    }

    return pages
  })

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
      currentPage.value = page
      return true
    }
    return false
  }

  const nextPage = () => {
    return goToPage(currentPage.value + 1)
  }

  const prevPage = () => {
    return goToPage(currentPage.value - 1)
  }

  const reset = () => {
    currentPage.value = 1
    totalItems.value = 0
  }

  const updateTotal = (total) => {
    totalItems.value = total
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    currentPage,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    visiblePages,
    goToPage,
    nextPage,
    prevPage,
    reset,
    updateTotal,
    scrollToTop
  }
}