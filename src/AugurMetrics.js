import React from 'react';
import Info from "./info";
import Chart from './chart';
import { getData } from "./utils"
import { TypeChooser } from "react-stockcharts/lib/helper";
import './App.css';

const Augur = require('augur.js');
const augur = new Augur();
const http = require('request-promise');

class AugurMetrics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ethId: undefined,
      ethUsd: undefined,
      connectedAugurNode: undefined,
      etherUniverse: undefined,
      universe: undefined,
      error: undefined,
      categories: [],
      marketIds: [],
      priceHistory: [],
      allSharesOutstanding: undefined,
      data: undefined
    }
    console.log("Constructor()")
  }

  componentWillMount() {
    getData().then((d) => {
      console.log(d);
      this.setState({ data: d })
    })
  }

  componentDidMount() {
    http.get('https://api.coinmarketcap.com/v2/listings/', (err, res, body) => {
      this.setState({
        ethId: body
      })
      console.log(body);
      console.log(body[0].data);
      // http.get(`https://api.coinmarketcap.com/v2/ticker/${this.state.ethId}/`, (err, response, body) => {
      //   console.log(response);
      //   console.log(body);
      // this.setState({
      //   ethUsd: body.data[1].quotes.USD.price
      // })
      // console.log(err);
      // })

    })
      .then(() => { console.log("then") })
      .catch((err) => { console.log(err) })
    this.connectNode.then(() => {
      getData().then((data) => {
        this.setState({
          chartData: data
        })
      })
    })
    console.log("mounted");
  }

  connectNode = new Promise((resolve, reject) => {
    var augurNode =     // "wss://augur.gethstar.com";
      "ws://127.0.0.1:9001";
    var ethereumNode = {
      httpAddresses: [  // "http://127.0.0.1:8545",
        "https://megageth.com/"
      ],
      wsAddresses: [    // "ws://127.0.0.1:8546",
        "wss://megageth.com/ws"
      ]
    };

    augur.connect({ ethereumNode, augurNode }, (err, connectionInfo) => {
      console.log(connectionInfo);
      this.setState({
        connectedAugurNode: connectionInfo.augurNode,
        universe: connectionInfo.ethereumNode.contracts.Universe
      });

      if (connectionInfo) {
        augur.markets.getCategories({ universe: connectionInfo.ethereumNode.contracts.Universe },
          (error, cats) => {
            let categories = [];
            // let marks = [];
            let shares = 0;
            /************************************/
            // Get Categories
            /************************************/
            for (let i = 0; cats[i] !== undefined; ++i) {
              categories = [...categories, cats[i]]
              this.setState({
                categories: [...this.state.categories, cats[i]]
              })
            }
            /************************************/
            // Get Markets
            /************************************/
            for (let i = 0; categories[i] !== undefined; ++i) {
              augur.markets.getMarketsInCategory({
                universe: connectionInfo.ethereumNode.contracts.Universe,
                category: categories[i].category
              },
                (err, markets) => {
                  for (let j = 0; markets[j] !== undefined; ++j) {
                    this.setState({
                      marketIds: [...this.state.marketIds, markets[j]]
                    })
                  }
                  /************************************/
                  // Get SharesOutstanding
                  /************************************/
                  augur.markets.getMarketsInfo({ marketIds: [...markets] },
                    (error, result) => {
                      var num1, num2;
                      for (let k = 0; result[k] !== undefined; ++k) {
                        num1 = parseFloat(result[k].outstandingShares);
                        num2 = parseFloat(shares);
                        num1 += num2;
                        shares = num1;
                        this.setState({
                          allSharesOutstanding: num1
                        })
                      }
                    }
                  )
                }
              )
            }
          }
        )
      }
      else reject(err);
    })
  })

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

  render() {
    return (
      <div>
        <h1>AugurMetrics</h1>
        <div id="buffer"></div>
        {this.state.connectedAugurNode === undefined && <p> Loading... </p>}
        <Info
          marketsIdsByCategories={this.state.marketsIdsByCategories}
          connectedAugurNode={this.state.connectedAugurNode}
          etherUniverse={this.state.etherUniverse}
          universe={this.state.universe}
          markets={this.state.markets}
          allSharesOutstanding={this.state.allSharesOutstanding}
        />
        {this.state.data && <Chart
          data={this.state.data}
        />}
      </div>
    );
  }
}

export default AugurMetrics;