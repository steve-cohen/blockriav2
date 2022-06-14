import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Transaction from './Transactions/Transaction'

const ClientTransactions = ({ transactions }) => {
	const [searchParams] = useSearchParams()
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
						{transactions.map(transaction => (
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
	// else {
	// 	const taxEvents = transactions.filter(({ type }) => type === 'buy' || type === 'sell')

	// 	return (
	// 		<>
	// 			<div className='ResponsiveTable'>
	// 				<table id='transactions'>
	// 					<caption>
	// 						<div className='Flex'>
	// 							<div className='Title'>Transaction History</div>
	// 							<div></div>
	// 						</div>
	// 					</caption>
	// 					<thead>
	// 						<tr>
	// 							<th>DATE</th>
	// 							<th>TIME</th>
	// 							<th>TYPE</th>
	// 							<th>HOLDING</th>
	// 							<th>AMOUNT</th>
	// 							<th className='AlignRight'>UNIT PRICE</th>
	// 							<th className='AlignRight'>COST</th>
	// 							<th className='AlignRight'>FEES</th>
	// 							<th className='AlignRight'>TOTAL</th>
	// 							<th className='AlignRight Break'>STATUS</th>
	// 						</tr>
	// 					</thead>
	// 					<tbody>
	// 						{transactions.map(({ amount, cost, created_at, fee, id, holding, total, type }) => (
	// 							<tr key={`Transaction ${id}`}>
	// 								<td>{created_at.slice(0, 10)}</td>
	// 								<td>{created_at.slice(11, 19)}</td>
	// 								<td className='Bold'>{displayTypes[type]}</td>
	// 								<td className='Bold'>
	// 									{holding !== 'USD' ? (
	// 										<a
	// 											href={`https://coinbase.com/price/${coinbaseTokenNames[holding]
	// 												.replace(/ /g, '-')
	// 												.toLowerCase()}`}
	// 											target='_blank'
	// 											rel='noopener noreferrer'
	// 										>
	// 											{holding}
	// 										</a>
	// 									) : (
	// 										holding
	// 									)}
	// 								</td>
	// 								<td>{Number(amount)}</td>
	// 								<td className='AlignRight'>{formatUSD(Math.abs(Number(cost) / Number(amount)))}</td>
	// 								<td className='AlignRight'>{formatUSD(cost)}</td>
	// 								<td className='AlignRight'>({formatUSD(fee)})</td>
	// 								<td className={`AlignRight Bold ${total < 0 ? 'Red' : 'Green'}`}>{formatUSD(total)}</td>
	// 								<td className='AlignRight Green'>Completed</td>
	// 							</tr>
	// 						))}
	// 					</tbody>
	// 					{transactions.length ? (
	// 						<tfoot>
	// 							<tr>
	// 								<td colSpan={14}>
	// 									<Link
	// 										to={`transactions?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get(
	// 											'clientId'
	// 										)}`}
	// 									>
	// 										Show All {transactions.length} Transaction
	// 										{transactions.length !== 1 && 's'}
	// 									</Link>
	// 								</td>
	// 							</tr>
	// 						</tfoot>
	// 					) : null}
	// 				</table>
	// 			</div>
	// 			<div className='ResponsiveTable'>
	// 				<table id='taxes'>
	// 					<caption>
	// 						<div className='Flex'>
	// 							<div className='Title'>Tax Events</div>
	// 							<div></div>
	// 						</div>
	// 					</caption>
	// 					<thead>
	// 						<tr>
	// 							<th>DATE</th>
	// 							<th>TIME</th>
	// 							<th>TYPE</th>
	// 							<th>HOLDING</th>
	// 							<th>AMOUNT</th>
	// 							<th className='AlignRight'>UNIT PRICE</th>
	// 							<th className='AlignRight'>COST</th>
	// 							<th className='AlignRight'>FEES</th>
	// 							<th className='AlignRight'>TOTAL</th>
	// 							<th className='AlignRight Break'>STATUS</th>
	// 						</tr>
	// 					</thead>
	// 					<tbody>
	// 						{taxEvents.slice(0, 10).map(({ amount, cost, created_at, fee, id, holding, total, type }) => (
	// 							<tr key={`Transaction ${id}`}>
	// 								<td>{created_at.slice(0, 10)}</td>
	// 								<td>{created_at.slice(11, 19)}</td>
	// 								<td className='Bold'>{displayTypes[type]}</td>
	// 								<td className='Bold'>
	// 									{holding !== 'USD' ? (
	// 										<a
	// 											href={`https://coinbase.com/price/${coinbaseTokenNames[holding]
	// 												.replace(/ /g, '-')
	// 												.toLowerCase()}`}
	// 											target='_blank'
	// 											rel='noopener noreferrer'
	// 										>
	// 											{holding}
	// 										</a>
	// 									) : (
	// 										holding
	// 									)}
	// 								</td>
	// 								<td>{Number(amount)}</td>
	// 								<td className='AlignRight'>{formatUSD(Math.abs(Number(cost) / Number(amount)))}</td>
	// 								<td className='AlignRight'>{formatUSD(cost)}</td>
	// 								<td className='AlignRight'>({formatUSD(fee)})</td>
	// 								<td className={`AlignRight Bold ${total < 0 ? 'Red' : 'Green'}`}>{formatUSD(total)}</td>
	// 								<td className='AlignRight Green'>Completed</td>
	// 							</tr>
	// 						))}
	// 					</tbody>
	// 					{taxEvents.length ? (
	// 						<tfoot>
	// 							<tr>
	// 								<td colSpan={14}>
	// 									<Link
	// 										to={`taxEvents?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get(
	// 											'clientId'
	// 										)}`}
	// 									>
	// 										Show All {taxEvents.length} Tax Event
	// 										{taxEvents.length !== 1 && 's'}
	// 									</Link>
	// 								</td>
	// 							</tr>
	// 						</tfoot>
	// 					) : null}
	// 				</table>
	// 			</div>
	// 		</>
	// 	)
	// }
}

export default ClientTransactions
