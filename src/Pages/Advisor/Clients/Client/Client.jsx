import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './Client.css'

const Client = ({ clients, portfolios }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [clientName, setClientName] = useState('')
	const [nonzeroAccounts, setNonzeroAccounts] = useState([])
	const [portfolioId, setPortfolioId] = useState('')

	useEffect(() => {
		const client = clients.filter(({ clientId }) => clientId.S === searchParams.get('clientId'))

		if (client.length) {
			setClientName(client[0].clientName.S)
			setPortfolioId(client[0].portfolioId.S)
			setNonzeroAccounts(JSON.parse(client[0].nonzeroAccounts.S))
		}
	}, [])

	function renderNonZeroAccount({ balance, id, name, native_balance }) {
		console.log(nonzeroAccounts)

		return (
			<tr key={`NonZeroAccount ${id}`}>
				{/* <td></td> */}
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

	return (
		<div className='Client'>
			<div className='Title'>{clientName}</div>
			<div className='Options'>
				<div></div>
				<div>
					<Link className='Option2' to={`deposit?clientName=${clientName}&clientId=${searchParams.get('clientId')}`}>
						Initiate Deposit(s)
					</Link>
					<Link className='Option1' to={`withdrawal?clientName=${clientName}&clientId=${searchParams.get('clientId')}`}>
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
				<tbody>{nonzeroAccounts.map(renderNonZeroAccount)}</tbody>
			</table>
		</div>
	)
}

export default Client
