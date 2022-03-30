import { Bucket,BucketRound,RoundWinner,UserRoundTicket, AuthedToken, User } from '../generated/schema'
import { BigInt, log } from '@graphprotocol/graph-ts'
import { AddAuth as E_AddAuth, DelAuth as E_DelAuth } from '../generated/templates/AuthPool/AuthPool'

export function handleAddAuth(event: E_AddAuth): void {
    let user = User.load(event.params.tokenOwner.toHex())
    if (user === null) {
        user = new User(event.params.tokenOwner.toHex())
        user.userJoinedRoundList = []
        user.authedTokens = []
        user.save()
    }

     // Add Auth
     let authedTokenIds = event.params.tokenIds

    for (let i = 0; i < authedTokenIds.length; i++) {
        let authedToken = new AuthedToken(event.params.token.toHex() + authedTokenIds[i].toString())
        authedToken.user = user.id
        authedToken.tokenAddr = event.params.token.toHex()
        authedToken.tokenID = authedTokenIds[i].toI32()
        authedToken.txHash = event.transaction.hash.toHex() // can you help check this?
        authedToken.save()

        log.info("handleAddAuth authedTokenId:{} authedTokenUser {}", [authedToken.id, authedToken.user])
        let authedTokenlist = user.authedTokens
        authedTokenlist.push(authedToken.id)
        user.authedTokens = authedTokenlist
        user.save()
    }
    user.save()
}

export function handleDelAuth(event: E_DelAuth): void {
    //del AuthToken
    let delTokenIds = event.params.tokenIds
    log.info("handleDelAuth authedTokenId:{} ", [event.params.token.toHex()])
    for (let i = 0; i < delTokenIds.length; i++) {
        let delToken = AuthedToken.load(event.params.token.toHex() + delTokenIds[i].toString())
        let delTokenId = delToken.id

        let user = User.load(delToken.user)
        let delIndex = user.authedTokens.indexOf(delTokenId)
        let authedTokensAfterDel = user.authedTokens.splice(delIndex, 1)
        user.authedTokens = authedTokensAfterDel
        user.save()
    }
}
