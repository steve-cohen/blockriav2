import React, { useState } from 'react'
import emailjs from '@emailjs/browser'
import './Invites.css'

const defaultCoinbaseURL =
	'https://www.coinbase.com/oauth/authorize?account=all&scope=wallet:accounts:read,wallet:accounts:update,wallet:accounts:create,wallet:accounts:delete,wallet:addresses:read,wallet:addresses:create,wallet:buys:read,wallet:buys:create,wallet:deposits:read,wallet:deposits:create,wallet:notifications:read,wallet:payment-methods:read,wallet:payment-methods:delete,wallet:payment-methods:limits,wallet:sells:read,wallet:sells:create,wallet:transactions:read,wallet:transactions:request,wallet:transactions:transfer,wallet:user:read,wallet:user:update,wallet:user:email,wallet:withdrawals:read,wallet:withdrawals:create&response_type=code&client_id=d41fd296f21919731b07190afcf278b4f7a7f2813d029bb48d81fbf872c8fae4'

function defaultMessage(advisor) {
	const email = advisor.idToken.payload.email
	const firmName = advisor.idToken.payload['custom:firm_name']
	const firstName = advisor.idToken.payload.given_name
	const lastName = advisor.idToken.payload.family_name
	const phoneNumber = advisor.idToken.payload.phone_number

	return `${firmName} and your advisor ${firstName} ${lastName} have partnered with Block RIA to manage your Digital Assets right within your Coinbase wallet. 

Click this link or the button below to grant access and get started.

[Button - Authorize]

Sincerely,
${firstName} ${lastName}
${email}
${phoneNumber}


For questions contact your advisor or for platform support email us at support@blockria.com.



[Disclosures]`
}

function defaultSubject(advisor) {
	return `${advisor.idToken.payload.given_name} ${advisor.idToken.payload.family_name} Needs to Connect to Your Account`
}

const Invites = ({ advisor }) => {
	const [coinbaseURL] = useState(`${defaultCoinbaseURL}&state=${advisor.idToken.payload.sub}`)
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState(defaultMessage(advisor))
	const [subject, setSubject] = useState(defaultSubject(advisor))

	function handleSubmit(e) {
		e.preventDefault()
		console.log(advisor)

		const templateParams = {
			advisorName: `${advisor.idToken.payload.given_name} ${advisor.idToken.payload.family_name}`,
			email,
			message,
			subject
		}
		console.log(templateParams)
		emailjs
			.send('service_1zzl4ah', 'template_zpo8s53', templateParams, 'joD1A0qHJYnXOOY4z')
			.then(console.log)
			.catch(console.error)
	}

	return (
		<div className='Invites'>
			<div className='Title'>Invites</div>
			<form onSubmit={handleSubmit}>
				<input
					name='email'
					onChange={e => setEmail(e.target.value)}
					placeholder="Enter Your Client's Email"
					required
					value={email}
					type='email'
				/>
				<input name='subject' onChange={e => setSubject(e.target.value)} required value={subject} type='text' />
				<textarea name='message' onChange={e => setMessage(e.target.value)} required value={message} />
				<input type='submit' />
			</form>
		</div>
	)
}

export default Invites
