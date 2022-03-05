import React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './Assign.css'

const Assign = ({ portfolios }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	function renderPortfolios({ allocations, portfolioId, portfolioName }) {
		let url = '/advisor/portfolios/confirm?'
		url += `clientName=${searchParams.get('clientName')}`
		url += `&clientId=${searchParams.get('clientId')}`
		// url += `&portfolioId=${searchParams.get('portfolioId')}`
		url += `&newPortfolioId=${portfolioId.S}`

		return (
			<tr key={`Portfolio ${portfolioId.S}`} onClick={() => navigate(url)}>
				<td>{portfolioName.S}</td>
				<td>
					{JSON.parse(allocations.S)
						.sort((a, b) => b.percent - a.percent)
						.map(({ currency, percent }) => `${currency} ${percent}%`)
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
