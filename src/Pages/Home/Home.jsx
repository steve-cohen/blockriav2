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
					<span className='CompanyName'>Block RIA</span>
				</div>
				{/* <div className='Hrefs'>
					<a href='#compliance'>Compliance</a>
					<a href='#features'>Features</a>
					<a href='#contact'>Contact</a>
				</div> */}
				<div>
					<Link className='ToSignIn' to='/advisor/signin'>
						Sign In
					</Link>
					<Link className='Button' to='/advisor/signup'>
						Try the RIA Platform
					</Link>
				</div>
			</nav>
			<section id='Hero'>
				<div>
					<div className='Title'>{`Manage Cryptocurrency\nfor Your Clients`}</div>
					<div className='Actions'>
						<Link className='Button' to='/advisor/signup'>
							Try the RIA Platform
						</Link>
						<Link className='ToSignIn' to='/advisor/signin'>
							Sign In
						</Link>
					</div>
				</div>
			</section>
			{/* <section style={{ background: 'rgb(18, 25, 44)', height: 'calc(100vh - 72vh - 12vh - 100px)' }} /> */}
			{/* <section id='compliance'>
				<div className='Group'>
					<div className='Title'>{`Compliance for\nFinancial Advisors / RIAs`}</div>
				</div>
				<div className='Group Details'>
					<div>170+ Cryptocurrencies</div>
					<div>Handle Form ADV Part 2A, Form ADV Part 2B, Form CRS, Investment Advisory Agreements, and more</div>
				</div>
				<div></div>
			</section> */}
			{/* <section id='features'></section> */}
		</div>
	)
}

export default Home
