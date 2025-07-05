/**
 * Validates an Ethereum address format and returns it in lowercase
 * @param addr The address to validate
 * @returns The address in lowercase with 0x prefix
 * @throws If the address is not a valid Ethereum address
 */
export function validateAddress(addr: string): `0x${string}` {
  if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
    throw new Error(`Invalid address format: ${addr}`);
  }
  return addr.toLowerCase() as `0x${string}`;
}

/**
 * Shortens an Ethereum address for display
 * @param address The address to shorten
 * @param chars Number of characters to show at the start and end
 * @returns Shortened address (e.g., 0x1234...5678)
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
}
