import { Bucket,BucketRound,RoundWinner,User,UserRoundTicket } from '../generated/schema'
import { BigInt, log } from '@graphprotocol/graph-ts'
import { AddTickets as E_AddTickets, Raffle as E_Raffle } from '../generated/templates/Bucket/Bucket'

// event AddTickets(address user, uint256 round, uint256 epoch, uint256 amount);
// event Raffle(address operator, uint256 round, uint256 rnd);

export function handleAddTickets(event: E_AddTickets): void {
    let bucket = Bucket.load(event.address.toHex())
    let bucketRound = BucketRound.load(event.address.toHex()+event.params.round.toString())
    let user = User.load(event.params.user.toHex())
    // log.error("wenlufu userRoundId {}", [userRoundId])
    let amount = event.params.amount.toI32()
    bucketRound.tickets += amount
    {
        let userRoundId = user.id.concat(bucketRound.id)
        let userRoundTicket = UserRoundTicket.load(userRoundId)
        if(!userRoundTicket) {
            userRoundTicket = new UserRoundTicket(userRoundId)
            userRoundTicket.bucketRound = bucketRound.id
            userRoundTicket.amount = 0

            bucketRound.userTickets.push(userRoundTicket.id)
            bucketRound.bucket = bucket.id
            bucketRound.round = event.params.round.toI32()
            // bucketRound.state = BucketState.
        }
        userRoundTicket.amount += amount
        userRoundTicket.save()

        user.userJoinedRoundList.push("0x16991")
        user.save()
    }
    bucketRound.save()
    log.info("wenlufu handleAddTickets:{} {}", [event.params.user.toHex(), event.params.amount.toString()])
}

export function handleRaffle(event: E_Raffle): void {
    let bucket = Bucket.load(event.address.toHex())
    let round = BucketRound.load(event.address.toHex()+event.params.round.toString())
    round.raffleTime = event.block.timestamp.toI32()
    round.rnd = event.params.rnd
    round.state = "done"
    //TODO: binary search
    for(let i = 0; i < bucket.whitelistPerRound; i++) {
        let winnerUserId = "xxx"
        let winner = new RoundWinner(round.id+winnerUserId) // how do we get user id
        winner.round = round.id
        winner.numberWhitelist = i;
        winner.save()
        round.winners.push(winner.id)
    }
    round.save()
    log.info("handleRaffle:{}",[event.params.rnd.toHex()])
}
