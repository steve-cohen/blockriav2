import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import coinbaseTokenNames from '../../coinbaseTokenNames.json'

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

const ClientHoldings = ({ client }) => {
	const [searchParams] = useSearchParams()

	const [holdings, setHoldings] = useState([])
	const [holdingsNonTradeable, setHoldingsNonTradeable] = useState([])
	const [spotPrices, setSpotPrices] = useState({})
	const [totalBalance, setTotalBalance] = useState(0)
	const [totalBalanceNonTradeable, setTotalBalanceNonTradeable] = useState(0)
	const [totalPercent, setTotalPercent] = useState(1)
	const [totalPercentNonTradeable, setTotalPercentNonTradeable] = useState(1)

	useEffect(() => {
		if (client.clientId) handleNewClient(client)
	}, [client])

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
		let newHoldings = []
		let newHoldingsNonTradeable = []
		newClient.holdings.forEach(holding => {
			if (holding.type !== 'vault' && holding.balance.currency !== 'ETH2') newHoldings.push(holding)
			else newHoldingsNonTradeable.push(holding)
		})
		console.log(newHoldings)

		// [3.0] Calculate Tradeable Total Balance and NonTradeable Total Balance
		let newTotalBalance = 0
		let newTotalBalanceNonTradeable = 0
		newHoldings.forEach(({ balance }, index) => {
			const newBalance = newSpotPrices[balance.currency] * balance.amount
			newTotalBalance += newBalance
			newHoldings[index].nativeBalance = newBalance
		})
		newHoldingsNonTradeable.forEach(({ balance }, index) => {
			const newBalance = newSpotPrices[balance.currency] * balance.amount
			newTotalBalanceNonTradeable += newBalance
			newHoldingsNonTradeable[index].nativeBalance = newBalance
		})
		console.log(newTotalBalance)

		// [4.0] Calculate Tradeable Total Percent and NonTradeable Total Percent
		let newTotalPercent = 0
		let newTotalPercentNonTradeable = 0
		newHoldings.forEach(({ balance }, index) => {
			const newBalance = newSpotPrices[balance.currency] * balance.amount
			const percent = Number(newBalance / newTotalBalance)
			newTotalPercent += percent
			newHoldings[index].nativePercent = percent
		})
		newHoldingsNonTradeable.forEach(({ balance }, index) => {
			const newBalance = newSpotPrices[balance.currency] * balance.amount
			const percent = Number(newBalance / newTotalBalanceNonTradeable)
			newTotalPercentNonTradeable += percent
			newHoldingsNonTradeable[index].nativePercent = percent
		})
		console.log(newTotalPercent)

		// [5.0] Sort Accounts by Native Percent
		newHoldings = newHoldings.sort((a, b) => b.nativePercent - a.nativePercent)
		newHoldingsNonTradeable = newHoldingsNonTradeable.sort((a, b) => b.nativePercent - a.nativePercent)

		// [6.0] Update State
		setHoldings(newHoldings)
		setHoldingsNonTradeable(newHoldingsNonTradeable)
		setSpotPrices(newSpotPrices)
		setTotalBalance(newTotalBalance)
		setTotalBalanceNonTradeable(newTotalBalanceNonTradeable)
		setTotalPercent(newTotalPercent)
		setTotalPercentNonTradeable(newTotalPercentNonTradeable)
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

	return (
		<>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Current Holdings for {searchParams.get('clientName')}</div>
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
						<th>LAST TRANSACTION</th>
						<th>CREATED</th>
					</tr>
				</thead>
				<tbody>{holdings.map(renderHolding)}</tbody>
				<tfoot>
					<tr>
						<td className='AlignRight Bold'>{formatPercent(totalPercent)}</td>
						<td className='AlignRight Bold'>{formatUSD(totalBalance)}</td>
						<td>{holdings.length} Total</td>
					</tr>
				</tfoot>
			</table>
			{totalBalanceNonTradeable ? (
				<table>
					<caption>
						<div className='Flex'>
							<div className='Title'>Current Non-Tradeable Holdings for {searchParams.get('clientName')}</div>
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
							<th>LAST TRANSACTION</th>
							<th>CREATED</th>
						</tr>
					</thead>
					<tbody>{holdingsNonTradeable.map(renderHolding)}</tbody>
					<tfoot>
						<tr>
							<td className='AlignRight Bold'>{formatPercent(totalPercentNonTradeable)}</td>
							<td className='AlignRight Bold'>{formatUSD(totalBalanceNonTradeable)}</td>
							<td>{holdings.length} Total</td>
						</tr>
					</tfoot>
				</table>
			) : null}
		</>
	)
}

export default ClientHoldings
