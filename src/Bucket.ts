import { Bucket,BucketRound,RoundWinner,SearchTicket,UserRoundTicket } from '../generated/schema'
import { BigInt, log } from '@graphprotocol/graph-ts'
import { AddTickets as E_AddTickets, Raffle as E_Raffle } from '../generated/templates/Bucket/Bucket'


export function handleAddTickets(event: E_AddTickets): void {
    let round = BucketRound.load(event.address.toHex()+event.params.round.toString())
    let user = event.params.user.toHex()
    let amount = event.params.amount.toI32()
    round.tickets += amount
    {
        let lastId = round.id + BigInt.fromI32(round.searchLength - 1).toString()
        let lastTicket = SearchTicket.load(lastId)
        if(lastTicket != null && lastTicket.user == user) {
            lastTicket.accumulateTicktes += amount
            lastTicket.save()
        }else{
            let newId = round.id + BigInt.fromI32(round.searchLength).toString()
            let newTicket = new SearchTicket(newId)
            newTicket.bucketRound = round.id
            newTicket.user = user
            newTicket.accumulateTicktes = round.tickets
            newTicket.save()
            round.searchTickets.push(newTicket.id)
            round.searchLength = round.searchLength + 1
        }
    }
    {
        let userRoundId = round.id+user
        let userRoundTicket = UserRoundTicket.load(userRoundId)
        if(!userRoundTicket) {
            userRoundTicket = new UserRoundTicket(userRoundId)
            userRoundTicket.bucketRound = round.id
            userRoundTicket.amount = 0
            round.userTickets.push(userRoundTicket.id)
        }
        userRoundTicket.amount += amount
        userRoundTicket.save()
    }
    round.save()
    log.info("handleAddTickets:{} {}", [event.params.user.toHex(), event.params.amount.toString()])
}

export function handleRaffle(event: E_Raffle): void {
    let bucket = Bucket.load(event.address.toHex())
    let round = BucketRound.load(event.address.toHex()+event.params.round.toString())
    round.raffleTime = event.block.timestamp.toI32()
    round.rnd = event.params.rnd
    round.state = "done"
    // TODO: binary search
    for(let i = 0; i < bucket.whitelistPerRound; i++) {
        let id = round.id + '0'
        let lastTicket = SearchTicket.load(id)
        let winners = new RoundWinner(round.id+i.toString())
        winners.round = round.id
        winners.winner = lastTicket.user
        winners.numberWhitelist = i;
        winners.save()
        round.result.push(winners.id)
    }
    round.save()
    log.info("handleRaffle:{}",[event.params.rnd.toHex()])
}