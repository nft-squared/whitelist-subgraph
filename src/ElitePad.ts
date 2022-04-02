import { log } from '@graphprotocol/graph-ts'
import { Initialize } from '../generated/ElitePad/ElitePad'
import { BucketFactory as I_BucketFactory} from '../generated/templates'
import { AuthPool as I_AuthPool} from '../generated/templates'
import { Weights as I_Weights} from '../generated/templates'
import { System} from '../generated/schema'

export function handleInitialize(event: Initialize): void {
    let elitePad = System.load('0')
    I_BucketFactory.create(event.params._bucketFactory)
    I_AuthPool.create(event.params._authPool)
    I_Weights.create(event.params._weight)
    log.info("=========System Init=========",[])
    log.info("bucketFactory:{}",[event.params._bucketFactory.toHex()])
    log.info("authPool:{}",[event.params._authPool.toHex()])
    log.info("weight:{}",[event.params._weight.toHex()])
}
