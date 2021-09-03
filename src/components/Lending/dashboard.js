import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from "ethers";

import { Tab } from 'semantic-ui-react'


import LendingPool from '../../abis/LendingPool.json';
import BandPriceOracle from '../../abis/BandPriceOracle.json'
import IPoolConfigure from '../../abis/IPoolConfiguration.json'
import IERC20 from '../../abis/IERC20.json'
import { tokenAddresses, lendingPoolAddress, bandPriceOracleAddress } from '../../config'

import styles from './lending.module.css'
import Deposit from './deposit';
import Borrow from './borrow';


const DashBoard = () => {
    const { library, account } = useWeb3React();
    const [forceUpdate, setForceUpdate] = useState(false)
    const [homeDashboard, setHomeDashboard] = useState([])
    const [userDashboard, setUserDashborard] = useState()

    const toforceUpdate = () => {
        setForceUpdate(!forceUpdate)
    }

    useEffect(() => {

        const convertInt = (BigNumber) => {
            return BigNumber.div(1e9).div(1e9).toNumber()
        }

        const loadDashboard = async () => {
            if (library) {
                const provider = account ? library.getSigner() : library;
                const LendingContract = new ethers.Contract(lendingPoolAddress, LendingPool.abi, provider)
                const PriceOracleContract = new ethers.Contract(bandPriceOracleAddress, BandPriceOracle.abi, provider)
                const udata = await LendingContract.getUserAccount(account)

                let userData = {
                    tBorrowBalance: convertInt(udata.totalBorrowBalanceBase),
                    tCollateralBalance: convertInt(udata.totalCollateralBalanceBase),
                    tLiquidityBalance: convertInt(udata.totalLiquidityBalanceBase)
                }


                const tokens = await Promise.all(Object.keys(tokenAddresses).map(async symbol => {
                    const address = tokenAddresses[symbol]
                    const data = await LendingContract.getPool(address)
                    const price = await PriceOracleContract.getAssetPrice(address)
                    let token = {
                        symbol: symbol,
                        tokenAddr: address,
                        price: convertInt(price),
                        poolConfAddress: data.poolConfigAddress,
                        alTokenAddress: data.alTokenAddress,
                        tAvaiLiquidity: convertInt(data.totalAvailableLiquidity),
                        tBorrow: convertInt(data.totalBorrows),
                        tBorrowShares: convertInt(data.totalBorrowShares),
                        tLiquidity: convertInt(data.totalLiquidity)
                    }


                    const PoolConfContract = new ethers.Contract(token.poolConfAddress, IPoolConfigure.abi, provider)
                    const rateData = await PoolConfContract.calculateInterestRate(data.totalBorrows, data.totalLiquidity)
                    token['borrowRate'] = rateData.div(1e9).toNumber() / 1e7
                    token['borrowAPY'] = token['borrowRate'] 
                    token['depositAPY'] = (token['tBorrow'] * (1 + token['borrowRate'])) / token['tLiquidity']

                    // user ERC20 Token Pool INFO
                    const ucData = await LendingContract.getUserPoolData(account, address);

                    // user ERC20 Token Balance
                    const ERC20Contract = new ethers.Contract(address, IERC20.abi, provider)
                    const balance = await ERC20Contract.balanceOf(account)

                    // user token date 
                    userData[symbol] = {
                        "liquidityBalance": convertInt(ucData.compoundedLiquidityBalance),
                        "borrowBalance": convertInt(ucData.compoundedBorrowBalance),
                        "collateral": ucData.userUsePoolAsCollateral,
                        "balance": convertInt(balance)
                    }

                    return token
                }))

                setUserDashborard(userData)
                setHomeDashboard(tokens)
            }
        }
        loadDashboard()
    }, [account, library, forceUpdate])


    const panes = [
        {
            menuItem: 'Deposit', render: () => <Tab.Pane className={styles.OperateTabPane} style={{ border: "0px" }}>
                <Deposit tokens={homeDashboard} userDatas={userDashboard} forceUpdate={toforceUpdate}/></Tab.Pane>
        },

        {
            menuItem: 'Borrow', render: () => <Tab.Pane className={styles.OperateTabPane} style={{ border: "0px" }}>
                <Borrow tokens={homeDashboard} userDatas={userDashboard} forceUpdate={toforceUpdate}/></Tab.Pane>
        }
    ]


    return (
        <Tab menu={{ text: true }} panes={panes} className={styles.OperateTab} />
    )
}


export default DashBoard