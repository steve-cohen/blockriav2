import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import Transaction from '../Transactions/Transaction'
import './TaxEvents.css'

const displayTypes = {
	buy: 'Buy',
	fiat_deposit: 'Deposit',
	fiat_withdrawal: 'Withdrawal',
	sell: 'Sell',
	send: 'Send',
	trade: 'Trade'
}

function formatUSD(number) {
	return Number(number).toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const TaxEvents = () => {
	const [searchParams] = useSearchParams()
	const [taxEvents, setTaxEvents] = useState([])

	useEffect(() => {
		fetch(`https://blockria.com/api/coinbase/clients/client/taxevents?clientId=${searchParams.get('clientId')}`)
			.then(response => response.json())
			.then(newTaxEvents => {
				console.log(newTaxEvents)
				if (searchParams.get('year')) {
					setTaxEvents(newTaxEvents.filter(({ updated_at }) => updated_at.slice(0, 4) === searchParams.get('year')))
				} else {
					setTaxEvents(newTaxEvents)
				}
			})
			.catch(error => alert(error))
	}, [])

	function renderExportCSV() {
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

	function renderTotals() {
		let totalFee = 0
		taxEvents.forEach(({ buy, sell, type }) => {
			if (type === 'buy') totalFee += buy.fee.amount
			else if (type === 'sell') totalFee += sell.fee.amount
		})

		return (
			<tfoot>
				<tr>
					<td>{taxEvents.length} Total</td>
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
					<div className='Title'>
						Taxable Events for {searchParams.get('clientName')}
						{searchParams.get('year') ? ` for ${searchParams.get('year')}` : ''}
					</div>
					{renderExportCSV()}
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
				{taxEvents.map(transaction => (
					<Transaction key={`Taxes ${transaction.id}`} transaction={transaction} />
				))}
			</tbody>
			{renderTotals()}
		</table>
	)
}

export default TaxEvents
