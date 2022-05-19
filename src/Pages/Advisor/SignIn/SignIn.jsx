import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AccountContext } from '../../../Account'
import { demoAdvisorEmpty } from '../demoData'

const SignIn = ({ setAdvisor }) => {
	const { authenticate } = useContext(AccountContext)
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [email, setEmail] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [password, setPassword] = useState('')

	useEffect(() => {
		localStorage.clear()
		setAdvisor(demoAdvisorEmpty)
	}, [])

	function handleSubmit(e) {
		e.preventDefault()
		setIsLoading(true)

		if (!e.currentTarget.checkValidity()) {
			e.stopPropagation()
			setIsLoading(false)
			return
		}

		authenticate(email, password)
			.then(async newAdvisor => {
				if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
					// newAdvisor.idToken.payload.sub = ''
				}
				localStorage.setItem('advisor', JSON.stringify(newAdvisor))
				setAdvisor(newAdvisor)
				setIsLoading(false)
				navigate('/advisor')
			})
			.catch(error => {
				setIsLoading(false)
				if (error === 'User is not confirmed.') navigate('/advisor/verifyemail', { state: { email } })
				else alert(error)
			})
	}

	return (
		<div className='SignIn NewForm NewFormWrapper'>
			<form onSubmit={handleSubmit}>
				<div className='Title'>{searchParams.get('verified') ? 'Your email was verified!' : 'Sign Into Block RIA'}</div>
				<div>Email</div>
				<input autoFocus minLength={1} onChange={e => setEmail(e.target.value)} required type='email' value={email} />
				<div>Password</div>
				<input minLength={6} onChange={e => setPassword(e.target.value)} required type='password' />
				<input
					className='Continue'
					disabled={isLoading ? true : false}
					type='submit'
					value={isLoading ? 'Loading...' : 'Sign In'}
				/>
				{searchParams.get('verified') ? null : (
					<Link className='Cancel' to='/advisor/signup'>
						Create an Account
					</Link>
				)}
			</form>
		</div>
	)
}

export default SignIn
