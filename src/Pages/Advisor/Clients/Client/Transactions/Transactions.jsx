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

function formatUSD(number) {
	return number.toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
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

	function renderTransaction({ buy, details, fiat_deposit, fiat_withdrawal, id, sell, status, type, updated_at }) {
		if (type === 'buy' || type == 'sell') {
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
								href={`https://coinbase.com/price/${event.amount.currency.replace(/ /g, '-').toLowerCase()}`}
								target='_blank'
								rel='noopener noreferrer'
							>
								{event.amount.currency}
							</a>
						) : (
							event.amount.currency
						)}
					</td>
					<td className={`AlignRight Bold ${type === 'sell' ? 'Green' : ''}${type === 'buy' ? 'Red' : ''}`}>
						{change}
						{formatUSD(event.total.amount)}
					</td>
					<td className='AlignRight'>
						{change}
						{formatUSD(event.subtotal.amount)}
					</td>
					<td className='AlignRight DeEmphasize'>({formatUSD(event.fee.amount)})</td>
					<td className='AlignRight DeEmphasize'>{formatUSD(event.unit_price.amount)}</td>
					<td className='Break'>{details.title}</td>
					<td>{details.payment_method_name}</td>
					<td>{event.hold_days ? `${event.hold_days} Days` : ''}</td>
					<td>{event.hold_until ? event.hold_until.slice(0, 10) : ''}</td>
					<td>{event.instant ? 'Yes' : 'No'}</td>
					<td className={`${status === 'completed' ? 'Green' : 'Red'}`}>{status}</td>
				</tr>
			)
		} else if (type === 'fiat_deposit' || type === 'fiat_withdrawal') {
			const change = type === 'fiat_deposit' ? '+' : '-'
			const event = type === 'fiat_deposit' ? fiat_deposit : fiat_withdrawal

			return (
				<tr key={`Transaction ${id}`}>
					<td>{updated_at.slice(0, 10)}</td>
					<td>{updated_at.slice(11, 19)}</td>
					<td className='Bold'>{type in displayTypes ? displayTypes[type] : type}</td>
					<td className='Bold'>{event.amount.currency}</td>
					<td className={`AlignRight Bold ${type === 'fiat_deposit' ? 'Green' : 'Red'}`}>
						{change}
						{formatUSD(event.amount.amount)}
					</td>
					<td className='AlignRight'>
						{change}
						{formatUSD(event.subtotal.amount)}
					</td>
					<td className='AlignRight DeEmphasize'>({formatUSD(event.fee.amount)})</td>
					<td />
					<td className=''>{details.title}</td>
					<td>{details.payment_method_name}</td>
					<td>{event.hold_days ? `${event.hold_days} Days` : ''}</td>
					<td>{type === 'fiat_deposit' ? event.hold_until.slice(0, 10) : event.payout_at.slice(0, 10)}</td>
					<td>{event.instant ? 'Yes' : 'No'}</td>
					<td className={`${status === 'completed' ? 'Green' : 'Red'}`}>{status}</td>
				</tr>
			)
		}
	}

	function renderTotals() {
		let totalNet = 0
		let totalAmount = 0
		let totalFee = 0

		transactions.forEach(({ buy, fiat_deposit, fiat_withdrawal, sell, type }) => {
			switch (type) {
				case 'buy':
					totalNet -= buy.total.amount
					totalAmount -= buy.subtotal.amount
					totalFee += buy.fee.amount
					break
				case 'sell':
					totalNet += sell.total.amount
					totalAmount += sell.subtotal.amount
					totalFee += sell.fee.amount
					break
				case 'fiat_deposit':
					totalNet += fiat_deposit.amount.amount
					totalAmount += fiat_deposit.subtotal.amount
					totalFee += fiat_deposit.fee.amount
					break
				case 'fiat_withdrawal':
					totalNet -= fiat_withdrawal.amount.amount
					totalAmount -= fiat_withdrawal.subtotal.amount
					totalFee += fiat_withdrawal.fee.amount
					break
				default:
					break
			}
		})

		return (
			<tr>
				<td>{transactions.length} Total</td>
				<td />
				<td />
				<td />
				<td className='AlignRight Bold'>{formatUSD(totalNet)}</td>
				<td className='AlignRight'>{formatUSD(totalAmount)}</td>
				<td className='AlignRight'>({formatUSD(totalFee)})</td>
			</tr>
		)
	}

	return (
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
					<th className='AlignRight'>NET</th>
					<th className='AlignRight'>AMOUNT</th>
					<th className='AlignRight'>FEE</th>
					<th className='AlignRight'>UNIT PRICE</th>
					<th>DESCRIPTION</th>
					<th>PAYMENT METHOD</th>
					<th>HOLD</th>
					<th>HOLD UNTIL</th>
					<th>INSTANT</th>
					<th>STATUS</th>
				</tr>
			</thead>
			<tbody>{transactions.map(renderTransaction)}</tbody>
			<tfoot>{renderTotals()}</tfoot>
		</table>
	)
}

export default Transactions
