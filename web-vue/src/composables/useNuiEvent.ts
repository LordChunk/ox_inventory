import { onMounted, onUnmounted } from 'vue';
import { isEnvBrowser } from '../utils/misc';

/**
 * A hook that manages the registration and cleanup of NUI callbacks
 * @param action - The action to listen for
 * @param handler - The callback function to handle the event data
 */
export default function useNuiEvent<T = unknown>(action: string, handler: (data: T) => void) {
  const eventListener = (event: MessageEvent) => {
    const { action: eventAction, data } = event.data;

    if (eventAction === action) {
      handler(data);
    }
  };

  onMounted(() => window.addEventListener('message', eventListener));
  onUnmounted(() => window.removeEventListener('message', eventListener));

  // Return a function to manually remove the event listener
  return () => window.removeEventListener('message', eventListener);
}