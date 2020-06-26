import { BigInt, Bytes, log, EthereumEvent } from "@graphprotocol/graph-ts"
import {
  Party as PartyContract,
  RegisterEvent,
  WithdrawEvent,
  UpdateParticipantLimit,
  FinalizeEvent,
  ClearEvent,
  AdminGranted,
  AdminRevoked
} from "../../generated/templates/Party/Party"
import { PartyEntity, ParticipantEntity } from "../../generated/schema"
import {
  Party as PartyBindingContract,
} from "../../generated/templates/Party/Party"

function updateTotalBalance(event: EthereumEvent): void {
  let party = PartyEntity.load(event.address.toHexString())
  let partyContract = PartyBindingContract.bind(event.address)
  party.totalBalance = partyContract.totalBalance()
  party.withdrawn = partyContract.withdrawn().toI32()
  let tryWithdrawn = partyContract.try_withdrawn()
  if(!tryWithdrawn.reverted){
    party.withdrawn = tryWithdrawn.value.toI32()
  }

  party.save()
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
  let participant = new ParticipantEntity(event.address.toHexString() + '-' + event.params.addr.toHexString())
  participant.index = event.params.index.toI32()
  participant.partyAddress = event.address
  participant.userAddress = event.params.addr
  participant.state = 'REGISTERED'
  participant.save()
  updateTotalBalance(event)
}

export function handleWithdrawEvent(event: WithdrawEvent): void {
  let participant = ParticipantEntity.load(event.address.toHexString() + '-' + event.params.addr.toHexString())
  participant.state = 'WITHDRAWN_PAYOUT'
  participant.save()
  updateTotalBalance(event)
}

export function handleUpdateParticipantLimit(event: UpdateParticipantLimit): void {
  let party = PartyEntity.load(event.address.toHexString())
  party.limitOfParticipants = event.params.limit.toI32()
  party.save()
}

export function handleFinalizeEvent(event: FinalizeEvent): void {
  let party = PartyEntity.load(event.address.toHexString())
  party.payout = event.params.payout
  party.endedAt =  event.block.timestamp
  let partyContract = PartyBindingContract.bind(event.address)
  let numRegistered = partyContract.registered()
  for (let i = 1; i <= numRegistered.toI32(); i++) {
    let address = partyContract.participantsIndex(BigInt.fromI32(i))
    let isAttended = partyContract.isAttended(address)
    let participant = ParticipantEntity.load(event.address.toHexString() + '-' + address.toHexString())
    if(isAttended){
      participant.state = 'WON'
    }else{
      participant.state = 'LOST'
    }
    participant.save()  
  }
  party.save()
}

export function handleClearEvent(event: ClearEvent): void {
  let party = PartyEntity.load(event.address.toHexString())
  party.clearedAt =  event.block.timestamp
  party.save()
  updateTotalBalance(event)
}

export function handleAdminGranted(event: AdminGranted): void {
  let partyContract = PartyBindingContract.bind(event.address)
  let party = PartyEntity.load(event.address.toHexString())
  party.admins = partyContract.getAdmins() as Array<Bytes>
  party.save()
}

export function handleAdminRevoked(event: AdminRevoked): void {
  let partyContract = PartyBindingContract.bind(event.address)
  let party = PartyEntity.load(event.address.toHexString())
  party.admins = partyContract.getAdmins() as Array<Bytes>
  party.save()
}
