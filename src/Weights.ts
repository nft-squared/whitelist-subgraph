import { Bucket,UserBucketTicket, AuthedToken, User, TokenWeight } from '../generated/schema'
import { log } from '@graphprotocol/graph-ts'
import { UpdateWeights as E_UpdateWeights } from '../generated/templates/Weights/Weights'

// event UpdateWeights(uint256 optEpoch, uint256 epoch, address[] tokens, uint256[] weights);
export function handleUpdateWeights(event: E_UpdateWeights): void {
    let epochId = event.params.epoch
    let tokens = event.params.tokens
    let weights = event.params.weights
    for (let i = 0; i < tokens.length; i++) {
        let tokenAddress = tokens[i].toHex()
        let tokenWeightId = epochId.toString() + tokenAddress
        let tokenWeight = TokenWeight.load(tokenWeightId)
        if (tokenWeight === null) {
            tokenWeight = new TokenWeight(tokenWeightId)
        }
        tokenWeight.epoch = epochId.toI32()
        tokenWeight.tokenAddress = tokenAddress
        tokenWeight.weight = weights[i].toI32()
        tokenWeight.save()
    }
}
