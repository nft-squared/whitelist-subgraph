import { Bucket,BucketRound,RoundWinner,User,UserRoundTicket } from '../generated/schema'
import { log } from '@graphprotocol/graph-ts'
import { AddTickets as E_AddTickets, Raffle as E_Raffle } from '../generated/templates/Bucket/Bucket'
import { Bucket as BucketSmartContract} from '../generated/templates/Bucket/Bucket'

// event AddTickets(address user, uint256 round, uint256 epoch, uint256 amount);
// event Raffle(address operator, uint256 round, uint256 rnd);

export function handleAddTickets(event: E_AddTickets): void {
    let bucket = Bucket.load(event.address.toHex())
    let bucketRound = BucketRound.load(event.address.toHex()+event.params.round.toString())
    let user = User.load(event.params.user.toHex())
    if (user === null) {
        user = new User(event.params.user.toHex())
        user.save()
    }
    let amount = event.params.amount.toI32()
    bucketRound.tickets += amount
    {
        let userRoundId = user.id.concat(bucketRound.id)
        let userRoundTicket = UserRoundTicket.load(userRoundId)
        if(!userRoundTicket) {
            userRoundTicket = new UserRoundTicket(userRoundId)
            userRoundTicket.bucketRound = bucketRound.id
            userRoundTicket.amount = 0

            bucketRound.userRoundTickets.push(userRoundTicket.id)
            bucketRound.bucket = bucket.id
            bucketRound.round = event.params.round.toI32()
        }
        // userRoundTicket.user = user.id // no need for this line because it was derived
        userRoundTicket.amount += amount
        userRoundTicket.save()

        let userJoinedRoundList = user.userJoinedRoundList
        userJoinedRoundList.push(userRoundTicket.id)
        user.userJoinedRoundList = userJoinedRoundList
        user.save()
    }
    bucketRound.save()
    log.info("handleAddTickets:{} {}", [event.params.user.toHex(), event.params.amount.toString()])
}

export function handleRaffle(event: E_Raffle): void {
    let bucketRound = BucketRound.load(event.address.toHex()+event.params.round.toString())
    bucketRound.raffleTime = event.block.timestamp.toI32()
    bucketRound.rnd = event.params.rnd

    let contract = BucketSmartContract.bind(event.address)
    let winners = contract.whitelist(event.params.round)

    // bucketRound.state = "done"
    for(let i = 0; i < 1; i++) {
        let winnerUserId = winners[i].toHex()
        let roundWinner = RoundWinner.load(bucketRound.id+winnerUserId)
        if (roundWinner === null) {
            roundWinner = new RoundWinner(bucketRound.id+winnerUserId)
            roundWinner.numberWhitelist = 0
            roundWinner.save()
        }
        roundWinner.round = bucketRound.id
        roundWinner.numberWhitelist += 1;
        roundWinner.winner = winnerUserId
        roundWinner.save()
        bucketRound.save()
    }
    bucketRound.save()
    log.info("wenluhandleRaffle:{}",[event.params.rnd.toHex()])
}
