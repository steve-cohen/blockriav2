import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AccountContext } from '../../../../Account'
import coinbaseTokens from './coinbaseTokens.json'
import './Edit.css'

const Edit = ({ portfolios, setPortfolios }) => {
	const { getAdvisorId } = useContext(AccountContext)
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [allocations, setAllocations] = useState([
		{ holding: '', holdings: coinbaseTokens, percent: '', showHoldings: false },
		{ holding: '', holdings: coinbaseTokens, percent: '', showHoldings: false }
	])
	const [isLoading, setIsLoading] = useState(false)
	const [portfolioName, setPortfolioName] = useState('')
	const [portfolioId, setPortfolioId] = useState('')

	useEffect(() => {
		if (searchParams.get('portfolioId')) {
			const portfolio = portfolios.filter(({ portfolioId }) => portfolioId.S === searchParams.get('portfolioId'))

			if (portfolio.length) {
				setAllocations(JSON.parse(portfolio[0].allocations.S))
				setPortfolioName(portfolio[0].portfolioName.S)
				setPortfolioId(portfolio[0].portfolioId.S)
			}
		}
	}, [])

	function addHolding() {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations.push({ holding: '', holdings: [], percent: '', showHoldings: false })
		setAllocations(newAllocations)
	}

	function handleHolding(e, index) {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations.forEach((_, index) => (newAllocations[index].showHoldings = false))

		newAllocations[index].holding = e.target.value.toUpperCase()
		newAllocations[index].holdings = coinbaseTokens.filter(token => token.includes(e.target.value.toUpperCase()))
		newAllocations[index].showHoldings = true
		console.log(newAllocations)
		setAllocations(newAllocations)
	}

	function handleHoldingDropDown(holding, index) {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations[index].holding = holding
		newAllocations[index].holdings = coinbaseTokens.filter(token => token.includes(holding))
		newAllocations[index].showHoldings = false
		setAllocations(newAllocations)
	}

	function handlePercent(e, index) {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations[index].percent = e.target.value
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

		// Upload New Portfolio
		const advisorId = getAdvisorId()
		let newAllocations = JSON.stringify(allocations)
		let newPortfolioId = portfolioId || new Date().getTime().toString()
		let newPortfolioName = portfolioName

		let url = `https://blockria.com/portfolios/update`
		url += `?advisorId=${advisorId}&portfolioId=${newPortfolioId}&portfolioName=${newPortfolioName}&allocations=${newAllocations}`

		console.log(url)
		fetch(url)
			.then(response => {
				console.log(response)

				console.log(portfolios)
				let newPortfolios = JSON.parse(JSON.stringify(portfolios))

				if (portfolioId) {
					let newPortfoliosObject = {}
					newPortfolios.forEach(newPortfolio => (newPortfoliosObject[newPortfolio.portfolioId.S] = newPortfolio))
					console.log({ newPortfoliosObject })

					newPortfoliosObject[portfolioId] = {
						portfolioId: { S: portfolioId },
						portfolioName: { S: newPortfolioName },
						allocations: { S: newAllocations }
					}

					newPortfolios = Object.values(newPortfoliosObject)
				} else {
					newPortfolios.push({
						portfolioId: { S: newPortfolioId },
						portfolioName: { S: newPortfolioName },
						allocations: { S: newAllocations }
					})
				}
				console.log(newPortfolios)

				setPortfolios(newPortfolios)
				setIsLoading(false)
				navigate('/advisor/portfolios')
			})
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
						className='Percent'
						minLength={1}
						onChange={e => handlePercent(e, index)}
						placeholder='0.00%'
						required
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
					<div className='RemoveHolding' onClick={() => removeHolding(index)}>
						Remove
					</div>
				)}
			</div>
		)
	}

	function closeAllHoldings(e) {
		console.log(e.target.id)
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
					autoFocus
					className='PortfolioName'
					onChange={e => setPortfolioName(e.target.value)}
					placeholder='Portfolio Name'
					required
					value={portfolioName}
				/>
				{allocations.map(renderAllocation)}
				<div className='AddHolding' onClick={addHolding}>
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
