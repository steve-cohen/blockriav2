import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AccountContext } from '../../../../Account'
import './Edit.css'

const Edit = ({ portfolios, setPortfolios }) => {
	const { getAdvisorId } = useContext(AccountContext)
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [allocations, setAllocations] = useState([
		{ currency: '', percent: '' },
		{ currency: '', percent: '' },
		{ currency: '', percent: '' }
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

	function addCurrency() {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations.push({ currency: '', percent: '' })
		setAllocations(newAllocations)
	}

	function handleCurrency(e, index) {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations[index].currency = e.target.value
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

		let url = `https://blockria.com/portfolios/update`
		url += `?advisorId=${advisorId}&portfolioId=${newPortfolioId}&portfolioName=${portfolioName}&allocations=${newAllocations}`

		console.log(url)
		// fetch(url)
		// 	.then(response => {
		// 		console.log(response)

		// 		console.log(portfolios)
		// 		let newPortfolios = JSON.parse(JSON.stringify(portfolios))
		// 		newPortfolios.push({
		// 			portfolioId: { S: portfolioId },
		// 			portfolioName: { S: portfolioName },
		// 			allocations: { S: newAllocations }
		// 		})
		// 		console.log(newPortfolios)

		// 		setPortfolios(newPortfolios)
		// 		setIsLoading(false)
		// 		navigate('/advisor/portfolios')
		// 	})
		// 	.catch(error => {
		// 		setIsLoading(false)
		// 		alert(error)
		// 	})
	}

	function removeCurrency(index) {
		let newAllocations = JSON.parse(JSON.stringify(allocations))
		newAllocations.splice(index, 1)
		setAllocations(newAllocations)
	}

	function renderAllocation({ currency, percent }, index) {
		return (
			<div className='Allocation' key={`Allocation ${index}`}>
				<div className='Flex'>
					<input
						className='Currency'
						minLength={1}
						onChange={e => handleCurrency(e, index)}
						placeholder='Currency'
						required
						value={currency}
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
					<div className='RemoveCurrency' onClick={() => removeCurrency(index)}>
						Remove
					</div>
				)}
			</div>
		)
	}

	return (
		<div className='Edit'>
			<div className='Title'>Edit Portfolio</div>
			<form onSubmit={handleSubmit}>
				<input
					className='PortfolioName'
					onChange={e => setPortfolioName(e.target.value)}
					placeholder='Portfolio Name'
					required
					value={portfolioName}
				/>
				{allocations.map(renderAllocation)}
				<div className='AddCurrency' onClick={addCurrency}>
					+ Add Currency
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
			</form>
		</div>
	)
}

export default Edit
