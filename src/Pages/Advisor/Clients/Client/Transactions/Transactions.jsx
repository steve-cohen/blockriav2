import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Transaction from './Transaction'

function formatUSD(number) {
	return number.toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const Transactions = () => {
	const [searchParams] = useSearchParams()
	const clientId = searchParams.get('clientId')
	const clientName = searchParams.get('clientName')
	const [transactions, setTransactions] = useState([])

	useEffect(() => {
		fetch(`https://blockria.com/api/coinbase/clients/client/transactions?clientId=${clientId}`)
			.then(response => response.json())
			.then(newTransactions =>
				setTransactions(newTransactions.sort((a, b) => b.updated_at.localeCompare(a.updated_at)))
			)
			.catch(error => alert(error))
	}, [])

	function renderTotals() {
		let totalFee = 0
		transactions.forEach(({ buy, sell, type }) => {
			if (type === 'buy') totalFee += buy.fee.amount
			else if (type === 'sell') totalFee += sell.fee.amount
		})

		return (
			<tfoot>
				<tr>
					<td>{transactions.length} Total</td>
					<td />
					<td />
					<td />
					<td />
					<td />
					<td />
					<td className='AlignRight'>({formatUSD(totalFee)})</td>
				</tr>
			</tfoot>
		)
	}

	return (
		<table>
			<caption>
				<div className='Flex'>
					<div className='Title'>Transaction History for {clientName}</div>
					<div></div>
				</div>
			</caption>
			<thead>
				<tr>
					<th>DATE</th>
					<th>TIME</th>
					<th>TYPE</th>
					<th>HOLDING</th>
					<th>AMOUNT</th>
					<th className='AlignRight'>UNIT PRICE</th>
					<th className='AlignRight'>COST</th>
					<th className='AlignRight'>FEES</th>
					<th className='AlignRight'>TOTAL</th>
					<th className='Break'>DESCRIPTION</th>
					<th>PAYMENT METHOD</th>
					<th>HOLD</th>
					<th>HOLD UNTIL</th>
					<th>INSTANT</th>
					<th>STATUS</th>
				</tr>
			</thead>
			<tbody>
				{transactions.map(transaction => (
					<Transaction key={`Transaction ${transaction.id}`} transaction={transaction} />
				))}
			</tbody>
			{renderTotals()}
		</table>
	)
}

export default Transactions
