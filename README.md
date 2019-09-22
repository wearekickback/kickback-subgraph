

## Query example

```
    curl \
    -X POST \
    -H "Content-Type: application/json" \
    --data '{ "query": "{ statsEntities(skip:0, orderBy:blockNumber) { dayGroup blockNumber numIn numOut timestamp } }" }' \
    https://api.thegraph.com/subgraphs/name/makoto/deployer \
    | jq -r '.data.statsEntities | map([.dayGroup, .blockNumber, .numIn, .numOut, .timestamp] | join(", ")) | join("\n")' 
     
```