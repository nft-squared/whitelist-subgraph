import { Bucket,User,UserBucketTicket,SearchTicket, BucketWinner } from '../generated/schema'
import { Address, BigInt, ByteArray, Bytes, crypto, ethereum, log } from '@graphprotocol/graph-ts'
import { AddTickets as E_AddTickets, Raffle as E_Raffle } from '../generated/templates/Bucket/Bucket'
import { Bucket as BucketSmartContract} from '../generated/templates/Bucket/Bucket'

function searchTicketId(bucket: Bucket, i:i32):string{
    return bucket.id +  BigInt.fromI32(i).toString()
}

function addSearchTicket(bucket: Bucket, user: Address, tickets: i32): void {
    let lastIndex = bucket.searchLength - 1;
    let id = searchTicketId(bucket, lastIndex)
    let searchTicket = SearchTicket.load(id)
    if (searchTicket !== null && searchTicket.user == user){
        searchTicket.accumulateTicktes += tickets
    } else {
        let accumulateTicktes = searchTicket !== null ? searchTicket.accumulateTicktes : 0;
        id = searchTicketId(bucket, lastIndex + 1)
        searchTicket = new SearchTicket(id)
        searchTicket.user = user
        searchTicket.bucket = bucket.id
        searchTicket.accumulateTicktes = accumulateTicktes + tickets
        bucket.searchLength++
        bucket.save()
    }
    searchTicket.save()
}

function binarySearch(bucket: Bucket, target: i32, gt: (bucket: Bucket, target: i32, i:i32)=>boolean):i32 {
    let searchLength = bucket.searchLength
    if (searchLength == 0) {
        return 0;
    }

    let low = 0;
    let high = searchLength;

    while (low < high) {
        // (a + b) / 2 can overflow.
        let mid =  (low & high) + (low ^ high) / 2;

        // Note that mid will always be strictly less than high (i.e. it will be a valid array index)
        // because Math.average rounds down (it does integer division with truncation).
        if (gt(bucket, target, mid)) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }
    return low;
}

function winners(bucket: Bucket):Address[] {
    let _winners = [] as Address[];
    if(bucket.searchLength == 0) return _winners;
    for(let i = 0; i < bucket.whitelistAmount; i++) {
        let tickets = rndI(bucket.rnd!, i).mod(BigInt.fromI32(bucket.ticketsAmountInBucket)).toI32()
        let find = binarySearch(bucket, tickets, (bucket: Bucket, target: i32, p:i32):boolean=>{
            let id = searchTicketId(bucket, p)
            let searchTicket = SearchTicket.load(id)!
            return searchTicket.accumulateTicktes > target
        })
        let findId = searchTicketId(bucket, find)
        let user = SearchTicket.load(findId)!.user
        _winners.push(Address.fromBytes(user))
    }
    return _winners
}

function rndI(rnd: BigInt, i: i32): BigInt {
    let encoded = ethereum.encode(ethereum.Value.fromFixedSizedArray([
        ethereum.Value.fromUnsignedBigInt(rnd),
        ethereum.Value.fromI32(i)
    ]))!
    let hash = crypto.keccak256(ByteArray.fromHexString(encoded.toHex()))
    for(let i = 0; i < hash.length/2; i++) { // reverse
        let tmp = hash[i]
        hash[i] = hash[hash.length-i-1]
        hash[hash.length-i-1] = tmp
    }
    return BigInt.fromUnsignedBytes(hash)
}

export function handleAddTickets(event: E_AddTickets): void {
    let bucket = Bucket.load(event.address.toHex()) as Bucket
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
            userBucketTicket.bucket = bucket.id
            userBucketTicket.user = user.id
            userBucketTicket.amount = 0
        }
        userBucketTicket.amount += amount
        userBucketTicket.save()
        user.save()
    }
    addSearchTicket(bucket, event.params.user, amount)
    log.info("handleAddTickets:{} {}", [event.params.user.toHex(), event.params.amount.toString()])
}

export function handleRaffle(event: E_Raffle): void {
    let bucket = Bucket.load(event.address.toHex())!
    bucket.raffleTime = event.block.timestamp.toI32()
    bucket.rnd = event.params.rnd
    bucket.state = "closed"
    //let contract = BucketSmartContract.bind(event.address)
    let _winners = winners(bucket)
    for(let i = 0; i < _winners.length; i++) {
        let winnerUserId = _winners[i].toHex()
        let bucketWinnerId = bucket.id + winnerUserId
        let bucketWinner = BucketWinner.load(bucketWinnerId)
        if (bucketWinner === null) {
            bucketWinner = new BucketWinner(bucketWinnerId)
            bucketWinner.bucket = bucket.id
            bucketWinner.user = winnerUserId
        }
        const indexes = bucketWinner.indexes
        indexes.push(i)
        bucketWinner.indexes = indexes
        bucketWinner.save()
    }
    bucket.save()
}
