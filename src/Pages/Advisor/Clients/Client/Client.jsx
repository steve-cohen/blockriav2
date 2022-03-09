import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './Client.css'

const Client = ({ advisor, client, setClient }) => {
	const [searchParams] = useSearchParams()
	const [isLoading, setIsLoading] = useState(false)

	useEffect(async () => {
		setIsLoading(true)
		const advisorId = advisor.idToken.payload.sub
		const clientId = searchParams.get('clientId')

		await fetch(`https://blockria.com/coinbase/client?advisorId=${advisorId}&clientId=${clientId}`)
			.then(response => response.json())
			.then(newClient => setClient(newClient))
			.catch(error => alert(error))

		setIsLoading(false)
	}, [])

	function renderAccount({ balance, id, name, native_balance }) {
		if (Number(balance.amount)) {
			return (
				<tr key={`Account ${id}`}>
					<td>
						{Number(native_balance.amount).toLocaleString('en-US', {
							style: 'currency',
							currency: native_balance.currency
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
			<div className='Title'>{searchParams.get('clientName')}</div>
			<div className='Options'>
				<div></div>
				<div>
					<Link
						className='Option2'
						to={`deposit?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get('clientId')}`}
					>
						Initiate Deposit(s)
					</Link>
					<Link
						className='Option1'
						to={`withdrawal?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get('clientId')}`}
					>
						Initiate Withdrawal(s)
					</Link>
				</div>
			</div>
			<table>
				<thead>
					<tr>
						{/* <th>ALLOCATION</th> */}
						<th>BALANCE</th>
						<th>HOLDING</th>
						<th>NAME</th>
						<th>AMOUNT</th>
					</tr>
				</thead>
				<tbody>
					{isLoading ? (
						<tr>
							<td>Loading...</td>
						</tr>
					) : (
						client.accounts.map(renderAccount)
					)}
				</tbody>
			</table>
		</div>
	)
}

export default Client
