import { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { Table, Button, Modal, Header, Container, Input, Label } from 'semantic-ui-react'

import Item from './Util/item'
import ButtonPercent from './Util/buttonPercent'


import IERC20 from '../../abis/IERC20.json'
import LendingPool from '../../abis/LendingPool.json';
import { lendingPoolAddress } from '../../config'



// import image 
import MATICPNG from '../../assets/MATIC.png'
import BTCBPNG from '../../assets/BTCB.png'
import WETHPNG from '../../assets/WETH.png'




const Deposit = (props) => {
    const { tokens, userDatas } = props;
    const [DepositVisible, setDepositVisible] = useState(false);
    const [WithDrawVisible, setWithDrawVisible] = useState(false);
    const [ModalToken, setModalToken] = useState({});
    const [ModalUserData, setModalUserData] = useState({});
    const [ModalUserTokenData, setModalUserTokenData] = useState({});




    const tokenImage = { "BTCB": BTCBPNG, "MATIC": MATICPNG, "WETH": WETHPNG }
    const _tokens = tokens.map((token, i) => {
        token['imageUrl'] = tokenImage[token.symbol]
        return token
    })

    const depositModal = (token, userDatas) => {
        setModalToken(token)
        setModalUserData(userDatas)
        setModalUserTokenData(userDatas[token.symbol])
        setDepositVisible(true)
    }

    const withdrawModal = (token, userDatas) => {
        setModalToken(token)
        setModalUserData(userDatas)
        setModalUserTokenData(userDatas[token.symbol])
        setWithDrawVisible(true)
    }




    return (
        <Table basic='very'>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Asset</Table.HeaderCell>
                    <Table.HeaderCell>Wallet balance</Table.HeaderCell>
                    <Table.HeaderCell>Your deposit balance</Table.HeaderCell>
                    <Table.HeaderCell>Deposit APY</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
            </Table.Header>


            <Table.Body className="ListTable">
                {
                    Boolean(tokens.length) && (
                        _tokens.map((token, i) => (
                            <Table.Row key={token.symbol}>
                                <Table.Cell className="ListTableImage"><img src={token.imageUrl} alt=''></img>{token.symbol} </Table.Cell>
                                <Table.Cell> {userDatas[token.symbol].balance} </Table.Cell>
                                <Table.Cell> {userDatas[token.symbol].liquidityBalance} </Table.Cell>
                                <Table.Cell> {token.depositAPY ? `${token.depositAPY} %` : `-`} </Table.Cell>
                                <Table.Cell>
                                    <Button basic color="teal" size="small" onClick={(e) => depositModal(token, userDatas)}>Deposit</Button>

                                    {userDatas[token.symbol].liquidityBalance > 0 && (
                                        <Button basic color="grey" size="small" onClick={(e) => withdrawModal(token, userDatas)}>Withdraw</Button>
                                    )}

                                </Table.Cell>
                            </Table.Row>
                        )))
                }
            </Table.Body>

            <DepositModal Visible={DepositVisible} SetVisible={setDepositVisible} Token={ModalToken} UserData={ModalUserData}  UserTokenData={ModalUserTokenData} />
            <WithDrawModal Visible={WithDrawVisible} SetVisible={setWithDrawVisible} Token={ModalToken} UserData={ModalUserData}  UserTokenData={ModalUserTokenData} />

        </Table>
    )

}

const DepositModal = (props) => {
    const { Visible, SetVisible, Token, UserData, UserTokenData } = props
    const [depositAmount, setDepositAmount] = useState(0)
    const { library, account } = useWeb3React()


    const handleDeposit = async () => {
        const provider = account ? library.getSigner() : library;
        const ERC20Contract = new ethers.Contract(Token.tokenAddr, IERC20.abi, provider)
        const LendingContract = new ethers.Contract(lendingPoolAddress, LendingPool.abi, provider)
        await ERC20Contract.approve(lendingPoolAddress, ethers.utils.parseUnits(depositAmount.toString(), 18))
        await LendingContract.deposit(Token.tokenAddr, ethers.utils.parseUnits(depositAmount.toString(), 18))

        handleCloseVisible()
        window.location.reload()
    }

    const handleCloseVisible = () => {
        setDepositAmount(0)
        SetVisible(false)
    }

    return (
        <Modal
            closeIcon
            open={Visible}
            onClose={() => handleCloseVisible()}
            onOpen={() => SetVisible(true)}
            className='LendingModal'
            style={{ width: "520px" }}
        >
            <Header icon='dollar sign' content='Deposit' />
            <Modal.Content>
                <Container>
                    <Item
                        title="Deposit balance"
                        content={`${UserTokenData.liquidityBalance} ${Token.symbol}`}
                        end={`($${UserTokenData.liquidityBalance * Token.price})`} />
                    <Item
                        title="Wallet balance"
                        content={`${UserTokenData.balance} ${Token.symbol}`}
                        end={`($${UserTokenData.balance * Token.price})`} />
                    <Item
                        title="Borrow Limit"
                        content={`$${UserData.tCollateralBalance} -> $${UserData.tCollateralBalance + 0.75 * depositAmount * Token.price}`}
                    />
                    <h4>How much would you like to deposit?</h4>
                    <p>You can set the amount you want to deposit or use the percentage button below. These percentages are according to your Wallet balance</p>
                    <Input labelPosition="right" type="float" style={{ width: '100%', marginBottom: '1rem' }}>
                        <input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                        <Label>{Token.symbol}</Label>
                    </Input>

                    <ButtonPercent Liquidity={UserTokenData.balance} setUpdate={setDepositAmount} />

                    <p>You can deposit a maximum of {UserTokenData.balance} {Token.symbol}</p>
                </Container>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='orange' onClick={handleDeposit}>
                    Deposit!
                </Button>
            </Modal.Actions>
        </Modal>
    )
}

const WithDrawModal = (props) => {
    const { Visible, SetVisible, Token, UserData, UserTokenData } = props
    const [withdrawAmount, setWithdrawAmount] = useState(0)
    const { library, account } = useWeb3React()

    const handleWithdraw = async () => {
        const provider = account ? library.getSigner() : library;
        const LendingContract = new ethers.Contract(lendingPoolAddress, LendingPool.abi, provider)
        await LendingContract.withdraw(Token.tokenAddr, ethers.utils.parseUnits(withdrawAmount.toString(), 18))

        handleCloseVisible()
        window.location.reload()
    }

    const handleCloseVisible = () => {
        setWithdrawAmount(0)
        SetVisible(false)
    }

    const CalculateWithdraw = () => {
        const maxWithdraw = (UserData.tLiquidityBalance - UserData.tBorrowBalance) / Token.price
        return maxWithdraw > UserTokenData.liquidityBalance ? UserTokenData.liquidityBalance : maxWithdraw
    }


    return (
        <Modal
            closeIcon
            open={Visible}
            onClose={() => handleCloseVisible()}
            onOpen={() => SetVisible(true)}
            className='LendingModal'
            style={{ width: "520px" }}
        >
            <Header icon='dollar sign' content='Withdraw' />
            <Modal.Content>
                <Container>
                    <Item
                        title="Deposit balance"
                        content={`${UserTokenData.liquidityBalance} ${Token.symbol}`}
                        end={`($${UserTokenData.liquidityBalance * Token.price})`} />
                    <Item
                        title="Borrow balance"
                        content={`${UserTokenData.borrowBalance} ${Token.symbol}`}
                        end={`($${UserTokenData.borrowBalance * Token.price})`} />
                    <Item
                        title="Borrow Limit"
                        content={`$${UserData.tCollateralBalance} -> $${UserData.tLiquidityBalance - withdrawAmount * Token.price}`}
                    />

                    <h4>How much would you like to withdraw?</h4>
                    <p>You can set the amount you want to withdraw or use the percentage buttons below.
                        These percentages are calculated from Borrow limit – Borrow limit used. We don't recommend
                        withdrawing at 100% to avoid liquidation.</p>
                    <Input labelPosition="right" type="float" style={{ width: '100%', marginBottom: '1rem' }}>
                        <input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                        <Label>{Token.symbol}</Label>
                    </Input>

                    <ButtonPercent Liquidity={CalculateWithdraw()} setUpdate={setWithdrawAmount} />

                    <p>You can deposit a maximum of {CalculateWithdraw()} {Token.symbol}</p>
                </Container>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='orange' onClick={handleWithdraw}>
                    Withdraw!
                </Button>
            </Modal.Actions>
        </Modal>
    )
}

export default Deposit