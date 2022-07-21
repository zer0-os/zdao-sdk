# Voting on Snapshot

[Snapshot](https://snapshot.org) is a voting system where projects can create a proposal for people to vote, this is a popular tool for decentralized organizations(DAO).

Snapshot has lots of spaces for DAO, every space has its own ENS.
We call this DAO `zDAO` with an association of proper `zNA`s.

As above, associations are registered in `ZDAORegistry`, detailed `zDAO` information is in `SnapshotZDAOChef` which is inherited from `IZDAOFactory``.

Every `zDAO` has ENS and an address to Gnosis Safe Wallet.
Once created space in [Snapshot](https://snapshot.org), we should register it in `ZDAORegistry`, only registered `zDAO`s will be listed in the SDK.

## Create zDAO

1. Create ENS and create a space in snapshot.

- create ENS: https://docs.snapshot.org/spaces/before-creating-your-space
- create space: https://docs.snapshot.org/spaces/create

  Space supports ERC20 or ERC721 voting, use `erc20-with-balance` for ERC20 voting, user `erc721` for ERC721 voting.

2. Register zDAO and associated zNAs in `ZDAORegistry` contract

   `ENS` and `zNA` can be different strings, one `zDAO` can have multiple associated zNAs, multiple `zNA`s can point to the same `zDAO`.
   Smart contract is using uint for `ENS` and `zNA`.

- generate label hash of ENS: https://thegraph.com/hosted-service/subgraph/ensdomains/ens
- generate zNA id: https://github.com/zer0-os/zNS-sdk
