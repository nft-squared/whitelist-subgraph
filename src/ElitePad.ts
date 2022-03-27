import { dataSource, log } from '@graphprotocol/graph-ts'
import { ElitePad, Initialize } from '../generated/ElitePad/ElitePad'
import { BucketFactory as I_BucketFactory} from '../generated/templates'
import { System } from '../generated/schema'

export function handleInitialize(event: Initialize): void {
    let elitePad = System.load('0')
    I_BucketFactory.create(event.params._bucketFactory)
    log.info("=========System Init=========",[])
    log.info("bucketFactory:{}",[event.params._bucketFactory.toHex()])
    
}