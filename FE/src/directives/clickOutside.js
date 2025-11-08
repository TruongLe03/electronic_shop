// Click outside directive
export const clickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      // Check if the click is outside the element and its children
      if (!(el === event.target || el.contains(event.target))) {
        // Call the provided method
        binding.value(event);
      }
    };
    // Use setTimeout to avoid immediate trigger
    setTimeout(() => {
      document.addEventListener("click", el.clickOutsideEvent);
    }, 0);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};
