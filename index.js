#!/usr/bin/env node
const bcorejs = require("bcorejs");
const crypto = require("crypto");
const figlet = require("figlet");
const colors = require("colors");
const request = require("request");
const requestPromise = require("request-promise-native");
const Table = require('ascii-table');
const ora = require('ora');
const cowsay = require('cowsay');
const async = require('async');
const vorpal = require('vorpal')();
const child_process = require('child_process');
const Path = require('path');

// var ledgerSupported = true;
// try {
//   var ledger = require('ledgerco');
//   var BexLedgerWallet = require('./src/BexLedgerWallet.js');
//   var ledgerWorker = child_process.fork(Path.resolve(__dirname, './ledger-worker'));
// } catch (USBError) {
//   ledgerSupported = false;
//   vorpal.log(colors.yellow("Warning: BenchPay CLI (BexCli) is running on a server or virtual machine: No Ledger support available."));
// }

var blessed = require('blessed');
var contrib = require('blessed-contrib');

var connected = false;
var server;
var network;
var bexPriceTicker = {};
const currencies = ["USD","AUD", "BRL", "CAD", "CHF", "CNY", "EUR", "GBP", "HKD", "IDR", "INR", "JPY", "KRW", "MXN", "RUB"];
//
// var ledgerAccounts = [];
// var ledgerBridge = null;
// var ledgerComm   = null;

const networks = {
  benchtest: {
    nethash: "08342b1ec5cf90a4f6be50f0273eb205bd8cd29f7dca8897f2d5e5e0975ef401",
    peers: [
      "51.15.113.19:6619"
    ],
    // ledgerpath: "44'/1'/"
  },
  bench: {
    nethash: "6e84d08bd299ed97c212c886c98a57e36545c8f5d645ca7eeae63a8bd62d8988",
    peers: [
      "51.15.99.156:6620"
    ],
    // ledgerpath: "44'/111'/"
  }
};

function isConnected() {
  return server && connected;
}

function getNetworkFromNethash(nethash){
  for(var n in networks){
    if(networks[n].nethash == nethash){
      return n;
    }
  }
  return "unknown";
}

function findEnabledPeers(cb){
  var peers=[];
  getFromNode('http://'+server+'/api/peers', function(err, response, body){

    if(err){
      vorpal.log(colors.red("Can't get peers from network: " + err));
      return cb(peers);
    }
    else {
      var respeers = JSON.parse(body).peers.map(function(peer){
        return peer.ip+":"+peer.port;
      }).filter(function(peer){
        return peer.status=="OK";
      });
      async.each(respeers, function(peer, cb){
        getFromNode('http://'+peer+'/api/blocks/getHeight', function(err, response, body){
          if(body != "Forbidden"){
            peers.push(peer);
          }
          cb();
        });
      },function(err){
        return cb(peers);
      });
    }
  });
}

function postTransaction(container, transaction, cb){
  var performPost = function() {
    request({
      url: 'http://'+server+'/peer/transactions',
      headers: {
        nethash: network.nethash,
        version: '1.0.0',
        port:1
      },
      method: 'POST',
      json: true,
      body: {transactions:[transaction]}
    }, cb);
  };

  let senderAddress = bcorejs.crypto.getAddress(transaction.senderPublicKey);
  getFromNode('http://' + server + '/api/accounts?address=' + senderAddress, function(err, response, body){

    if(!err && body) {
      try {
        body = JSON.parse(body);
        if ( !body.hasOwnProperty('success') || body.success === false) {
          // The account does not yet exist on the connected node.
          throw "Failed: " + body.error;
        }
        if (body.hasOwnProperty('account') && body.account.secondSignature) {
          container.prompt({
            type: 'password',
            name: 'passphrase',
            message: 'Second passphrase: ',
          }, function(result) {
            if (result.passphrase) {
              var secondKeys = bcorejs.crypto.getKeys(result.passphrase);
              bcorejs.crypto.secondSign(transaction, secondKeys);
              transaction.id = bcorejs.crypto.getId(transaction);
            } else {
              vorpal.log('No second passphrase given. Trying without.');
            }
          });
        }
      } catch (error) {
        vorpal.log(colors.red(error));
      }
    } // if(body)
    performPost();
  });
}

function getFromNode(url, cb){
  let nethash=network?network.nethash:"";
  request(
    {
      url: url,
      headers: {
        nethash: nethash,
        version: '1.0.0',
        port:1
      },
      timeout: 5000
    },
    cb
  );
}

function getBEXPriceTicker(currency){
  request({url: "https://api.coinmarketcap.com/v1/ticker/ark/?convert="+currency}, function(err, response, body){
    bexPriceTicker[currency]=JSON.parse(body)[0];
  });
}

function getAccount(container, seriesCb) {
  var getPassPhrase = function() {
    container.prompt({
      type: 'password',
      name: 'passphrase',
      message: 'passphrase: ',
    }, function(result){
      if (result.passphrase) {
        return seriesCb(null, {
          passphrase: result.passphrase,
        });
      } else{
        return seriesCb("Aborted.");
      }
    });
  };
  // if (ledgerSupported && ledgerAccounts.length) {
  //   var message = 'We have found the following Ledgers: \n';
  //   ledgerAccounts.forEach(function(ledger, index) {
  //     var balance = network.config.symbol + (ledger.data.accountData.balance / 100000000);
  //     message += (index + 1) + ') ' + ledger.data.address + ' (' + balance + ')' + '\n';
  //   });
  //   message += 'N) passphrase\n\n';
  //   message += 'Please choose an option: ';
  //   container.prompt({
  //     type: 'input',
  //     name: 'account',
  //     message: message,
  //   }, function(result){
  //     if (result.account.toUpperCase() === 'N') {
  //       getPassPhrase();
  //     } else if (ledgerAccounts[result.account - 1]) {
  //       var ledger = ledgerAccounts[result.account - 1];
  //       return seriesCb(null, {
  //         address: ledger.data.address,
  //         publicKey: ledger.data.publicKey,
  //         path: ledger.path,
  //       });
  //     } else {
  //       return seriesCb("Failed to get Accounts");
  //     }
  //   });
  // } else {
  //   getPassPhrase();
  // }
}

// function resetLedger() {
//   ledgerAccounts = [];
//   ledgerBridge = null;
//   if (ledgerComm !== null) {
//     ledgerComm.close_async();
//     ledgerComm   = null;
//   }
// }
//
// async function populateLedgerAccounts() {
//   if (!ledgerSupported || !ledgerBridge) {
//     return;
//   }
//   ledgerAccounts = [];
//   ///var accounts = [];
//   var account_index = 0;
//   var path = network.hasOwnProperty('ledgerpath') ? network.ledgerpath : "44'/111'/";
//   var empty = false;
//
//   while (!empty) {
//     var localpath = path + account_index + "'/0/0";
//     var result = null;
//     try {
//       await ledgerBridge.getAddress_async(localpath).then(
//         (response) => { result = response }
//       ).fail(
//         (response) => { result = response }
//       );
//       if (result.publicKey) {
//         result.address = bcorejs.crypto.getAddress(result.publicKey);
//         var accountData = null;
//         await requestPromise({
//           uri: 'http://' + server + '/api/accounts?address=' + result.address,
//           headers: {
//             nethash: network.nethash,
//             version: '1.0.0',
//             port: 1
//           },
//           timeout: 5000,
//           json: true,
//         }).then(
//           (body) => { accountData = body }
//         );
//         if (!accountData || accountData.success === false) {
//           // Add an empty available account when 0 transactions have been made.
//           empty = true;
//           result.accountData = {
//             address: result.address,
//             unconfirmedBalance: "0",
//             balance: "0",
//             publicKey: result.publicKey,
//             unconfirmedSignature: 0,
//             secondSignature: 0,
//             secondPublicKey: null,
//             multisignatures: [],
//             u_multisignatures: []
//           };
//         } else {
//           result.accountData = accountData.account;
//         }
//       }
//     } catch (e) {
//       console.log('no request:', e);
//       break;
//     }
//     if (result && result.address) {
//       ledgerAccounts.push({
//         data: result,
//         path: localpath
//       });
//       account_index = account_index + 1;
//     } else {
//       empty = true;
//     }
//   }
//
//   if (ledgerAccounts.length) {
//     vorpal.log('Ledger App Connected');
//   }
// }
//
// async function ledgerSignTransaction(seriesCb, transaction, account, callback) {
//   if (!ledgerSupported || !account.publicKey || !account.path) {
//     return callback(transaction);
//   }
//
//   transaction.senderId = account.address;
//   if (transaction.type === 3) {
//     transaction.recipientId = account.address;
//   }
//   transaction.senderPublicKey = account.publicKey;
//   delete transaction.signature;
//   var transactionHex = bcorejs.crypto.getBytes(transaction, true, true).toString("hex");
//   var result = null;
//   console.log('Please sign the transaction on your Ledger');
//   await ledgerBridge.signTransaction_async(account.path, transactionHex).then(
//     (response) => { result = response }
//   ).fail(
//     (response) => { result = response }
//   );
//   if (result.signature && result.signature === '00000100') {
//     return seriesCb('We could not sign the transaction. Close everything using the Ledger and try again.');
//   } else if (result.signature) {
//     transaction.signature = result.signature;
//     transaction.id = bcorejs.crypto.getId(transaction);
//   } else {
//     transaction = null;
//   }
//   callback(transaction);
// }
//
// if (ledgerSupported) {
// ledgerWorker.on('message', function (message) {
//   if (message.connected && network && (!ledgerComm || !ledgerAccounts.length)) {
//     ledger.comm_node.create_async().then((comm) => {
//       ledgerComm = comm;
//       ledgerBridge = new BexLedgerWallet(ledgerComm);
//       populateLedgerAccounts();
//     }).fail((error) => {
//       //vorpal.log(colors.red('ledger error: ' +error));
//     });
//   } else if (!message.connected && ledgerComm) {
//     vorpal.log('Ledger App Disconnected');
//     resetLedger();
//   }
// });
// }

vorpal
  .command('init <network>', 'Initiate a connection to the Bench rootchain or a native sidechain.')
  .action(function(args, callback) {
    // reset an existing connection first
    if(server) {
      server=null;
      network=null;
      resetLedger();
    }

		var self = this;
    network = networks[args.network];

    if(!network){
        self.log("Network not found");
        return callback();
    }

    connect2network(network,function(){
      getFromNode('http://'+server+'/peer/status', function(err, response, body){
        self.log("Node: " + server + ", height: " + JSON.parse(body).height);
        self.delimiter('bex '+args.network+'>');
        bcorejs.crypto.setNetworkVersion(network.config.version);
	connected = true;
        callback();
      });
    });

  });

function connect2network(n, callback){
  server = n.peers[Math.floor(Math.random()*1000)%n.peers.length];
  findEnabledPeers(function(peers){
    if(peers.length>0){
      server=peers[0];
      n.peers=peers;
    }
  });
  getFromNode('http://'+server+'/api/loader/autoconfigure', function(err, response, body){
    if(!body) connect2network(n, callback);
    else{
      n.config = JSON.parse(body).network;
      vorpal.log(n.config);
      callback();
    }
  });
}


vorpal
  .command('connect peer <address>', 'Initiate a connection with a public peer ex: "connect peer michaelx.bex.life:6620"')
  .action(function(args, callback) {
    // reset an existing connection first
    if(server) {
      server=null;
      network=null;
      resetLedger();
    }

		var self = this;
    server=args.url;
    getFromNode('http://'+server+'/api/blocks/getNethash', function(err, response, body){
      if(err){
        self.log(colors.red("Public API unreacheable on this server "+server+" - "+err));
        server=null;
        self.delimiter('bex>');
        return callback();
      }
      try {
        var nethash = JSON.parse(body).nethash;
      }
      catch (error){
        self.log(colors.red("API is not returning expected result:"));
        self.log(body);
        server=null;
        self.delimiter('bex>');
        return callback();
      }

      var networkname = getNetworkFromNethash(nethash);
      network = networks[networkname];
      if(!network){
        network = {
          nethash: nethash,
          peers:[server]
        };
        networks[nethash]=network;
      }
      getFromNode('http://'+server+'/api/loader/autoconfigure', function(err, response, body){
        network.config = JSON.parse(body).network;
        console.log(network.config);
      });
      self.log("Connected to network " + nethash + colors.green(" ("+networkname+")"));
      self.delimiter('bex '+server+'>');
      getFromNode('http://'+server+'/peer/status', function(err, response, body){
        self.log("Node height ", JSON.parse(body).height);
      });
      connected = true;
      callback();
    });
  });


vorpal
  .command('bex life', 'Print network statistics to a Bench rootchain or sidechain you are connected to.')
  .action(function(args, callback) {
    var self = this;
    if(!isConnected()){
      self.log("Please connect to node or network before");
      return callback();
    }
		getFromNode('http://'+server+'/peer/list', function(err, response, body){
      if(err){
        self.log(colors.red("Can't get peers from network: " + err));
        return callback();
      }
      else {
        var peers = JSON.parse(body).peers.map(function(peer){
          return peer.ip+":"+peer.port;
        });
        self.log("Checking "+peers.length+" peers");
        var spinner = ora({text:"0%",spinner:"shark"}).start();
        var heights={};
        var delays={};
        var count=0;
        async.each(peers, function(peer, cb){
          var delay=new Date().getTime();
          getFromNode('http://'+peer+'/peer/status', function(err, response, hbody){
            delay=new Date().getTime()-delay;
            if(delays[10*Math.floor(delay/10)]){
              delays[10*Math.floor(delay/10)]++;
            }
            else{
              delays[10*Math.floor(delay/10)]=1;
            }
            count++;
            spinner.text=Math.floor(100*count/peers.length)+"%";
            if(err){
              return cb();
            }
            else{
              var height=JSON.parse(hbody).height;
              if(!height){
                return cb();
              }
              if(heights[height]){
                heights[height]++;
              }
              else{
                heights[height]=1;
              }
              return cb();
            }
            return cb();
          });
        },function(err){
          spinner.stop();
          var screen = blessed.screen();
          var grid = new contrib.grid({rows: 12, cols: 12, screen: screen});
          var line = grid.set(0, 0, 6, 6, contrib.line,
              { style:
                 { line: "yellow"
                 , text: "green"
                 , baseline: "black"}
               , xLabelPadding: 3
               , xPadding: 5
               , label: 'Delays'});
          var data = {
               x: Object.keys(delays).map(function(d){return d+"ms"}),
               y: Object.values(delays)
            };
          screen.append(line); //must append before setting data
          line.setData([data]);

          var bar = grid.set(6, 0, 6, 12, contrib.bar, { label: 'Network Height', barWidth: 4, barSpacing: 6, xOffset: 0, maxHeight: 9});
          screen.append(bar); //must append before setting data
          bar.setData({titles: Object.keys(heights), data: Object.values(heights)});

          screen.onceKey(['escape'], function(ch, key) {
            screen.destroy();
          });
          screen.render();
        });
      }
    });

  });

vorpal
  .command('bexgal <address>', 'Calling all Bench chicks to get their account status.')
  .action(function(args, callback) {
    var self = this;
    if(!isConnected()){
      self.log("please connect to node or network before");
      return callback();
    }
    var address=args.address;
    getFromNode('http://'+server+'/api/accounts?address='+address, function(err, response, body){
      var a = JSON.parse(body).account;

      if(!a){
        self.log("Unknown on the blockchain");
        return callback();
      }
      for(var i in a){
        if(!a[i] || a[i].length === 0) delete a[i];
      }
      delete a.address;
      var table = new Table();
      table.setHeading(Object.keys(a));
      var rowItems = [];
      Object.keys(a).map(function (key) {
        var value = a[key];
        if (['unconfirmedBalance', 'balance'].includes(key)) {
          value = value / 100000000;
        }
        rowItems.push(value);
      });
      table.addRow(rowItems);
      self.log(table.toString());
      getFromNode('http://'+server+'/api/delegates/get/?publicKey='+a.publicKey, function(err, response, body){
        body = JSON.parse(body);
        if(body.success){
          var delegate=body.delegate;
          delete delegate.address;
          delete delegate.publicKey;
          table = new Table("Delegate");
          table.setHeading(Object.keys(delegate));
          table.addRow(Object.values(delegate));
          self.log(table.toString());
        }

        callback();
      });
    });
  });

  vorpal
    .command('bexbro <address>', 'Get account status')
    .action(function(args, callback) {
      var self = this;
      if(!isConnected()){
        self.log("please connect to node or network before");
        return callback();
      }
      var address=args.address;
      getFromNode('http://'+server+'/api/accounts?address='+address, function(err, response, body){
        var a = JSON.parse(body).account;

        if(!a){
          self.log("Unknown on the blockchain");
          return callback();
        }
        for(var i in a){
          if(!a[i] || a[i].length === 0) delete a[i];
        }
        delete a.address;
        var table = new Table();
        table.setHeading(Object.keys(a));
        var rowItems = [];
        Object.keys(a).map(function (key) {
          var value = a[key];
          if (['unconfirmedBalance', 'balance'].includes(key)) {
            value = value / 100000000;
          }
          rowItems.push(value);
        });
        table.addRow(rowItems);
        self.log(table.toString());
        getFromNode('http://'+server+'/api/delegates/get/?publicKey='+a.publicKey, function(err, response, body){
          body = JSON.parse(body);
          if(body.success){
            var delegate=body.delegate;
            delete delegate.address;
            delete delegate.publicKey;
            table = new Table("Delegate");
            table.setHeading(Object.keys(delegate));
            table.addRow(Object.values(delegate));
            self.log(table.toString());
          }

          callback();
        });
      });
    });

vorpal
  .command('cast vote <delegate>', 'Cast a vote for a delegate on the Bench rootchain or sidechain you are connected to.')
  .action(function(args, callback) {
    var self = this;
    if(!isConnected()){
      self.log("You have to be connected to a Bench rootchain or sidechain to vote for a delegate.");
      return callback();
    }
    async.waterfall([
      function(seriesCb) {
        getAccount(self, seriesCb);
      },
      function(account, seriesCb) {
        var delegateName = args.delegate;
        var address = null;
        var publicKey = null;
        var passphrase = '';
        if (account.passphrase) {
          passphrase = account.passphrase;
          var keys = bcorejs.crypto.getKeys(passphrase);
          publicKey = keys.publicKey;
          address = bcorejs.crypto.getAddress(publicKey);
        } else if (account.publicKey) {
          address = account.address;
          publicKey = account.publicKey;
        } else {
          return seriesCb('No public key for account');
        }
        getFromNode('http://'+server+'/api/accounts/delegates/?address='+address, function(err, response, body) {
          body = JSON.parse(body);
          if (!body.success) {
            return seriesCb("Failed getting current vote: " + body.error);
          }
          var currentVote = null;
          if (body.delegates.length) {
            currentVote = body.delegates.pop();
            if (currentVote.username === delegateName) {
              return seriesCb('You have already voted for ' + delegateName);
            }
          }
          getFromNode('http://'+server+'/api/delegates/get/?username='+delegateName, function(err, response, body){
            body = JSON.parse(body);
            if (!body.success) {
              return seriesCb("Failed: " + body.error);
            }
            var newDelegate = body.delegate;
            var confirmMessage = 'Vote for ' + delegateName + ' now';
            if (currentVote) {
              confirmMessage = 'Vote for ' + delegateName + ' and unvote ' + currentVote.username + ' now';
            }
            self.prompt({
              type: 'confirm',
              name: 'continue',
              default: false,
              message: confirmMessage,
            }, function(result){
              if (result.continue) {
                if (currentVote) {
                  try {
                    var unvoteTransaction = bcorejs.vote.createVote(passphrase, ['-'+currentVote.publicKey]);
                  } catch (error) {
                    return seriesCb('Failed: ' + error);
                  }
                  ledgerSignTransaction(seriesCb, unvoteTransaction, account, function(unvoteTransaction) {
                    if (!unvoteTransaction) {
                      return seriesCb('Failed to sign unvote transaction with ledger');
                    }
                    postTransaction(self, unvoteTransaction, function(err, response, body) {
                      if (err) {
                        return seriesCb('Failed to unvote previous delegate: ' + err);
                      } else if (!body.success){
                        return seriesCb("Failed to send unvote transaction: " + body.error);
                      }
                      var transactionId = body.transactionIds.pop();
                      console.log('Waiting for unvote transaction (' + transactionId + ') to confirm.');
                      var checkTransactionTimerId = setInterval(function() {
                        getFromNode('http://' + server + '/api/transactions/get?id=' + transactionId, function(err, response, body) {
                          body = JSON.parse(body);
                          if (!body.success && body.error !== 'Transaction not found') {
                            clearInterval(checkTransactionTimerId);
                            return seriesCb('Failed to fetch unconfirmed transaction: ' + body.error);
                          } else if (body.transaction) {
                            clearInterval(checkTransactionTimerId);
                            try {
                              var transaction = bcorejs.vote.createVote(passphrase, ['+'+newDelegate.publicKey]);
                            } catch (error) {
                              return seriesCb('Failed: ' + error);
                            }
                            ledgerSignTransaction(seriesCb, transaction, account, function(transaction) {
                              if (!transaction) {
                                return seriesCb('Failed to sign vote transaction with ledger');
                              }
                              return seriesCb(null, transaction);
                            });
                          }
                        });
                      }, 2000);
                    });
                  });
                } else {
                  try {
                    var transaction = bcorejs.vote.createVote(passphrase, ['+'+newDelegate.publicKey]);
                  } catch (error) {
                    return seriesCb('Failed: ' + error);
                  }
                  ledgerSignTransaction(seriesCb, transaction, account, function(transaction) {
                    if (!transaction) {
                      return seriesCb('Failed to sign transaction with ledger');
                    }
                    return seriesCb(null, transaction);
                  });
                }
              } else {
                return seriesCb("Aborted.");
              }
            });
          });
        });
      },
      function(transaction, seriesCb){
        postTransaction(self, transaction, function(err, response, body){
          if(err){
            seriesCb("Failed to send transaction: " + err);
          }
          else if(body.success){
            seriesCb(null, transaction);
          }
          else {
            seriesCb("Failed to send transaction: " + body.error);
          }
        });
      }
    ], function(err, transaction){
      if(err){
        self.log(colors.red(err));
      }
      else{
        self.log(colors.green("Transaction sent successfully with id "+transaction.id));
      }
      return callback();
    });
  });

vorpal
  .command('remove vote ', 'Remove previous vote')
  .action(function(args, callback) {
    var self = this;
    if(!isConnected()){
      self.log("You have to be connected to a Bench rootchain or sidechain to remove your vote for a delegate.");
      return callback();
    }
    async.waterfall([
      function(seriesCb){
        getAccount(self, seriesCb);
      },
      function(account, seriesCb){
        var address = null;
        var publicKey = null;
        var passphrase = '';
        if (account.passphrase) {
          passphrase = account.passphrase;
          var keys = bcorejs.crypto.getKeys(passphrase);
          publicKey = keys.publicKey;
          address = bcorejs.crypto.getAddress(publicKey);
        } else if (account.publicKey) {
          address = account.address;
          publicKey = account.publicKey;
        } else {
          return seriesCb('No public key for account');
        }
        getFromNode('http://'+server+'/api/accounts/delegates/?address='+address, function(err, response, body) {
          body = JSON.parse(body);
          if (!body.success) {
            return seriesCb("Failed: " + body.error);
          }
          if (!body.delegates.length) {
            return seriesCb("You currently haven't voted for anyone.");
          }
          var lastDelegate = body.delegates.pop();
          var delegates = ['-' + lastDelegate.publicKey];
          self.prompt({
            type: 'confirm',
            name: 'continue',
            default: false,
            message: 'Removing last vote for ' + lastDelegate.username,
          }, function(result){
            if (result.continue) {
              try {
                var transaction = bcorejs.vote.createVote(passphrase, delegates);
              } catch (error) {
                return seriesCb('Failed: ' + error);
              }
              ledgerSignTransaction(seriesCb, transaction, account, function(transaction) {
                if (!transaction) {
                  return seriesCb('Failed to sign transaction with ledger');
                }
                return seriesCb(null, transaction);
              });
            } else {
              return seriesCb("Aborted.");
            }
          });
        });
      },
      function(transaction, seriesCb){
        postTransaction(self, transaction, function(err, response, body){
          if(err){
            seriesCb("Failed to send transaction: " + err);
          }
          else if(body.success){
            seriesCb(null, transaction);
          }
          else {
            seriesCb("Failed to send transaction: " + body.error);
          }
        });
      }
    ], function(err, transaction){
      if(err){
        self.log(colors.red(err));
      }
      else{
        self.log(colors.green("Transaction sent successfully with id "+transaction.id));
      }
      return callback();
    });
  });
  vorpal
    .command('register as delegate <username>', 'Register yourself as a delegate on the Bench rootchain or sidechain you are connected to.')
    .action(function(args, callback) {
  		var self = this;
      if(!isConnected()){
        self.log("You have to be connected to a Bench rootchain or sidechain to register as a delegate.");
        return callback();
      }
      async.waterfall([
        function(seriesCb) {
          getAccount(self, seriesCb);
        },
        function(account, seriesCb) {
          var address = null;
          var publicKey = null;
          var passphrase = '';
          if (account.passphrase) {
            passphrase = account.passphrase;
            var keys = bcorejs.crypto.getKeys(passphrase);
            publicKey = keys.publicKey;
            address = bcorejs.crypto.getAddress(publicKey);
          } else if (account.publicKey) {
            address = account.address;
            publicKey = account.publicKey;
          } else {
            return seriesCb('No public key for account');
          }
          try {
            var transaction = bcorejs.delegate.createDelegate(passphrase, args.delegate_name);
          } catch (error) {
            return seriesCb('Failed: ' + error);
          }
          ledgerSignTransaction(seriesCb, transaction, account, function(transaction) {
            if (!transaction) {
              return seriesCb('Failed to sign transaction with ledger');
            }
            return seriesCb(null, transaction);
          });
        },
        function(transaction, seriesCb) {
          postTransaction(self, transaction, function(err, response, body){
            if(err){
              seriesCb("Failed to send transaction: " + err);
            }
            else if(body.success){
              seriesCb(null, transaction);
            }
            else {
              seriesCb("Failed to send transaction: " + body.error);
            }
          });
        }
      ], function(err, transaction){
        if(err){
          self.log(colors.red(err));
        }
        else{
          self.log(colors.green("Transaction sent successfully with id "+transaction.id));
        }
        return callback();
      });
    });


vorpal
  .command('create wallet', 'Create a wallet on the Bench rootchain or sidechain you are connected to.')
  .action(function(args, callback) {
		var self = this;
    if(!isConnected()){
      self.log("please connect to node or network before, in order to retrieve necessery information about address prefixing");
      return callback();
    }
    var passphrase = require("bip39").generateMnemonic();
		self.log("Seed    - private:",passphrase);
		self.log("WIF     - private:",bcorejs.crypto.getKeys(passphrase).toWIF());
		self.log("Address - public :",bcorejs.crypto.getAddress(bcorejs.crypto.getKeys(passphrase).publicKey));
		callback();
  });

vorpal
  .command('create custom wallet <string>', 'Generate a wallet address containing a custom (vanity) lowercased phrase (<string>) (This could take some time)')
  .action(function(args, callback) {
    var self=this;
    if(!isConnected()){
      self.log("In order to create a custom vanity wallet, you will need to be connected to a Bench rootchain or sidechain.");
      return callback();
    }

    var count=0;
    var numCPUs = require('os').cpus().length;
    var cps=[];
    self.log("Spawning process to "+numCPUs+" cpus");
    var spinner = ora({text:"passphrases tested: 0",spinner:"shark"}).start();
    for (var i = 0; i < numCPUs; i++) {
      var cp=child_process.fork(__dirname+"/vanity.js");
      cps.push(cp);
      cp.on('message', function(message){
        if(message.passphrase){
          spinner.stop();
          var passphrase = message.passphrase;
          self.log("Found after",count,"passphrases tested");
          self.log("Seed    - private:",passphrase);
          self.log("WIF     - private:",bcorejs.crypto.getKeys(passphrase).toWIF());
          self.log("Address - public :",bcorejs.crypto.getAddress(bcorejs.crypto.getKeys(passphrase).publicKey));

          for(var killid in cps){
            cps[killid].kill();
          }
          callback();
        }
        if(message.count){
          count += message.count;
          spinner.text="passphrases tested: "+count;
        }
      });
      cp.send({string:args.string.toLowerCase(), version:network.config.version});
    }

  });

  vorpal
    .command('pay <amount> <address>', 'Pay <amount> (of ASSET) to <address>. <amount>.')
    .action(function(args, callback) {
  		var self = this;
      if(!isConnected()){
        self.log("You have to be connected to a Bench rootchain or sidechain in order to send transactions.");
        return callback();
      }
      var currency;
      var found = false;

      if(typeof args.amount != "number")
      {

        for(var i in currencies)
        {
          if(args.amount.startsWith(currencies[i]))
          {
            currency=currencies[i];
            args.amount = Number(args.amount.replace(currency,""));
            getBEXPriceTicker(currency);
            found = true;
            break;
          }
        }

        if(!found)
        {
          self.log("Invalid Currency Format");
          return callback();
        }
      }

      async.waterfall([
        function(seriesCb){
          getAccount(self, seriesCb);
        },
        function(account, seriesCb){
          var address = null;
          var publicKey = null;
          var passphrase = '';
          if (account.passphrase) {
            passphrase = account.passphrase;
            var keys = bcorejs.crypto.getKeys(passphrase);
            publicKey = keys.publicKey;
            address = bcorejs.crypto.getAddress(publicKey);
          } else if (account.publicKey) {
            address = account.address;
            publicKey = account.publicKey;
          } else {
            return seriesCb('No public key for account');
          }

          var bexamount = args.amount;
          var bexAmountString = args.amount;

          if(currency){
            if(!bexPriceTicker[currency]){
              return seriesCb("Can't get price from market. Aborted.");
            }
            bexamount = parseInt(args.amount * 100000000 / Number(bexPriceTicker[currency]["price_"+currency.toLowerCase()]),10);
            bexAmountString = bexamount/100000000;
          } else {
            bexamount = parseInt(args.amount * 100000000, 10);
          }

          self.prompt({
            type: 'confirm',
            name: 'continue',
            default: false,
            message: 'Sending ' + bexAmountString + ' ' + network.config.token+' '+(currency?'('+currency+args.amount+') ':'')+'to '+args.address+' now',
          }, function(result){
            if (result.continue) {
              try {
                var transaction = bcorejs.transaction.createTransaction(args.address, bexamount, null, passphrase);
              } catch (error) {
                return seriesCb('Failed: ' + error);
              }
              ledgerSignTransaction(seriesCb, transaction, account, function(transaction) {
                if (!transaction) {
                  return seriesCb('Failed to sign transaction with ledger');
                }
                return seriesCb(null, transaction);
              });
            }
            else {
              return seriesCb("Aborted.");
            }
          });
        },
        function(transaction, seriesCb){
          postTransaction(self, transaction, function(err, response, body){
            if(err){
              seriesCb("Failed to send transaction: " + err);
            }
            else if(body.success){
              seriesCb(null, transaction);
            }
            else {
              seriesCb("Failed to send transaction: " + body.error);
            }
          });
        }
      ], function(err, transaction){
        if(err){
          self.log(colors.red(err));
        }
        else{
          self.log(colors.green("Transaction sent successfully with id "+transaction.id));
        }
        return callback();
      });
    });


vorpal
  .command('message sign <message>', 'Sign a message')
  .action(function(args, callback) {
		var self = this;
    return this.prompt({
      type: 'password',
      name: 'passphrase',
      message: 'passphrase: ',
    }, function(result){
      if (result.passphrase) {
        var hash = crypto.createHash('sha256');
        hash = hash.update(new Buffer(args.message,"utf-8")).digest();
        self.log("public key: ",bcorejs.crypto.getKeys(result.passphrase).publicKey);
        self.log("address   : ",bcorejs.crypto.getAddress(bcorejs.crypto.getKeys(result.passphrase).publicKey));
        self.log("signature : ",bcorejs.crypto.getKeys(result.passphrase).sign(hash).toDER().toString("hex"));

      } else {
        self.log('Aborted.');
        callback();
      }
    });
  });

vorpal
  .command('message verify <message> <publickey>', 'Verify the <message> signed by the owner of <publickey> (you will be prompted to provide the signature)')
  .action(function(args, callback) {
		var self = this;
    return this.prompt({
      type: 'input',
      name: 'signature',
      message: 'signature: ',
    }, function(result){
      if (result.signature) {
        try{
          var hash = crypto.createHash('sha256');
          hash = hash.update(new Buffer(args.message,"utf-8")).digest();
          var signature = new Buffer(result.signature, "hex");
        	var publickey= new Buffer(args.publickey, "hex");
        	var ecpair = bcorejs.ECPair.fromPublicKeyBuffer(publickey);
        	var ecsignature = bcorejs.ECSignature.fromDER(signature);
        	var res = ecpair.verify(hash, ecsignature);
          self.log(res);
        }
        catch(error){
          self.log("Failed: ", error);
        }
        callback();
      } else {
        self.log('Aborted.');
        callback();
      }
    });
  });

  vorpal
    .command('kill', 'Kill a connection to a peer or a Bench rootchain/sidechain')
    .action(function(args, callback) {
  		var self = this;
      self.log("Killed connection to "+server);
      self.delimiter('bex>');
      server=null;
      network=null;
      connected = false;

      resetLedger();
      callback();
    });

vorpal.history('bench');

vorpal.log(colors.cyan(figlet.textSync("BEX BRO","Swamp Land")));

vorpal
  .delimiter('bench>')
  .show();
