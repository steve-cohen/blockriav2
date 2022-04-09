import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import './TaxEvents.css'

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

const TaxEvents = ({ advisor }) => {
	const [searchParams] = useSearchParams()
	const [taxEvents, setTaxEvents] = useState([])

	useEffect(() => {
		console.log(advisor)
		fetch(`https://blockria.com/api/coinbase/clients/client/taxevents?clientId=${searchParams.get('clientId')}`)
			.then(response => response.json())
			.then(setTaxEvents)
			.catch(error => alert(error))
	}, [])

	function renderExportCSV() {
		// const fileName = `TaxEvents-${new Date().toLocaleDateString()}-${advisor.idToken.payload['custom:firm_name']}-${
		// 	advisor.idToken.payload.family_name
		// }-${advisor.idToken.payload.given_name}`
		const fileName = `${new Date().toISOString()}-TaxEvents.csv`

		const headers = [
			'Date',
			'Time',
			'Type',
			'Holding',
			'Net',
			'Amount',
			'Fee',
			'Unit Price',
			'Description',
			'Hold Days',
			'Hold Until',
			'Instant',
			'Status'
		]
		let data = taxEvents.map(({ buy, details, sell, status, type, updated_at }) => {
			const change = type === 'buy' ? '-' : '+'
			const event = type === 'buy' ? buy : sell
			return {
				Date: updated_at.slice(0, 10),
				Time: updated_at.slice(11, 19),
				Type: type in displayTypes ? displayTypes[type] : type,
				Holding: event.amount.currency,
				Net: change + event.total.amount,
				Amount: change + event.subtotal.amount,
				Fee: event.fee.amount,
				'Unit Price': event.unit_price.amount,
				Description: details.title,
				'Hold Days': event.hold_days || 0,
				'Hold Until': event.hold_until || '',
				Instant: event.instant,
				Status: status
			}
		})

		return (
			<div>
				<CSVLink className='Button' data={data} enclosingCharacter={''} filename={fileName} headers={headers}>
					Export CSV
				</CSVLink>
			</div>
		)
	}

	function renderTaxEvent({ buy, details, id, sell, status, type, updated_at }) {
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
							href={`https://coinbase.com/price/${event.amount.currency.toLowerCase()}`}
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
	}

	function renderTotals() {
		let totalNet = 0
		let totalAmount = 0
		let totalFee = 0

		taxEvents.forEach(({ buy, fiat_deposit, fiat_withdrawal, sell, type }) => {
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
				default:
					break
			}
		})

		return (
			<tfoot>
				<tr>
					<td>{taxEvents.length} Total</td>
					<td />
					<td />
					<td />
					<td className='AlignRight Bold'>{formatUSD(totalNet)}</td>
					<td className='AlignRight'>{formatUSD(totalAmount)}</td>
					<td className='AlignRight'>({formatUSD(totalFee)})</td>
				</tr>
			</tfoot>
		)
	}

	return (
		<table>
			<caption>
				<div className='Flex'>
					<div className='Title'>Taxable Events</div>
					{renderExportCSV()}
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
			<tbody>{taxEvents.map(renderTaxEvent)}</tbody>
			{renderTotals()}
		</table>
	)
}

export default TaxEvents
