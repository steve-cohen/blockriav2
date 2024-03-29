import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Taxes.css'

const Taxes = ({ advisor }) => {
	const [clients, setClients] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [taxYears, setTaxYears] = useState([])

	useEffect(async () => {
		setIsLoading(true)

		await fetch(`https://blockria.com/api/coinbase/taxes?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(newClients => {
				console.log(newClients)
				const date = new Date()

				let minTaxYear = date.getFullYear()
				newClients.forEach(({ createdAt }) => {
					if (minTaxYear > Number(createdAt.slice(0, 4))) minTaxYear = Number(createdAt.slice(0, 4))
				})

				let newTaxYears = []
				for (let i = date.getFullYear(); i >= minTaxYear; i--) newTaxYears.push(i)

				setClients(newClients.sort((a, b) => a.clientName.localeCompare(b.clientName)))
				setTaxYears(newTaxYears)
			})
			.catch(alert)

		setIsLoading(false)
	}, [])

	function renderTaxYears(clientId, clientName, createdAt) {
		const date = new Date()
		let years = []
		for (let i = date.getFullYear(); i >= Number(createdAt.slice(0, 4)); i--) years.push(i)

		return years.map(year => (
			<td key={`TaxYearBody ${year}`}>
				<Link to={`/advisor/clients/client/taxevents?clientName=${clientName}&clientId=${clientId}&year=${year}`}>
					{year}
				</Link>
			</td>
		))
	}

	return (
		<div className='ResponsiveTable'>
			<table className='Taxes'>
				<caption>
					<div className='Flex'>
						<div className='Title'>Tax Events</div>
					</div>
				</caption>
				<thead>
					<tr>
						<th>NAME</th>
						<th>ALL</th>
						{taxYears.map((taxYear, index) => (
							<th className={index === taxYears.length - 1 ? 'Break' : ''} key={`TaxYearHead ${taxYear}`}>
								{taxYear}
							</th>
						))}
					</tr>
				</thead>
				{isLoading ? (
					<tbody>
						<tr>
							<td className='Loading' style={{ border: 'none' }}>
								Loading...
							</td>
						</tr>
					</tbody>
				) : (
					<tbody>
						{clients
							.sort((a, b) => b.clientName - a.clientName)
							.map(({ clientId, clientName, createdAt }) => (
								<tr key={clientId}>
									<td className='Bold'>
										<Link to={`/advisor/clients/client?clientName=${clientName}&clientId=${clientId}`}>
											{clientName}
										</Link>
									</td>
									<td className='Bold Break'>
										<Link to={`/advisor/clients/client/taxevents?clientName=${clientName}&clientId=${clientId}`}>
											All Tax Events
										</Link>
									</td>
									{renderTaxYears(clientId, clientName, createdAt)}
								</tr>
							))}
					</tbody>
				)}
			</table>
		</div>
	)
}

export default Taxes
