import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import './Transactions.css'

const displayTypes = {
	buy: 'Buy',
	fiat_deposit: 'Deposit',
	fiat_withdrawal: 'Withdrawal',
	sell: 'Sell',
	send: 'Send'
}

const Transactions = () => {
	const [searchParams] = useSearchParams()
	const [transactions, setTransactions] = useState([])

	useEffect(() => {
		fetch(`https://blockria.com/api/coinbase/clients/client/transactions?clientId=${searchParams.get('clientId')}`)
			.then(response => response.json())
			.then(setTransactions)
			.catch(error => alert(error))
	}, [])

	function renderTransaction({ details, id, status, type, updated_at }) {
		return (
			<tr key={`Transaction ${id}`}>
				<td>{updated_at}</td>
				<td>{displayTypes[type]}</td>
				<td>{details.header}</td>
				<td>{details.payment_method_name}</td>
				<td>{status}</td>
			</tr>
		)
	}

	return (
		<div className='Transactions'>
			<table>
				<caption>Transaction History</caption>
				<thead>
					<tr>
						<th>DATE</th>
						<th>TYPE</th>
						<th>DESCRIPTION</th>
						<th>PAYMENT METHOD</th>
						<th>STATUS</th>
					</tr>
				</thead>
				<tbody>{transactions.map(renderTransaction)}</tbody>
			</table>
		</div>
	)
}

export default Transactions
