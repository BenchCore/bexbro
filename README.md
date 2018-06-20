# BEX Command CLI
Command CLI for BenchCore `RootChains` and `SideChains`.
You can connect to the BenchChain Live Network and Test Network as well as many of our native `SideChains` like `MUZ`, `SHARE`, `VID`, `SHOP` and `DAN`.

## Table of Contents

- [Background](#background)
- [Installation](#installation)
  - [Install With NPM](#install-with-npm)
  - [Install With YARN](#install-with-yarn)
- [Usage](#usage)
  - [Connect To A Network](#connect-to-a-network)
  - [Create A Wallet](#create-a-wallet)
  - [Kill Network Connection](#kill-network-connection)
- [Libraries](#libraries)
- [Resources](#resources)
- [Why Decentralized Internet](#why-the-internet-must-have-a-decentralized-alternative)
- [Bench On The dWeb](#bench-on-the-dweb)
- [License](#license)
- [Copyright](#license)

## Background
`bexbro` is the official MultiChain Command CLI for BenchCore `RootChains` and `SideChain` and was built from Ark's original blockchain [ark-node](https://github.com/ArkEcosystem/ark-node) and derives directly from , which derived from [Lisk](https://lisk.io) and was originally known as **Crypti**. It has come a long way since then and is one of the most battle tested blockchain libraries on the face of the planet.
You can connect to the BenchChain Live Network and Test Network as well as many of our native `SideChains` like `MUZ`, `SHARE`, `VID`, `SHOP` and `DAN`.

## Installation
You need to have node (version 7.6.0 or newer) installed. Then:

### Install With NPM

```
npm install i -g bexbro
```

### Install With YARN

```
yarn add global bexbro
```

## Usage

### Starting Up The CLI

```
$> bench

  _______   ______   __     __        _______   ______    ______
/_______/\ /_____/\ /__/\ /__/\     /_______/\ /_____/\  /_____/\
\::: _  \ \\::::_\/_\ \::\\:.\ \    \::: _  \ \\:::_ \ \ \:::_ \ \
 \::(_)  \/_\:\/___/\\_\::_\:_\/     \::(_)  \/_\:(_) ) )_\:\ \ \ \
  \::  _  \ \\::___\/_ _\/__\_\_/\    \::  _  \ \\: __ `\ \\:\ \ \ \
   \::(_)  \ \\:\____/\\ \ \ \::\ \    \::(_)  \ \\ \ `\ \ \\:\_\ \ \
    \_______\/ \_____\/ \_\/  \__\/     \_______\/ \_\/ \_\/ \_____\/

bench>
```

### CLI Options
```
bench> help

Commands:

  help [command...]                     Provides help for a given command.
  exit                                  Exits application.
  init <network>                        Initiate a connection to the Bench rootchain or a native sidechain.
  connect peer <address>                Initiate a connection with a public peer ex: "connect peer michaelx.bex.life:6620"
  bex life                              Print network statistics to a Bench rootchain or sidechain you are connected to.
  bexgal <address>                      Calling all Bench chicks to get their account status.
  bexbro <address>                      Get account status
  cast vote <delegate>                  Cast a vote for a delegate on the Bench rootchain or sidechain you are connected to.
  remove vote                           Remove previous vote
  register as delegate <username>       Register yourself as a delegate on the Bench rootchain or sidechain you are connected to.
  create wallet                         Create a wallet on the Bench rootchain or sidechain you are connected to.
  create custom wallet <string>         Generate a wallet address containing a custom (vanity) lowercased phrase (<string>) (This could take some time)
  pay <amount> <address>                Pay <amount> (of ASSET) to <address>. <amount>.
  message sign <message>                Sign a message
  message verify <message> <publickey>  Verify the <message> signed by the owner of <publickey> (you will be prompted to provide the signature)
  kill                                  Kill a connection to a peer or a Bench rootchain/sidechain
```

### Connect To A Network

**Available Network Names**

- `bench`
- `benchtest`
- `muznet`
- `muztest`
- `sharenet`
- `sharetest`
- `shopnet`
- `shoptest`
- `vidnet`
- `vidtest`
- `dannet`
- `dantest`
- `ark`

```
bench> init bench
{ nethash: '3a832f6849162ee605da8251cf9f94b228a82a8989cc3a2abdeb4a8c18cb41b6',
  token: 'BEX',
  symbol: 'ƀ',
  explorer: 'https://bex.bex.life',
  version: 25 }
Node: node1.bex.life:6620, height: 5314
```

### Create A Wallet

The following example creates a wallet on the `bench` network. (To connect to bench you would type `init bench`)

```
bex bench> create wallet
Seed    - private: balance cost unaware fault rally sample track damage affair basket laptop seek
WIF     - private: UdKeGtsfjHv9YorGuFPzZrbyD8w1ggKNKHyjUcVEPecgxGiLHdis
Address - public : BBTSTFM6cQcuqkrPavTfDu2axk3GdbENA7
```

### Kill Network Connection

```
bex bench> kill
Killed connection to node1.bex.life:6620
```

## Libraries
- [bcoreJS](https://github.com/benchcore/bcorejs) - Javascript Library For BenchCore RootChains and SideChains
- [benchcore-explorer](https://github.com/benchcore/benchcore-explorer) - Vue.js-based Explorer For BenchCore RootChains and SideChains
- [bexbro](https://github.com/benchcore/bexbro) - Javascript Command CLI For BenchCore RootChains and SideChains
- [benchcore](https://github.com/benchcore/benchcore) - BenchCore V2 MultiChain Modular Core (In BETA and on DevNet only)
- [benchcore-v1](https://github.com/benchcore/benchcore-v1) - BenchCore V1 MultiChain Core
- [bench-paper](https://github.com/benchcore/bench-paper) - BenchCore (BEX) Paper Wallet Generator via [https://paper.benchcore.io](https://paper.benchcore.io)
- [benchwallet](https://github.com/benchcore/benchwallet) - BenchCore MultiChain Wallet For Desktops (Mac, Linux and Windows)
- [benchwallet-mobile](https://github.com/benchcore/benchwallet-mobile) - BenchCore MultiChain Wallet For Mobile Phones (Android/iOS)
- [benchcore-launcher](https://github.com/benchcore/benchcore-launcher) - BenchCore V2 MultiChain Modular Core Easy Deployment Script
- [benchcore-web-wallet](https://github.com/benchcore/benchcore-web-wallet) - BenchCore Web Wallet via [https://wallet.benchcore.io](https://wallet.benchcore.io)

## Resources
- [BenchCore Website](https://benchcore.io) - Official BenchCore Website
- [BenchCore API V1 Docs](https://api.benchcore.io/v1/) - Official BenchCore API V1 Documentation
- [BenchCore API V2 Docs](https://api.benchcore.io/v2/) - Official BenchCore API V2 Documentation
- [BenchCore Guide](https://docs.benchcore.io) - Official BenchCore Documentation
- [BenchCore Support](https://help.benchcore.io) - Official BenchCore Support Site
- [BenchCore Community](https://community.benchcore.io) - Official BenchCore Community Forums
- [BenchCore Developers Chat](https://chat.benchcore.io) - Official BenchCore Developer Chat (This is not a community chat.)
- [BenchCore Installation Guide](https://docs.benchcore.io/install) - Official Installation Guide For BenchCore V1 and V2


## Why The Internet Must Have A Decentralized Alternative
Today, the internet is more censored than ever and it's only getting worse. Our mission with the [dWeb Protocol](https://github.com/distributedweb/dweb) was to create a truly powerful P2P protocol, around [benOS](https://github.com/benchOS/benos), [dBrowser](https://github.com/benchOS/dbrowser) and many of benOS' underlying libraries to bring the most powerful P2P products to life. In the last few months, by rebuilding P2P technologies that have existed since the early 2000s, we have built a powerful suite of decentralized libraries for benOS and the Bench Network, that will only improve over time. But we also brought new ideas to life, like:

- [dDrive](https://github.com/distributedweb/ddrive)
- [dExplorer](https://github.com/distributedweb/dexplorer)
- [dDatabase](https://github.com/distributedweb/ddatabase)
- [dSites](https://github.com/distributedweb/dsites)
- [dPack](https://github.com/distributedweb/dpack)
- [benFS](https://github.com/benchOS/benfs)
- [DCDN](https://github.com/distributedweb/dcdn)
- [Rocketainer](https://github.com/distributedweb/rocketainer)
- [RocketOS](https://github.com/distributedweb/rocketos)
- [dNames](https://github.com/distributedweb/dnames)
- [P2PDNS](https://github.com/distributedweb/p2pdns)
- [dWebFS](https://github.com/distributedweb/dwebfs)
- [dWebDB](https://github.com/distributedweb/dwebdb)
- [MeteorIDE](https://github.com/distributedweb/meteorIDE)
- [Kepler](https://github.com/benchlab/kepler)
- [Neutron](https://github.com/benchlab/neutron)
- [Designate](https://github.com/benchlab/designate)
- [Nova](https://github.com/benchlab/nova)

and more! These were the protocols and libraries that we needed to create a completely decentralized operating system, where everything was distributed, protected and people were once again in control of their data. benOS is made up of over 1100+ different libraries that we are releasing on a day-by-day basis as we move them to a stable/production state. While financial support is great for this open source project, we need developers who want to be some of the first to build the `dApps` and `dSites` of the future. We have to take back what our forefathers originally designed for freedom, by making our code the law, instead of releasing weak and highly centralized applications where law cannot be applied because the code lacks the foundation to implement a legal framework for itself. Join us for a truly historic journey on the [BenchLabs Telegram](https://t.me/benchlabs). See you there.

### Bench On The dWeb
[dweb://bench.dnames.io](dweb://bench.dnames.io) // dNames Short Link
[dweb://3EDAE09848B77401445B7739CAFCE442DDE1752AED63025A1F94E6A86D7E9F04](dweb://3EDAE09848B77401445B7739CAFCE442DDE1752AED63025A1F94E6A86D7E9F04) // dWeb Key Link

In order to make the links above clickable or to view these links period, you will need [dBrowser](https://github.com/benchOS/dbrowser) (Available for Mac OSX, Linux, Windows and soon to be available on iOS/Android)

#### "The Code Is The Law" - Stan Larimer - Godfather of BitShares.

## License
[MIT](LICENSE.md)
<br><br>
[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)
<br>
[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://js.benchcore.io)
<br>
[![dWebShield](https://github.com/benchlab/dweb-shields/blob/master/shields/dweb-protocol-shield.svg)](https://dwebs.io)

## Copyright
Copyright (c) 2018 Distributed Webs Project. All rights reserved.
