import { IChainSource, JsonBlock, JsonTransaction } from './types.js';
import { default as axios } from 'axios';

type Peer = {
  url: string;
  blocks: number;
  height: number;
  lastSeen: number;
};

export class ChainApiClient implements IChainSource {
  private chainApiUrl: string;
  private peers: Record<string, Peer> = {};

  constructor(chainApiUrl: string) {
    this.chainApiUrl = chainApiUrl.replace(/\/$/, '');
  }

  async refreshPeers(): Promise<void> {
    try {
      const response = await axios.get(`${this.chainApiUrl}/peers`);
      const peerHosts = response.data as string[];
      await Promise.all(
        peerHosts.map(async (peerHost) => {
          try {
            const peerUrl = `http://${peerHost}`;
            const response = await axios.get(`${peerUrl}/info`);
            this.peers[peerHost] = {
              url: peerUrl,
              blocks: response.data.blocks,
              height: response.data.height,
              lastSeen: new Date().getTime()
            };
          } catch (error) {
            // TODO track metric
          }
          return;
        })
      );
      console.log(this.peers);
    } catch (error) {
      // TODO track metric
    }
  }

  // TODO handle errors (retry 429s and 5XXs)
  async getBlockByHeight(height: number): Promise<JsonBlock> {
    const response = await axios.get(
      `${this.chainApiUrl}/block/height/${height}`
    );
    return response.data as JsonBlock;
  }

  // TODO handle errors (retry 429s and 5XXs)
  async getTx(txId: string): Promise<JsonTransaction> {
    const response = await axios.get(`${this.chainApiUrl}/tx/${txId}`);
    return response.data as JsonTransaction;
  }

  async getBlockAndTxs(height: number): Promise<{
    block: JsonBlock;
    txs: JsonTransaction[];
    missingTxIds: string[];
  }> {
    const block = await this.getBlockByHeight(height);

    // Retrieve block transactions
    const missingTxIds: string[] = [];
    const txs: JsonTransaction[] = [];
    await Promise.all(
      block.txs.map(async (txId) => {
        try {
          const tx = await this.getTx(txId);
          txs.push(tx);
        } catch (error) {
          // TODO log error
          missingTxIds.push(txId);
        }
      })
    );

    return { block, txs: txs, missingTxIds: missingTxIds };
  }

  async getHeight(): Promise<number> {
    const response = await axios.get(`${this.chainApiUrl}/height`);
    return response.data as number;
  }
}
