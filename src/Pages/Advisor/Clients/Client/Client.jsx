import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { demoClientEmpty } from '../../demoData'
import coinbaseTokenNames from '../../coinbaseTokenNames.json'
import './Client.css'

const Client = ({ advisor, client, setClient }) => {
	const [searchParams] = useSearchParams()

	const [accounts, setAccounts] = useState([])
	const [accountsNonTradeable, setAccountsNonTradeable] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [spotPrices, setSpotPrices] = useState({})

	const [totalBalance, setTotalBalance] = useState(0)
	const [totalBalanceNonTradeable, setTotalBalanceNonTradeable] = useState(0)
	const [totalPercent, setTotalPercent] = useState(1)
	const [totalPercentNonTradeable, setTotalPercentNonTradeable] = useState(1)

	useEffect(async () => {
		setIsLoading(true)
		setClient(demoClientEmpty)
		const advisorId = advisor.idToken.payload.sub
		const clientId = searchParams.get('clientId')

		await fetch(`https://blockria.com/api/coinbase/clients/client?advisorId=${advisorId}&clientId=${clientId}`)
			.then(response => response.json())
			.then(async newClient => {
				await getSpotPrices()
				console.log(newClient)
				localStorage.setItem('client', JSON.stringify(newClient))
				setClient(newClient)
			})
			.catch(error => alert(error))

		setIsLoading(false)
	}, [])

	useEffect(() => {
		// Separate Tradeable and NonTradeable Accounts
		let newAccounts = []
		let newAccountsNonTradeable = []
		client.holdings.forEach(holding => {
			if (holding.type !== 'vault' && holding.balance.currency !== 'ETH2') newAccounts.push(holding)
			else newAccountsNonTradeable.push(holding)
		})
		console.log(newAccounts)

		// Calculate Tradeable Total Balance and NonTradeable Total Balance
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

		// Calculate Tradeable Total Percent and NonTradeable Total Percent
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

		// Sort Accounts by Native Percent
		newAccounts = newAccounts.sort((a, b) => b.nativePercent - a.nativePercent)
		newAccountsNonTradeable = newAccountsNonTradeable.sort((a, b) => b.nativePercent - a.nativePercent)

		setAccounts(newAccounts)
		setAccountsNonTradeable(newAccountsNonTradeable)
		setTotalBalance(newTotalBalance)
		setTotalBalanceNonTradeable(newTotalBalanceNonTradeable)
		setTotalPercent(newTotalPercent)
		setTotalPercentNonTradeable(newTotalPercentNonTradeable)
	}, [client])

	async function getSpotPrices() {
		// Format Holdings
		let currencies = {}
		client.holdings.forEach(({ balance }) =>
			balance.currency !== 'USD' ? (currencies[balance.currency] = true) : null
		)
		console.log(currencies)

		// GET Spot Prices
		const spotPricesResponse = await Promise.all(Object.keys(currencies).map(getSpotPrice))

		// Format Spot Prices
		let newSpotPrices = { USD: 1 }
		spotPricesResponse.forEach(({ data }) => (newSpotPrices[data.base] = Number(data.amount)))
		console.log(newSpotPrices)
		setSpotPrices(newSpotPrices)
	}

	function getSpotPrice(holding) {
		return fetch(`https://blockria.com/v2/prices/${holding}-USD/spot`)
			.then(response => response.json())
			.catch(error => alert(error))
	}

	function renderAccount({ balance, id, nativeBalance, nativePercent }) {
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
			<div className='Title'>
				{searchParams.get('clientName')}
				{client.user && client.user.email ? ` - ${client.user.email}` : ''}
			</div>
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
			<table>
				<caption>Holdings</caption>
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
					{isLoading ? (
						<tr>
							<td style={{ border: 'none' }}>Loading...</td>
						</tr>
					) : (
						<>
							{accounts.map(renderAccount)}
							<tr className='Totals'>
								<td>
									{totalBalance !== 0 &&
										totalPercent.toLocaleString('en-US', {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
											style: 'percent'
										})}
								</td>
								<td>{totalBalance.toLocaleString('en-US', { currency: 'USD', style: 'currency' })}</td>
							</tr>
						</>
					)}
				</tbody>
			</table>
			{accountsNonTradeable.length && totalBalanceNonTradeable > 0 ? (
				<table style={{ marginTop: '72px' }}>
					<caption>Non-Tradeable Accounts</caption>
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
						{accountsNonTradeable.map(renderAccount)}
						<tr className='Totals'>
							<td>
								{totalPercentNonTradeable.toLocaleString('en-US', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
									style: 'percent'
								})}
							</td>
							<td>{totalBalanceNonTradeable.toLocaleString('en-US', { currency: 'USD', style: 'currency' })}</td>
						</tr>
					</tbody>
				</table>
			) : null}
		</div>
	)
}

export default Client
