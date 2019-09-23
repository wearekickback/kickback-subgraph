import { BigInt } from "@graphprotocol/graph-ts"
import {
  Party as PartyContract,
  RegisterEvent,
  WithdrawEvent
} from "../../generated/templates/Party/Party"
import { MoneyEntity, MetaEntity, StatsEntity } from "../../generated/schema"
import { log } from '@graphprotocol/graph-ts'

function saveMeta(): void {
  let meta = MetaEntity.load('')
  meta.numMoneyTransactions =  meta.numMoneyTransactions + 1
  meta.save()
}


export function handleRegisterEvent(event: RegisterEvent): void {
  log.warning(
    '*** 4 Block number: {}, block hash: {}, transaction hash: {}',
    [
      event.block.number.toString(),       // "47596000"
      event.block.hash.toHexString(),      // "0x..."
      event.transaction.hash.toHexString() // "0x..."
    ]
  );

  let contract = PartyContract.bind(event.address)

  let entity = new MoneyEntity(event.transaction.hash.toHex())

  saveMeta()

  let dayGroup = event.block.timestamp.toI32() / 86400
  let stats = StatsEntity.load(dayGroup.toString())
  if(stats){
    stats.numIn = stats.numIn + 1
  }else{
    stats = new StatsEntity(dayGroup.toString())
    stats.numIn = 0
    stats.numOut = 0
  }
  stats.dayGroup  = dayGroup
  stats.blockNumber = event.block.number.toI32()
  stats.timestamp = event.block.timestamp
  stats.save()

  entity.partyAddress = event.address
  entity.userAddress = event.params.addr
  entity.amount = contract.deposit()
  entity.direction = 'IN'
  entity.blockNumber = event.block.number.toI32()
  entity.timestamp = event.block.timestamp
  entity.save()
}

export function handleWithdrawEvent(event: WithdrawEvent): void {
  log.warning(
    '*** 5 Block number: {}, block hash: {}, transaction hash: {}',
    [
      event.block.number.toString(),       // "47596000"
      event.block.hash.toHexString(),      // "0x..."
      event.transaction.hash.toHexString() // "0x..."
    ]
  );
  let entity = new MoneyEntity(event.transaction.hash.toHex())

  saveMeta()

  let dayGroup = event.block.timestamp.toI32() / 86400
  let stats = StatsEntity.load(dayGroup.toString())
  if(stats){
    stats.numOut = stats.numOut + 1
  }else{
    stats = new StatsEntity(dayGroup.toString())
    stats.numIn = 0
    stats.numOut = 0
  }
  stats.dayGroup  = dayGroup
  stats.blockNumber = event.block.number.toI32()
  stats.timestamp = event.block.timestamp
  stats.save()

  entity.partyAddress = event.address
  entity.userAddress = event.params.addr
  entity.amount = event.params.payout
  entity.direction = 'OUT'
  entity.blockNumber = event.block.number.toI32()
  entity.timestamp = event.block.timestamp
  entity.save()
}
