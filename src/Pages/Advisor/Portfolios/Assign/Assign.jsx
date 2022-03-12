import React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './Assign.css'

const Assign = ({ portfolios, setPortfolio }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	function handlePortfolio(portfolio) {
		localStorage.setItem('portfolio', JSON.stringify(portfolio))
		setPortfolio(portfolio)

		let url = '/advisor/portfolios/confirm?'
		url += `clientName=${searchParams.get('clientName')}`
		url += `&clientId=${searchParams.get('clientId')}`
		navigate(url)
	}

	function renderPortfolios(portfolio) {
		const { allocations, portfolioId, portfolioName } = portfolio

		return (
			<tr key={`Portfolio ${portfolioId.S}`} onClick={() => handlePortfolio(portfolio)}>
				<td>{portfolioName.S}</td>
				<td>
					{JSON.parse(allocations.S)
						.sort((a, b) => b.percent - a.percent)
						.map(({ holding, percent }) => `${holding} ${percent}%`)
						.join(', ')}
				</td>
			</tr>
		)
	}

	function renderNoPortfolio() {
		let url = '/advisor/portfolios/confirm?'
		url += `clientName=${searchParams.get('clientName')}`
		url += `&clientId=${searchParams.get('clientId')}`
		// url += `&portfolioId=${searchParams.get('portfolioId')}`
		url += `&newPortfolioId=`

		return (
			<tr key={`Portfolio -1`} onClick={() => navigate(url)}>
				<td>No Portfolio</td>
				<td />
			</tr>
		)
	}

	return (
		<div className='Assign'>
			<div className='Description'>
				<div className='Title'>Assign a Portfolio to {searchParams.get('clientName')}.</div>
			</div>
			<div>
				<table>
					<tbody>
						{portfolios.map(renderPortfolios)}
						{renderNoPortfolio()}
						<tr key={`Portfolio Create`} onClick={() => navigate('/advisor/portfolios/edit')}>
							<td>Create a Portfolio</td>
							<td />
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default Assign
