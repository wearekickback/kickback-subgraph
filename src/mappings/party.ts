import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Party as PartyContract,
  RegisterEvent,
  WithdrawEvent,
  UpdateParticipantLimit
} from "../../generated/templates/Party/Party"
import { MoneyEntity, MetaEntity, StatsEntity } from "../../generated/schema"
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
    '*** handleRegisterEvent: {}, block hash: {}, transaction hash: {}',
    [
      event.block.number.toString(),       // "47596000"
      event.block.hash.toHexString(),      // "0x..."
      event.transaction.hash.toHexString() // "0x..."
    ]
  );
  log.warning('*****2 {}', ['1'])
  let contract = PartyContract.bind(event.address)
  log.warning('*****2 {}', ['2'])
  let entity = new MoneyEntity(event.transaction.hash.toHex())
  log.warning('*****2 {}', ['3'])
  let amount = contract.deposit()
  log.warning('*****2 {}', ['4a'])
  let tokenAddress = contract.tokenAddress()
  log.warning('*****2 {} tokenAddress {}', ['4b', tokenAddress.toHexString()])
  log.warning('*****2 {}', ['4c'])
  entity.partyAddress = event.address
  log.warning('*****2 {}', ['4d'])
  entity.userAddress = event.params.addr
  log.warning('*****2 {}', ['4e'])
  entity.tokenAddress = tokenAddress
  log.warning('*****2 {}', ['4f'])
  log.warning('*****2 {}', ['6'])
  entity.amount = amount
  entity.direction = 'IN'
  log.warning('*****2 {}', ['7'])
  entity.blockNumber = event.block.number.toI32()
  log.warning('*****2 {}', ['8'])
  entity.timestamp = event.block.timestamp
  log.warning('*****2 {}', ['9'])
  entity.save()
  log.warning('*****2 {}', ['10'])
  saveMeta('IN')
  log.warning('*****2 {}', ['11'])
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

}