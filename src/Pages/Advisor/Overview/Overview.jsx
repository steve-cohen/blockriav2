import React, { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, LabelList, Legend, Tooltip, ResponsiveContainer, Text } from 'recharts'
import './Overview.css'

const Overview = ({ advisor }) => {
	const [performance, setPerformance] = useState([])

	useEffect(async () => {
		await fetch(`https://blockria.com/api/overview?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(formatPerformanceData)
			.catch(alert)
	}, [])

	function formatPerformanceData(data) {
		console.log(data)

		if (data.Item === undefined) return []
		if (data.Item.advisorId) delete data.Item.advisorId

		// DeStructure DynamoDB
		let newPerformance = []
		Object.entries(data.Item).forEach(([date, holdings]) => {
			let performanceDay = { date }
			Object.entries(holdings.M).forEach(([token, amount]) => (performanceDay[token] = Number(amount.N).toFixed(2)))
			newPerformance.push(performanceDay)
		})
		newPerformance = newPerformance.sort((a, b) => Number(a.date.replace(/-/g, '')) - Number(b.date.replace(/-/g, '')))

		console.log(newPerformance)
		setPerformance(newPerformance)
	}

	return (
		<div className='Overview'>
			<ResponsiveContainer width='100%' height='100%'>
				<AreaChart data={performance}>
					<defs>
						<linearGradient id='BTC' x1='0' y1='0' x2='0' y2='1'>
							<stop offset='5%' stopColor='#8884d8' stopOpacity={0.8} />
							<stop offset='90%' stopColor='#8884d8' stopOpacity={0} />
						</linearGradient>
						<linearGradient id='ETH' x1='0' y1='0' x2='0' y2='1'>
							<stop offset='5%' stopColor='#82ca9d' stopOpacity={0.8} />
							<stop offset='90%' stopColor='#82ca9d' stopOpacity={0} />
						</linearGradient>
						<linearGradient id='USD' x1='0' y1='0' x2='0' y2='1'>
							<stop offset='5%' stopColor='#ffc658' stopOpacity={0.8} />
							<stop offset='90%' stopColor='#ffc658' stopOpacity={0} />
						</linearGradient>
					</defs>
					{/* <CartesianGrid strokeDasharray='3 3' /> */}
					<XAxis dataKey='date' />
					<YAxis label={{ value: 'Assets Under Management', angle: -90, position: 'start', textAnchor: 'end' }} />
					{/* <YAxis /> */}
					<Tooltip />
					<Legend />
					<Text />
					<Area type='monotone' dataKey='BTC' stackId='1' stroke='#8884d8' fill='url(#BTC)' />
					<Area type='monotone' dataKey='ETH' stackId='1' stroke='#82ca9d' fill='url(#ETH)' />
					<Area type='monotone' dataKey='USD' stackId='1' stroke='#ffc658' fill='url(#USD)' />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	)
}

export default Overview
