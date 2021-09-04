import { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { Table, Button, Modal, Header, Container, Input, Label } from 'semantic-ui-react'

import Item from './Util/item'
import ButtonPercent from './Util/buttonPercent'


import { fixNumber } from './Util/lib'
import IERC20 from '../../abis/IERC20.json'
import LendingPool from '../../abis/LendingPool.json';
import { lendingPoolAddress } from '../../config'


// import image 
import MATICPNG from '../../assets/MATIC.png'
import BTCBPNG from '../../assets/BTCB.png'
import WETHPNG from '../../assets/WETH.png'




const Borrow = (props) => {
    const { tokens, userDatas } = props;
    const [BorrowVisible, setBorrowVisible] = useState(false);
    const [RepayVisible, setRepayVisible] = useState(false);
    const [ModalToken, setModalToken] = useState({});
    const [ModalUserData, setModalUserData] = useState({});
    const [ModalUserTokenData, setModalUserTokenData] = useState({});




    const tokenImage = { "BTCB": BTCBPNG, "MATIC": MATICPNG, "WETH": WETHPNG }
    const _tokens = tokens.map((token, i) => {
        token['imageUrl'] = tokenImage[token.symbol]
        return token
    })

    const borrowModal = (token, userDatas) => {
        setModalToken(token)
        setModalUserData(userDatas)
        setModalUserTokenData(userDatas[token.symbol])
        setBorrowVisible(true)
    }

    const repayModal = (token, userDatas) => {
        setModalToken(token)
        setModalUserData(userDatas)
        setModalUserTokenData(userDatas[token.symbol])
        setRepayVisible(true)
    }




    return (
        <Table basic='very'>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Asset</Table.HeaderCell>
                    <Table.HeaderCell>Wallet balance</Table.HeaderCell>
                    <Table.HeaderCell>Your borrow balance</Table.HeaderCell>
                    <Table.HeaderCell>Borrow APY</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
            </Table.Header>


            <Table.Body className="ListTable">
                {
                    Boolean(tokens.length) && (
                        _tokens.map((token, i) => (
                            <Table.Row key={token.symbol}>
                                <Table.Cell className="ListTableImage" style={{ paddingTop: "1.3rem" }}><img src={token.imageUrl} alt=''></img>{token.symbol} </Table.Cell>
                                <Table.Cell> {userDatas[token.symbol].balance} </Table.Cell>
                                <Table.Cell> {userDatas[token.symbol].borrowBalance} </Table.Cell>
                                <Table.Cell> {token.borrowAPY ? `${token.borrowAPY} %` : `-`} </Table.Cell>
                                <Table.Cell>
                                    <Button basic color="teal" size="small" onClick={(e) => borrowModal(token, userDatas)}>Borrow</Button>

                                    {userDatas[token.symbol].borrowBalance > 0.01 && (
                                        <Button basic color="grey" size="small" onClick={(e) => repayModal(token, userDatas)}>Repay</Button>
                                    )}

                                </Table.Cell>
                            </Table.Row>
                        )))
                }
            </Table.Body>

            <BorrowModal Visible={BorrowVisible} SetVisible={setBorrowVisible} Token={ModalToken} UserData={ModalUserData} UserTokenData={ModalUserTokenData} />
            <RepayModal Visible={RepayVisible} SetVisible={setRepayVisible} Token={ModalToken} UserData={ModalUserData} UserTokenData={ModalUserTokenData} />

        </Table>
    )

}

const BorrowModal = (props) => {
    const { Visible, SetVisible, Token, UserData, UserTokenData } = props
    const { library, account } = useWeb3React()
    const [borrowAmount, setBorrowAmount] = useState(0)


    const handleBorrow = async () => {
        const provider = account ? library.getSigner() : library;
        const LendingContract = new ethers.Contract(lendingPoolAddress, LendingPool.abi, provider)
        const tx = await LendingContract.borrow(Token.tokenAddr, ethers.utils.parseUnits(borrowAmount.toString(), 18))

        await tx.wait()
        handleCloseVisible()
        window.location.reload()
    }

    const handleCloseVisible = () => {
        setBorrowAmount(0)
        SetVisible(false)
    }

    const CalculateBorrow = () => {
        const maxBorrow = (UserData.tCollateralBalance - UserData.tBorrowBalance) / Token.price
        return maxBorrow < Token.tAvaiLiquidity ? fixNumber(maxBorrow) : fixNumber(Token.tAvaiLiquidity)
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
            <Header icon='dollar sign' content='Borrow' />
            <Modal.Content>
                <Container>
                    <Item
                        title="Deposit balance"
                        content={`${UserTokenData.liquidityBalance} ${Token.symbol}`}
                        end={`($${UserTokenData.liquidityBalance * Token.price})`} />
                    <Item
                        title="Borrow balance"
                        content={`${UserTokenData.borrowBalance} ${Token.symbol}`}
                        end={`($${fixNumber(UserTokenData.borrowBalance * Token.price)})`} />

                    <Item
                        title="Borrow Limit used"
                        content={`${fixNumber(UserData.tBorrowBalance / UserData.tCollateralBalance * 100)}% -> ${fixNumber((UserData.tBorrowBalance + borrowAmount * Token.price) / UserData.tCollateralBalance * 100)}% `}
                    />
                    <Item
                        title="Borrow Limit"
                        content={`$${UserData.tCollateralBalance} -> $${fixNumber(UserData.tCollateralBalance - (borrowAmount * Token.price))}`}
                    />
                    <h4>How much would you like to borrow?</h4>
                    <p>You can set the amount you want to borrow or use the percentage buttons below.
                        These percentages are calculated from Borrow limit – Borrow limit used. We don't recommend borrowing at 100% to avoid liquidation.</p>
                    <Input labelPosition="right" type="float" style={{ width: '100%', marginBottom: '1rem' }}>
                        <input value={borrowAmount} onChange={(e) => setBorrowAmount(e.target.value)} />
                        <Label>{Token.symbol}</Label>
                    </Input>

                    <ButtonPercent Liquidity={CalculateBorrow()} setUpdate={setBorrowAmount} />

                    <p>You can borrow a maximum of {CalculateBorrow()} {Token.symbol}</p>
                </Container>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='orange' onClick={handleBorrow}>
                    Borrow!
                </Button>
            </Modal.Actions>
        </Modal>
    )
}

const RepayModal = (props) => {
    const { Visible, SetVisible, Token, UserData, UserTokenData } = props
    const [repayAmount, setRepayAmount] = useState(0)
    const { library, account } = useWeb3React()

    const handleRepay = async () => {
        const provider = account ? library.getSigner() : library;
        const ERC20Contract = new ethers.Contract(Token.tokenAddr, IERC20.abi, provider)
        const LendingContract = new ethers.Contract(lendingPoolAddress, LendingPool.abi, provider)
        await ERC20Contract.approve(lendingPoolAddress, ethers.utils.parseUnits(repayAmount.toString(), 18))
        const tx = await LendingContract.repayByAmount(Token.tokenAddr, ethers.utils.parseUnits(repayAmount.toString().slice(0, 8), 18))

        await tx.wait()
        handleCloseVisible()
        window.location.reload()
    }

    const handleCloseVisible = () => {
        setRepayAmount(0)
        SetVisible(false)
    }

    const CalculateRepay = () => {
        const maxRepay = (UserData.tBorrowBalance) / Token.price
        return maxRepay > UserTokenData.tBorrowBalance ? fixNumber(UserTokenData.liquidityBalance) : fixNumber(maxRepay)
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
            <Header icon='dollar sign' content='Repay' />
            <Modal.Content>
                <Container>
                    <Item
                        title="Borrow balance"
                        content={`${UserTokenData.borrowBalance} ${Token.symbol}`}
                        end={`($${fixNumber(UserTokenData.borrowBalance * Token.price)})`} />
                    <Item
                        title="Wallet balance"
                        content={`${UserTokenData.balance} ${Token.symbol}`}
                        end={`($${fixNumber(UserTokenData.balance * Token.price)})`} />

                    <Item
                        title="Borrow Limit used"
                        content={`${fixNumber(UserData.tBorrowBalance / UserData.tCollateralBalance * 100, 2)}% -> ${fixNumber((UserData.tBorrowBalance - repayAmount * Token.price) / UserData.tCollateralBalance * 100, 2)} `}
                    />
                    <Item
                        title="Borrow Limit"
                        content={`$${UserData.tCollateralBalance}`}
                    />

                    <h4>How much would you like to repay?</h4>
                    <p>You can set the amount you want to repay or use the percentage buttons below.
                        These percentages are according to your 'Wallet balance'..</p>

                    <Input labelPosition="right" type="float" style={{ width: '100%', marginBottom: '1rem' }}>
                        <input value={repayAmount} onChange={(e) => setRepayAmount(e.target.value)} />
                        <Label>{Token.symbol}</Label>
                    </Input>

                    <ButtonPercent Liquidity={CalculateRepay()} setUpdate={setRepayAmount} />

                    <p>You can repay a maximum of {CalculateRepay()} {Token.symbol}</p>
                </Container>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='orange' onClick={handleRepay}>
                    Repay!
                </Button>
            </Modal.Actions>
        </Modal>
    )
}

export default Borrow