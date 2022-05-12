import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './SetPortfolio.css'

const frequencies = ['Once', 'Weekly', 'Biweekly', 'Monthly', 'Quarterly', 'Annually']

const SetPortfolio = ({ advisor }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [frequency, setFrequency] = useState(searchParams.get('rebalanceFrequency') || '')
	const [isConfirming, setIsConfirming] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [portfolioId, setPortfolioId] = useState(searchParams.get('portfolioId') || '')
	const [portfolios, setPortfolios] = useState([])

	useEffect(() => {
		fetch(`https://blockria.com/api/portfolios?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(setPortfolios)
			.catch(alert)
	}, [])

	async function handleSubmit(e) {
		e.preventDefault()

		if (!e.currentTarget.checkValidity()) {
			e.stopPropagation()
			return
		}

		if (!isConfirming) {
			setIsConfirming(true)
			return
		}

		setIsLoading(true)

		let url = 'https://blockria.com/coinbase/update/portfolioid?'
		url += `advisorId=${advisor.idToken.payload.sub}`
		url += `&clientId=${searchParams.get('clientId')}`
		url += `&portfolioId=${portfolioId}`
		url += `&rebalanceFrequency=${frequency}`

		await fetch(url)
			.then(() => navigate('/advisor/clients'))
			.catch(alert)
	}

	function renderFrequency(frequency) {
		return (
			<option value={frequency} key={`SetFrequency ${frequency}`}>
				Rebalance {frequency}
			</option>
		)
	}

	function renderPortfolio({ allocations, portfolioId, portfolioName }) {
		return (
			<option value={portfolioId} key={`SetPortfolio ${portfolioId}`}>
				{portfolioName} ({renderPortfolioAllocations(allocations)})
			</option>
		)
	}

	function renderPortfolioAllocations(allocations) {
		const allocationsString = allocations
			.sort((a, b) => b.percent - a.percent)
			.slice(0, 5)
			.map(({ holding, percent }) => `${holding} ${percent}%`)
			.join(', ')

		if (allocations.length > 5) allocationsString += ', ...'

		return allocationsString
	}

	console.log({ portfolioId })
	return (
		<div className={`SetPortfolio NewForm ${isConfirming ? 'NewFormConfirm' : ''}`}>
			<form onSubmit={handleSubmit}>
				<div className='Title'>Set a Portfolio for {searchParams.get('clientName')}</div>
				<div>Portfolio</div>
				<select
					disabled={isConfirming ? true : false}
					onChange={e => setPortfolioId(e.target.value)}
					required
					value={portfolioId}
				>
					<option disabled value=''>
						Select a Portfolio
					</option>
					{portfolios.map(renderPortfolio)}
					<option value={0}>No Portfolio</option>
				</select>
				<div>Rebalancing Frequency</div>
				<select
					disabled={isConfirming ? true : false}
					onChange={e => setFrequency(e.target.value)}
					required
					value={frequency}
				>
					<option disabled value=''>
						Select a Rebalancing Frequency
					</option>
					{frequencies.map(renderFrequency)}
					<option value={0}>No Rebalancing</option>
				</select>
				{isConfirming && (
					<>
						<div>Next Rebalancing</div>
						<input
							disabled={true}
							type='text'
							value={
								portfolioId !== '0' && portfolioId !== '' && frequency !== '0'
									? '11:59:59 PM GMT-0700 (Pacific Daylight Time)'
									: 'None'
							}
						/>
					</>
				)}
				<input
					className='Continue'
					disabled={isLoading ? true : false}
					type='submit'
					value={isLoading ? 'Loading...' : isConfirming ? 'Confirm Portfolio' : 'Set Portfolio'}
				/>
				{!isLoading && (
					<div className='Cancel' onClick={() => (isConfirming ? setIsConfirming(false) : navigate(-1))}>
						Cancel
					</div>
				)}
			</form>
		</div>
	)
}

export default SetPortfolio
