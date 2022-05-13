import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import coinbaseTokenNames from '../../coinbaseTokenNames.json'
import coinbaseTokenOrder from './coinbaseTokenOrder.json'
import './EditPortfolio.css'

const coinbaseHoldings = coinbaseTokenOrder.map(token => `${token} - ${coinbaseTokenNames[token]}`).sort()

function formatPercent(number) {
	return (number / 100).toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		style: 'percent'
	})
}

const EditPortfolio = ({ advisor }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const advisorId = advisor.idToken.payload.sub
	let portfolioId = searchParams.get('portfolioId')

	const [holdings, setHoldings] = useState([
		{ holding: '', percent: '' },
		{ holding: '', percent: '' }
	])
	const [isDeleteing, setIsDeleting] = useState(false)
	const [isConfirming, setIsConfirming] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [portfolioName, setPortfolioName] = useState('')

	useEffect(async () => {
		setIsLoading(true)

		if (portfolioId) {
			await fetch(`https://blockria.com/api/portfolios/portfolio?advisorId=${advisorId}&portfolioId=${portfolioId}`)
				.then(response => response.json())
				.then(newPortfolio => {
					setHoldings(JSON.parse(newPortfolio.allocations))
					setPortfolioName(newPortfolio.portfolioName)
				})
				.catch(alert)
		}

		await setIsLoading(false)
	}, [])

	function addHolding() {
		let newHoldings = JSON.parse(JSON.stringify(holdings))
		newHoldings.push({ holding: '', percent: '' })
		setHoldings(newHoldings)
	}

	function deleteHolding(index) {
		let newHoldings = JSON.parse(JSON.stringify(holdings))
		newHoldings.splice(index, 1)
		setHoldings(newHoldings)
	}

	function handleHolding(newHolding, index) {
		let newHoldings = JSON.parse(JSON.stringify(holdings))
		newHoldings[index] = newHolding
		setHoldings(newHoldings)
	}

	async function handleDelete() {
		if (!isConfirming) {
			setIsConfirming(true)
			setIsDeleting(true)
			return
		}

		const deleteOptions = {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ advisorId, portfolioId })
		}

		fetch('https://blockria.com/api/portfolios/portfolio', deleteOptions)
			.then(() => navigate('/advisor/portfolios'))
			.catch(alert)
	}

	async function handleSubmit(e) {
		e.preventDefault()

		if (!e.currentTarget.checkValidity()) {
			e.stopPropagation()
			return
		}

		let totalPercent = 0
		holdings.forEach(({ percent }) => (totalPercent += Number(percent)))
		if (totalPercent < 99.99 || totalPercent > 100) {
			e.stopPropagation()
			alert('Percentages must add up to 100%')
			return
		}

		if (!isConfirming) {
			setIsConfirming(true)
			return
		}

		setIsLoading(true)

		const allocations = holdings.map(({ holding, percent }) => {
			return { holding, percent: Number(percent) }
		})

		const portfolioOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				advisorId,
				allocations,
				portfolioId: portfolioId || Date.now(),
				portfolioName
			})
		}

		fetch('https://blockria.com/api/portfolios/portfolio', portfolioOptions)
			.then(() => navigate(`/advisor/portfolios`))
			.catch(alert)
	}

	function renderDelete() {
		if (!portfolioId) return
		if (isConfirming && !isDeleteing) return

		return (
			<div className='Delete' onClick={handleDelete} style={isConfirming ? {} : { marginLeft: '12px' }}>
				{isConfirming ? 'Confirm Delete Portfolio' : 'Delete Portfolio'}
			</div>
		)
	}

	function renderHolding({ holding, percent }, index) {
		return (
			<React.Fragment key={`Holdings ${index}`}>
				<div className='HoldingFlex'>
					<div>Holding {index + 1}</div>
					{!isConfirming && (
						<div className='Red' onClick={() => deleteHolding(index)}>
							Delete
						</div>
					)}
				</div>
				<select
					disabled={isConfirming && true}
					onChange={e => handleHolding({ holding: e.target.value, percent }, index)}
					required
					value={holding}
				>
					<option disabled value={''}>
						Select a Holding
					</option>
					{coinbaseHoldings.map(holding => (
						<option value={holding.split(' - ')[0]} key={`Holding ${holding}`}>
							{holding}
						</option>
					))}
				</select>
				<input
					autoComplete='off'
					className='Percent'
					disabled={isConfirming && true}
					displayvalue={isConfirming ? `${formatPercent(percent)}%` : null}
					min={0.01}
					max={100}
					onChange={e => handleHolding({ holding, percent: e.target.value }, index)}
					placeholder='Set a Percentage (Ex: 60.00%)'
					required
					step={0.01}
					type={isConfirming ? 'text' : 'number'}
					value={isConfirming ? formatPercent(percent) : percent}
				/>
			</React.Fragment>
		)
	}

	return isLoading ? (
		<div className='EditPortfolio NewForm'>
			<div className='Loading'>Loading...</div>
		</div>
	) : (
		<div className={`EditPortfolio NewForm ${isConfirming && 'NewFormConfirm'}`}>
			<form onSubmit={handleSubmit}>
				<div className='Title'>{portfolioId ? 'Edit' : 'Create a'} Portfolio</div>
				<div>Portfolio Name</div>
				<input
					autoComplete='off'
					autoFocus
					disabled={isConfirming && true}
					onChange={e => setPortfolioName(e.target.value)}
					required
					value={portfolioName}
				/>
				{holdings.map(renderHolding)}
				{!isConfirming && (
					<div className='Link' onClick={addHolding}>
						+ Add Holding
					</div>
				)}
				{!isDeleteing && (
					<input
						className='Continue'
						type='submit'
						value={isConfirming ? 'Confirm Portfolio' : portfolioId ? 'Edit Portfolio' : 'Create Portfolio'}
					/>
				)}
				{renderDelete()}
				<div className='Cancel' onClick={() => (isConfirming ? setIsConfirming(false) : navigate(-1))}>
					Cancel
				</div>
			</form>
		</div>
	)
}

export default EditPortfolio
