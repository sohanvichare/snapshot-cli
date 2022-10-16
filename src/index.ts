import {Command} from 'commander';
import {getENS} from './utils/ens';
import {
  buildAddressToProposalsVoted,
  getNumProposalsVotedByAddress,
  getTopAddresses,
} from './utils/scoring';
import {getAllVotesFromClosedProposals} from './utils/snapshot';

const program = new Command();

program
  .name('snapshot-participation-cli')
  .description('CLI to get voter participation data from Snapshot')
  .version('0.1');

// Top command – retrieve top participants
program
  .command('top')
  .description(
    'Get the n top addresses for a given snapshot space by number of proposals voted on'
  )
  .argument('<n>', 'Number of top accounts to return')
  .argument('<spaceId>', 'Id of snapshot space (e.g. "aave.eth"')
  .option(
    '-pb, --proposal-batch-size <number>',
    'Gql batch size for querying proposals',
    '150'
  )
  .option(
    '-vb, --vote-batch-size <number>',
    'Gql batch size for querying votes (20k max)',
    '20000'
  )
  .action(async (n, spaceId, options) => {
    const {votes, numProposals} = await getAllVotesFromClosedProposals(
      spaceId,
      parseInt(options.proposalBatchSize),
      parseInt(options.voteBatchSize)
    );
    const addressToProposalsVoted = buildAddressToProposalsVoted(votes);
    const topAddresses = getTopAddresses(addressToProposalsVoted).slice(0, n);
    console.log('Looking up ENS...');
    const formattedTable = await Promise.all(
      topAddresses.map(async a => {
        let address = a.address;
        const ens = await getENS(a.address);
        if (ens) address = `${ens} | ${a.address}`;
        return {
          address,
          '# Proposals Voted': a.proposalsVoted,
          'Participation rate': (a.proposalsVoted / numProposals) * 100,
        };
      })
    );

    console.table(formattedTable);
  });

// Address command – retrieve data for address
program
  .command('address')
  .description(
    'Get the n top addresses for a given snapshot space by number of proposals voted on'
  )
  .argument('<address>', 'Address to return number of proposals voted on')
  .argument('<spaceId>', 'Id of snapshot space (e.g. "aave.eth"')
  .option(
    '-pb, --proposal-batch-size <number>',
    'Gql batch size for querying proposals',
    '150'
  )
  .option(
    '-vb, --vote-batch-size <number>',
    'Gql batch size for querying votes (20k max)',
    '20000'
  )
  .action(async (address, spaceId, options) => {
    const {votes, numProposals} = await getAllVotesFromClosedProposals(
      spaceId,
      parseInt(options.proposalBatchSize),
      parseInt(options.voteBatchSize)
    );
    const addressToProposalsVoted = buildAddressToProposalsVoted(votes);
    const participation = getNumProposalsVotedByAddress(
      address,
      addressToProposalsVoted
    );
    console.log(
      `Address ${address} has voted in ${participation} (rate of ${
        participation / numProposals
      }) proposals on space ${spaceId}`
    );
  });

const main = async () => {
  await program.parseAsync();
};

main();
