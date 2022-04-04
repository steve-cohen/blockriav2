import React, { useEffect, useState } from 'react'
import './Transactions.css'

const displayTypes = {
	buy: 'Buy',
	fiat_deposit: 'Deposit',
	fiat_withdrawal: 'Withdrawal',
	sell: 'Sell',
	send: 'Send'
}

const Transactions = ({ advisorId, clientId }) => {
	const [transactions, setTransactions] = useState([])

	useEffect(() => {
		getTransactions()
	}, [])

	async function getTransactions() {
		await fetch(`https://blockria.com/api/coinbase/transactions/all?advisorId=${advisorId}&clientId=${clientId}`)
			.then(response => response.json())
			.then(newTransactions => {
				console.log(newTransactions)
				setTransactions(newTransactions)
			})
			.catch(error => alert(error))
	}

	function renderTransaction({ created_at, details, id, status, type, updated_at }) {
		return (
			<tr key={`Transaction ${id}`}>
				<td>{displayTypes[type]}</td>
				<td>{details.header}</td>
				<td>{created_at}</td>
				<td>{updated_at}</td>
				<td>{status}</td>
			</tr>
		)
	}

	return (
		<table style={{ marginTop: '72px' }}>
			<caption>Transaction History</caption>
			<thead>
				<tr>
					<th>TYPE</th>
					<th>DESCRIPTION</th>
					<th>CREATED AT</th>
					<th>UPDATED AT</th>
					<th>STATUS</th>
				</tr>
			</thead>
			<tbody>{transactions.map(renderTransaction)}</tbody>
		</table>
	)
}

export default Transactions
