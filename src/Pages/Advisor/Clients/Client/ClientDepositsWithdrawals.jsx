import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './ClientDepositsWithdrawals.css'

const ClientDepositsWithdrawals = () => {
	const [searchParams] = useSearchParams()

	return (
		<table style={{ marginBottom: '60px' }}>
			<caption>
				<div className='Flex'>
					{/* <div className='Title'>Automatic Deposits and Withdrawals</div> */}
					<div className='Title'>Deposits and Withdrawals</div>
					<div>
						<Link
							className='Button'
							to={`deposit?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get('clientId')}`}
						>
							Initiate Deposit
							{/* Initiate Deposit(s) */}
						</Link>
						<Link
							className='Button'
							to={`withdrawal?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get('clientId')}`}
						>
							Initiate Withdrawal
							{/* Initiate Withdrawal(s) */}
						</Link>
					</div>
				</div>
			</caption>
			<thead>
				<tr>
					<th>SERVICE</th>
					{/* <th>FREQUENCY</th> */}
					<th className='Break'>DESCRIPTION</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td className='Bold'>Deposits</td>
					{/* <td></td> */}
					<td style={{ textTransform: 'none' }}>
						Transfer funds <b>INTO</b> {searchParams.get('clientName')}'s Coinbase account
					</td>
				</tr>
				<tr>
					<td className='Bold'>Withdrawals</td>
					{/* <td></td> */}
					<td style={{ textTransform: 'none' }}>
						Transfer funds <b>FROM</b> {searchParams.get('clientName')}'s Coinbase account
					</td>
				</tr>
			</tbody>
		</table>
	)
}

export default ClientDepositsWithdrawals
