import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './Confirm.css'

function renderAllocation({ holding, percent }, index) {
	return (
		<div className='Allocation' key={`Allocation ${index}`}>
			<div className='Flex'>
				<div className='Holding'>{holding}</div>
				<div className='Percent'>{`${Number(percent).toFixed(2)}%`}</div>
			</div>
		</div>
	)
}

const Confirm = ({ advisor, client, portfolio }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const [isLoading, setIsLoading] = useState(false)

	async function handleSubmit(e) {
		e.preventDefault()
		e.stopPropagation()
		setIsLoading(true)

		let url = 'https://blockria.com/coinbase/update/portfolioid?'
		url += `advisorId=${advisor.idToken.payload.sub}`
		url += `&clientId=${searchParams.get('clientId')}`
		url += `&portfolioId=${portfolio.portfolioId.S}`
		await fetch(url)
			.then(console.log)
			.catch(error => alert(error))

		setIsLoading(false)
		navigate('/advisor/clients')
	}

	return (
		<div className='Confirm'>
			<div className='Description'>
				<div className='Title'>Confirm the New Portfolio for {searchParams.get('clientName')}.</div>
			</div>
			<div className='Portfolio'>
				<div className='Name'>{portfolio.portfolioName.S}</div>
				{JSON.parse(portfolio.allocations.S).map(renderAllocation)}
				<button className='Submit' disabled={isLoading} onClick={handleSubmit}>
					{isLoading ? 'Loading' : 'Confirm New Portfolio'}
				</button>
				<div className='Cancel' onClick={() => navigate(-1)}>
					Cancel
				</div>
			</div>
		</div>
	)
}

export default Confirm
