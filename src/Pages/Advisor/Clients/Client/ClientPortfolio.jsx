import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './ClientPortfolio.css'

const ClientPortfolio = ({ advisor, portfolioId, rebalanceFrequency }) => {
	const [searchParams] = useSearchParams()
	const [portfolio, setPortfolio] = useState({})

	const clientId = searchParams.get('clientId')
	const clientName = searchParams.get('clientName')

	useEffect(() => {
		if (!portfolioId) return

		fetch(
			`https://blockria.com/api/coinbase/clients/client/portfolio?advisorId=${advisor.idToken.payload.sub}&portfolioId=${portfolioId}`
		)
			.then(response => response.json())
			.then(setPortfolio)
			.catch(alert)
	}, [advisor, portfolioId])

	return (
		<table>
			<caption>
				<div className='Flex'>
					<div className='Title'>Portfolio for {clientName}</div>
					<Link
						className='Button'
						to={`/advisor/clients/client/setPortfolio?clientName=${clientName}&clientId=${clientId}&portfolioId=${portfolioId}`}
					>
						{portfolioId ? 'Change Portfolio' : 'Assign a Portfolio'}
					</Link>
				</div>
			</caption>
			<thead>
				<tr>
					<th>PORTFOLIO</th>
					<th>REBALANCING</th>
					{/* <th className='AlignRight'>1D</th>
					<th className='AlignRight'>1W</th>
					<th className='AlignRight'>1M</th>
					<th className='AlignRight'>3M</th>
					<th className='AlignRight'>YTD</th>
					<th className='AlignRight'>1Y</th> */}
				</tr>
			</thead>
			{portfolioId ? (
				<tbody>
					<tr>
						<td className='Bold'>{portfolio.portfolioName}</td>
						<td className='Break'>{rebalanceFrequency}</td>
					</tr>
				</tbody>
			) : null}
			<tfoot>
				<tr>
					<td colSpan={8}>
						<Link
							to={`/advisor/clients/client/setPortfolio?clientName=${clientName}&clientId=${clientId}&portfolioId=${portfolioId}`}
						>
							+ {portfolioId ? 'Change Portfolio' : 'Assign a Portfolio'}
						</Link>
					</td>
				</tr>
			</tfoot>
		</table>
	)
}

export default ClientPortfolio
