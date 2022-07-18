import { IResolvers } from '@graphql-tools/utils';
import { GqlTransaction } from '../../types.js';
import ArModule from 'arweave/node/ar.js';

/* eslint-disable */
// @ts-ignore
const { default: Ar } = ArModule;

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function getPageSize({ first }: { first?: number }) {
  return Math.min(first || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
}

const ar = new Ar();

function winstonToAr(amount: string) {
  return ar.winstonToAr(amount);
}

export const resolvers: IResolvers = {
  Query: {
    transaction: async (_, queryParams, { db }) => {
      // TODO extract parameter construction into a function
      // TODO separate function for returning a single transaction
      return (await db.getGqlTransactions({
        pageSize: 1,
        ids: [queryParams.id],
      })).edges[0].node;
    },
    transactions: (_, queryParams, { db }) => {
      // TODO extract parameter construction into a function
      return db.getGqlTransactions({
        pageSize: getPageSize(queryParams),
        sortOrder: queryParams.sort,
        cursor: queryParams.after,
        ids: queryParams.ids,
        recipients: queryParams.recipients,
        owners: queryParams.owners,
        tags: queryParams.tags || [],
        minHeight: queryParams.height?.min,
        maxHeight: queryParams.height?.max
      });
    },
    block: async (_, queryParams, { db }) => {
      // TODO extract parameter construction into a function
      // TODO separate function for returning a single block
      return (await db.getGqlBlocks({
        pageSize: 1,
        ids: [queryParams.id],
      })).edges[0].node;
    },
    blocks: (_, queryParams, { db }) => {
      // TODO extract parameter construction into a function
      return db.getGqlBlocks({
        pageSize: getPageSize(queryParams),
        sortOrder: queryParams.sort,
        cursor: queryParams.after,
        ids: queryParams.ids,
        minHeight: queryParams.height?.min,
        maxHeight: queryParams.height?.max
      });
    }
  },
  Transaction: {
    block: (parent: GqlTransaction) => {
      return parent.blockIndepHash
        ? {
            id: parent.blockIndepHash,
            timestamp: parent.blockTimestamp,
            height: parent.height,
            previous: parent.blockPreviousBlock,
          }
        : null;
    },
    // TODO extract formatting into testable functions
    recipient: (parent: GqlTransaction) => {
      if (parent.recipient) {
        return parent.recipient.trim();
      } else {
        return '';
      }
    },
    data: (parent: GqlTransaction) => {
      return {
        size: parent.dataSize || '0',
        type: parent.contentType
      };
    },
    quantity: (parent: GqlTransaction) => {
      return {
        ar: winstonToAr(parent.quantity || '0'),
        winston: parent.quantity || '0'
      };
    },
    fee: (parent: GqlTransaction) => {
      return {
        ar: winstonToAr(parent.fee || '0'),
        winston: parent.fee || '0'
      };
    },
    owner: (parent: GqlTransaction) => {
      return {
        address: parent.ownerAddress,
        key: parent.ownerKey
      };
    },
    parent: () => {
      return {
        id: ''
      };
    },
    bundledIn: () => {
      return {
        id: ''
      };
    }
  }
};
