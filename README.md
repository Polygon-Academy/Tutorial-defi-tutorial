# Defi Tutorial - A Lending Protocol

Here is an awesome Smart Lending Protocol. It shows you how to implement a lending protocol that can borrow and clear ERC20 tokens from multiple parties, and optimize lending rates.

# 0. Project Introduction

Lending Protocol Project Showcase, Introduction, Screenshots

# Lending Protocol Showcase

![img](https://avatars.githubusercontent.com/u/88427645?s=200&v=4)

Use Starter Kits to quickly deploy a DAPP

An Polygon Starter Kit Tutorial containing React, @web3-react, Infura.

[Developer Docs](https://docs.matic.network/docs/develop/getting-started) - [Tutorial](https://polygon-tutorial.solidstake.net/shelves/tutorial)

## LendingPool

> Refer: https://github.com/AlphaFinanceLab/alpha-lending-smart-contract

#### Screenshots

[![deposit.png](https://polygon-tutorial.solidstake.net/uploads/images/gallery/2021-09/scaled-1680-/Gthz42UYGFQBjOJy-deposit.png)](https://polygon-tutorial.solidstake.net/uploads/images/gallery/2021-09/Gthz42UYGFQBjOJy-deposit.png)

[![project.png](https://polygon-tutorial.solidstake.net/uploads/images/gallery/2021-09/scaled-1680-/QyjxN5frocFKQBA2-project.png)](https://polygon-tutorial.solidstake.net/uploads/images/gallery/2021-09/QyjxN5frocFKQBA2-project.png)


#### URL:
[Polygon-Academy defi-tutorial](https://github.com/Polygon-Academy/defi-tutorial)

#  1. Lending Protocol Terminology Explains

How does Price Oracle function in different parts of lending protocol, such as deposit, lending rate calculation, etc.



# Price Oracle

##### Price Oracle

- `Base Rate`: the exchange rate with `USD`

Search for the latest price and transmit the data to our lending protocol. Generally, Smart Contract needs to react immediately with the price update, especially in Defi Industry.

![img](https://assets-global.website-files.com/5f6b7190899f41fb70882d08/5f92d52787c34081c67386ea_solutions-diagram-poster.jpg)

------

Usually in Swap Protocols, in order to evaluate the risks of Investments, each and every execution or procedure is heavily dependent on accurate **Asset** Price. Meanwhile in Lending Protocols, it's more about approximate value evaluation of deposited asset, lending asset, and the health of user deposited asset, is it required to liquidate to ensure the stability of the system, etc.

\1. Lending Protocol Terminology Explains

# Deposit

[![whitepaper-deposit.png](https://polygon-tutorial.solidstake.net/uploads/images/gallery/2021-09/scaled-1680-/OZSgt1RmeZtlzXzv-whitepaper-deposit.png)](https://polygon-tutorial.solidstake.net/uploads/images/gallery/2021-09/OZSgt1RmeZtlzXzv-whitepaper-deposit.png)


Here is an example of the diagram above. Alice first deposits one of the supported assets, such as BNB, into the protocol. Once deposited, the deposited BNB is added into a pooled fund, which is referred to as the Total Liquidity. This Total Liquidity is calculated as follows:


**<center>Total Liquidity = Total Available Liquidity + Total Borrows</center>**


Total Available Liquidity is the liquidity available of that asset for borrowers to borrow or lenders to withdraw. The Total Borrows of an asset is the sum of the total borrowed amount and the accumulated borrow interest from all borrowers. Total Borrows is calculated as follows:

**<center>Total Borrows = Borrow Amount + Cumulative Borrow Interest</center>**

This means that Total Liquidity will continue to grow as Cumulative Borrow Interest grows over-time.
More details on interest rate can be found in section 3.5.  **[Interest Rate Dynamics](https://polygon-tutorial.solidstake.net/books/defi-tutorial/page/interest-rate-dynamics)** .
Alice will receive alTokens, such as alBNB, that represent her share of BNB deposited to Total Liquidity
of BNB. alToken is a tokenized representation of the user’s lending position, and is an interest-bearing
BEP20 token, which means an alToken can claim more of the underlying asset over-time as Total Liquidity grows from interest collected from the borrowers. Number of alTokens each user receives is calculated as follows:

**<center>Number of alTokens = Deposit Amount * Total alToken / Total Liquidity</center>**

Total alToken is set based on the first user who deposits this asset. For example, if Bob is the first user who deposits 1,000 BNB, then Total alBNB starts with 1,000 alBNB. If Alice then adds 100 BNB when the Total Liquidity is 1,000 BNB, then Alice gets 100 alBNB (100 * 1,000 / 1,000).

> **Refer:** **[Aplha LendingPool WhitePaper](https://github.com/AlphaFinanceLab/alpha-lending-smart-contract/blob/master/documents/Alpha%20Lending%20Whitepaper.pdf)**



## Borrow

[![whitepaper-borrow.png](https://polygon-tutorial.solidstake.net/uploads/images/gallery/2021-09/scaled-1680-/Y46QCzAVLPKJiYwT-whitepaper-borrow.png)](https://polygon-tutorial.solidstake.net/uploads/images/gallery/2021-09/Y46QCzAVLPKJiYwT-whitepaper-borrow.png)


Before a user can borrow, they have to first deposit some of their assets that can be used as collateral on the protocol. Upon depositing such assets, the user receives alTokens, representing the user’s shares in the
assets’ pools. . Note that some assets are not accepted as collateral in order to protect the protocol’s security. Even if these alTokens are used as collateral, the user will still earn deposit interest on them since other users are borrowing the underlying asset from the asset pool and paying borrow interest to the pool, or Total Liquidity.

For example, Alice can deposit BUSD, one of the available collateral assets, into the protocol and receives a balance of alBUSD that represents her share in the total BUSD pool . Alice can then use this alBUSD as collateral, enabling her to borrow other assets such as ETH. In this case, Alice is earning deposit interest on BUSD and paying borrow interest on ETH. More details on interest rates can be found in section 3.5. Interest Rate Dynamics.
Each asset that can be used as collateral has an assigned **Asset Maximum Loan-to-value (LTV)**. For instance, if Alice deposits $100 worth of BUSD, which has an Asset Maximum LTV of 75%, then Alice can borrow any asset with the Borrow Limit of $75. Borrow Limit is calculated based on the total value of deposited assets that can be used as collateral and Asset Maximum LTV of each deposited asset. Specifically, the Borrow Limit for an asset can be calculated as follows:

**<center>Borrow Limit = (Deposit Value in USD of Asset1 \* Asset Maximum LTV1 + Deposit Value in USD for Asset2 \* Asset Maximum LTV2 + ...)</center>**

&nbsp; 


A user can only borrow if the Account Health remains healthy after taking into account the new borrow amount. Account Health can be calculated as follows:

**<center>Account Health = Healthy (borrow value ≤ Borrow Limit) </center>**
**<center>Account Health = Unhealthy (borrow value > Borrow Limit) </center>**

**Borrowing process**

When a user borrows and receives the borrowed amount, the protocol calculates how many Borrow Shares the borrowed amount equals to. Borrow Shares represent the share of the user’s borrowed amount to the Total Borrows of that asset. Borrow Shares is calculated as follows:
Borrow Shares = (Borrow Amount * Total Borrow Shares) / Total Borrows
The number of Total Borrow Shares is set based on the first user who borrows this asset. For example, if Bob is the first user who borrows 1,000 BNB, then the number of Total Borrow Shares starts with 1,000. If Alice then borrows 100 BNB when the Total Borrows is 1,000 BNB, then Alice gets 100 Borrow Shares (100 * 1,000 / 1,000).

> **Refer:** **[Aplha LendingPool WhitePaper](https://github.com/AlphaFinanceLab/alpha-lending-smart-contract/blob/master/documents/Alpha%20Lending%20Whitepaper.pdf)**



## Withdraw

[![whitepaper-withdraw.png](https://polygon-tutorial.solidstake.net/uploads/images/gallery/2021-09/scaled-1680-/mATiFPG9IOY4L2lr-whitepaper-withdraw.png)](https://polygon-tutorial.solidstake.net/uploads/images/gallery/2021-09/mATiFPG9IOY4L2lr-whitepaper-withdraw.png)

A user can withdraw the amount only if there is enough Total Available Liquidity to do so and if the Account Health remains healthy after the transaction.
Withdrawing process

To withdraw a part or all of the deposited amount, the protocol calculates Withdraw Shares from the withdraw amount inputted, burns alTokens equal to the number of Withdraw Shares, and transfers the withdraw amount to the user. Withdraw Shares is calculated as follows:

**<center>Withdraw Shares = Withdraw Amount * Total alToken / Total Liquidity</center>**

&nbsp; 

Because Total Liquidity increases over-time from accruing borrow interest, the same withdrawal amount will equal smaller Withdraw Shares over-time, and thus burns fewer alTokens to claim the same withdraw amount. If the user withdraws all of the deposited amount, the user will receive a withdraw amount that is more than the originally deposited amount from accruing deposit interest. More details on interest rates can be found in section 3.5. **[Interest Rate Dynamics](https://polygon-tutorial.solidstake.net/books/defi-tutorial/page/interest-rate-dynamics)**.

> **Refer:** **[Aplha LendingPool WhitePaper](https://github.com/AlphaFinanceLab/alpha-lending-smart-contract/blob/master/documents/Alpha%20Lending%20Whitepaper.pdf)**



## Repay

[![whitepaper-repay.png](https://polygon-tutorial.solidstake.net/uploads/images/gallery/2021-09/scaled-1680-/5hgBInXkiwGEkYVt-whitepaper-repay.png)](https://polygon-tutorial.solidstake.net/uploads/images/gallery/2021-09/5hgBInXkiwGEkYVt-whitepaper-repay.png)

To repay a part or all of the borrowed amount, the protocol calculates Repay Shares from the repay amount inputted, transfers the repay amount to the pool, and reduces Borrow Shares by Repay Shares. Repay Shares is calculated as follows:

**<center>Repay Shares = Repay Amount * Total Borrow Shares / Total Borrows</center>**

&nbsp; 

Because Total Borrows increases over-time from accruing borrow interest, the same repay amount will equal smaller Repay Shares over-time, reducing Borrow Shares by a smaller Repay Shares. If the user repays all of the borrowed amount, the user will pay more than the original amount because of accrued borrow interest. More details on interest rate can be found in section 3.5. Interest Rate Dynamics.



## Interest Rates Dynamics

Interest rates for borrowers and lenders are determined by Utilization Rate. Utilization Rate is calculated as follows:

**<center>Utilization Rate = Total Borrows / Total Liquidity</center>**

&nbsp; 


Because the Utilization Rate reflects the demand to borrow an asset, a higher Utilization Rate corresponds to a higher cost of borrowing or borrow interest rate. Each asset has its own base borrow rate and Optimal Utilization Rate, or the specific Utilization Rate that marks the beginning of a sharp rise in Borrow Interest Rate to protect the liquidity in the pool. Therefore, Borrow Interest Rate1 and Borrow Interest Rate2 when Utilization Rate is below and above Optimal Utilization Rate can be calculated as:

*Borrow Interest Rate1 when Utilization Rate < Optimal Utilization Rate:*

**<center>Borrow Interest Rate = Base Borrow Rate + (Utilization Rate * Slope1)</center>**

&nbsp; 


*Borrow Interest Rate2 when Utilization Rate > Optimal Utilization Rate:*

**<center>Borrow Interest Rate = Slope1 + [(Utilization Rate - Optimal Utilization Rate)/(100% - Optimal Utilization Rate) * Slope2]</center>**   

&nbsp; 

5-10% of the Borrow Interest Rate will be allocated for Pool Reserve as an insurance for the pool. Since the accumulated borrow interest are added to Total Liquidity and the alTokens that lenders receive can claim the share of Total Liquidity, the higher borrow interest rate corresponds to the higher Deposit Interest Rate, which can be calculated as:

**<center>Deposit Interest Rate = Borrow Interest Rate * Utilization Rate</center>**



# 2. Lending Protocol Core Components Code

How to semantically normalize the implementation of the Lending protocol, core code (Smart Contract)

\2. Lending Protocol Core Components Code

# Price Oracle Protocol

##### StdReferenceBasic.sol

```javascripts
# StdReferenceBasic.sol 

contract StdReferenceBasic is Ownable, StdReferenceBase {
    event RefDataUpdate(string symbol, uint64 rate, uint64 lastUpdate);
    
    struct RefData {
        uint64 rate; // USD-rate, multiplied by 1e9.
        uint64 lastUpdate; // UNIX epoch when data is last updated.
    }

    mapping(string => RefData) public refs; // Mapping from symbol to ref data.

    function relay(
        string[] memory _symbols,
        uint64[] memory _rates,
        uint64[] memory _resolveTimes
    ) external onlyOwner {
        uint256 len = _symbols.length;
        require(_rates.length == len, "BAD_RATES_LENGTH");
        require(_resolveTimes.length == len, "BAD_RESOLVE_TIMES_LENGTH");
        for (uint256 idx = 0; idx < len; idx++) {
            refs[_symbols[idx]] = RefData({
                rate: _rates[idx],
                lastUpdate: _resolveTimes[idx]
            });
            emit RefDataUpdate(_symbols[idx], _rates[idx], _resolveTimes[idx]);
        }
    }

    function getReferenceData(string memory _base, string memory _quote)
        public
        override
        view
        returns (ReferenceData memory)
    {
        (uint256 baseRate, uint256 baseLastUpdate) = _getRefData(_base);
        (uint256 quoteRate, uint256 quoteLastUpdate) = _getRefData(_quote);
        return
            ReferenceData({
                rate: (baseRate * 1e18) / quoteRate,
                lastUpdatedBase: baseLastUpdate,
                lastUpdatedQuote: quoteLastUpdate
            });
    }

    function _getRefData(string memory _symbol)
        internal
        view
        returns (uint256 rate, uint256 lastUpdate)
    {
        if (keccak256(bytes(_symbol)) == keccak256(bytes("USD"))) {
            return (1e9, now);
        }
        RefData storage refData = refs[_symbol];
        require(refData.lastUpdate > 0, "REF_DATA_NOT_AVAILABLE");
        return (uint256(refData.rate), uint256(refData.lastUpdate));
    }
```

####  Execution steps

BandPriceOracle.sol -> StdReferenceProxy.sol(upgradable StdReference) -> StdReferenceBasic.sol

# 2. Lending Protocol Core Components Code

# Pool Configuration

##### configure struct

```
  // optimal utilization rate at 80%
  uint256 public constant OPTIMAL_UTILIZATION_RATE = 0.8 * 1e18; 
  
  
  // excess utilization rate at 20%
  uint256 public constant EXCESS_UTILIZATION_RATE = 0.2 * 1e18;

  uint256 public baseBorrowRate;
  uint256 public rateSlope1;
  uint256 public rateSlope2;
  uint256 public collateralPercent;
  uint256 public liquidationBonusPercent;
```

##### calcaulate InterestRate

```
  function calculateInterestRate(uint256 _totalBorrows, uint256 _totalLiquidity)
    external
    override(IPoolConfiguration)
    view
    returns (uint256)
  {
    uint256 utilizationRate = getUtilizationRate(_totalBorrows, _totalLiquidity);

    if (utilizationRate > OPTIMAL_UTILIZATION_RATE) {
      uint256 excessUtilizationRateRatio = utilizationRate.sub(OPTIMAL_UTILIZATION_RATE).wadDiv(
        EXCESS_UTILIZATION_RATE
      );
      return baseBorrowRate.add(rateSlope1).add(rateSlope2.wadMul(excessUtilizationRateRatio));
    } else {
      return
        baseBorrowRate.add(utilizationRate.wadMul(rateSlope1).wadDiv(OPTIMAL_UTILIZATION_RATE));
    }
  }
```

\2. Lending Protocol Core Components Code

# LendingPool.sol

##### InitPool

```javascripts
  function initPool(ERC20 _token, IPoolConfiguration _poolConfig) external onlyOwner {
    for (uint256 i = 0; i < tokenList.length; i++) {
      require(tokenList[i] != _token, "this pool already exists on lending pool");
    }
    string memory alTokenSymbol = string(abi.encodePacked("al", _token.symbol()));
    string memory alTokenName = string(abi.encodePacked("Al", _token.symbol()));
    AlToken alToken = alTokenDeployer.createNewAlToken(alTokenName, alTokenSymbol, _token);
    Pool memory pool = Pool(
      PoolStatus.INACTIVE,
      alToken,
      _poolConfig,
      0,
      0,
      0,
      block.timestamp,
      0,
      0
    );
    pools[address(_token)] = pool;
    tokenList.push(_token);
    emit PoolInitialized(address(_token), address(alToken), address(_poolConfig));
  }
```

##### updatePoolWithInterestsAndTimestamp

```
  modifier updatePoolWithInterestsAndTimestamp(ERC20 _token) {
    Pool storage pool = pools[address(_token)];
    uint256 borrowInterestRate = pool.poolConfig.calculateInterestRate(
      pool.totalBorrows,
      getTotalLiquidity(_token)
    );
    uint256 cumulativeBorrowInterest = calculateLinearInterest(
      borrowInterestRate,
      pool.lastUpdateTimestamp,
      block.timestamp
    );

    // update pool
    uint256 previousTotalBorrows = pool.totalBorrows;
    pool.totalBorrows = cumulativeBorrowInterest.wadMul(pool.totalBorrows);
    pool.poolReserves = pool.poolReserves.add(
      pool.totalBorrows.sub(previousTotalBorrows).wadMul(reservePercent)
    );
    pool.lastUpdateTimestamp = block.timestamp;
    emit PoolInterestUpdated(address(_token), cumulativeBorrowInterest, pool.totalBorrows);
    _;
  }
```

##### calculateLinearIntereset

```
  function calculateLinearInterest(
    uint256 _rate,
    uint256 _fromTimestamp,
    uint256 _toTimestamp
  ) internal pure returns (uint256) {
    return
      _rate.wadMul(_toTimestamp.sub(_fromTimestamp)).wadDiv(SECONDS_PER_YEAR).add(WadMath.wad());
  }
```

