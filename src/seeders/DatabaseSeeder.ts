import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import NftContract from '../entities/nftContract.entity';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const contractAddress = process.env.SHAREDASSET_CONTRACT;
    const nftContract = new NftContract(
      contractAddress,
      'ShareAsset',
      'BOA SPACE NFT Contract',
    );

    em.getRepository(NftContract)
      .persistAndFlush(nftContract)
      .then(() => console.log('💪 NftContract persisted to database'))
      .catch((err) => console.log('😱 something went wrong!:', err));
  }
}
