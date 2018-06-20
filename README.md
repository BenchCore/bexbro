# BEX Command CLI
Command CLI for BenchPay (BEX) blockchain.
You can connect to the BenchChain Live Network and Test Network as well as
many of our native `SideChains` like `MUZ`, `SHARE`, `VID`, `SHOP` and `DAN`.

# Installation
You need to have node (version 7.6.0 or newer) installed. Then:
```
$> yarn add global bexbro
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

# Usage
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


# License

**MIT License**

- Copyright © 2018 BenchPay Foundation, LLC.
- Copyright © 2017 ARK.io
- Copyright © 2017 FX Thoorens

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
