import { Modal, Toast, Collapse } from 'bootstrap'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      bootstrap: {
        Modal,
        Toast,
        Collapse
      }
    }
  }
})