

## Query example

Showing daily stats of people RSVPed (numIn) and people Withdrawn(numOut)

```
    curl \
    -X POST \
    -H "Content-Type: application/json" \
    --data '{ "query": "{ statsEntities(skip:0, orderBy:blockNumber) { dayGroup blockNumber numIn numOut timestamp } }" }' \
    https://api.thegraph.com/subgraphs/name/makoto/deployer \
    | jq -r '.data.statsEntities | map([.dayGroup, .blockNumber, .numIn, .numOut, .timestamp] | join(", ")) | join("\n")' 
     
```

Showing daily stats of people RSVPed (numIn) and people Withdrawn(numOut) of active events

  statsEntities(where:{blockNumber_gt:8572748}) {


```
    curl \
    -X POST \
    -H "Content-Type: application/json" \
    --data '{ "query": "{ statsEntities(skip:0, orderBy:blockNumber, where:{blockNumber_gt:8572748}) { dayGroup blockNumber numIn numOut timestamp } }" }' \
    https://api.thegraph.com/subgraphs/name/makoto/deployer \
    | jq -r '.data.statsEntities | map([.dayGroup, .blockNumber, .numIn, .numOut, .timestamp] | join(", ")) | join("\n")'
```