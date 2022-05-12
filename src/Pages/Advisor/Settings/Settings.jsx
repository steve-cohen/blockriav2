import React, { useEffect, useState } from 'react'
import './Settings.css'

function renderPhone(phone_number) {
	if (phone_number.slice(0, 2) === '+1') {
		return `+1 (${phone_number.slice(2, 5)}) ${phone_number.slice(5, 8)}-${phone_number.slice(8, 12)}`
	}
}

const Settings = ({ advisor }) => {
	const [isLoading, setIsLoading] = useState(false)
	const [customerId, setCustomerId] = useState('')
	const [subscription, setSubscription] = useState({})

	useEffect(async () => {
		setIsLoading(true)

		const newSubscription = await getSubscription()
		console.log(newSubscription)

		if (newSubscription && newSubscription.Item) {
			setCustomerId(newSubscription.Item.stripeSubscription.M.data.M.object.M.customer.S)
		}

		setSubscription(newSubscription)
		setIsLoading(false)
	}, [])

	function getSubscription() {
		return fetch(`https://blockria.com/api/stripe/subscription?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.catch(alert)
	}

	function renderBillingPortal() {
		return (
			<a
				href={`https://blockria.com/api/stripe/billingportal?customerId=${customerId}`}
				target='_blank'
				rel='noopener noreferrer'
			>
				Manage Your Plan
			</a>
		)
	}

	function renderPlanSignUp() {
		return (
			<div className='PlanSignUp'>
				<a
					className='Bold Red'
					href={`https://blockria.com/api/stripe/signup?advisorId=${advisor.idToken.payload.sub}&advisorName=${advisor.idToken.payload.given_name} ${advisor.idToken.payload.family_name}&firmName=${advisor.idToken.payload['custom:firm_name']}`}
					target='_blank'
					rel='noopener noreferrer'
				>
					Sign Up for a Plan
				</a>
			</div>
		)
	}

	return (
		<div className='Settings'>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Billing Details</div>
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
						<td className='Bold'>Plan</td>
						<td className='Break'>
							{isLoading ? 'Loading..' : customerId ? renderBillingPortal() : renderPlanSignUp()}
						</td>
					</tr>
					{subscription.Item ? (
						<tr>
							<td className='Bold'>Billing Cycle</td>
							<td>
								<div style={{ textTransform: 'capitalize' }}>
									{subscription.Item.stripeSubscription.M.data.M.object.M.items.M.data.L[0].M.plan.M.interval.S + 'ly'}
								</div>
							</td>
						</tr>
					) : null}
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
						<td style={{ textTransform: 'none' }}>{advisor.idToken.payload.email}</td>
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
