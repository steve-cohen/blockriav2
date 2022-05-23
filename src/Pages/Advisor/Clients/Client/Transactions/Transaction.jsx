import React from 'react'
import coinbaseTokenNames from '../../../coinbaseTokenNames.json'

const displayTypes = {
	buy: 'Buy',
	fiat_deposit: 'Deposit',
	fiat_withdrawal: 'Withdrawal',
	interest: 'Interest',
	sell: 'Sell',
	send: 'Send',
	staking_reward: 'Stake',
	trade: 'Trade'
}

function formatUSD(number) {
	return number.toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const Transaction = ({ transaction }) => {
	const {
		amount,
		buy,
		details,
		fiat_deposit,
		fiat_withdrawal,
		native_amount,
		network,
		off_chain_status,
		sell,
		status,
		type,
		updated_at
	} = transaction

	function renderTransaction() {
		switch (type) {
			case 'buy':
				return renderBuyOrSell()
			case 'fiat_deposit':
				return renderDepositOrWithdrawal()
			case 'fiat_withdrawal':
				return renderDepositOrWithdrawal()
			case 'interest':
				return renderInterest()
			case 'sell':
				return renderBuyOrSell()
			case 'send':
				return renderSend()
			case 'staking_reward':
				return renderStakingReward()
			case 'trade':
				return renderTrade()
			default:
				return null
		}
	}

	function renderBuyOrSell() {
		const change = type === 'buy' ? '-' : '+'
		const event = type === 'buy' ? buy : sell

		return (
			<tr>
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
				<td className={`${status === 'completed' ? 'Green' : 'Red'}`}>{status}</td>
			</tr>
		)
	}

	function renderDepositOrWithdrawal() {
		const change = type === 'fiat_deposit' ? '+' : '-'
		const event = type === 'fiat_deposit' ? fiat_deposit : fiat_withdrawal

		return (
			<tr>
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
				<td className={`${status === 'completed' ? 'Green' : 'Red'}`}>{status}</td>
			</tr>
		)
	}

	function renderInterest() {
		const change = native_amount.amount > 0 ? '+' : ''

		return (
			<tr>
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
				<td>{details.subtitle}</td>
				<td />
				<td />
				<td />
				<td className={`${status === 'completed' ? 'Green' : 'Red'}`}>{status}</td>
			</tr>
		)
	}

	function renderSend() {
		const change = native_amount.amount > 0 ? '+' : ''

		return (
			<tr>
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
				{network.status === 'confirmed' ? (
					<td className='Green'>Completed</td>
				) : network.status === 'off_blockchain' ? (
					<td className={off_chain_status === 'completed' ? 'Green' : 'Red'}>{off_chain_status}</td>
				) : (
					<td />
				)}
			</tr>
		)
	}

	function renderStakingReward() {
		const change = native_amount.amount > 0 ? '+' : ''

		return (
			<tr>
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
				<td>{details.subtitle}</td>
				<td />
				<td />
				<td className={`${status === 'completed' ? 'Green' : 'Red'}`}>{status}</td>
			</tr>
		)
	}

	function renderTrade() {
		const change = native_amount.amount > 0 ? '+' : ''

		return (
			<tr>
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
				<td>{details.subtitle}</td>
				<td />
				<td />
				<td className={`${status === 'completed' ? 'Green' : 'Red'}`}>{status}</td>
			</tr>
		)
	}

	return renderTransaction()
}

export default Transaction
