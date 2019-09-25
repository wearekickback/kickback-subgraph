# Kickback Deployer

Please refer to [the front end repo](https://github.com/makoto/the-pot) for more about this project.

## Query example

Recommend installing [jq](https://stedolan.github.io/jq/) which helps formating the data.

## Showing daily stats of people RSVPed (numIn) and people Withdrawn(numOut)


```
curl \
-X POST \
-H "Content-Type: application/json" \
--data '{ "query": "{ statsEntities(skip:0, orderBy:blockNumber) { dayGroup blockNumber numIn numOut amountIn amountOut timestamp } }" }' \
https://api.thegraph.com/subgraphs/name/makoto/deployer \
| jq -r '.data.statsEntities | map([.dayGroup, .blockNumber, .numIn, .numOut, .amountIn, .amountOut, .timestamp] | join(", ")) | join("\n")'
```
