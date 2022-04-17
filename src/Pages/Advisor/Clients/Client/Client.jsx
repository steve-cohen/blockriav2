import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ClientPortfolio from './ClientPortfolio'
import coinbaseTokenNames from '../../coinbaseTokenNames.json'
import './Client.css'

const displayTypes = {
	buy: 'Buy',
	fiat_deposit: 'Deposit',
	fiat_withdrawal: 'Withdrawal',
	sell: 'Sell',
	send: 'Send'
}

function formatPercent(number) {
	return number.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		style: 'percent'
	})
}

function formatUSD(number) {
	return number.toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

function getSpotPrice(holding) {
	return fetch(`https://blockria.com/v2/prices/${holding}-USD/spot`)
		.then(response => response.json())
		.catch(console.log)
}

const Client = ({ advisor }) => {
	const [searchParams] = useSearchParams()

	const [accounts, setAccounts] = useState([])
	const [accountsNonTradeable, setAccountsNonTradeable] = useState([])
	const [portfolioId, setPortfolioId] = useState(0)
	const [rebalanceFrequency, setRebalanceFrequency] = useState('')
	const [spotPrices, setSpotPrices] = useState({})
	const [totalBalance, setTotalBalance] = useState(0)
	const [totalBalanceNonTradeable, setTotalBalanceNonTradeable] = useState(0)
	const [totalPercent, setTotalPercent] = useState(1)
	const [totalPercentNonTradeable, setTotalPercentNonTradeable] = useState(1)
	const [taxEvents, setTaxEvents] = useState([])
	const [transactions, setTransactions] = useState([])

	useEffect(() => {
		const advisorId = advisor.idToken.payload.sub
		const clientId = searchParams.get('clientId')

		// Get Client
		fetch(`https://blockria.com/api/coinbase/clients/client?advisorId=${advisorId}&clientId=${clientId}`)
			.then(response => response.json())
			.then(handleNewClient)
			.catch(console.log)

		// GET Tax Events
		fetch(`https://blockria.com/api/coinbase/clients/client/taxevents?clientId=${clientId}`)
			.then(response => response.json())
			.then(newTaxEvents => setTaxEvents(newTaxEvents.filter(({ type }) => type === 'buy' || type === 'sell')))
			.catch(console.log)

		// GET Transactions
		fetch(`https://blockria.com/api/coinbase/clients/client/transactions?clientId=${clientId}&limit=10`)
			.then(response => response.json())
			.then(setTransactions)
			.catch(console.log)
	}, [advisor.idToken.payload.sub, searchParams])

	async function handleNewClient(newClient) {
		console.log({ newClient })

		// [1.0] GET Spot Prices
		// [1.1] Format Currencies
		let currencies = {}
		newClient.holdings.forEach(({ balance }) => {
			if (balance.currency !== 'USD') currencies[balance.currency] = true
		})

		// [1.2] GET Spot Prices
		const spotPricesResponse = await Promise.all(Object.keys(currencies).map(getSpotPrice))

		// [1.3] Format Spot Prices
		let newSpotPrices = { USD: 1 }
		spotPricesResponse.forEach(({ data }) => (newSpotPrices[data.base] = Number(data.amount)))
		console.log({ newSpotPrices })

		// [2.0] Separate Tradeable and NonTradeable Accounts
		let newAccounts = []
		let newAccountsNonTradeable = []
		newClient.holdings.forEach(holding => {
			if (holding.type !== 'vault' && holding.balance.currency !== 'ETH2') newAccounts.push(holding)
			else newAccountsNonTradeable.push(holding)
		})
		console.log(newAccounts)

		// [3.0] Calculate Tradeable Total Balance and NonTradeable Total Balance
		let newTotalBalance = 0
		let newTotalBalanceNonTradeable = 0
		newAccounts.forEach(({ balance }, index) => {
			const newBalance = newSpotPrices[balance.currency] * balance.amount
			newTotalBalance += newBalance
			newAccounts[index].nativeBalance = newBalance
		})
		newAccountsNonTradeable.forEach(({ balance }, index) => {
			const newBalance = newSpotPrices[balance.currency] * balance.amount
			newTotalBalanceNonTradeable += newBalance
			newAccountsNonTradeable[index].nativeBalance = newBalance
		})
		console.log(newTotalBalance)

		// [4.0] Calculate Tradeable Total Percent and NonTradeable Total Percent
		let newTotalPercent = 0
		let newTotalPercentNonTradeable = 0
		newAccounts.forEach(({ balance }, index) => {
			const newBalance = newSpotPrices[balance.currency] * balance.amount
			const percent = Number(newBalance / newTotalBalance)
			newTotalPercent += percent
			newAccounts[index].nativePercent = percent
		})
		newAccountsNonTradeable.forEach(({ balance }, index) => {
			const newBalance = newSpotPrices[balance.currency] * balance.amount
			const percent = Number(newBalance / newTotalBalanceNonTradeable)
			newTotalPercentNonTradeable += percent
			newAccountsNonTradeable[index].nativePercent = percent
		})
		console.log(newTotalPercent)

		// [5.0] Sort Accounts by Native Percent
		newAccounts = newAccounts.sort((a, b) => b.nativePercent - a.nativePercent)
		newAccountsNonTradeable = newAccountsNonTradeable.sort((a, b) => b.nativePercent - a.nativePercent)

		// [6.0] Update State
		setAccounts(newAccounts)
		setAccountsNonTradeable(newAccountsNonTradeable)
		setPortfolioId(newClient.portfolioId)
		setRebalanceFrequency(newClient.rebalanceFrequency)
		setSpotPrices(newSpotPrices)
		setTotalBalance(newTotalBalance)
		setTotalBalanceNonTradeable(newTotalBalanceNonTradeable)
		setTotalPercent(newTotalPercent)
		setTotalPercentNonTradeable(newTotalPercentNonTradeable)
	}

	function renderHoldings(isTradeable) {
		const holdings = isTradeable ? accounts : accountsNonTradeable
		const nativeBalance = isTradeable ? totalBalance : totalBalanceNonTradeable
		const nativePercent = isTradeable ? totalPercent : totalPercentNonTradeable
		const title = isTradeable ? 'Current Holdings' : 'Current Non-Tradeable Holdings'

		return (
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>
							{title} for {searchParams.get('clientName')}
						</div>
						<div>
							<Link
								className='Button'
								to={`withdrawal?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get('clientId')}`}
							>
								Initiate Withdrawal(s)
							</Link>
							<Link
								className='Button'
								to={`deposit?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get('clientId')}`}
							>
								Initiate Deposit(s)
							</Link>
						</div>
					</div>
				</caption>
				<thead>
					<tr>
						<th>PERCENT</th>
						<th className='AlignRight'>BALANCE</th>
						<th>HOLDING</th>
						<th>NAME</th>
						<th>AMOUNT</th>
						<th>SPOT PRICE</th>
						<th>ALLOW DEPOSITS</th>
						<th>ALLOW WITHDRAWALS</th>
						<th>TYPE</th>
						<th>UPDATED</th>
						<th>CREATED</th>
					</tr>
				</thead>
				<tbody>{holdings.map(renderHolding)}</tbody>
				<tfoot>
					<tr>
						<td className='AlignRight Bold'>{formatPercent(nativePercent)}</td>
						<td className='AlignRight Bold'>{formatUSD(nativeBalance)}</td>
						<td>{holdings.length} Total</td>
					</tr>
				</tfoot>
			</table>
		)
	}

	function renderHolding({
		allow_deposits,
		allow_withdrawals,
		balance,
		created_at,
		currency,
		id,
		nativeBalance,
		nativePercent,
		type,
		updated_at
	}) {
		return (
			<tr key={`Holding ${id}`}>
				<td className='Bold AlignRight'>{formatPercent(nativePercent)}</td>
				<td className='AlignRight'>{formatUSD(nativeBalance)}</td>

				<td className='Bold'>
					{balance.currency !== 'USD' ? (
						<a
							href={`https://coinbase.com/price/${coinbaseTokenNames[balance.currency]
								.replace(/ /g, '-')
								.toLowerCase()}`}
							target='_blank'
							rel='noopener noreferrer'
						>
							{balance.currency}
						</a>
					) : (
						balance.currency
					)}
				</td>
				<td>{currency.name}</td>
				<td>{balance.amount}</td>
				<td className='Break'>{formatUSD(spotPrices[balance.currency] || 0)}</td>
				<td>{allow_deposits ? 'Yes' : 'No'}</td>
				<td>{allow_withdrawals ? 'Yes' : 'No'}</td>
				<td style={{ textTransform: 'capitalize' }}>{type}</td>
				<td>{updated_at.slice(0, 10)}</td>
				<td>{created_at.slice(0, 10)}</td>
			</tr>
		)
	}

	function renderTransactions(newTransactions, type) {
		const clientId = searchParams.get('clientId')
		const clientName = searchParams.get('clientName')

		const link =
			type === 'taxEvents'
				? `taxEvents?clientName=${clientName}&clientId=${clientId}`
				: `transactions?clientName=${clientName}&clientId=${clientId}`
		const showMore = type === 'taxEvents' ? '+ Show All Taxable Events' : '+ Show Full Transaction History'
		const title = type === 'taxEvents' ? 'Taxable Events' : 'Transaction History'

		return (
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>
							{title} for {searchParams.get('clientName')}
						</div>
						<div></div>
					</div>
				</caption>
				<thead>
					<tr>
						<th>DATE</th>
						<th>TIME</th>
						<th>TYPE</th>
						<th>HOLDING</th>
						<th className='AlignRight'>NET</th>
						<th className='AlignRight'>AMOUNT</th>
						<th className='AlignRight'>FEE</th>
						<th className='AlignRight'>UNIT PRICE</th>
						<th>DESCRIPTION</th>
						<th>PAYMENT METHOD</th>
						<th>HOLD</th>
						<th>HOLD UNTIL</th>
						<th>INSTANT</th>
						<th>STATUS</th>
					</tr>
				</thead>
				<tbody>{newTransactions.map(renderTransaction)}</tbody>
				<tfoot>
					<tr>
						<td colSpan={14}>
							<Link to={link}>{showMore}</Link>
						</td>
					</tr>
				</tfoot>
			</table>
		)
	}

	function renderTransaction({ buy, details, fiat_deposit, fiat_withdrawal, id, sell, status, type, updated_at }) {
		if (type === 'buy' || type === 'sell') {
			const change = type === 'buy' ? '-' : '+'
			const event = type === 'buy' ? buy : sell

			return (
				<tr key={`Transaction ${id}`}>
					<td>{updated_at.slice(0, 10)}</td>
					<td>{updated_at.slice(11, 19)}</td>
					<td className='Bold'>{type in displayTypes ? displayTypes[type] : type}</td>
					<td className='Bold'>
						<a
							href={`https://coinbase.com/price/${coinbaseTokenNames[event.amount.currency]
								.replace(/ /g, '-')
								.toLowerCase()}`}
							target='_blank'
							rel='noopener noreferrer'
						>
							{event.amount.currency}
						</a>
					</td>
					<td className={`AlignRight Bold ${type === 'sell' ? 'Green' : ''}${type === 'buy' ? 'Red' : ''}`}>
						{change}
						{formatUSD(event.total.amount)}
					</td>
					<td className='AlignRight'>
						{change}
						{formatUSD(event.subtotal.amount)}
					</td>
					<td className='AlignRight DeEmphasize'>({formatUSD(event.fee.amount)})</td>
					<td className='AlignRight DeEmphasize'>{formatUSD(event.unit_price.amount)}</td>
					<td>{details.title}</td>
					<td className='Break'>{details.payment_method_name}</td>
					<td>{event.hold_days ? `${event.hold_days} Days` : ''}</td>
					<td>{event.hold_until ? event.hold_until.slice(0, 10) : ''}</td>
					<td>{event.instant ? 'Yes' : 'No'}</td>
					<td className={`${status === 'completed' ? 'Green' : 'Red'}`}>{status}</td>
				</tr>
			)
		} else if (type === 'fiat_deposit' || type === 'fiat_withdrawal') {
			const change = type === 'fiat_deposit' ? '+' : '-'
			const event = type === 'fiat_deposit' ? fiat_deposit : fiat_withdrawal

			return (
				<tr key={`Transaction ${id}`}>
					<td>{updated_at.slice(0, 10)}</td>
					<td>{updated_at.slice(11, 19)}</td>
					<td className='Bold'>{type in displayTypes ? displayTypes[type] : type}</td>
					<td className='Bold'>{event.amount.currency}</td>
					<td className={`AlignRight Bold ${type === 'fiat_deposit' ? 'Green' : 'Red'}`}>
						{change}
						{formatUSD(event.amount.amount)}
					</td>
					<td className='AlignRight'>
						{change}
						{formatUSD(event.subtotal.amount)}
					</td>
					<td className='AlignRight DeEmphasize'>({formatUSD(event.fee.amount)})</td>
					<td />
					<td className=''>{details.title}</td>
					<td>{details.payment_method_name}</td>
					<td>{event.hold_days ? `${event.hold_days} Days` : ''}</td>
					<td>{type === 'fiat_deposit' ? event.hold_until.slice(0, 10) : event.payout_at.slice(0, 10)}</td>
					<td>{event.instant ? 'Yes' : 'No'}</td>
					<td className={`${status === 'completed' ? 'Green' : 'Red'}`}>{status}</td>
				</tr>
			)
		}
	}

	return (
		<div className='Client'>
			<ClientPortfolio advisor={advisor} portfolioId={portfolioId} rebalanceFrequency={rebalanceFrequency} />
			{renderHoldings(true)}
			{totalBalanceNonTradeable !== 0 ? renderHoldings(false) : null}
			{renderTransactions(taxEvents.slice(0, 10), 'taxEvents')}
			{renderTransactions(transactions, 'transactions')}
		</div>
	)
}

export default Client
