import { BigInt } from "@graphprotocol/graph-ts"
import {
  Party,
  RegisterEvent,
  WithdrawEvent
} from "../../generated/templates/Party/Party"
import { MoneyEntity } from "../../generated/schema"
import { log } from '@graphprotocol/graph-ts'

export function handleRegisterEvent(event: RegisterEvent): void {
  log.warning(
    '*** 4 Block number: {}, block hash: {}, transaction hash: {}',
    [
      event.block.number.toString(),       // "47596000"
      event.block.hash.toHexString(),      // "0x..."
      event.transaction.hash.toHexString() // "0x..."
    ]
  );
  let entity = new MoneyEntity(event.transaction.hash.toHex())
  entity.address = event.params.addr
  // entity.amount = contract.deposit()
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
  entity.address = event.params.addr
  entity.amount = event.params.payout
  entity.direction = 'OUT'
  entity.blockNumber = event.block.number.toI32()
  entity.timestamp = event.block.timestamp
  entity.save()
}