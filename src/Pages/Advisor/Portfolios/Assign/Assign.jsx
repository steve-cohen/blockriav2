import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './Assign.css'

const Assign = ({ portfolios }) => {
	const [searchParams] = useSearchParams()

	const [allocations, setAllocations] = useState([])
	const [portfolioName, setPortfolioName] = useState('')
	const [portfolioId, setPortfolioId] = useState('')
	const [showOptions, setShowOptions] = useState(false)

	useEffect(() => {
		if (searchParams.get('portfolioId')) {
			const portfolio = portfolios.filter(({ portfolioId }) => portfolioId.S === searchParams.get('portfolioId'))
			if (portfolio.length) selectPortfolio(portfolio[0])
		}
	}, [])

	function handleSubmit() {
		console.log('Submit')
	}

	function renderAllocation({ currency, percent }, index) {
		return (
			<div className='Allocation' key={`Allocation ${index}`}>
				<div className='Flex'>
					<input className='Currency' disabled readOnly value={currency} />
					<input className='Percent' disabled readOnly value={`${percent.toFixed(2)}%`} />
				</div>
			</div>
		)
	}

	function renderPortfolio(portfolio) {
		return (
			<div onClick={() => selectPortfolio(portfolio)} key={`Portfolio ${portfolio.portfolioId.S}`}>
				{portfolio.portfolioName.S}
			</div>
		)
	}

	function selectPortfolio({ allocations, portfolioId, portfolioName }) {
		setAllocations(JSON.parse(allocations.S))
		setPortfolioName(portfolioName.S)
		setPortfolioId(portfolioId.S)
	}

	return (
		<div className='Assign'>
			<div className='Description'>
				<div className='Title'>Assign a Portfolio to {searchParams.get('clientName')}.</div>
			</div>
			<form onSubmit={handleSubmit}>
				<div className='Select' onClick={() => setShowOptions(!showOptions)}>
					{portfolioId ? portfolioName : 'Select a Portfolio'}
					{showOptions && (
						<div className='Options'>
							<div onClick={() => setPortfolioId('')}>Select a Portfolio</div>
							{portfolios.map(renderPortfolio)}
						</div>
					)}
				</div>
				{portfolioId && (
					<>
						<input className='PortfolioName' disabled value={portfolioName} />
						{allocations.map(renderAllocation)}
						<Link to='/signup'>Assign Portfolio</Link>
					</>
				)}
			</form>
		</div>
	)
}

export default Assign
