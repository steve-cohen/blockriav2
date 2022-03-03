import React from 'react'
import { Link } from 'react-router-dom'
import './Portfolios.css'

function renderPortfolios({ allocation, portfolioId, portfolioName }) {
	return (
		<tr key={`Portfolio ${portfolioId.S}`}>
			<td>{portfolioName.S}</td>
			<td>
				{Object.entries(JSON.parse(allocation.S))
					.sort((a, b) => b[1] - a[1])
					.map(([id, percent]) => `${id} ${percent}%`)
					.join('\n')}
			</td>
			<td>
				<Link to={`/advisor/portfolios/edit?portfolioId=${portfolioId.S}`}>Edit Portfolio</Link>
			</td>
			<td>
				<Link to={`/advisor/portfolios/assign?portfolioId=${portfolioId.S}`}>Assign Portfolio to Client(s)</Link>
			</td>
			<td></td>
		</tr>
	)
}

const Portfolios = ({ portfolios }) => {
	return (
		<div className='Portfolios'>
			<div className='Title'>Portfolios</div>
			<div className='Options'>
				<div></div>
				<div>
					<Link className='Option1' to='/advisor/createportfolio'>
						Create Portfolio
					</Link>
				</div>
			</div>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Allocations</th>
						<th></th>
						<th></th>
					</tr>
				</thead>
				<tbody>{portfolios.map(portfolio => renderPortfolios(portfolio))}</tbody>
			</table>
			<Link className='Option0' to='/advisor/createportfolio'>
				+ Create Portfolio
			</Link>
		</div>
	)
}

export default Portfolios
