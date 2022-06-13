import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Transaction from './Transactions/Transaction'
import coinbaseTokenNames from '../../coinbaseTokenNames.json'

function formatUSD(number) {
	return Number(number).toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const ClientTransactions = ({ client, transactions }) => {
	const [searchParams] = useSearchParams()
	const [coinbaseProTransactions, setCoinbaseProTransactions] = useState([])

	function handleCoinbaseProTransactions() {
		// Merge by Trade Id
		let trades = {}
		transactions.forEach(transaction => {
			if (transaction.type.S === 'match' || transaction.type.S === 'fee') {
				const tradeId = transaction.details.M.trade_id.S
				if (tradeId in trades) trades[tradeId].push(transaction)
				else trades[tradeId] = [transaction]
			}
		})
		console.log(trades)

		// Merge Each Trade Id
		let renderTransactions = {}
		Object.entries(trades).forEach(([tradeId, tradeTransactions]) => {
			let renderTransaction = {
				amount: '',
				cost: '',
				created_at: '',
				fee: '',
				holding: '',
				id: tradeId,
				total: 0,
				type: ''
			}

			tradeTransactions.forEach(transaction => {
				if (transaction.holding.S === 'USD') {
					if (transaction.type.S === 'match') {
						renderTransaction.cost = Number(transaction.amount.S) || 0
						renderTransaction.total += Number(transaction.amount.S) || 0
						renderTransaction.type = Number(transaction.amount.S) > 0 ? 'Sell' : 'Buy'
					} else if (transaction.type.S === 'fee') {
						renderTransaction.fee = -1 * Number(transaction.amount.S) || 0
						renderTransaction.total += Number(transaction.amount.S) || 0
					}
				} else {
					renderTransaction.amount = transaction.amount.S
					renderTransaction.created_at = transaction.created_at.S
					renderTransaction.holding = transaction.holding.S
				}
			})

			renderTransactions[tradeId] = renderTransaction
		})
		console.log(renderTransactions)

		let newCoinbaseProTransactions = Object.values(renderTransactions).sort((a, b) =>
			a.created_at.localeCompare(b.created_at)
		)
		console.log(newCoinbaseProTransactions)
		setCoinbaseProTransactions(newCoinbaseProTransactions)
	}

	useEffect(() => {
		handleCoinbaseProTransactions()
	}, [transactions])

	if (client.clientId === undefined) return null
	if (client.clientId.includes('-')) {
		const taxEvents = transactions.filter(({ type }) => type === 'buy' || type === 'sell')

		return (
			<>
				<div className='ResponsiveTable'>
					<table id='transactions'>
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
								<th>DESCRIPTION</th>
								<th className='Break'>PAYMENT METHOD</th>
								<th>HOLD</th>
								<th>HOLD UNTIL</th>
								<th>STATUS</th>
							</tr>
						</thead>
						<tbody>
							{transactions.slice(0, 10).map(transaction => (
								<Transaction key={`Transaction ${transaction.id}`} transaction={transaction} />
							))}
						</tbody>
						{transactions.length ? (
							<tfoot>
								<tr>
									<td colSpan={14}>
										<Link
											to={`transactions?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get(
												'clientId'
											)}`}
										>
											Show All {transactions.length} Transaction
											{transactions.length !== 1 && 's'}
										</Link>
									</td>
								</tr>
							</tfoot>
						) : null}
					</table>
				</div>
				<div className='ResponsiveTable'>
					<table id='taxes'>
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
								<th>DESCRIPTION</th>
								<th className='Break'>PAYMENT METHOD</th>
								<th>HOLD</th>
								<th>HOLD UNTIL</th>
								<th>STATUS</th>
							</tr>
						</thead>
						<tbody>
							{taxEvents.slice(0, 10).map(transaction => (
								<Transaction key={`Taxes ${transaction.id}`} transaction={transaction} />
							))}
						</tbody>
						{taxEvents.length ? (
							<tfoot>
								<tr>
									<td colSpan={14}>
										<Link
											to={`taxEvents?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get(
												'clientId'
											)}`}
										>
											Show All {taxEvents.length} Tax Event
											{taxEvents.length !== 1 && 's'}
										</Link>
									</td>
								</tr>
							</tfoot>
						) : null}
					</table>
				</div>
			</>
		)
	} else {
		console.log(transactions)
		return (
			<>
				<div className='ResponsiveTable'>
					<table id='transactions'>
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
								<th className='AlignRight Break'>STATUS</th>
							</tr>
						</thead>
						<tbody>
							{/* {transactions.map(({ amount, created_at, details, holding, type }) => (
								<tr>
									<td>{created_at.S.slice(0, 10)}</td>
									<td>{created_at.S.slice(11, 19)}</td>
									<td className='Bold'>{type.S === 'transfer' ? details.M.transfer_type.S : type.S}</td>
									<td>{holding.S}</td>
									<td>{amount.S}</td>
								</tr>
							))} */}
							{coinbaseProTransactions.map(({ amount, cost, created_at, fee, id, holding, total, type }) => (
								<tr key={`Transaction ${id}`}>
									<td>{created_at.slice(0, 10)}</td>
									<td>{created_at.slice(11, 19)}</td>
									<td className='Bold'>{type}</td>
									<td className='Bold'>
										{holding !== 'USD' ? (
											<a
												href={`https://coinbase.com/price/${coinbaseTokenNames[holding]
													.replace(/ /g, '-')
													.toLowerCase()}`}
												target='_blank'
												rel='noopener noreferrer'
											>
												{holding}
											</a>
										) : (
											holding
										)}
									</td>
									<td>{Number(amount)}</td>
									<td className='AlignRight'>{formatUSD(Math.abs(Number(cost) / Number(amount)))}</td>
									<td className='AlignRight'>{formatUSD(cost)}</td>
									<td className='AlignRight'>({formatUSD(fee)})</td>
									<td className={`AlignRight Bold ${total < 0 ? 'Red' : 'Green'}`}>{formatUSD(total)}</td>
									<td className='AlignRight Green'>Completed</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</>
		)
	}
}

export default ClientTransactions
