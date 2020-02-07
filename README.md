# Kickback Subgraph

It contains on-chain information of Kickback including party (events), and participants.

Things not included are

- Metadata of event
- Check in info

## How to deploy

## Mainnet

```
// get access token from https://thegraph.com/explorer/subgraph/wearekickback/kickback
export ACCESS_TOKEN=$ACCESS_TOKEN
yarn codegen
yarn build
yarn deploy --access-token $ACCESS_TOKEN
```

## Kovan

Use `kovan` branch which contains kovan config and contract info