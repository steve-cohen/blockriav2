import React, { useEffect, useState } from 'react'
import emailjs from '@emailjs/browser'
import './Invites.css'

function defaultMessage(advisor) {
	const email = advisor.idToken.payload.email
	const firmName = advisor.idToken.payload['custom:firm_name']
	const firstName = advisor.idToken.payload.given_name
	const lastName = advisor.idToken.payload.family_name
	const phoneNumber = advisor.idToken.payload.phone_number

	return `${firmName} and your advisor ${firstName} ${lastName} have partnered with Block RIA to manage your Digital Assets right within your Coinbase wallet.

Click the link below to grant access and get started.

{{Authorization Link}}

Sincerely,
${firstName} ${lastName}
${phoneNumber}
${email}
`
}

function defaultSubject(advisor) {
	return `${advisor.idToken.payload['custom:firm_name']} Needs to Connect to Your Account`
}

const Invites = ({ advisor }) => {
	const [authorizationLink, setAuthorizationLink] = useState('')
	const [email, setEmail] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isResent, setIsResent] = useState([])
	const [message, setMessage] = useState(defaultMessage(advisor))
	const [pendingInvites, setPendingInvites] = useState([])
	const [subject, setSubject] = useState(defaultSubject(advisor))

	useEffect(() => {
		getPendingInvites()
	}, [])

	useEffect(() => {
		let url = 'https://blockria.com/client/sign?'
		url += `email=${email}`
		url += `&firmName=${advisor.idToken.payload['custom:firm_name']}`
		url += `&advisorName=${advisor.idToken.payload.given_name} ${advisor.idToken.payload.family_name}`
		url += `&advisorId=${advisor.idToken.payload.sub}`
		setAuthorizationLink(url)
	}, [advisor, email])

	async function getPendingInvites() {
		await fetch(`https://blockria.com/api/invites?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(newPendingInvites => {
				newPendingInvites = newPendingInvites.sort((a, b) => b.clientEmailLastSent - a.clientEmailLastSent)

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

	async function handleSubmit(e) {
		e.preventDefault()
		setIsLoading(true)

		// [1.0] Send Email
		const templateParams = {
			advisorName: `${advisor.idToken.payload.given_name} ${advisor.idToken.payload.family_name}`,
			email,
			message: message
				.replace('{{Authorization Link}}', `<a href='${authorizationLink}'>Authorization Link</a>`)
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

		await getPendingInvites()

		setEmail('')
		setIsLoading(false)
		setMessage(defaultMessage(advisor))
		setSubject(defaultSubject(advisor))
	}

	function renderPendingInvite(pendingInvite, index) {
		const day = 24 * 60 * 60 * 1000 // hours * minutes * seconds * milliseconds
		const today = new Date()
		const lastSent = new Date(pendingInvite.clientEmailLastSent)
		const daysSince = Math.round((today - lastSent) / day)

		return (
			<tr key={`Client Email ${pendingInvite.clientEmailAddress}`}>
				<td>{pendingInvite.clientEmailAddress}</td>
				<td>{daysSince ? (daysSince === 1 ? '1 Day Ago' : `${daysSince} Days Ago`) : 'Today'}</td>
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

		// [0.0]
		let newIsResent = [...isResent]
		newIsResent[index] = true
		setIsResent(newIsResent)

		// [1.0] Send Email
		const templateParams = {
			advisorName: `${advisor.idToken.payload.given_name} ${advisor.idToken.payload.family_name}`,
			email: clientEmailAddress,
			message: decodeURIComponent(clientEmailMessage)
				.replace('{{Authorization Link}}', `<a href='${authorizationLink}'>Authorization Link</a>`)
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
	}

	return (
		<div className='Invites'>
			<div style={{ float: 'left', marginBottom: '48px' }}>
				<form onSubmit={handleSubmit}>
					<div className='Title'>New Invite</div>
					<div>Client's Email</div>
					<input autoComplete='No' autoFocus onChange={e => setEmail(e.target.value)} required value={email} />
					<div>Email Subject</div>
					<input name='subject' onChange={e => setSubject(e.target.value)} required value={subject} />
					<div>Email Body</div>
					<textarea name='message' onChange={e => setMessage(e.target.value)} required value={message} />
					<input
						className='SendEmail'
						disabled={isLoading ? true : false}
						style={isLoading ? { cursor: 'default', textDecoration: 'none' } : {}}
						type='submit'
						value={isLoading ? 'Loading...' : 'Send Email Invite'}
					/>
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
