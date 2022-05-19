import React, { useEffect, useState } from 'react'
import './Settings.css'

function renderPhone(phone_number) {
	if (phone_number.slice(0, 2) === '+1') {
		return `+1 (${phone_number.slice(2, 5)}) ${phone_number.slice(5, 8)}-${phone_number.slice(8, 12)}`
	}
}

const Settings = ({ advisor }) => {
	const advisorEmail = advisor.idToken.payload.email
	const advisorId = advisor.idToken.payload.sub
	const advisorName = `${advisor.idToken.payload.given_name} ${advisor.idToken.payload.family_name}`
	const firmName = advisor.idToken.payload['custom:firm_name']

	const [isLoading, setIsLoading] = useState(true)
	const [customerId, setCustomerId] = useState('')
	const [subscription, setSubscription] = useState({})

	useEffect(async () => {
		GETSubscription()
	}, [])

	function GETSubscription() {
		return fetch(`https://blockria.com/api/stripe/subscription?advisorId=${advisorId}`)
			.then(response => response.json())
			.then(newSubscription => {
				if (newSubscription && newSubscription.Item) {
					setCustomerId(newSubscription.Item.stripeSubscription.M.data.M.object.M.customer.S)
				}
				setSubscription(newSubscription)
				setIsLoading(false)
			})
			.catch(alert)
	}

	return (
		<div className='Settings'>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Billing Details</div>
						{!isLoading &&
							(customerId ? (
								<a
									className='Button'
									href={`https://blockria.com/api/stripe/billingportal?customerId=${customerId}`}
									target='_blank'
									rel='noopener noreferrer'
								>
									Manage Billing Plan
								</a>
							) : (
								<a
									className='Button'
									href={`https://blockria.com/api/stripe/signup?advisorEmail=${advisorEmail}&advisorId=${advisorId}&advisorName=${advisorName}&firmName=${firmName}`}
									target='_blank'
									rel='noopener noreferrer'
								>
									Sign Up for a Billing Plan
								</a>
							))}
					</div>
				</caption>
				<thead>
					<tr>
						<th>NAME</th>
						<th>VALUE</th>
					</tr>
				</thead>
				<tbody>
					{isLoading ? (
						<tr>
							<td className='Loading'>Loading...</td>
						</tr>
					) : (
						<>
							<tr>
								<td className='Bold'>Billing Plan</td>
								<td className='Break'>
									{customerId ? (
										<a
											href={`https://blockria.com/api/stripe/billingportal?customerId=${customerId}`}
											target='_blank'
											rel='noopener noreferrer'
										>
											Manage Your Plan
										</a>
									) : (
										<a
											className='Bold'
											href={`https://blockria.com/api/stripe/signup?advisorEmail=${advisorEmail}&advisorId=${advisorId}&advisorName=${advisorName}&firmName=${firmName}`}
											target='_blank'
											rel='noopener noreferrer'
										>
											Sign Up for a Billing Plan
										</a>
									)}
								</td>
							</tr>
							<tr>
								<td className='Bold'>Billing Cycle</td>
								<td>
									{subscription.Item && (
										<div style={{ textTransform: 'capitalize' }}>
											{subscription.Item.stripeSubscription.M.data.M.object.M.items.M.data.L[0].M.plan.M.interval.S +
												'ly'}
										</div>
									)}
								</td>
							</tr>
						</>
					)}
				</tbody>
			</table>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Advisor Details</div>
					</div>
				</caption>
				<thead>
					<tr>
						<th>NAME</th>
						<th>VALUE</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className='Bold'>Firm</td>
						<td className='Break'>{advisor.idToken.payload['custom:firm_name']}</td>
					</tr>
					<tr>
						<td className='Bold'>First Name</td>
						<td>{advisor.idToken.payload.given_name}</td>
					</tr>
					<tr>
						<td className='Bold'>Last Name</td>
						<td>{advisor.idToken.payload.family_name}</td>
					</tr>
					<tr>
						<td className='Bold'>Email</td>
						<td style={{ textTransform: 'none' }}>{advisorEmail}</td>
					</tr>
					<tr>
						<td className='Bold'>Phone Number</td>
						<td>{renderPhone(advisor.idToken.payload.phone_number)}</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}

export default Settings
