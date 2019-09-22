import { BigInt } from "@graphprotocol/graph-ts"
import { DeployCall } from '../generated/Contract/Contract'
import {
  Contract,
  NewParty,
  OwnershipTransferred
} from "../generated/Contract/Contract"
import { PartyEntity } from "../generated/schema"
import { EthereumCall } from '@graphprotocol/graph-ts'
import { EthereumBlock } from '@graphprotocol/graph-ts'
import { log } from '@graphprotocol/graph-ts'

export function handleNewParty(event: NewParty): void {
  log.warning(
    '*** 1 Block number: {}, block hash: {}, transaction hash: {}',
    [
      event.block.number.toString(),       // "47596000"
      event.block.hash.toHexString(),      // "0x..."
      event.transaction.hash.toHexString() // "0x..."
    ]
  );
  let entity = PartyEntity.load(event.transaction.from.toHex())
  if (entity == null) {
    entity = new PartyEntity(event.transaction.from.toHex())
  }
  entity.address = event.params.deployedAddress
  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.owner(...)
}

export function handleCreateParty(call: DeployCall): void {
  log.warning(
    '*** 2 Block number: {}, block hash: {}, transaction hash: {}',
    [
      call.block.number.toString(),       // "47596000"
      call.block.hash.toHexString(),      // "0x..."
      call.transaction.hash.toHexString() // "0x..."
    ]
  );
  log.warning('call.inputs._name {}', [call.inputs._name]);
  log.warning('call.inputs._deposit {}', [call.inputs._deposit.toString()]);
  log.warning('call.inputs._limitOfParticipants {}', [call.inputs._limitOfParticipants.toString()]);
  log.warning('call.inputs._coolingPeriod {}', [call.inputs._coolingPeriod.toString()]);
  log.warning('call.inputs._tokenAddress {}', [call.inputs._tokenAddress.toHexString()]);

  let entity = PartyEntity.load(call.transaction.hash.toHex())
  if (entity == null) {
    entity = new PartyEntity(call.transaction.hash.toHex())
  }
  entity.name = call.inputs._name
  entity.deposit = call.inputs._deposit
  entity.limitOfParticipants = call.inputs._limitOfParticipants.toI32()
  entity.coolingPeriod = call.inputs._coolingPeriod.toI32()
  entity.tokenAddress = call.inputs._tokenAddress
  entity.save()
}

export function handleBlock(block: EthereumBlock): void {
  log.warning(
    '*** 3 Block number: {}, block hash: {}',
    [
      block.number.toString(),       // "47596000"
      block.hash.toHexString()      // "0x..."
    ]
  );
}