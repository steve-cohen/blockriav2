import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { demoClientEmpty } from '../../demoData'
import './Client.css'

const Client = ({ advisor, client, setClient }) => {
	const [searchParams] = useSearchParams()
	const [isLoading, setIsLoading] = useState(false)
	const [totalBalance, setTotalBalance] = useState(0)
	const [totalPercent, setTotalPercent] = useState(100)

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
		client.accounts.forEach(({ native_balance }) => (newTotalBalance += Number(native_balance.amount)))
		setTotalBalance(newTotalBalance)

		let newTotalPercent = 0
		client.accounts.forEach(({ native_balance }) => {
			const percentRounded = (Number(native_balance.amount) / newTotalBalance).toFixed(2)
			newTotalPercent += Number(percentRounded)
		})
		setTotalPercent(newTotalPercent)
	}, [client])

	function renderAccount({ balance, id, name, native_balance }) {
		if (Number(balance.amount)) {
			return (
				<tr key={`Account ${id}`}>
					<td>
						{(Number(native_balance.amount) / totalBalance).toLocaleString('en-US', {
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
							{client.accounts
								.sort((a, b) => Number(b.native_balance.amount) - Number(a.native_balance.amount))
								.map(renderAccount)}
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
										currency: client.accounts[0].native_balance.currency
									})}
								</td>
							</tr>
						</>
					)}
				</tbody>
			</table>
		</div>
	)
}

export default Client
