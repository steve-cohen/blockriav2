import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Billing.css'

const Billing = ({ advisor }) => {
	return (
		<div className='Billing'>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Billing Plans</div>
						<Link className='Button' to='/advisor/billing/edit'>
							Create Billing Plan
						</Link>
					</div>
				</caption>
				<thead>
					<tr>
						<th>NAME</th>
						<th>TYPE</th>
						<th>FEE</th>
						<th className='Break'>FREQUENCY</th>
						<th>ASSIGNED TO</th>
						<th>EDIT</th>
					</tr>
				</thead>
				<tbody></tbody>
				<tfoot>
					<tr>
						<td colSpan={6}>
							<Link to='/advisor/billing/edit'>+ Create Billing Plan</Link>
						</td>
					</tr>
				</tfoot>
			</table>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Billing Statements</div>
					</div>
				</caption>
				<thead>
					<tr>
						<th>START DATE</th>
						<th>END DATE</th>
						<th className='Break'>TOTAL FEES</th>
						<th>EXPORT</th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>
		</div>
	)
}

export default Billing
