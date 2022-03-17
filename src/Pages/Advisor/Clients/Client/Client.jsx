import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { demoClientEmpty } from '../../demoData'
import './Client.css'

const Client = ({ advisor, client, setClient }) => {
	const [searchParams] = useSearchParams()

	const [accounts, setAccounts] = useState([])
	const [accountsNonTradeable, setAccountsNonTradeable] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [totalBalance, setTotalBalance] = useState(0)
	const [totalBalanceNonTradeable, setTotalBalanceNonTradeable] = useState(0)
	const [totalPercent, setTotalPercent] = useState(100)
	const [totalPercentNonTradeable, setTotalPercentNonTradeable] = useState(100)

	useEffect(async () => {
		setIsLoading(true)
		setClient(demoClientEmpty)
		const advisorId = advisor.idToken.payload.sub
		const clientId = searchParams.get('clientId')

		await fetch(`https://blockria.com/coinbase/client?advisorId=${advisorId}&clientId=${clientId}`)
			.then(response => response.json())
			.then(newClient => {
				console.log(newClient)
				localStorage.setItem('client', JSON.stringify(newClient))
				setClient(newClient)
			})
			.catch(error => alert(error))

		setIsLoading(false)
	}, [])

	useEffect(() => {
		let newTotalBalance = 0
		let newTotalBalanceNonTradeable = 0
		client.accounts.forEach(({ currency, native_balance, type }) => {
			if (currency !== 'ETH2' && type !== 'vault') newTotalBalance += Number(native_balance.amount)
			else newTotalBalanceNonTradeable += Number(native_balance.amount)
		})
		setTotalBalance(newTotalBalance)
		setTotalBalanceNonTradeable(newTotalBalanceNonTradeable)

		let newTotalPercent = 0
		let newTotalPercentNonTradeable = 0
		client.accounts.forEach(({ currency, native_balance, type }) => {
			if (currency !== 'ETH2' && type !== 'vault' && newTotalBalance !== 0) {
				const percentRounded = (Number(native_balance.amount) / newTotalBalance).toFixed(2)
				newTotalPercent += Number(percentRounded)
			} else if ((currency === 'ETH2' || type === 'vault') && newTotalBalanceNonTradeable !== 0) {
				const percentRounded = (Number(native_balance.amount) / newTotalBalanceNonTradeable).toFixed(2)
				newTotalPercentNonTradeable += Number(percentRounded)
			}
		})
		setTotalPercent(newTotalPercent)
		setTotalPercentNonTradeable(newTotalPercentNonTradeable)

		setAccounts(client.accounts.filter(({ currency, type }) => currency !== 'ETH2' && type !== 'vault'))
		setAccountsNonTradeable(client.accounts.filter(({ currency, type }) => currency === 'ETH2' || type === 'vault'))
	}, [client])

	function renderAccount({ balance, id, name, native_balance }, tradeable = true) {
		const denominator = tradeable ? totalBalance : totalBalanceNonTradeable
		console.log(name, denominator)
		if (Number(balance.amount)) {
			return (
				<tr key={`Account ${id}`}>
					<td>
						{(Number(native_balance.amount) / denominator).toLocaleString('en-US', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
							style: 'percent'
						})}
					</td>
					<td>
						{Number(native_balance.amount).toLocaleString('en-US', {
							currency: native_balance.currency,
							style: 'currency'
						})}
					</td>
					<td>{balance.currency}</td>
					<td>{name}</td>
					<td>{balance.amount}</td>
				</tr>
			)
		}
	}

	return (
		<div className='Client'>
			<div className='Title'>
				{searchParams.get('clientName')}
				{client.user.email ? ` - ${client.user.email}` : ''}
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
				<caption>Overview</caption>
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
							{accounts
								.sort((a, b) => Number(b.native_balance.amount) - Number(a.native_balance.amount))
								.map(account => renderAccount(account, true))}
							<tr className='Totals'>
								<td>
									{totalPercent.toLocaleString('en-US', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
										style: 'percent'
									})}
								</td>
								<td>
									{totalBalance.toLocaleString('en-US', {
										style: 'currency',
										currency: accounts.length ? accounts[0].native_balance.currency : 'USD'
									})}
								</td>
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
						{accountsNonTradeable
							.sort((a, b) => Number(b.native_balance.amount) - Number(a.native_balance.amount))
							.map(accountNonTradeable => renderAccount(accountNonTradeable, false))}
						<tr className='Totals'>
							<td>
								{totalPercentNonTradeable.toLocaleString('en-US', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
									style: 'percent'
								})}
							</td>
							<td>
								{totalBalanceNonTradeable.toLocaleString('en-US', {
									style: 'currency',
									currency: accountsNonTradeable.length ? accountsNonTradeable[0].native_balance.currency : 'USD'
								})}
							</td>
						</tr>
					</tbody>
				</table>
			) : null}
		</div>
	)
}

export default Client
