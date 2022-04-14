import React, { useEffect, useState } from 'react'
import emailjs from '@emailjs/browser'
import './Invites.css'

const coinbaseURL =
	'https://www.coinbase.com/oauth/authorize?account=all&scope=wallet:accounts:read,wallet:accounts:update,wallet:accounts:create,wallet:accounts:delete,wallet:addresses:read,wallet:addresses:create,wallet:buys:read,wallet:buys:create,wallet:deposits:read,wallet:deposits:create,wallet:notifications:read,wallet:payment-methods:read,wallet:payment-methods:delete,wallet:payment-methods:limits,wallet:sells:read,wallet:sells:create,wallet:transactions:read,wallet:transactions:request,wallet:transactions:transfer,wallet:user:read,wallet:user:update,wallet:user:email,wallet:withdrawals:read,wallet:withdrawals:create&response_type=code&client_id=d41fd296f21919731b07190afcf278b4f7a7f2813d029bb48d81fbf872c8fae4'

function defaultMessage(advisor) {
	const email = advisor.idToken.payload.email
	const firmName = advisor.idToken.payload['custom:firm_name']
	const firstName = advisor.idToken.payload.given_name
	const lastName = advisor.idToken.payload.family_name
	const phoneNumber = advisor.idToken.payload.phone_number

	return `${firmName} and your advisor ${firstName} ${lastName} have partnered with Block RIA to manage your Digital Assets right within your Coinbase wallet.

Click the link below to grant access and get started.

[[Authorization Link]]

Sincerely,
${firstName} ${lastName}
${phoneNumber}
${email}
`
}

function defaultSubject(advisor) {
	return `${advisor.idToken.payload.given_name} ${advisor.idToken.payload.family_name} Needs to Connect to Your Account`
}

const Invites = ({ advisor }) => {
	const [email, setEmail] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isResent, setIsResent] = useState([])
	const [isSent, setIsSent] = useState(false)
	const [message, setMessage] = useState(defaultMessage(advisor))
	const [pendingInvites, setPendingInvites] = useState([])
	const [subject, setSubject] = useState(defaultSubject(advisor))

	useEffect(() => {
		getPendingInvites()
	}, [])

	async function getPendingInvites() {
		await fetch(`https://blockria.com/api/invites?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(newPendingInvites => {
				let newIsResent = []
				for (let i = 0; i < newPendingInvites.length; i++) newIsResent.push(false)
				setIsResent(newIsResent)
				setPendingInvites(newPendingInvites)
			})
			.catch(alert)
	}

	async function handleDelete(e, { clientEmailAddress }) {
		if (isLoading) return

		const deleteParams = { advisorId: advisor.idToken.payload.sub, clientEmailAddress }

		await fetch('https://blockria.com/api/invites', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(deleteParams)
		})

		await getPendingInvites()
	}

	function handleSendAnotherInvite() {
		setEmail('')
		setIsLoading(false)
		setIsSent(false)
	}

	async function handleSubmit(e) {
		e.preventDefault()
		setIsLoading(true)

		// [1.0] Send Email
		const templateParams = {
			advisorName: `${advisor.idToken.payload.given_name} ${advisor.idToken.payload.family_name}`,
			email,
			message: message
				.replace(
					'[[Authorization Link]]',
					`<a href='${coinbaseURL}&state=["${advisor.idToken.payload.sub}","${email}"]'>Authorization Link</a>`
				)
				.replace(/\n/g, '<br>'),
			subject
		}

		await emailjs
			.send('service_1zzl4ah', 'template_zpo8s53', templateParams, 'joD1A0qHJYnXOOY4z')
			.then(console.log)
			.catch(alert)

		// [2.0] Save Records
		const inviteOptions = {
			advisorId: advisor.idToken.payload.sub,
			clientEmailAddress: email,
			clientEmailLastSent: Date.now(),
			clientEmailMessage: encodeURIComponent(message),
			clientEmailSubject: subject
		}
		await fetch('https://blockria.com/api/invites', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(inviteOptions)
		})

		setIsLoading(false)
		setIsSent(true)

		await getPendingInvites()
	}

	function renderPendingInvite(pendingInvite, index) {
		const day = 24 * 60 * 60 * 1000 // hours * minutes * seconds * milliseconds
		const today = new Date()
		const lastSent = new Date(pendingInvite.clientEmailLastSent)
		const daysSince = Math.round((today - lastSent) / day)

		return (
			<tr key={`Client Email ${pendingInvite.clientEmailAddress}`}>
				<td>{pendingInvite.clientEmailAddress}</td>
				<td>{daysSince ? (daysSince === 1 ? '1 Day Ago' : `${daysSince} Day Ago`) : 'Today'}</td>
				{isResent[index] ? (
					<td className='Bold'>Sent</td>
				) : (
					<td className='Blue' onClick={e => resendEmail(e, pendingInvite, index)} style={{ fontWeight: 500 }}>
						Resend Email
					</td>
				)}
				<td className='Red' onClick={e => handleDelete(e, pendingInvite)}>
					Delete
				</td>
			</tr>
		)
	}

	async function resendEmail(e, { clientEmailAddress, clientEmailMessage, clientEmailSubject }, index) {
		e.preventDefault()
		setIsLoading(true)

		// [0.0]
		let newIsResent = [...isResent]
		newIsResent[index] = true
		setIsResent(newIsResent)

		// [1.0] Send Email
		const templateParams = {
			advisorName: `${advisor.idToken.payload.given_name} ${advisor.idToken.payload.family_name}`,
			email: clientEmailAddress,
			message: decodeURIComponent(clientEmailMessage)
				.replace('[[Authorization Link]]', `<a href='${coinbaseURL}'>Authorization Link</a>`)
				.replace(/\n/g, '<br>'),
			subject: clientEmailSubject
		}

		await emailjs
			.send('service_1zzl4ah', 'template_zpo8s53', templateParams, 'joD1A0qHJYnXOOY4z')
			.then(console.log)
			.catch(alert)

		// [2.0] Save Records
		const inviteOptions = {
			advisorId: advisor.idToken.payload.sub,
			clientEmailAddress,
			clientEmailLastSent: Date.now(),
			clientEmailMessage,
			clientEmailSubject
		}
		await fetch('https://blockria.com/api/invites', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(inviteOptions)
		})

		setIsLoading(false)
		setIsSent(true)
	}

	return (
		<div className='Invites'>
			<div style={{ float: 'left', marginBottom: '48px' }}>
				<form onSubmit={handleSubmit}>
					<div className='Title'>New Invite</div>
					<div>Client's Email</div>
					<input
						autoComplete='No'
						autoFocus
						onChange={e => setEmail(e.target.value)}
						required
						type='text'
						value={email}
					/>
					<div>Email Subject</div>
					<input name='subject' onChange={e => setSubject(e.target.value)} required value={subject} />
					<div>Email Body</div>
					<textarea name='message' onChange={e => setMessage(e.target.value)} required value={message} />
					<input
						className='SendEmail'
						disabled={isLoading || isSent ? true : false}
						style={isLoading || isSent ? { cursor: 'default', textDecoration: 'none' } : {}}
						type='submit'
						value={isSent ? 'Sent!' : isLoading ? 'Loading...' : 'Send Email Invite'}
					/>
					{isSent && (
						<button className='SendAnotherEmail' onClick={() => handleSendAnotherInvite()}>
							Send Another Invite
						</button>
					)}
				</form>
			</div>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Pending Invites</div>
					</div>
				</caption>
				<thead>
					<tr>
						<th className='Break'>EMAIL</th>
						<th>SENT</th>
						<th>RESEND</th>
						<th>DELETE</th>
					</tr>
				</thead>
				<tbody>{pendingInvites.map((pendingInvite, index) => renderPendingInvite(pendingInvite, index))}</tbody>
				<tfoot>
					<tr>
						<td>{pendingInvites.length} Total</td>
					</tr>
				</tfoot>
			</table>
		</div>
	)
}

export default Invites
