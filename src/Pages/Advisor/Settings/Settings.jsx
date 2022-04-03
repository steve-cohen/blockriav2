import React, { useEffect, useState } from 'react'
import './Settings.css'

function renderPhone(phone_number) {
	if (phone_number.slice(0, 2) === '+1') {
		return `+1 (${phone_number.slice(2, 5)}) ${phone_number.slice(5, 8)}-${phone_number.slice(8, 12)}`
	}
}

const Settings = ({ advisor }) => {
	const [isLoading, setIsLoading] = useState(false)
	const [stripeId, setStripeId] = useState('')
	const [subscription, setSubscription] = useState({})

	useEffect(async () => {
		setIsLoading(true)

		console.log(advisor)
		const newSubscriptionResponse = await getSubscription()
		console.log(newSubscriptionResponse)

		if (newSubscriptionResponse.Item && newSubscriptionResponse.Item.stripeSubscription) {
			const newSubscription = JSON.parse(newSubscriptionResponse.Item.stripeSubscription)
			console.log(newSubscription)
			setSubscription(newSubscription)

			if (newSubscription.data.object.customer) {
				setStripeId(newSubscription.data.object.customer)
			}
		}

		setIsLoading(false)
	}, [])

	function getSubscription() {
		return (
			fetch(`https://blockria.com/stripe/subscription?advisorId=${advisor.idToken.payload.sub}`)
				// return fetch(`https://blockria.com/stripe/subscription?advisorId=123`)
				.then(response => response.json())
				.catch(console.log)
		)
	}

	function renderBillingPortal() {
		return (
			<a
				href={`https://blockria.com/stripe/billingportal?stripeId=${stripeId}`}
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
				<svg viewBox='0 0 512 512'>
					<path d='M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z' />
				</svg>
				<a
					// href={`https://blockria.com/stripe/advisor?advisorId=${advisor.idToken.payload.sub}`}
					href={`https://blockria.com/stripe/advisor?advisorId=123`}
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
			<div className='Title'>Settings</div>
			<div className='Box'>
				<div className='BoxTitle'>Advisor Details</div>
				<div className='Inline'>
					<div>Firm</div>
					<div>{advisor.idToken.payload['custom:firm_name']}</div>
				</div>
				<div className='Inline'>
					<div>First Name</div>
					<div>{advisor.idToken.payload.given_name}</div>
				</div>
				<div className='Inline'>
					<div>Last Name</div>
					<div>{advisor.idToken.payload.family_name}</div>
				</div>
				<div className='Inline'>
					<div>Email</div>
					<div>{advisor.idToken.payload.email}</div>
				</div>
				<div className='Inline'>
					<div>Phone</div>
					<div>{renderPhone(advisor.idToken.payload.phone_number)}</div>
				</div>
			</div>
			<div className='Box'>
				<div className='BoxTitle'>Billing Details</div>
				<div className='Inline'>
					<div>Plan</div>
					{isLoading ? 'Loading..' : stripeId ? renderBillingPortal() : renderPlanSignUp()}
				</div>
				<div className='Inline'>
					<div>Billing Cycle</div>
					{isLoading ? (
						'Loading...'
					) : subscription.data ? (
						<div style={{ textTransform: 'capitalize' }}>
							{subscription.data.object.items.data[0].plan.interval + 'ly'}
						</div>
					) : (
						renderPlanSignUp()
					)}
				</div>
			</div>
		</div>
	)
}

export default Settings
