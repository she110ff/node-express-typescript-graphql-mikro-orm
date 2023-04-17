import { BigNumber, utils } from 'ethers';

export function parseTokenId(tokenId: string): {
  owner: string;
  index: BigNumber;
  totalSupply: number;
} {
  const ADDRESS_BITS = 160;
  const INDEX_BITS = 56;
  const SUPPLY_BITS = 40;

  const numericTokenId = BigNumber.from(tokenId);
  const SUPPLY_MASK = BigNumber.from(1).shl(SUPPLY_BITS).sub(1);
  const INDEX_MASK = BigNumber.from(1)
    .shl(INDEX_BITS + SUPPLY_BITS)
    .sub(1)
    .xor(SUPPLY_MASK);

  const address = numericTokenId.shr(INDEX_BITS + SUPPLY_BITS).toHexString();
  const tokenIndex = BigNumber.from(
    numericTokenId.and(INDEX_MASK).shr(SUPPLY_BITS),
  );
  const maxSupply = numericTokenId.and(SUPPLY_MASK).toNumber();

  return { owner: address, index: tokenIndex, totalSupply: maxSupply };
}

export function createTokenId(
  address: string,
  index: number,
  maxSupply: number,
): string {
  let makerPart = BigNumber.from(utils.hexZeroPad(address, 32));
  makerPart = makerPart.shl(96); // shift 12 bytes
  let newIdPart = BigNumber.from(index);
  newIdPart = newIdPart.shl(40); // shift 5 bytes
  const quantityPart = BigNumber.from(maxSupply);
  const tokenId = makerPart.add(newIdPart).add(quantityPart);

  return tokenId.toString();
}

export function randomIndex(): number {
  return BigNumber.from(utils.randomBytes(6)).toNumber();
}
