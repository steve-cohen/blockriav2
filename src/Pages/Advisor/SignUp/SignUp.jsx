import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import UserPool from '../../../UserPool'
import './SignUp.css'

const SignUp = () => {
	const navigate = useNavigate()

	const [email, setEmail] = useState('')
	const [firmName, setFirmName] = useState('')
	const [firstName, setFirstName] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [lastName, setLastName] = useState('')
	const [password, setPassword] = useState('')
	const [phoneNumber, setPhoneNumber] = useState('')

	const handleSubmit = e => {
		e.preventDefault()
		setIsLoading(true)

		if (!e.currentTarget.checkValidity()) {
			e.stopPropagation()
			setIsLoading(false)
			return
		}

		const customAttributes = [
			{ Name: 'given_name', Value: firstName },
			{ Name: 'family_name', Value: lastName },
			{ Name: 'phone_number', Value: `+1${phoneNumber}` },
			{ Name: 'custom:firm_name', Value: firmName }
		]

		UserPool.signUp(email, password, customAttributes, null, (error, data) => {
			setIsLoading(false)

			if (error) alert(error.message)
			else navigate('/advisor/verifyemail', { state: { email: data.user.username } })
		})
	}

	return (
		<div className='SignUp NewForm'>
			<form onSubmit={handleSubmit}>
				<div className='Title'>Create a Block RIA Account</div>
				<div>Email</div>
				<input autoFocus minLength={1} onChange={e => setEmail(e.target.value)} required type='email' value={email} />
				<div>Password</div>
				<input minLength={6} onChange={e => setPassword(e.target.value)} required type='password' />
				<div>First Name</div>
				<input minLength={1} onChange={e => setFirstName(e.target.value)} required value={firstName} />
				<div>Last Name</div>
				<input minLength={1} onChange={e => setLastName(e.target.value)} required value={lastName} />
				<div>Firm Name</div>
				<input minLength={1} onChange={e => setFirmName(e.target.value)} required value={firmName} />
				<div>Phone Number</div>
				<input onChange={e => setPhoneNumber(e.target.value.slice(0, 10))} type='number' value={phoneNumber} />
				<input
					className='Continue'
					disabled={isLoading ? true : false}
					type='submit'
					value={isLoading ? 'Loading...' : 'Create an Account'}
				/>
				<Link className='Cancel' to='/advisor/signin'>
					Sign In
				</Link>
			</form>
		</div>
	)
}

export default SignUp
