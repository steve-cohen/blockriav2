import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './DepositAmount.css'

const DepositAmount = () => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [amount, setAmount] = useState('')

	function handleSubmit() {
		let url = 'depositconfirm?'
		url += `clientId=${searchParams.get('clientId')}`
		url += `&depositId=${searchParams.get('depositId')}`
		url += `&depositAmount=${amount}`
		navigate(url)
	}

	return (
		<div className='DepositAmount'>
			<div className='Description'>
				<div className='Title'>Enter a Deposit Amount</div>
			</div>
			<div>
				<form onSubmit={() => handleSubmit()}>
					<input
						autoFocus
						minLength={1}
						onChange={e => setAmount(e.target.value)}
						placeholder='DEPOSIT AMOUNT'
						required
						type='number'
						value={amount}
					/>
					<button type='submit'>Confirm Amount</button>
				</form>
			</div>
		</div>
	)
}

export default DepositAmount
