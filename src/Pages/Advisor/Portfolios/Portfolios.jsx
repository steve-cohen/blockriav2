import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Portfolios.css'

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
			<td></td>
		</tr>
	)
}

const Portfolios = ({ advisor, portfolios, setPortfolios }) => {
	useEffect(async () => {
		setPortfolios([])
		fetch(`https://blockria.com/api/portfolios?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(newPortfolios => {
				console.log(newPortfolios)
				localStorage.setItem('portfolios', JSON.stringify(newPortfolios))
				setPortfolios(newPortfolios)
			})
			.catch(error => alert(error))
	}, [])

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
