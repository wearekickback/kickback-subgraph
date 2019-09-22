import { BigInt } from "@graphprotocol/graph-ts"
import { DeployCall } from '../../generated/Deployer/Deployer'
import {
  NewParty
} from "../../generated/Deployer/Deployer"
import { PartyEntity, MetaEntity, PendingPartyEntity } from "../../generated/schema"
import {
  Party as PartyContract,
} from "../../generated/templates"

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
  // let entity = PendingPartyEntity.load(event.transaction.hash.toHex())
  // if (entity == null) {
  //   entity = new PendingPartyEntity(event.transaction.hash.toHex())
  // }
  // entity.address = event.params.deployedAddress
  // entity.save()
  
  let newEntity = new PartyEntity(event.params.deployedAddress.toHex())
  // newEntity.name = entity.name
  // newEntity.deposit = entity.deposit
  // newEntity.limitOfParticipants = entity.limitOfParticipants
  // newEntity.coolingPeriod = entity.coolingPeriod
  // newEntity.tokenAddress = entity.tokenAddress
  newEntity.save()
  // Creating dynamic source
  let meta = MetaEntity.load('')
  if(meta){
    meta.numParties = meta.numParties + 1
    meta.numMoneyTransactions =  meta.numMoneyTransactions + 1 
  }else{
    meta = new MetaEntity('')
    meta.numParties = 0
    meta.numMoneyTransactions = 0  
  }
  meta.save()
  PartyContract.create(event.params.deployedAddress)
  // Entities can be written to the store with `.save()`
}

// export function handleCreateParty(call: DeployCall): void {
//   log.warning(
//     '*** 2 Block number: {}, block hash: {}, transaction hash: {}',
//     [
//       call.block.number.toString(),       // "47596000"
//       call.block.hash.toHexString(),      // "0x..."
//       call.transaction.hash.toHexString() // "0x..."
//     ]
//   );
//   log.warning('call.inputs._name {}', [call.inputs._name]);
//   log.warning('call.inputs._deposit {}', [call.inputs._deposit.toString()]);
//   log.warning('call.inputs._limitOfParticipants {}', [call.inputs._limitOfParticipants.toString()]);
//   log.warning('call.inputs._coolingPeriod {}', [call.inputs._coolingPeriod.toString()]);
//   log.warning('call.inputs._tokenAddress {}', [call.inputs._tokenAddress.toHexString()]);

//   let entity = PendingPartyEntity.load(call.transaction.hash.toHex())
//   if (entity == null) {
//     entity = new PendingPartyEntity(call.transaction.hash.toHex())
//   }
//   entity.name = call.inputs._name
//   entity.deposit = call.inputs._deposit
//   entity.limitOfParticipants = call.inputs._limitOfParticipants.toI32()
//   entity.coolingPeriod = call.inputs._coolingPeriod.toI32()
//   entity.tokenAddress = call.inputs._tokenAddress
//   entity.save()
// }

// export function handleBlock(block: EthereumBlock): void {
//   log.warning(
//     '*** 3 Block number: {}, block hash: {}',
//     [
//       block.number.toString(),       // "47596000"
//       block.hash.toHexString()      // "0x..."
//     ]
//   );
// }