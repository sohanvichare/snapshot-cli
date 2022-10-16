# Snapshot Participation CLI
A CLI tool that determines participation rates of voters on Snapshot.

## Details

- use `top <n> <spaceId>` command to get the top n participants of a space
- use `address <address> <spaceId>` command to get the participation of an address in a space
- fetches data as concurrently as possible
    - use the `--proposals-batch-size` and `--votes-batch-size` optional parameters to modify internal gql requests
- **participation** is defined as (number of closed proposals voted on) / (total number of closed proposals)
    - Note: vote weighting is not taken into account
    - Note: proposals are not taken into account (proposing something doesn't add to your participation)



## Example Data
### Top AAVE Participants (as of 10/16 1:45 PM PST)
Here are the top 20 participants on AAVE (spaceId `aave.eth`).

Command: `yarn snapshot-participation 20 aave.eth`

```
┌─────────┬──────────────────────────────────────────────────────────────────────┬───────────────────┬────────────────────┐
│ (index) │                               address                                │ # Proposals Voted │ Participation rate │
├─────────┼──────────────────────────────────────────────────────────────────────┼───────────────────┼────────────────────┤
│    0    │       'reblt.eth | 0x7A3BdeE62dd34faC317Ae61cd8B3bA7c27ada145'       │        140        │ 84.84848484848484  │
│    1    │      'soseth.eth | 0x0516cf37B67235E07aF38ad8E388d0E68089b0F2'       │        140        │ 84.84848484848484  │
│    2    │       'daciv.eth | 0xD03Ad690ed8065EDfdC1E08197a3ebC71535A7ff'       │        139        │ 84.24242424242424  │
│    3    │     'kongdata.eth | 0x972a8B7D891B88220780421fE4D11f174354cEEd'      │        139        │ 84.24242424242424  │
│    4    │      'slmplex.eth | 0x00432772Ed25d4Eb3C6EB26Dc461239b35cf8760'      │        139        │ 84.24242424242424  │
│    5    │ 'dextrysblockchain.eth | 0x76AC6Ad4e4E7c2e0b4Ceeb30745bd53df3a85774' │        139        │ 84.24242424242424  │
│    6    │  'orchidprotocol.eth | 0x2D5823E8e8B4dfbf599a97566ff2A121Cc141d60'   │        139        │ 84.24242424242424  │
│    7    │     'scryfans.eth | 0x1b5b4fCEDF1252cd92496a2fd5C593b39aC49b01'      │        139        │ 84.24242424242424  │
│    8    │   '8848community.eth | 0x707D306714FF28560f32bF9DAE973BD33cd851c5'   │        139        │ 84.24242424242424  │
│    9    │      'daohuas.eth | 0xc97370F22eD5ac4c7B24A8E1ca9D81FEbb3b9457'      │        139        │ 84.24242424242424  │
│   10    │       'yuopu.eth | 0x70Ddb5AbF21202602b57F4860eE1262a594a0086'       │        139        │ 84.24242424242424  │
│   11    │       'ubiex.eth | 0x344b1E4Ac175f16D3bA40A688cA928E3768E275a'       │        139        │ 84.24242424242424  │
│   12    │     'xinyubtc.eth | 0x0fF9B6AB6Ec58ceB6D5ae8a1690dd5a0959aD002'      │        139        │ 84.24242424242424  │
│   13    │   'indigituseth.eth | 0x35E6fc00e3F190A8dFe15faa219368a01028ec14'    │        139        │ 84.24242424242424  │
│   14    │      'sznews.eth | 0x9Ba6baA919BAc9Acd901dF3Bfde848FE006D3caE'       │        139        │ 84.24242424242424  │
│   15    │    'blockchian.eth | 0xbDa0136ea391e24a938793972726f8763150c7C3'     │        139        │ 84.24242424242424  │
│   16    │    'bitcloutcat.eth | 0x1B9DA462D07512Fa37021973d853B59dEbB761Dd'    │        127        │ 76.96969696969697  │
│   17    │      'aevolve.eth | 0x06c4865ab16c9C760622f19a313a2E637E2e66a2'      │        127        │ 76.96969696969697  │
│   18    │             '0x79ccEDbEFbfE6c95570d85e65f8B0aC0D6bd017B'             │        123        │ 74.54545454545455  │
│   19    │             '0x770BEbe5946907CeE4DFE004F1648ac435A9d5bb'             │        111        │ 67.27272727272727  │
└─────────┴──────────────────────────────────────────────────────────────────────┴───────────────────┴────────────────────┘
```

### Penn Blockchain Club's Participation
Penn Blockchain address: `0x070341aA5Ed571f0FB2c4a5641409B1A46b4961b`

Output of `yarn snapshot-participation address 0x070341aA5Ed571f0FB2c4a5641409B1A46b4961b aave.eth`

```
Address 0x070341aA5Ed571f0FB2c4a5641409B1A46b4961b has voted in 71 (rate of 43.03030303030303) proposals on space aave.eth

```

## Setup

Yarn + TS
1. Install packages with `yarn`
2. Run command `yarn snapshot-participation <opts>` (see above examples for commands)


## Improvements
- an option to sanitycheck this data as well (runs slower, but runs checks)
    - check assumptions made:
        - snapshot doesn't ever send a vote twice
        - the number of proposals / number of votes per proposal is =  everything that can be retrieved from api sequentially
- caching, so doesn't need to get all the votes each time
- tools for counting vote weighting
- proposing something should probably increase participation
- options to accept provider api keys for ENS lookup (currently just uses `ethers` default provider, which leads to rate limits`
- can make more efficient top-n alg (minor)

