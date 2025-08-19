/**
 * Sends analytics information about the events logged.
 *
 * @param eventName The event name tied to actions like button clicks.
 * @param properties
 * @returns void
 */
export function trackEvent(eventName: string, properties?: Object) {
  console.log(`trackEvent(${eventName}, ${properties})`);
}

/**
 * Sends analytics information about the pages visited.
 *
 * @param pathName (Dynamic) Path name as given by the React router.
 * @returns void
 */
export function trackPage(pathName: string) {
  console.log(`trackPage(${pathName})`);
}

/**
 * Sends analytics information about the connected wallets.
 *
 * @param {String} account Wallet address
 * @param {String} networkType The network the wallet is connected to
 * @param {String} connector Wallet connector used by use-wallet library
 * @returns {void}
 */
export function identifyUser(
  account: string,
  networkType: string,
  connector: string
): void {
  console.log(`identifyUser(${account},${networkType},${connector})`);
}

export function disableAnalytics() {
  console.log('disableAnalytics()');
}

export function enableAnalytics() {
  console.log('enableAnalytics()');
}
