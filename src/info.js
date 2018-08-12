import React from 'react';

class Info extends React.Component {
    render() {
        return (
            <div >
                <div>
                    {this.props.connectedAugurNode && <p> Augur Node: {this.props.connectedAugurNode} </p>}
                    {this.props.etherUniverse && <p> Ethereum Universe: {this.props.etherUniverse} </p>}
                    {this.props.universe && <p> Universe: {this.props.universe} </p>}
                    {this.props.allSharesOutstanding && <p> All Shares Outstanding: {this.props.allSharesOutstanding } </p>}
                </div>
            </div>
        )
    }
}
export default Info;