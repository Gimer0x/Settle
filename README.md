# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
Contracts
These are the contracts deployed in the sepolia network:

STL TOken:
```shell
0xA934379960B2503d29e7F7E49f04248cA04782Ba
```
STLToken Verification:
```
https://sepolia.etherscan.io/address/0xA934379960B2503d29e7F7E49f04248cA04782Ba#code
```

STLPool: 
```
0x8D943881eB8F55E4D037b3b2CF731418f619deFD
```
STLPool Verification:
```
https://sepolia.etherscan.io/address/0x8D943881eB8F55E4D037b3b2CF731418f619deFD#code
```
To run the task execute:
```
npx hardhat balance --token 0xA934379960B2503d29e7F7E49f04248cA04782Ba --pool 0x8D943881eB8F55E4D037b3b2CF731418f619deFD --network sepolia
```

Build the Docker app:

```
docker build . -t hhdocker
```

Execute the image
```
docker run -it --name myhd hhdocker
``

To remove the Docker container:

```
docker rm -f myhd
```

Deploy to the local network
````
docker exec -it myhd /bin/sh -c "cd app; yarn deploy:local"
```