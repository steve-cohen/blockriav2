import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import coinbaseTokenNames from '../../coinbaseTokenNames.json'

const displayTypes = {
	buy: 'Buy',
	fiat_deposit: 'Deposit',
	fiat_withdrawal: 'Withdrawal',
	sell: 'Sell',
	send: 'Send'
}

function formatUSD(number) {
	return number.toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const ClientTransactions = ({ transactions }) => {
	const [searchParams] = useSearchParams()

	function renderBuyOrSell({ amount, buy, details, id, sell, status, type, updated_at }) {
		const change = type === 'buy' ? '-' : '+'
		const event = type === 'buy' ? buy : sell

		return (
			<tr key={`Transaction ${id}`}>
				<td>{updated_at.slice(0, 10)}</td>
				<td>{updated_at.slice(11, 19)}</td>
				<td className='Bold'>{type in displayTypes ? displayTypes[type] : type}</td>
				<td className='Bold'>
					{event.amount.currency !== 'USD' ? (
						<a
							href={`https://coinbase.com/price/${coinbaseTokenNames[event.amount.currency]
								.replace(/ /g, '-')
								.toLowerCase()}`}
							target='_blank'
							rel='noopener noreferrer'
						>
							{event.amount.currency}
						</a>
					) : (
						event.amount.currency
					)}
				</td>
				<td>
					{amount.amount < 0 && '+'}
					{-1 * amount.amount}
				</td>
				<td className='AlignRight DeEmphasize'>{formatUSD(event.unit_price.amount)}</td>
				<td className='AlignRight'>
					{change}
					{formatUSD(event.subtotal.amount)}
				</td>
				<td className='AlignRight DeEmphasize'>({formatUSD(event.fee.amount)})</td>
				<td className={`AlignRight Bold ${type === 'sell' ? 'Green' : ''}${type === 'buy' ? 'Red' : ''}`}>
					{change}
					{formatUSD(event.total.amount)}
				</td>
				<td>{details.title}</td>
				<td>{details.payment_method_name}</td>
				<td>{event.hold_days ? `${event.hold_days} Days` : ''}</td>
				<td>{event.hold_until ? event.hold_until.slice(0, 10) : ''}</td>
				<td>{event.instant ? 'Yes' : 'No'}</td>
				<td className={`${status === 'completed' ? 'Green' : 'Red'}`}>{status}</td>
			</tr>
		)
	}

	function renderDepositOrWithdrawal({ amount, details, fiat_deposit, fiat_withdrawal, id, status, type, updated_at }) {
		const change = type === 'fiat_deposit' ? '+' : '-'
		const event = type === 'fiat_deposit' ? fiat_deposit : fiat_withdrawal

		return (
			<tr key={`Transaction ${id}`}>
				<td>{updated_at.slice(0, 10)}</td>
				<td>{updated_at.slice(11, 19)}</td>
				<td className='Bold'>{type in displayTypes ? displayTypes[type] : type}</td>
				<td className='Bold'>{event.amount.currency}</td>
				<td>
					{amount.amount >= 0 && '+'}
					{amount.amount.toFixed(2)}
				</td>
				<td className='AlignRight'>$1.00</td>
				<td className='AlignRight'>
					{change}
					{formatUSD(event.subtotal.amount)}
				</td>
				<td className='AlignRight DeEmphasize'>({formatUSD(event.fee.amount)})</td>
				<td className={`AlignRight Bold ${type === 'fiat_deposit' ? 'Green' : 'Red'}`}>
					{change}
					{formatUSD(event.amount.amount)}
				</td>
				<td className=''>{details.title}</td>
				<td>{details.payment_method_name}</td>
				<td>{event.hold_days ? `${event.hold_days} Days` : ''}</td>
				<td>{type === 'fiat_deposit' ? event.hold_until.slice(0, 10) : event.payout_at.slice(0, 10)}</td>
				<td>{event.instant ? 'Yes' : 'No'}</td>
				<td className={`${status === 'completed' ? 'Green' : 'Red'}`}>{status}</td>
			</tr>
		)
	}

	function renderSend({ amount, details, id, native_amount, network, off_chain_status, type, updated_at }) {
		const change = native_amount.amount > 0 ? '+' : ''

		return (
			<tr key={`Transaction ${id}`}>
				<td>{updated_at.slice(0, 10)}</td>
				<td>{updated_at.slice(11, 19)}</td>
				<td className='Bold'>{type in displayTypes ? displayTypes[type] : type}</td>
				<td className='Bold'>
					{amount.currency !== 'USD' ? (
						<a
							href={`https://coinbase.com/price/${coinbaseTokenNames[amount.currency]
								.replace(/ /g, '-')
								.toLowerCase()}`}
							target='_blank'
							rel='noopener noreferrer'
						>
							{amount.currency}
						</a>
					) : (
						amount.currency
					)}
				</td>
				<td>
					{amount.amount < 0 && '+'}
					{-1 * amount.amount}
				</td>
				<td className='AlignRight'>{formatUSD(native_amount.amount / amount.amount)}</td>
				<td className='AlignRight'>
					{change}
					{formatUSD(native_amount.amount)}
				</td>
				<td className='AlignRight'>($0.00)</td>
				<td className={`AlignRight Bold ${native_amount.amount > 0 ? 'Green' : 'Red'}`}>
					{change}
					{formatUSD(native_amount.amount)}
				</td>
				<td>{details.title}</td>
				<td style={{ textTransform: 'none' }}>{details.subtitle}</td>
				<td />
				<td />
				<td />
				{network.status === 'confirmed' ? <td className='Green'>Confirmed</td> : null}
				{network.status === 'off_blockchain' ? (
					<td className={off_chain_status === 'completed' ? 'Green' : 'Red'}>{off_chain_status}</td>
				) : null}
			</tr>
		)
	}

	function renderTrade({ amount, details, id, native_amount, status, type, updated_at }) {
		const change = native_amount.amount > 0 ? '+' : ''

		return (
			<tr key={`Transaction ${id}`}>
				<td>{updated_at.slice(0, 10)}</td>
				<td>{updated_at.slice(11, 19)}</td>
				<td className='Bold'>{type in displayTypes ? displayTypes[type] : type}</td>
				<td className='Bold'>
					{amount.currency !== 'USD' ? (
						<a
							href={`https://coinbase.com/price/${coinbaseTokenNames[amount.currency]
								.replace(/ /g, '-')
								.toLowerCase()}`}
							target='_blank'
							rel='noopener noreferrer'
						>
							{amount.currency}
						</a>
					) : (
						amount.currency
					)}
				</td>
				<td>
					{amount.amount >= 0 && '+'}
					{amount.amount}
				</td>
				<td>{formatUSD(native_amount.amount / amount.amount)}</td>
				<td className='AlignRight'>
					{change}
					{formatUSD(native_amount.amount)}
				</td>
				<td className='AlignRight'>($0.00)</td>
				<td className={`AlignRight Bold ${native_amount.amount > 0 ? 'Green' : 'Red'}`}>
					{change}
					{formatUSD(native_amount.amount)}
				</td>
				<td>{details.title}</td>
				<td>{details.subtitle}</td>
				<td />
				<td />
				<td />
				<td className={`${status === 'completed' ? 'Green' : 'Red'}`}>{status}</td>
			</tr>
		)
	}

	function renderTransaction(transaction) {
		switch (transaction.type) {
			case 'buy':
				return renderBuyOrSell(transaction)
			case 'fiat_deposit':
				return renderDepositOrWithdrawal(transaction)
			case 'fiat_withdrawal':
				return renderDepositOrWithdrawal(transaction)
			case 'sell':
				return renderBuyOrSell(transaction)
			case 'send':
				return renderSend(transaction)
			case 'trade':
				return renderTrade(transaction)
			default:
				return null
		}
	}

	return (
		<>
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
						.map(renderTransaction)}
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
			<table style={{ marginBottom: 0 }}>
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
				<tbody>{transactions.slice(0, 10).map(renderTransaction)}</tbody>
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
		</>
	)
}

export default ClientTransactions
