declare module 'vue-cal' {
  import { DefineComponent } from 'vue'

  export interface Event {
    start: string
    end: string
    title: string
  }

  export interface VueCalProps {
    events: Event[]
    // Add other props as needed
  }

  const VueCal: DefineComponent<VueCalProps, object, object>
  export default VueCal
}
