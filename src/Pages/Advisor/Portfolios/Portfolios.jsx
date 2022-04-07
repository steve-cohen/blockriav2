import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Portfolios.css'

const Portfolios = ({ advisor, portfolios, setPortfolios }) => {
	useEffect(async () => {
		setPortfolios([])
		fetch(`https://blockria.com/api/portfolios?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(setPortfolios)
			.catch(error => alert(error))
	}, [])

	function renderPortfolios({ allocations, portfolioId, portfolioName }) {
		return (
			<tr key={`Portfolio ${portfolioId}`}>
				<td>{portfolioName}</td>
				<td>
					{allocations
						.sort((a, b) => b.percent - a.percent)
						.map(({ holding, percent }) => `${holding} ${percent}%`)
						.join('\n')}
				</td>
				<td>
					<Link to={`/advisor/portfolios/edit?portfolioId=${portfolioId}`}>Edit Portfolio</Link>
				</td>
				{/* <td>
				<Link to={`/advisor/portfolios/assign?portfolioId=${portfolioId}`}>Assign Portfolio to Client(s)</Link>
			</td> */}
			</tr>
		)
	}

	return (
		<table>
			<caption>
				<div className='Flex'>
					<div className='Title'>Portfolios</div>
					<Link className='Button' to={`/advisor/portfolios/edit`}>
						Create Portfolio
					</Link>
				</div>
			</caption>
			<thead>
				<tr>
					<th>NAME</th>
					<th>Allocations</th>
					<th>EDIT</th>
				</tr>
			</thead>
			<tbody>{portfolios.map(renderPortfolios)}</tbody>
			<tfoot>
				<tr>
					<td colSpan={3}>
						<Link to='/advisor/portfolios/edit'>+ Create Portfolio</Link>
					</td>
				</tr>
			</tfoot>
		</table>
	)
}

export default Portfolios
