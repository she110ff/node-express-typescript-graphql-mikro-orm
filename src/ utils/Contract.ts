import { ethers } from 'ethers';

export async function isValidContract(address: string): Promise<boolean> {
  try {
    const provider = ethers.providers.getDefaultProvider(
      'https://testnet.bosagora.org',
    );
    const code = await provider.getCode(address);
    if (code !== '0x') return true;
  } catch (error) {
    return false;
  }
  return false;
}
