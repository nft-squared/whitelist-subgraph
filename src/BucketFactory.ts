
import { Bucket } from '../generated/schema'
import { log } from '@graphprotocol/graph-ts'
import { Bucket as I_Bucket } from '../generated/templates'
import { Create as E_Create } from '../generated/templates/BucketFactory/BucketFactory'


//event Create(address creator, address bucket, uint256 startEpoch, uint256 round, uint256 numPerRound, string uri);
export function handleCreate(event: E_Create): void {
    log.info("createnewbucket:{}",[event.params.bucket.toHex()])
    let bucket = new Bucket(event.params.bucket.toHex())
    bucket.state = "pending"
    bucket.txHash = event.transaction.hash
    bucket.creator = event.params.creator.toHex()
    bucket.uri = event.params.uri
    bucket.name = "bucket name"
    bucket.description = "bucket description"
    bucket.discord = "discord"
    bucket.twitter = "twitter"
    bucket.website = "website"
    bucket.whitelistAmount = event.params.numPerRound.toI32()
    bucket.mintPrice = 0
    bucket.mintToken = "mint token"
    bucket.blockchain = "ethereum"
    bucket.launchDate = 0
    bucket.createTime = event.block.timestamp.toI32()
    bucket.startEpoch = "startEpoch"
    bucket.endEpoch = "endEpoch"
    bucket.ticketsAmountInBucket = 0
    bucket.winners = []


    bucket.save()
    I_Bucket.create(event.params.bucket)
    log.info("create new bucket:{}",[event.params.bucket.toHex()])
}
