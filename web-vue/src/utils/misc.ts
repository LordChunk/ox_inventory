/**
 * Check if we're in a browser environment (versus the FiveM NUI environment)
 * This is used for development purposes
 * @returns {boolean} Whether we are in a browser
 */
export const isEnvBrowser = (): boolean => !(window as any).invokeNative;

// Basic no operation function
export const noop = () => {};
