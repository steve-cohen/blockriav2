import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Transactions from './Transactions/Transactions'
import coinbaseTokenNames from '../../coinbaseTokenNames.json'
import './Client.css'

function getSpotPrice(holding) {
	return fetch(`https://blockria.com/v2/prices/${holding}-USD/spot`)
		.then(response => response.json())
		.catch(error => alert(error))
}

const Client = ({ advisor }) => {
	const [searchParams] = useSearchParams()

	const [accounts, setAccounts] = useState([])
	const [accountsNonTradeable, setAccountsNonTradeable] = useState([])

	const [totalBalance, setTotalBalance] = useState(0)
	const [totalBalanceNonTradeable, setTotalBalanceNonTradeable] = useState(0)
	const [totalPercent, setTotalPercent] = useState(1)
	const [totalPercentNonTradeable, setTotalPercentNonTradeable] = useState(1)

	useEffect(async () => {
		const advisorId = advisor.idToken.payload.sub
		const clientId = searchParams.get('clientId')

		await fetch(`https://blockria.com/api/coinbase/clients/client?advisorId=${advisorId}&clientId=${clientId}`)
			.then(response => response.json())
			.then(handleNewClient)
			.catch(error => alert(error))
	}, [])

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
		let spotPrices = { USD: 1 }
		spotPricesResponse.forEach(({ data }) => (spotPrices[data.base] = Number(data.amount)))
		console.log({ spotPrices })

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
			const newBalance = spotPrices[balance.currency] * balance.amount
			newTotalBalance += newBalance
			newAccounts[index].nativeBalance = newBalance
		})
		newAccountsNonTradeable.forEach(({ balance }, index) => {
			const newBalance = spotPrices[balance.currency] * balance.amount
			newTotalBalanceNonTradeable += newBalance
			newAccountsNonTradeable[index].nativeBalance = newBalance
		})
		console.log(newTotalBalance)

		// [4.0] Calculate Tradeable Total Percent and NonTradeable Total Percent
		let newTotalPercent = 0
		let newTotalPercentNonTradeable = 0
		newAccounts.forEach(({ balance }, index) => {
			const newBalance = spotPrices[balance.currency] * balance.amount
			const percent = Number((newBalance / newTotalBalance).toFixed(2))
			newTotalPercent += percent
			newAccounts[index].nativePercent = percent
		})
		newAccountsNonTradeable.forEach(({ balance }, index) => {
			const newBalance = spotPrices[balance.currency] * balance.amount
			const percent = Number((newBalance / newTotalBalanceNonTradeable).toFixed(2))
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
		setTotalBalance(newTotalBalance)
		setTotalBalanceNonTradeable(newTotalBalanceNonTradeable)
		setTotalPercent(newTotalPercent)
		setTotalPercentNonTradeable(newTotalPercentNonTradeable)
	}

	function renderHoldings(isTradeable) {
		const holdings = isTradeable ? accounts : accountsNonTradeable
		const nativeBalance = isTradeable ? totalBalance : totalBalanceNonTradeable
		const nativePercent = isTradeable ? totalPercent : totalPercentNonTradeable
		const title = isTradeable ? 'Holdings' : 'Non-Tradeable Holdings'

		return (
			<table>
				<caption>{title}</caption>
				<thead>
					<tr>
						<th>ALLOCATION</th>
						<th>BALANCE</th>
						<th>HOLDING</th>
						<th>NAME</th>
						<th>AMOUNT</th>
					</tr>
				</thead>
				<tbody>
					{holdings.map(renderHolding)}
					<tr className='Totals'>
						<td>
							{nativePercent.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
								style: 'percent'
							})}
						</td>
						<td>{nativeBalance.toLocaleString('en-US', { currency: 'USD', style: 'currency' })}</td>
					</tr>
				</tbody>
			</table>
		)
	}

	function renderHolding({ balance, id, nativeBalance, nativePercent }) {
		return (
			<tr key={`Account ${id}`}>
				<td>
					{nativePercent.toLocaleString('en-US', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
						style: 'percent'
					})}
				</td>
				<td>
					{nativeBalance.toLocaleString('en-US', {
						currency: 'USD',
						style: 'currency'
					})}
				</td>
				<td>{balance.currency}</td>
				<td>{coinbaseTokenNames[balance.currency]}</td>
				<td>{balance.amount}</td>
			</tr>
		)
	}

	return (
		<div className='Client'>
			<div className='Title'>{searchParams.get('clientName')}</div>
			<div className='Options'>
				<div></div>
				<div>
					<Link
						className='Option'
						to={`withdrawal?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get('clientId')}`}
					>
						Initiate Withdrawal(s)
					</Link>
					<Link
						className='Option'
						to={`deposit?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get('clientId')}`}
					>
						Initiate Deposit(s)
					</Link>
				</div>
			</div>
			{renderHoldings(true)}
			{totalBalanceNonTradeable !== 0 ? renderHoldings(false) : null}
			<Transactions advisorId={advisor.idToken.payload.sub} clientId={searchParams.get('clientId')} />
		</div>
	)
}

export default Client
