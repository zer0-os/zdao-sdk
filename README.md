# zDAO-sdk with snapshot

This repository contains the sdk to associate DAO in snapshot.

zDAO has multiple associated zNA, this association is defined in `ZDAORegistry` smart contract.

## To use zDAO with sdk

1. Create ENS and create a space in snapshot.

- create ENS: https://docs.snapshot.org/spaces/before-creating-your-space
- create space: https://docs.snapshot.org/spaces/create

  When create a space in snapshot, should use `erc20-with-balance` strategy with voting token.

2. Register zDAO and associated zNAs in `ZDAORegistry` contract

   ENS and zNA can be different strings, one zDAO can have multiple associated zNAs, multiple zNAs can point to the same zDAO.
   Smart contract is using uint for ENS and zNA.

- generate label hash of ENS: https://thegraph.com/hosted-service/subgraph/ensdomains/ens
- generate zNA id: https://github.com/zer0-os/zNS-sdk

## Functionality Requirements

- [x] Create zDAO from parameters
- [x] List all the associated zNAs
- [x] Get zDAO by associated zNA
- [x] List all the assets(coin, collectibles) of zDAO from associated Safe Global
- [x] List all the transactions of zDAO from associated Safe Global
- [x] List all the proposals of zDAO from snapshot
- [x] Create a proposal of zDAO with the `erc20-with-balance` strategy which can transfer voting token to recipient
- [x] List all the votes and voting result of proposal
- [x] Cast a vote on proposal who has holding of certain amount of voting token
- [x] Execute a proposal by Safe Global owners
.