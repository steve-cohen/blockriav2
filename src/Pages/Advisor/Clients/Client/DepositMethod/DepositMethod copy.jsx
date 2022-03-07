import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './DepositMethod.css'

const DepositMethod = ({ clients }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [amount, setAmount] = useState('')
	const [depositMethod, setDepositMethod] = useState('')
	const [depositMethods, setDepositMethods] = useState([])

	useEffect(() => {
		const client = clients.filter(({ clientId }) => clientId.S === searchParams.get('clientId'))

		if (client.length) {
			let newDepositMethods = []
			JSON.parse(client[0].paymentMethods.S)
				.filter(({ allow_deposit }) => allow_deposit)
				.forEach(method => newDepositMethods.push(method))

			console.log(newDepositMethods)
			setDepositMethods(newDepositMethods)
		}
	}, [])

	function renderDepositMethod({ id, limits, name }) {
		return (
			<tr
				key={`DepositMethod ${id}`}
				onClick={() => navigate(`depositamount?clientId=${searchParams.get('clientId')}&depositId=${id}`)}
			>
				<td>{`${name}\n${limits.deposit[0].description.replace('of your', '/')}`}</td>
			</tr>
		)
	}

	return (
		<div className='DepositMethod'>
			<div className='Description'>
				<div className='Title'>Select a Deposit Method</div>
			</div>
			<div>
				{/* <input
					autoFocus
					minLength={1}
					onChange={e => setAmount(e.target.value)}
					placeholder='DEPOSIT AMOUNT'
					required
					type='number'
					value={amount}
				/> */}
				<table>
					<tbody>{depositMethods.map(renderDepositMethod)}</tbody>
				</table>
				<select>
					<option>Option 1</option>
				</select>
			</div>
		</div>
	)
}

export default DepositMethod
