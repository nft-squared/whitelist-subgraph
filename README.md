# ElitePad Subgrpah

## 1. setup contract enviroment
1. clone contract project and switch to 'fullTest' branch.
```
git clone https://github.com/nft-squared/whitelist-contracts
cd whitelist-contracts
git checkout origin/fullTest -b fullTest
```
2. install: `npm insall` or `yarn`
3. start a local evm node: `yarn enode`
3.1 remove typechain in gitignore
4. deploy contracts and do some test: `yarn test --network develop test/FullLogic.test.ts`
you'll see some logs like:
```
    DeployedProxy ElitePad(0x8198f5d8F8CfFE8f9C413d98a0A55aEB8ab9FbB7,0x0355B7B8cb128fA5692729Ab3AAa199C1753f726,0x36b58F5C1969B7b6591D752ea6F5486D069010AB,0x51A1ceB83B83F1985a81C295d1fF28Afef186E02,0x172076E0166D1F9Cc711C77Adf8488051744980C,0xf4B146FbA71F41E0592668ffbF264F1D186b2Ca8,0xD8a5a9b31c3C0232E196d518E89Fd8bF83AcAd43,0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB,0x2E2Ed0Cfd3AD2f1d34481277b3204d807Ca2F8c2) at 0x4EE6eCAD1c2Dae9f525404De8555724e3c35d07B
```
'0x4EE6eCAD1c2Dae9f525404De8555724e3c35d07B' is the ElitePad contract address, it will be used in later steps.

## 2. setup Thegraph node
1. clone Thegraph and goto docker directory
```
git clone https://github.com/graphprotocol/graph-node
cd graph-node/docker
```
2. edit `docker-compose.yml`, change `/services/graph-node/environment/ethereum` to `'mainnet:http://host.docker.internal:8545'`
3. start thegraph node
```
docker-compose build
docker-compose up
```

## 3. deploy subgraph to Thegraph node
1. cloen this repo
2. install: `yarn` or `npm install`
3. edit `subgraph.yaml`, change `/dataSources/0/source/address` to ElitePad contract address in 1.4
4. generate ts-class script from contracts-abis and schema.graphql: `yarn codegen`
5. compile ts-script to wasm: `yarn build`
6. create a Subgrpah on Thegraph node: `yarn create-local`
7. deploy wasm to the subgraph in 3.6: `yarn deploy-local`

## 4. Query from browser
1. open "http://localhost:8000/subgraphs/name/ElitePad"
2.  input the following and click the play button, it will display the result.
```
{
  buckets(first:1){
    id
  	rounds(first:1){
      id
	  state
      rnd
      tickets
      raffleTime
      searchLength
      searchTickets(first: 1000){
        id
      }
      result(first:100) {
        id
      }
    }
  }
}
```

for more details, access https://thegraph.com/docs/en/developer/create-subgraph-hosted
