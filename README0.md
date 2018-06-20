# BEX Command CLI
Command CLI for BenchPay (BEX) blockchain.
You can connect to the BenchChain Live Network and Test Network as well as
many of our native `SideChains` like `MUZ`, `SHARE`, `VID`, `SHOP` and `DAN`.

# Installation
You need to have node (version 7.6.0 or newer) installed. Then:
```
$> yarn add global bexbro
$> bexbro

  _______   ______   __     __    _______   ______    ______      
/_______/\ /_____/\ /__/\ /__/\ /_______/\ /_____/\  /_____/\     
\::: _  \ \\::::_\/_\ \::\\:.\ \\::: _  \ \\:::_ \ \ \:::_ \ \    
 \::(_)  \/_\:\/___/\\_\::_\:_\/ \::(_)  \/_\:(_) ) )_\:\ \ \ \   
  \::  _  \ \\::___\/_ _\/__\_\_/\\::  _  \ \\: __ `\ \\:\ \ \ \  
   \::(_)  \ \\:\____/\\ \ \ \::\ \\::(_)  \ \\ \ `\ \ \\:\_\ \ \
    \_______\/ \_____\/ \_\/  \__\/ \_______\/ \_\/ \_\/ \_____\/

bexbro>
```

# Usage
```
bexbro> yo

  Commands:

    yo [command...]                       Provides help for a given command.
    init <chain>                          Initiate a connection to the Bench rootchain or a native sidechain.
    get peer <ledger-peer-url>            Initiate a connection with a public peer ex: "connect peer michaelx.bex.life:6620"
    bex life                              Print network statistics to a Bench rootchain or sidechain you are connected to.
    create wallet                         Create a wallet on the Bench rootchain or sidechain you are connected to.
    account status <address>              Get account status
    bexgal                                Bench rootchain or sidechain network account/wallet status for chicks.
    bexbro                                Bench rootchain or sidechain network account/wallet status for dudes.
    cast vote <delegate-name>             Cast a vote for a delegate on the Bench rootchain or sidechain you are connected to.
    account send <amount> <recipient>     Send <amount> bex to <recipient>. <amount> format examples: 10, USD10.4, EUR100
    register as delegate <username>       Register yourself as a delegate on the Bench rootchain or sidechain you are connected to.
    account vanity <string>               Generate an address containing lowercased <string> (WARNING you could wait for long)
    message sign <message>                Sign a message
    message verify <message> <publickey>  Verify the <message> signed by the owner of <publickey> (you will be prompted to provide the signature)
    kill                                  Kill a connection to a peer or a Bench rootchain/sidechain
    exit                                  Exits application.
```



```
bex> connect devnet
Node: nyc1.bex.life:6622, height: 21078
bex devnet>
```

```
bex devnet> account create
Seed    - private: rely cup brand sentence wolf amateur clog knock execute avocado they ready
WIF     - private: SBHAcXWeCEBDaLVUm4B3idHoLde2qrmi2gkxz8KXtNYfjVMK16pH
Address - public : DMUeELFkFtN5obvStkV9Zt44GEjEaYgKhH
```

```
bex devnet> account send 100 AMUeELFkFtN5obvStkV9Zt44GEjEaYgKhH
passphrase: ************************************************************************
Transaction sent successfully with id 7adbf890c88dd345eacbac63e94610fa5f3905528cdc1c36740c3ba3fa3db302
```

```
bex devnet> account delegate nomoreheroes
passphrase: **************************************************************************
Transaction sent successfully with id b857f302611e4f36a33ea886f7bcb951633406ba1f5e40393893234a46ce54eb
```

```
bex devnet> account status DMUeELFkFtN5obvStkV9Zt44GEjEaYgKhH
{ address: 'DMUeELFkFtN5obvStkV9Zt44GEjEaYgKhH',
  unconfirmedBalance: '7500000000',
  balance: '7500000000',
  publicKey: '020cfc61215f2682bd70cce14aaa6cfa6fa3b0507771cb1943aee071a7dd57bcf6',
  username: 'benchx',
  vote: '0',
  producedblocks: 0,
  missedblocks: 0,
  rate: 52,
  approval: 0,
  productivity: 0 }
```

# License

**MIT License**

- Copyright © 2018 BenchPay Foundation, LLC.
- Copyright © 2017 ARK.io
- Copyright © 2017 FX Thoorens

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
