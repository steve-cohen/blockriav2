import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import UserPool from '../../UserPool'
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

		// UserPool.signUp(email, password, [], null, (error, data) => {
		// 	setIsLoading(false)

		// 	if (error) {
		// 		alert(error.message)
		// 	} else {
		// 		console.log(data)
		// 		navigate('/advisor')
		// 	}
		// })
	}

	return (
		<div className='SignUp'>
			<div className='Description'>
				<div className='Title'>Create an Account.</div>
				<p>
					<b>Increase Assets </b>
					<span>Attract held away assets from outside your firm to within your management.</span>
				</p>
				<p>
					<b>Add Simplicity </b>
					<span>
						Digital Assets can be complex. We make it simple by providing a seamless experience for you and your
						clients.
					</span>
				</p>
				<p>
					<b>Invest Intelligently </b>
					<span>
						Choose your model and outsource the day to day portfolio management to us. Automate the entire process and
						spend more time where your clients need you most.
					</span>
				</p>
			</div>
			<form onSubmit={handleSubmit}>
				<input
					autoFocus
					minLength={1}
					onChange={e => setEmail(e.target.value)}
					placeholder='EMAIL'
					required
					type='email'
					value={email}
				/>
				<input
					minLength={6}
					onChange={e => setPassword(e.target.value)}
					placeholder='PASSWORD'
					required
					type='password'
				/>
				<input
					minLength={1}
					onChange={e => setFirstName(e.target.value)}
					placeholder='FIRST NAME'
					required
					value={firstName}
				/>
				<input
					minLength={1}
					onChange={e => setLastName(e.target.value)}
					placeholder='LAST NAME'
					required
					value={lastName}
				/>
				<input
					minLength={1}
					onChange={e => setFirmName(e.target.value)}
					placeholder='FIRM NAME'
					required
					value={firmName}
				/>
				<input
					minLength={10}
					onChange={e => setPhoneNumber(e.target.value)}
					placeholder='PHONE NUMBER'
					type='tel'
					value={phoneNumber}
				/>
				<button disabled={isLoading} type='submit'>
					{isLoading ? 'Loading…' : 'Sign Up - Free for 30 days'}
				</button>
				<Link to='/signin'>Already have an account? Sign In</Link>
			</form>
		</div>
	)
}

export default SignUp
