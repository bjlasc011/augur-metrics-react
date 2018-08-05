import React from 'react';
import Info from "./components/info";
import './App.css';

const Augur = require('augur.js');
const augur = new Augur();
// const BigNumber = require('bignumber.js');

class AugurMetrics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connectedAugurNode: undefined,
      etherUniverse: undefined,
      universe: undefined,
      error: undefined,
      categories: [],
      marketIds: [],
      priceHistory: [],
      allSharesOutstanding: undefined,
    }
  }
  componentDidMount() {
    this.connectNode();
    console.log("mounted");
  }

  connectNode = async () => {
    var augurNode = //"wss://augur.gethstar.com";
      "ws://127.0.0.1:9001";
    var ethereumNode = {
      httpAddresses: [
        // "http://127.0.0.1:8545",
        "https://megageth.com/"
      ],
      wsAddresses: [   // "ws://127.0.0.1:8546",
        "wss://megageth.com/ws"
      ]
    };
    await augur.connect({ ethereumNode, augurNode }, (err, connectionInfo) => {
      console.log(connectionInfo);
      this.setState({
        connectedAugurNode: connectionInfo.augurNode,
        universe: connectionInfo.ethereumNode.contracts.Universe
      });
      return connectionInfo;
    })
  }

  getSyncInfo = async () => {
    await augur.augurNode.getSyncData(
      (error, result) => {
        console.log(result);
        return result;
      }
    );
  }

  getMarketCats = async () => {
    console.log("fetching categories...");
    this.setState({
      categories: []
    })
    await augur.markets.getCategories({
      universe: this.state.universe
    },
      (error, cats) => {
        for (let i = 0; cats[i] !== undefined; ++i) {
          this.setState({
            categories: [...this.state.categories, cats[i]]
          })
        }
        console.log(this.state.categories);
      })
  }

  getAllMarkets = async () => {
    console.log("fetching marketIds...");
    this.setState({
      marketIds: []
    })
    for (let i = 0; this.state.categories[i] !== undefined; ++i) {
      await augur.markets.getMarketsInCategory({ universe: this.state.universe, category: this.state.categories[i].category },
        (err, markets) => {
          for (let j = 0; markets[j] !== undefined; ++j) {
            console.log(markets[j])
            this.setState({
              marketIds: [...this.state.marketIds, markets[j]] //[marketId: string, marketId, ...]
            })
          }
        }
      )
    }
  }

  getMarketsInfo = async () => {
    console.log(this.state.marketIds)
    console.log('getMarketInfo...')
    this.setState({
      allSharesOutstanding: 0
    })
    for (let i = 0; this.state.marketIds[i] !== undefined; ++i) {
      await augur.markets.getMarketsInfo({ marketIds: [this.state.marketIds[i]] },
        (error, result) => {
          var num1 = parseFloat(result[0].outstandingShares)
          var num2 = parseFloat(this.state.allSharesOutstanding)
          num1 += num2
          this.setState({
            allSharesOutstanding: num1
          })
        }
      )
    }
  }

  getMarketPriceHistory = async () => {
    console.log(this.state.marketIds);
    this.setState({
      priceHistory: []
    })
    console.log("fetching marketPriceHistory...");
    for (let i = 0; this.state.marketIds[i] !== undefined; ++i) {
      await augur.markets.getMarketPriceHistory({
        marketId: this.state.marketIds[i] //this is supposed to be marketId not marketIds
      }, (err, mHist) => {
        console.log(this.state.marketIds[i])
        console.log(mHist)
        if (mHist !== {}) {
          for (let j = 0; mHist[j] !== undefined || j < 10; ++j) {
            for (let k = 0; mHist[j][k] !== undefined; ++k) {
              console.log(`Price: ${mHist[j][k].price}`)
              this.setState({
                allStakes: mHist[j][k].price * mHist[j][k].amount
              })
            }
          }
        }
        else { console.log(err) }
      }
      )
    }
  }

  getAllStakes = async () => {
    console.log(this.state.allStakes)
    // for (let i = 0; this.state.priceHistory[i] !== undefined; ++i) {
    //   for (let j = 0; this.state.priceHistory[i][j] !== undefined; ++j) {
    //     // if (this.state.priceHistory[i][j] !== undefined) {
    //     this.setState({
    //       allStakes: this.state.allStakes + (this.state.priceHistory[i][j].price * this.state.priceHistory[i][j].amount)
    //     })
    //     console.log(this.state.allStakes);
    //     // }
    //   }
    // }
  }
  getTotalStakes = async () => {

  }

  // for(let i = 0; i < marketIds.length; ++i){
  //   augur.markets.getMarketPriceHistory({
  //     marketIds: this.state.marketIds[i]
  //   })
  // }

  render() {
    return (
      <div>
        <h1>AugurMetrics</h1>
        <button onClick={this.getMarketCats}>Get Markets Categories</button>
        <br />
        <button onClick={this.getAllMarkets}>Get All Markets</button>
        <br />
        <button onClick={this.getMarketsInfo}>Get Market Info</button>
        <br />
        <button onClick={this.getAllStakes}>Get Stakes</button>

        <Info
          marketsIdsByCategories={this.state.marketsIdsByCategories}
          connectedAugurNode={this.state.connectedAugurNode}
          etherUniverse={this.state.etherUniverse}
          universe={this.state.universe}
          markets={this.state.markets}
          allSharesOutstanding={this.state.allSharesOutstanding}
        />
      </div>
    );
  }
}

export default AugurMetrics;