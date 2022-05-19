import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Transaction from './Transactions/Transaction'

const ClientTransactions = ({ transactions }) => {
	const [searchParams] = useSearchParams()

	return (
		<>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Transaction History</div>
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
					{transactions.slice(0, 10).map(transaction => (
						<Transaction key={`Transaction ${transaction.id}`} transaction={transaction} />
					))}
				</tbody>
				<tfoot>
					<tr>
						<td colSpan={14}>
							<Link
								to={`transactions?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get(
									'clientId'
								)}`}
							>
								+ Show Full Transaction History
							</Link>
						</td>
					</tr>
				</tfoot>
			</table>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Tax Events</div>
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
					{transactions
						.filter(({ type }) => type === 'buy' || type === 'sell')
						.slice(0, 10)
						.map(transaction => (
							<Transaction key={`Taxes ${transaction.id}`} transaction={transaction} />
						))}
				</tbody>
				<tfoot>
					<tr>
						<td colSpan={14}>
							<Link
								to={`taxEvents?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get('clientId')}`}
							>
								+ Show All Tax Events
							</Link>
						</td>
					</tr>
				</tfoot>
			</table>
		</>
	)
}

export default ClientTransactions
