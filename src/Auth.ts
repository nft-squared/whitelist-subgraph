import { Bucket,UserBucketTicket, AuthedToken, AuthedTokenId, User } from '../generated/schema'
import { Address, store, log, BigInt } from '@graphprotocol/graph-ts'
import { AddAuth as E_AddAuth, DelAuth as E_DelAuth } from '../generated/templates/AuthPool/AuthPool'

export function createToken(address: Address):AuthedToken {
    let id = address.toHex()
    let token = AuthedToken.load(id)
    if (token === null) {
        token = new AuthedToken(id)
        token.weight = 0
        token.save()
    }
    return token as AuthedToken
}

export function handleAddAuth(event: E_AddAuth): void {
    log.info("--- handleAddAuth", []);
    let user = User.load(event.params.tokenOwner.toHex())
    if (user === null) {
        user = new User(event.params.tokenOwner.toHex())
        user.save()
    }

    // Add Auth
    let authedTokenIds = event.params.tokenIds

    for (let i = 0; i < authedTokenIds.length; i++) {
        log.info("--- handleAddAuth: {}", [BigInt.fromI32(i).toString()]);
        let authedToken = createToken(event.params.token)
        let authedTokenId = new AuthedTokenId(event.params.token.toHex() + authedTokenIds[i].toString())
        authedTokenId.user = user.id
        authedTokenId.token = authedToken.id
        authedTokenId.tokenID = authedTokenIds[i].toI32()
        authedTokenId.txHash = event.transaction.hash.toHex() // can you help check this?
        authedTokenId.save()
        log.info("handleAddAuth authedTokenId:{} authedTokenUser {}", [authedTokenId.id, authedTokenId.user!])
    }
}

export function handleDelAuth(event: E_DelAuth): void {
    //del AuthToken
    let delTokenIds = event.params.tokenIds
    log.info("handleDelAuth authedTokenId:{} ", [event.params.token.toHex()])
    for (let i = 0; i < delTokenIds.length; i++) {
        let delTokenId = AuthedTokenId.load(event.params.token.toHex() + delTokenIds[i].toString())!
        // delTokenId.unset(delTokenId.id)
        // delTokenId.user = ''
        // delTokenId.save()
        store.remove('AuthedTokenId', delTokenId.id)
    }
}
