import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AccountContext } from '../../../../Account'
import './Edit.css'

const Edit = ({ portfolios, setPortfolios }) => {
	const { getAdvisorId } = useContext(AccountContext)
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [allocations, setAllocations] = useState([
		{ holding: '', percent: '' },
		{ holding: '', percent: '' },
		{ holding: '', percent: '' }
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
		newAllocations.push({ holding: '', percent: '' })
		setAllocations(newAllocations)
	}

	function handleHolding(e, index) {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations[index].holding = e.target.value
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

	function renderAllocation({ holding, percent }, index) {
		return (
			<div className='Allocation' key={`Allocation ${index}`}>
				<div className='Flex'>
					<input
						className='Holding'
						minLength={1}
						onChange={e => handleHolding(e, index)}
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
				{index > 0 && (
					<div className='RemoveHolding' onClick={() => removeHolding(index)}>
						Remove
					</div>
				)}
			</div>
		)
	}

	return (
		<div className='Edit'>
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
				{/* <button disabled={isLoading} type='submit'>
					{isLoading ? 'Loading…' : 'Save'}
				</button>
				<button disabled={isLoading} style={{ float: 'right' }} type='submit'>
					{isLoading ? 'Loading…' : 'Save + Assign to Client(s)'}
				</button> */}
				<button disabled={isLoading} type='submit'>
					{isLoading ? 'Loading…' : 'Save Portfolio'}
				</button>
				<div className='Cancel' onClick={() => navigate(-1)}>
					Cancel
				</div>
			</form>
		</div>
	)
}

export default Edit
