import {request, gql} from 'graphql-request';

const BASE_URL = 'https://hub.snapshot.org/graphql';

/// ======= TYPES ========

export type Vote = {
  id: string;
  voter: string;
  proposal: Proposal;
};

type Proposal = {
  id: string;
  votes: number;
};

type Space = {
  id: string;
  proposalsCount: number;
};

type GqlQueryBuilder = (first: number, skip: number) => string;

/// ======= QUERY BUILDERS ========

const buildSpaceQuery = (spaceId: string): string => {
  const query = gql`query {
    space(id: "${spaceId}") {
      id
      proposalsCount
    }
  }`;
  return query;
};

const buildProposalQuery = (
  spaceId: string,
  first: number,
  skip: number
): string => {
  const query = gql`
  query {
    proposals(
      first: ${first}
      skip: ${skip}
      where: {space: "${spaceId}", state: "closed"}
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      votes
    }
  }
`;
  return query;
};

const buildVotesQuery = (
  proposalIds: string[],
  first: number,
  skip: number
): string => {
  const query = gql`
    query {
      votes(
        first: ${first}
        skip: ${skip}
        where: {proposal_in: ${JSON.stringify(proposalIds)}}
        orderBy: "created"
        orderDirection: desc
      ) {
        id
        voter
        proposal {
            id
        }
      }
    }
  `;
  return query;
};

/// ======= UTILS ========

// Retrieve paginated data sequentially
const getPagninatedDataSequential = async <T>(
  queryBuilder: GqlQueryBuilder,
  batchSize: number
): Promise<T[]> => {
  const data: T[] = [];
  let prevDataLen = 0;
  let batchNum = 0;
  do {
    const query = queryBuilder(batchSize, batchSize * batchNum);
    const response: T[] = await runSingleQuery<T[]>(query);
    prevDataLen = response.length;
    batchNum++;
    data.push(...response);
  } while (prevDataLen === batchSize);
  return data;
};

// Retrieve paginated data concurrently (preferred)
const getPaginatedDataConcurrent = async <T>(
  queryBuilder: GqlQueryBuilder,
  batchSize: number,
  total: number
): Promise<T[]> => {
  const promises = [];
  const numBatches = Math.ceil(total / batchSize);
  for (let i = 0; i < numBatches; i++) {
    const query = queryBuilder(batchSize, batchSize * i);
    promises.push(await runSingleQuery<T[]>(query));
  }
  await Promise.all(promises);
  return promises.flat();
};

const runSingleQuery = async <T>(query: string): Promise<T> => {
  const data = await request(BASE_URL, query);
  return data[Object.keys(data)[0]];
};

/// ======= EXPOSED FNS ========

export const getAllVotesFromClosedProposals = async (
  spaceId: string,
  proposalBatchSize: number,
  voteBatchSize: number
): Promise<{votes: Vote[]; numProposals: number}> => {
  // Instead of just sequentially fetching all votes for a space, we will
  // retrieve the total # of items first, then concurrently query
  // 1. Get the # of closed proposals from the space endpoint
  // 2. This lets us concurrently query for proposal data
  // 3. Which in turn lets us concurrently query for vote data

  // Get data for a given space
  // Need this to know the # of proposals, fetch proposals concurrently
  const space: Space = await runSingleQuery<Space>(buildSpaceQuery(spaceId));
  console.log(
    `Found ${space.proposalsCount} closed proposals, getting data...`
  );

  // Get all closed proposals
  const proposalQueryBuilder: GqlQueryBuilder = (first: number, skip: number) =>
    buildProposalQuery(spaceId, first, skip);
  const proposals = await getPaginatedDataConcurrent<Proposal>(
    proposalQueryBuilder,
    proposalBatchSize,
    space.proposalsCount
  );

  let totalVotes = 0;
  proposals.forEach(p => (totalVotes += p.votes));
  console.log(
    `Retrieved proposal data. Found ${totalVotes} votes, getting data...`
  );

  // Get all votes from closed proposals
  const votesQueryBuilder: GqlQueryBuilder = (first: number, skip: number) =>
    buildVotesQuery(
      proposals.map(proposal => proposal.id),
      first,
      skip
    );
  const votes = await getPaginatedDataConcurrent<Vote>(
    votesQueryBuilder,
    voteBatchSize,
    totalVotes
  );
  console.log(`Retrieved data for ${votes.length} votes.`);
  return {votes: votes, numProposals: space.proposalsCount};
};
