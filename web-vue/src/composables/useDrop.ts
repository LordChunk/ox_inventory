import { ref } from 'vue'

interface DropOptions {
  accept: string
  drop: (item: any) => void
}

export function useDrop(options: DropOptions) {
  const dropRef = ref<HTMLElement | null>(null)

  return {
    dropRef
  }
}
