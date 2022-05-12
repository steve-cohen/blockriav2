import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
	return (
		<div className='Home'>
			<nav>
				<div>
					<div className='Logo' to='/advisor'>
						B
					</div>
					<span>Block RIA Inc.</span>
				</div>
				<span>
					<Link className='ToSignIn' to='/advisor/signin'>
						Sign In
					</Link>
					<Link className='Button' to='/advisor/signup'>
						Get Started
					</Link>
				</span>
			</nav>
			<section className='Hero'>
				<div>
					<div className='Title'>{`Manage Cryptocurrency\nfor Your Clients`}</div>
					<div>
						<Link className='Button' to='/advisor/signup'>
							Get Started
						</Link>
						<Link className='ToSignIn' to='/advisor/signin'>
							Sign In
						</Link>
					</div>
				</div>
				<div />
			</section>
			<section className='Compliance'>Compliance</section>
		</div>
	)
}

export default Home
