import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AccountContext } from '../../../../Account'
import coinbaseTokenNames from '../../coinbaseTokenNames.json'
import coinbaseTokenOrder from './coinbaseTokenOrder.json'
import './Edit.css'

const coinbaseHoldings = coinbaseTokenOrder.map(token => `${token} - ${coinbaseTokenNames[token]}`)

const Edit = ({ portfolios, setPortfolios }) => {
	const { getAdvisorId } = useContext(AccountContext)
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [allocations, setAllocations] = useState([
		{ holding: '', holdings: coinbaseHoldings, percent: '', showHoldings: false },
		{ holding: '', holdings: coinbaseHoldings, percent: '', showHoldings: false }
	])
	const [isLoading, setIsLoading] = useState(false)
	const [portfolioName, setPortfolioName] = useState('')
	const [portfolioId, setPortfolioId] = useState('')

	useEffect(() => {
		if (searchParams.get('portfolioId')) {
			const portfolio = portfolios.filter(({ portfolioId }) => portfolioId === Number(searchParams.get('portfolioId')))
			console.log(portfolio)

			if (portfolio.length) {
				const newAllocations = []
				portfolio[0].allocations.forEach(({ holding, percent }) => {
					const newHoldings = coinbaseHoldings.filter(token => token.toUpperCase().includes(holding.toUpperCase()))
					newAllocations.push({
						holding: `${holding} - ${coinbaseTokenNames[holding]}`,
						holdings: newHoldings,
						percent,
						showHoldings: false
					})
				})
				setAllocations(newAllocations)
				setPortfolioName(portfolio[0].portfolioName)
				setPortfolioId(portfolio[0].portfolioId)
			}
		}
	}, [])

	function addHolding() {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations.push({ holding: '', holdings: coinbaseHoldings, percent: '', showHoldings: false })
		setAllocations(newAllocations)
	}

	function handleHolding(e, index) {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations.forEach((_, index) => (newAllocations[index].showHoldings = false))

		newAllocations[index].holding = e.target.value
		newAllocations[index].holdings = coinbaseHoldings.filter(token =>
			token.toUpperCase().includes(e.target.value.toUpperCase())
		)
		newAllocations[index].showHoldings = true
		setAllocations(newAllocations)
	}

	function handleHoldingDropDown(holding, index) {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations[index].holding = holding
		newAllocations[index].holdings = coinbaseHoldings.filter(token => token.includes(holding))
		newAllocations[index].showHoldings = false
		setAllocations(newAllocations)
	}

	function handlePercent(e, index) {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations[index].percent = e.target.value.slice(0, 6)
		setAllocations(newAllocations)
	}

	function handleSubmit(e) {
		e.preventDefault()
		setIsLoading(true)

		if (!e.currentTarget.checkValidity()) {
			e.stopPropagation()
			setIsLoading(false)
			return
		}

		let allocationTotalPercent = 0
		allocations.forEach(({ percent }) => (allocationTotalPercent += Number(percent)))
		if (allocationTotalPercent < 99.99 || allocationTotalPercent > 100) {
			e.stopPropagation()
			setIsLoading(false)
			alert('Percentages must add up to 100%')
			return
		}

		// Upload New Portfolio
		const advisorId = getAdvisorId()
		let newAllocations = JSON.stringify(
			allocations.map(({ holding, percent }) => {
				return { holding: holding.trim().split(' ')[0], percent: Number(percent) }
			})
		)
		let newPortfolioId = portfolioId || new Date().getTime().toString()
		let newPortfolioName = portfolioName

		let url = `https://blockria.com/portfolios/update`
		url += `?advisorId=${advisorId}&portfolioId=${newPortfolioId}&portfolioName=${newPortfolioName}&allocations=${newAllocations}`

		console.log(url)
		fetch(url)
			.then(() => navigate('/advisor/portfolios'))
			.catch(error => {
				setIsLoading(false)
				alert(error)
			})
	}

	function removeHolding(index) {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations.splice(index, 1)
		setAllocations(newAllocations)
	}

	function renderAllocation({ holding, holdings, percent, showHoldings }, index) {
		return (
			<div className='Allocation' key={`Allocation ${index}`}>
				<div className='Flex'>
					<input
						autoComplete='off'
						className='Holding'
						minLength={1}
						id='holding'
						onChange={e => handleHolding(e, index)}
						onClick={() => flipHoldings(index)}
						placeholder='Holding'
						required
						value={holding}
					/>
					<input
						autoComplete='off'
						className='Percent'
						minLength={1}
						min='0'
						max='100'
						onChange={e => handlePercent(e, index)}
						placeholder='0.00%'
						required
						type='number'
						value={percent}
					/>
				</div>
				{showHoldings && (
					<div className='Holdings'>
						{holdings.map(holding => (
							<div key={holding} id='holding' onClick={() => handleHoldingDropDown(holding, index)}>
								{holding}
							</div>
						))}
					</div>
				)}
				{index > 0 && (
					<div className='RemoveHolding' id='holding' onClick={() => removeHolding(index)}>
						Remove
					</div>
				)}
			</div>
		)
	}

	function closeAllHoldings(e) {
		if (e.target.id !== 'holding') {
			let newAllocations = JSON.parse(JSON.stringify(allocations))
			newAllocations.forEach((_, index) => (newAllocations[index].showHoldings = false))
			setAllocations(newAllocations)
		}
	}

	function flipHoldings(index) {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations.forEach((_, allocationIndex) => {
			if (allocationIndex === index) newAllocations[index].showHoldings = !newAllocations[index].showHoldings
			else newAllocations[allocationIndex].showHoldings = false
		})
		setAllocations(newAllocations)
	}

	return (
		<div className='Edit' onClick={closeAllHoldings}>
			<div className='Title'>{searchParams.get('portfolioId') ? 'Edit Portfolio' : 'Create a Portfolio'}</div>
			<form onSubmit={handleSubmit}>
				<input
					autoComplete='off'
					autoFocus
					className='PortfolioName'
					onChange={e => setPortfolioName(e.target.value)}
					placeholder='Portfolio Name'
					required
					value={portfolioName}
				/>
				{allocations.map(renderAllocation)}
				<div className='AddHolding' id='holding' onClick={addHolding}>
					+ Add Holding
				</div>
				<button disabled={isLoading} type='submit'>
					{isLoading ? 'Loading…' : 'Save Portfolio'}
				</button>
				{/* <button disabled={isLoading} style={{ float: 'right' }} type='submit'>
					{isLoading ? 'Loading…' : 'Save + Assign to Client(s)'}
				</button> */}
				<div className='Cancel' onClick={() => navigate(-1)}>
					Cancel
				</div>
			</form>
		</div>
	)
}

export default Edit
