
import { Bucket, BucketRound } from '../generated/schema'
import { BigInt, log } from '@graphprotocol/graph-ts'
import { Bucket as I_Bucket } from '../generated/templates'
import { Create as E_Create } from '../generated/templates/BucketFactory/BucketFactory'


export function handleCreate(event: E_Create): void {
    let bucket = new Bucket(event.params.bucket.toHex())
    bucket.state = "pending"
    bucket.txHash = event.transaction.hash
    bucket.creator = event.params.creator.toHex()
    bucket.uri = event.params.uri
    bucket.name = "xxx"
    bucket.description = "xxxx"
    bucket.discord = "xxxxx"
    bucket.twitter = "xxxxxx"
    bucket.website = "xxxx"
    bucket.whitelistPerRound = event.params.numPerRound.toI32()
    bucket.numRounds = event.params.round.toI32()
    bucket.mintPrice = 0
    bucket.mintToken = "weth"
    bucket.blockchain = "ethereum"
    bucket.launchDate = 0
    bucket.createTime = event.block.timestamp.toI32()


    for(let i = 0; i < event.params.round.toI32(); i++) {
        let round = new BucketRound(event.params.bucket.toHex()+i.toString())
        round.round = i
        round.bucket = bucket.id
        round.state = "pending"
        round.tickets = 0
        round.searchLength = 0
        round.save()
        bucket.rounds.push(round.id)
    }
    bucket.save()
    I_Bucket.create(event.params.bucket)
    log.info("create new bucket:{}",[event.params.bucket.toHex()])
}