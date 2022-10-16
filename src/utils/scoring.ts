import {Vote} from './snapshot';

export const buildAddressToProposalsVoted = (
  votes: Vote[]
): Map<string, number> => {
  const addressToProposalsVoted = new Map<string, number>();
  votes.forEach(vote => {
    let previous = 0;
    if (addressToProposalsVoted.has(vote.voter)) {
      previous = addressToProposalsVoted.get(vote.voter)!;
    }
    addressToProposalsVoted.set(vote.voter, previous + 1);
  });
  return addressToProposalsVoted;
};

export const getTopAddresses = (
  addressToProposalsVoted: Map<string, number>
): {address: string; proposalsVoted: number}[] => {
  return Array.from(addressToProposalsVoted.entries())
    .map(entry => ({address: entry[0], proposalsVoted: entry[1]}))
    .sort((a, b) => b.proposalsVoted - a.proposalsVoted);
};

export const getNumProposalsVotedByAddress = (
  address: string,
  addressToProposalsVoted: Map<string, number>
): number => {
  return addressToProposalsVoted.has(address)
    ? addressToProposalsVoted.get(address)!
    : 0;
};
