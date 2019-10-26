import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Party as PartyContract,
  RegisterEvent,
  WithdrawEvent,
  UpdateParticipantLimit,
  FinalizeEvent,
  ClearEvent
} from "../../generated/templates/Party/Party"
import { MoneyEntity, MetaEntity, StatsEntity, PartyEntity, ParticipantEntity } from "../../generated/schema"
import { log } from '@graphprotocol/graph-ts'

const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

function saveMeta(direction:String): void {
  log.warning('***** saveMeta {}', ['1'])
  let meta = MetaEntity.load('')
  log.warning('***** saveMeta {}', ['2'])
  meta.numMoneyTransactions =  meta.numMoneyTransactions + 1
  log.warning('***** saveMeta {}', ['3'])
  if(direction == 'IN'){
    log.warning('***** saveMeta {}', ['4'])
    meta.numParticipants = meta.numParticipants + 1
    log.warning('***** saveMeta {}', ['5'])
  }
  log.warning('***** saveMeta {}', ['6'])
  meta.save()
}

function saveStats(timestamp: BigInt, blockNumber: BigInt, direction:String, amount:BigInt, tokenAddress:Bytes): void {
  let dayGroup = timestamp.toI32() / 86400
  let stats = StatsEntity.load(dayGroup.toString())
  if(stats){
    if(direction == 'IN'){
      stats.numIn = stats.numIn + 1
      log.warning('*****3 {}', ['1'])
      if(tokenAddress.toHexString() == EMPTY_ADDRESS){
        log.warning('*****3 {}', ['2'])
        stats.amountIn = stats.amountIn.plus(amount)
      }else{
        log.warning('*****3 {}', ['3'])
        stats.amountInDai = stats.amountInDai.plus(amount)
      }
    }else{
      log.warning('*****3 {}', ['4'])
      stats.numOut = stats.numOut + 1
      log.warning('*****3 {}', ['5'])
      if(tokenAddress.toHexString() == EMPTY_ADDRESS){
        log.warning('*****3 {}', ['6'])
        stats.amountOut = stats.amountOut.plus(amount)
        log.warning('*****3 {}', ['7'])
      }else{
        log.warning('*****3 {}', ['8'])
        stats.amountOutDai = stats.amountOutDai.plus(amount)
      }
    }
  }else{
    log.warning('*****3 {}', ['10'])
    stats = new StatsEntity(dayGroup.toString())
    log.warning('*****3 {}', ['11'])
    stats.numIn = 0
    stats.numOut = 0
    log.warning('*****3 {}', ['12'])
  }
  stats.dayGroup  = dayGroup
  stats.blockNumber = blockNumber.toI32()
  stats.timestamp = timestamp
  stats.save()
}

export function handleRegisterEvent(event: RegisterEvent): void {
  log.warning(
    '*** handleRegisterEvent: contract address:{} block number:{}, block hash: {}, transaction hash: {}',
    [
      event.address.toHexString(),
      event.block.number.toString(),       // "47596000"
      event.block.hash.toHexString(),      // "0x..."
      event.transaction.hash.toHexString() // "0x..."
    ]
  );
  let contract = PartyContract.bind(event.address)
  let entity = new MoneyEntity(event.transaction.hash.toHex())
  let amount = contract.deposit()
  let tokenAddress = contract.tokenAddress()
  entity.partyAddress = event.address
  entity.userAddress = event.params.addr
  entity.tokenAddress = tokenAddress
  entity.amount = amount
  entity.direction = 'IN'
  entity.blockNumber = event.block.number.toI32()
  entity.timestamp = event.block.timestamp
  entity.save()

  let participant = new ParticipantEntity(event.address.toHexString() + '-' + event.params.addr.toHexString())
  participant.partyAddress = event.address
  participant.userAddress = event.params.addr
  participant.state = 'REGISTERED'
  participant.save()

  saveMeta('IN')
  saveStats(
    event.block.timestamp,
    event.block.number,
    entity.direction,
    amount,
    tokenAddress
  )
  log.warning('*****2 {}', ['12'])
}

export function handleWithdrawEvent(event: WithdrawEvent): void {
  log.warning(
    '*** handleWithdrawEvent Block number: {}, block hash: {}, transaction hash: {}',
    [
      event.block.number.toString(),       // "47596000"
      event.block.hash.toHexString(),      // "0x..."
      event.transaction.hash.toHexString() // "0x..."
    ]
  );
  let entity = new MoneyEntity(event.transaction.hash.toHex())
  let contract = PartyContract.bind(event.address)
  let tokenAddress = contract.tokenAddress()
  entity.partyAddress = event.address
  entity.userAddress = event.params.addr
  entity.tokenAddress = tokenAddress
  entity.amount = event.params.payout
  entity.direction = 'OUT'
  entity.blockNumber = event.block.number.toI32()
  entity.timestamp = event.block.timestamp
  entity.save()

  let participant = ParticipantEntity.load(event.address.toHexString() + '-' + event.params.addr.toHexString())
  participant.state = 'WITHDRAWN'
  participant.save()

  saveMeta('OUT')
  saveStats(
    event.block.timestamp,
    event.block.number,
    entity.direction,
    event.params.payout,
    tokenAddress
  )
}

export function handleUpdateParticipantLimit(event: UpdateParticipantLimit): void {
  let party = PartyEntity.load(event.address.toHexString())
  party.limitOfParticipants = event.params.limit.toI32()
  party.save()
}

export function handleFinalizeEvent(event: FinalizeEvent): void {
  let party = PartyEntity.load(event.address.toHexString())
  party.payout = event.params.payout
  party.save()
}

export function handleClearEvent(event: ClearEvent): void {

}
