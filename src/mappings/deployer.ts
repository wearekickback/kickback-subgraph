import { BigInt, Bytes, ByteArray } from "@graphprotocol/graph-ts"
import { DeployCall } from '../../generated/Deployer/Deployer'
import {
  NewParty
} from "../../generated/Deployer/Deployer"
import { PartyEntity } from "../../generated/schema"
import {
  Party as PartyContract,
} from "../../generated/templates"
import {
  Party as PartyBindingContract,
} from "../../generated/templates/Party/Party"
var EMPTY_ADDRESS = Bytes.fromHexString("0x0000000000000000000000000000000000000000") as Bytes

import { log } from '@graphprotocol/graph-ts'

export function createNewParty(event: NewParty, isEthOnly:boolean): void{
  log.warning(
    '*** 1 Address: {}, Block number: {}, block hash: {}, transaction hash: {}',
    [
      event.params.deployedAddress.toHexString(),
      event.block.number.toString(),       // "47596000"
      event.block.hash.toHexString(),      // "0x..."
      event.transaction.hash.toHexString() // "0x..."
    ]
  );
  
  // Creating dynamic source
  PartyContract.create(event.params.deployedAddress)
  let party = PartyBindingContract.bind(event.params.deployedAddress)
  let limitOfParticipants = party.limitOfParticipants().toI32()
  let partyEntity = new PartyEntity(event.params.deployedAddress.toHex())
  partyEntity.limitOfParticipants = limitOfParticipants
  if(isEthOnly){
    log.warning('****6 {}', [EMPTY_ADDRESS.toHexString()])
    partyEntity.tokenAddress = EMPTY_ADDRESS
  }else{
    log.warning('****7 {}', [party.tokenAddress().toHexString()])
    partyEntity.tokenAddress = party.tokenAddress()
  }
  partyEntity.address = event.params.deployedAddress
  partyEntity.deposit = party.deposit()
  partyEntity.save()
}

export function handleEthOnlyNewParty(event: NewParty): void {
  log.warning('*** handleEthOnlyNewParty', {})
  createNewParty(event, true)
}

export function handleNewParty(event: NewParty): void {
  log.warning('*** handleNewParty', {})
  createNewParty(event, false)
}

