import { Bucket,User,UserBucketTicket } from '../generated/schema'
import { log } from '@graphprotocol/graph-ts'
import { AddTickets as E_AddTickets, Raffle as E_Raffle } from '../generated/templates/Bucket/Bucket'
import { Bucket as BucketSmartContract} from '../generated/templates/Bucket/Bucket'

export function handleAddTickets(event: E_AddTickets): void {
    let bucket = Bucket.load(event.address.toHex())
    let user = User.load(event.params.user.toHex())
    if (user === null) {
        user = new User(event.params.user.toHex())
        user.save()
    }
    let amount = event.params.amount.toI32()
    bucket.ticketsAmountInBucket += amount
    {
        let userBucketTicket = UserBucketTicket.load(user.id)
        if(!userBucketTicket) {
            userBucketTicket = new UserBucketTicket(user.id + bucket.id)
            userBucketTicket.amount = 0
        }
        userBucketTicket.bucket = bucket.id
        userBucketTicket.user = user.id
        userBucketTicket.amount += amount
        userBucketTicket.save()

        user.save()
    }
    log.info("handleAddTickets:{} {}", [event.params.user.toHex(), event.params.amount.toString()])
}

export function handleRaffle(event: E_Raffle): void {
    let bucket = Bucket.load(event.address.toHex())
    bucket.raffleTime = event.block.timestamp.toI32()
    bucket.rnd = event.params.rnd
    bucket.state = "closed"

    let contract = BucketSmartContract.bind(event.address)
    let winners = contract.whitelist(event.params.round)
    let bucketWinners = bucket.winners
    for(let i = 0; i < winners.length; i++) {
        let winnerUserId = winners[i].toHex()
        bucketWinners.push(winnerUserId)
    }
    bucket.winners = bucketWinners
    bucket.save()
}
