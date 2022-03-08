import React from 'react'
import { Link } from 'react-router-dom'
import './Portfolios.css'

function renderPortfolios({ allocations, portfolioId, portfolioName }) {
	return (
		<tr key={`Portfolio ${portfolioId.S}`}>
			<td>{portfolioName.S}</td>
			<td>
				{JSON.parse(allocations.S)
					.sort((a, b) => b.percent - a.percent)
					.map(({ holding, percent }) => `${holding} ${percent}%`)
					.join('\n')}
			</td>
			<td>
				<Link to={`/advisor/portfolios/edit?portfolioId=${portfolioId.S}`}>Edit Portfolio</Link>
			</td>
			{/* <td>
				<Link to={`/advisor/portfolios/assign?portfolioId=${portfolioId.S}`}>Assign Portfolio to Client(s)</Link>
			</td> */}
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
					<Link className='Option1' to='/advisor/portfolios/edit'>
						Create Portfolio
					</Link>
				</div>
			</div>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Allocations</th>
						<th>Edit</th>
						{/* <th>Assign</th> */}
						<th />
					</tr>
				</thead>
				<tbody>{portfolios.map(renderPortfolios)}</tbody>
			</table>
			<Link className='Option0' to='/advisor/portfolios/edit'>
				+ Create Portfolio
			</Link>
		</div>
	)
}

export default Portfolios
