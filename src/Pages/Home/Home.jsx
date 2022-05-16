import React from 'react'
import { Link } from 'react-router-dom'
import Performance from './Performance.png'
import Portfolio from './Portfolio.png'
import View from './View.png'
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
						Try the Advisor Platform
					</Link>
				</div>
			</nav>
			<section id='Hero' style={{ minHeight: '52vh' }}>
				<div>
					<div className='Title'>{`Manage Cryptocurrency\nfor Your Clients`}</div>
					<div className='Actions'>
						<Link className='Button' to='/advisor/signup'>
							Try the Advisor Platform
						</Link>
						<Link className='ToSignIn' to='/advisor/signin'>
							Sign In
						</Link>
					</div>
				</div>
			</section>
			<section id='view'>
				<div className='Group'>
					<div className='Title'>View Client Holdings</div>
					<p>Sync held away accounts to quickly see all your client’s holdings in one place</p>
					<p>Attract assets from outside your firm to within your management</p>
					<p>Initiate better conversations with performance and tax loss harvesting tools</p>
				</div>
				<img src={View} />
			</section>
			<section id='portfoliomanagement'>
				<img src={Portfolio} />
				<div className='Group'>
					<div className='Title'>Create Portfolios</div>
					<p>Create portfolios and initiate trades right within your client’s account</p>
					<p>Utilize automated rebalancing to take advantage of tax loss harvesting opportunities</p>
					<p>Initiate deposits and withdrawals with your client’s connected bank accounts</p>
				</div>
			</section>
			<section id='performance'>
				<div className='Group'>
					<div className='Title'>Track Performance</div>
					<p>Track performance over time to manage risk and client expectations</p>
					<p>Automatically generate billing reports every month based off of AUM or flat dollar</p>
					<p>Calculate returns based on individual holdings and overall portfolios</p>
				</div>
				<img src={Performance} />
			</section>
			<section id='compliance'>
				<div className='Group'>
					<div className='Title'>{`Compliance for\nFinancial Advisors`}</div>
				</div>
				<div className='Group'>
					<p>
						Block RIA Inc. works with FINRA member broker/dealers, SEC registered investment advisors, and clearing
						partners to ensure client accounts are regulated, secured, and insured. All accounts are FDIC insured and
						our partners have arranged for additional insurance coverage.
					</p>
					<p>
						A custodian is an institution that holds your financial assets. Block RIA Inc. integrates with Coinbase,
						Inc. and Coinbase Custody Trust Company LLC to provide your advisor with custody services and modern
						technology to help keep your investments secure.
					</p>
					<p>
						Coinbase Custody operates as a standalone, independently-capitalized business to Coinbase, Inc. Coinbase
						Custody is a fiduciary under NY State Banking Law. All digital assets are segregated and held in trust for
						the benefit of clients.
					</p>
				</div>
			</section>
			<section id='Hero' style={{ height: '50vh' }}>
				<div>
					<div className='Title'>Crypto Management Simplified.</div>
					<div className='Actions'>
						<Link className='Button' to='/advisor/signup'>
							Try the Advisor Platform
						</Link>
					</div>
				</div>
			</section>
		</div>
	)
}

export default Home
