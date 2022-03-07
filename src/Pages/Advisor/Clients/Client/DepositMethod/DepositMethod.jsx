import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './DepositMethod.css'

const DepositMethod = ({ clients }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [amount, setAmount] = useState('')
	const [depositMethod, setDepositMethod] = useState({
		limits: { deposit: [{ description: '' }] },
		name: 'No Deposit Methods Available'
	})
	const [depositMethods, setDepositMethods] = useState([])
	const [showDepositMethods, setShowDepositMethods] = useState(false)

	useEffect(() => {
		const client = clients.filter(({ clientId }) => clientId.S === searchParams.get('clientId'))

		if (client.length) {
			let newDepositMethods = []
			JSON.parse(client[0].paymentMethods.S)
				.filter(({ allow_deposit }) => allow_deposit)
				.forEach(method => newDepositMethods.push(method))

			console.log(newDepositMethods)
			setDepositMethods(newDepositMethods)

			newDepositMethods.forEach(newDepositMethod => {
				if (newDepositMethod.primary_buy) {
					console.log(newDepositMethod)
					setDepositMethod(newDepositMethod)
				}
			})
		}
	}, [])

	function renderDepositMethod(newDepositMethod) {
		return (
			<div key={`DepositMethod ${newDepositMethod.id}`} onClick={() => setDepositMethod(newDepositMethod)}>
				{`${newDepositMethod.name}\n${newDepositMethod.limits.deposit[0].description.replace('of your', '/')}`}
			</div>
		)
	}

	return (
		<div className='DepositMethod'>
			<div className='Description'>
				<div className='Title'>Select a Deposit Method</div>
			</div>
			<div className='Options'>
				<div onClick={() => setShowDepositMethods(!showDepositMethods)}>
					{`${depositMethod.name}\n${depositMethod.limits.deposit[0].description.replace('of your', '/')}`}
				</div>
				{showDepositMethods ? depositMethods.map(renderDepositMethod) : null}
			</div>
		</div>
	)
}

export default DepositMethod
