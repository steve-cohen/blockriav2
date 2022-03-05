import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './Confirm.css'

function renderAllocation({ currency, percent }, index) {
	return (
		<div className='Allocation' key={`Allocation ${index}`}>
			<div className='Flex'>
				<div className='Currency'>{currency}</div>
				<div className='Percent'>{`${percent.toFixed(2)}%`}</div>
			</div>
		</div>
	)
}

const Confirm = ({ portfolios }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [allocations, setAllocations] = useState([])
	const [portfolioName, setPortfolioName] = useState('')
	const [portfolioId, setPortfolioId] = useState('')

	useEffect(() => {
		if (searchParams.get('newPortfolioId')) {
			const newPortfolio = portfolios.filter(({ portfolioId }) => portfolioId.S === searchParams.get('newPortfolioId'))

			if (newPortfolio.length) {
				setAllocations(JSON.parse(newPortfolio[0].allocations.S))
				setPortfolioName(newPortfolio[0].portfolioName.S)
				setPortfolioId(newPortfolio[0].portfolioId.S)
			} else {
				setPortfolioName('No Portfolio')
			}
		} else {
			setPortfolioName('No Portfolio')
		}
	}, [])

	return (
		<div className='Confirm'>
			<div className='Description'>
				<div className='Title'>Confirm the New Portfolio for {searchParams.get('clientName')}.</div>
			</div>
			<div className='Portfolio'>
				<div className='Name'>{portfolioName}</div>
				{allocations.map(renderAllocation)}
				<div className='Submit'>Confirm New Portfolio</div>
				<div className='Cancel' onClick={() => navigate(-1)}>
					Cancel
				</div>
			</div>
		</div>
	)
}

export default Confirm
