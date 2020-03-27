import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Party as PartyContract,
  RegisterEvent,
  WithdrawEvent,
  UpdateParticipantLimit,
  FinalizeEvent,
  ClearEvent
} from "../../generated/templates/Party/Party"
import { PartyEntity, ParticipantEntity } from "../../generated/schema"
import { log } from '@graphprotocol/graph-ts'

const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

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
}

export function handleWithdrawEvent(event: WithdrawEvent): void {
  let participant = ParticipantEntity.load(event.address.toHexString() + '-' + event.params.addr.toHexString())
  participant.state = 'WITHDRAWN'
  participant.save()
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

  party.save()
}

export function handleClearEvent(event: ClearEvent): void {
  let party = PartyEntity.load(event.address.toHexString())
  party.clearedAt =  event.block.timestamp
  party.save()
}
