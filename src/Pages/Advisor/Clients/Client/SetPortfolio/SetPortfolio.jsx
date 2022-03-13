import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './SetPortfolio.css'

const frequencies = [
	'Rebalance Once',
	'Rebalance Daily',
	'Rebalance Weekly',
	'Rebalance Biweekly',
	'Rebalance Monthly',
	'Rebalance Quarterly',
	'Rebalance Annually'
]

const portfolioDefault = {
	allocations: { S: '[]' },
	portfolioId: { S: '' },
	portfolioName: { S: 'Select a Portfolio' }
}

const portfolioEmpty = {
	allocations: { S: '[]' },
	portfolioId: { S: '' },
	portfolioName: { S: 'No Portfolio' }
}

const SetPortfolio = ({ advisor, portfolios }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [confirm, setConfirm] = useState(false)
	const [frequency, setFrequency] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [portfolioSelection, setPortfolioSelection] = useState(portfolioDefault)
	const [showFrequencies, setShowFrequencies] = useState(false)
	const [showPortfolios, setShowPortfolios] = useState(false)

	function handleSelect(select) {
		setShowFrequencies(false)
		setShowPortfolios(false)

		if (select === 'Frequency') setShowFrequencies(!showFrequencies)
		else if (select === 'Portfolio') setShowPortfolios(!showPortfolios)
	}

	function handleSubmit(e) {
		e.preventDefault()
		e.stopPropagation()
		setConfirm(true)
	}

	async function handleSubmitConfirm(e) {
		e.preventDefault()
		e.stopPropagation()
		setIsLoading(true)

		let url = 'https://blockria.com/coinbase/update/portfolioid?'
		url += `advisorId=${advisor.idToken.payload.sub}`
		url += `&clientId=${searchParams.get('clientId')}`
		url += `&portfolioId=${portfolioSelection.portfolioId.S}`
		url += `&rebalanceFrequency=${frequency.replace('Rebalance ', '')}`
		await fetch(url)
			.then(console.log)
			.catch(error => alert(error))

		setIsLoading(false)
		navigate('/advisor/clients')
	}

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

	function renderFrequency(frequency) {
		return (
			<div
				className='Selection'
				key={`Frequency ${frequency}`}
				onClick={() => {
					setFrequency(frequency)
					setShowFrequencies(false)
				}}
			>
				<div>{frequency}</div>
			</div>
		)
	}

	function renderPortfolio(portfolio) {
		const { allocations, portfolioId, portfolioName } = portfolio

		return (
			<div
				className='Selection'
				key={`Portfolio ${portfolioId.S}`}
				onClick={() => {
					setPortfolioSelection(portfolio)
					setShowPortfolios(false)
				}}
			>
				<div>{portfolioName.S}</div>
				<div className='Allocations'>{renderPortfolioAllocations(allocations)}</div>
			</div>
		)
	}

	function renderPortfolioAllocations(allocations) {
		return JSON.parse(allocations.S)
			.sort((a, b) => b.percent - a.percent)
			.map(({ holding, percent }) => `${holding} ${percent}%`)
			.join(', ')
	}

	return !confirm ? (
		<div className='SetPortfolio'>
			<div className='Description'>
				<div className='Title'>Select a Portfolio for {searchParams.get('clientName')}.</div>
			</div>
			<form onSubmit={handleSubmit}>
				<div className='Select SelectionPortfolio' onClick={() => handleSelect('Portfolio')}>
					<div>{portfolioSelection.portfolioName.S}</div>
					<div>{renderPortfolioAllocations(portfolioSelection.allocations)}</div>
				</div>
				{showPortfolios && (
					<div className='Selections'>
						{portfolios.map(renderPortfolio)}
						{renderPortfolio(portfolioEmpty)}
						<div className='Selection' key={`Portfolio Create`} onClick={() => navigate('/advisor/portfolios/edit')}>
							<div>Create a Portfolio</div>
							<div />
						</div>
					</div>
				)}
				<div className='Select' onClick={() => handleSelect('Frequency')}>
					<div>{frequency || 'Rebalance Frequency'}</div>
				</div>
				{showFrequencies && <div className='Selections'>{frequencies.map(renderFrequency)}</div>}
				<button disabled={isLoading} type='submit'>
					{isLoading ? 'Loading…' : 'Continue'}
				</button>
				<div className='Cancel' onClick={() => navigate(-1)}>
					Cancel
				</div>
			</form>
		</div>
	) : (
		<div className='SetPortfolio SetPortfolioConfirm'>
			<div className='Description'>
				<div className='Title'>Confirm the Portfolio for {searchParams.get('clientName')}.</div>
			</div>
			<form onSubmit={handleSubmitConfirm}>
				<input className='Select' readOnly required value={portfolioSelection.portfolioName.S} />
				{JSON.parse(portfolioSelection.allocations.S).map(renderAllocation)}
				<input className='Select' readOnly required value={frequency} />
				<button disabled={isLoading} type='submit'>
					{isLoading ? 'Loading…' : 'Confirm New Portfolio'}
				</button>
				<div className='Cancel' onClick={() => setConfirm(false)}>
					Cancel
				</div>
			</form>
		</div>
	)
}

export default SetPortfolio
