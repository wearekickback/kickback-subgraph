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
import {
  Token as TokenBindingContract,
} from "../../generated/templates/Party/Token"


var EMPTY_ADDRESS = Bytes.fromHexString("0x0000000000000000000000000000000000000000") as Bytes
var SAI_ADDRESS = Bytes.fromHexString("0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359")

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
  log.warning('****2 {}', [''])
  // Creating dynamic source
  PartyContract.create(event.params.deployedAddress)
  log.warning('****3 {}', [''])
  let party = PartyBindingContract.bind(event.params.deployedAddress)
  log.warning('****4 {}', [''])
  let limitOfParticipants = party.limitOfParticipants().toI32()
  log.warning('****5 {}', [''])
  let partyEntity = new PartyEntity(event.params.deployedAddress.toHex())
  log.warning('****6 {}', [''])
  partyEntity.limitOfParticipants = limitOfParticipants
  log.warning('****7 {}', [''])
  if(isEthOnly){
    log.warning('****8 {}', [''])
    partyEntity.tokenAddress = EMPTY_ADDRESS
    partyEntity.tokenDecimals = 18
    partyEntity.tokenName = 'Ethereum'
    partyEntity.tokenSymbol = 'ETH'
  }else{
    let tokenAddress = party.tokenAddress()
    log.warning('****9 {} {}', [party.tokenAddress().toHexString(), event.params.deployedAddress.toHexString()])
    partyEntity.tokenAddress = tokenAddress
    if(tokenAddress == EMPTY_ADDRESS){
      partyEntity.tokenDecimals = 18
      partyEntity.tokenSymbol = 'ETH'
      partyEntity.tokenName = 'Ethereum'
    } else if(tokenAddress == SAI_ADDRESS){
      partyEntity.tokenDecimals = 18
      partyEntity.tokenSymbol = 'SAI'
      partyEntity.tokenName = 'Single Collateral Dai'
    }else{
      log.warning('****0008 {}', [party.tokenAddress().toHexString()])
      let token = TokenBindingContract.bind(tokenAddress)
      log.warning('****0009 {}', [party.tokenAddress().toHexString()])
      partyEntity.tokenName = token.name()
      let tryDecimals = token.try_decimals()
      let decimals = 0
      if(tryDecimals.reverted){
        log.warning('****00091 {}', [party.tokenAddress().toHexString()])
      }else{
        decimals = tryDecimals.value
        log.warning('****000092 {}', [party.tokenAddress().toHexString()])
      }
      partyEntity.tokenDecimals = decimals
  
      let trySymbol = token.try_symbol()
      let symbol = ''
      if(trySymbol.reverted){
        log.warning('****000101 {} , {}', [party.tokenAddress().toHexString(), event.params.deployedAddress.toHexString()])
      }else{
        symbol = trySymbol.value.toString()
        log.warning('****000102 {} , {}', [party.tokenAddress().toHexString(), event.params.deployedAddress.toHexString()])
      }
      partyEntity.tokenSymbol = symbol
    }
    log.warning('****000203 {} , {}', [party.tokenAddress().toHexString(), event.params.deployedAddress.toHexString()])
  }
  partyEntity.address = event.params.deployedAddress
  partyEntity.deposit = party.deposit()
  partyEntity.createdAt = event.block.timestamp
  partyEntity.coolPeriod = party.coolingPeriod()
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

