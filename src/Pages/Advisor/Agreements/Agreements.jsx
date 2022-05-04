import React, { useEffect, useState } from 'react'
import './Agreements.css'

function renderDate(timestamp) {
	// return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ')
	return new Date(timestamp).toISOString().slice(0, 10)
}

const Agreements = ({ advisor }) => {
	const [agreements, setAgreements] = useState({})

	const [document1IsLoading, setDocument1IsLoading] = useState(false)
	const [document2IsLoading, setDocument2IsLoading] = useState(false)
	const [document3IsLoading, setDocument3IsLoading] = useState(false)
	const [document4IsLoading, setDocument4IsLoading] = useState(false)
	const [document5IsLoading, setDocument5IsLoading] = useState(false)

	const [hasAutomation, setHasAutomation] = useState(true)
	const [hasAutomationIsLoading, setHasAutomationIsLoading] = useState(true)

	useEffect(() => {
		GETAgreements()
		GETSignedAgreements()
	}, [])

	async function GETAgreements() {
		setDocument1IsLoading(true)
		setDocument2IsLoading(true)
		setDocument3IsLoading(true)
		setDocument4IsLoading(true)
		setDocument5IsLoading(true)
		setHasAutomationIsLoading(true)

		await fetch(`https://blockria.com/api/agreements?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(newAgreements => {
				console.log(newAgreements)

				if (newAgreements.Item && newAgreements.Item.hasAutomation) {
					setHasAutomation(newAgreements.Item.hasAutomation.BOOL)
				}
			})
			.catch(alert)

		await fetch(`https://blockria.com/api/agreements2?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(setAgreements)
			.catch(alert)

		setDocument1IsLoading(false)
		setDocument2IsLoading(false)
		setDocument3IsLoading(false)
		setDocument4IsLoading(false)
		setDocument5IsLoading(false)
		setHasAutomationIsLoading(false)
	}

	async function GETSignedAgreements() {}

	async function handleAutomation(newHasAutomation) {
		setHasAutomationIsLoading(true)

		const body = JSON.stringify({ advisorId: advisor.idToken.payload.sub, hasAutomation: newHasAutomation })
		await fetch(`https://blockria.com/api/agreements/automation`, {
			body,
			headers: { 'Content-Type': 'application/json' },
			method: 'POST'
		})
			.then(() => setHasAutomation(newHasAutomation))
			.catch(alert)

		setHasAutomationIsLoading(false)
	}

	async function handleUploadPDF(event, documentOrder) {
		if (documentOrder === 1) setDocument1IsLoading(true)
		else if (documentOrder === 2) setDocument2IsLoading(true)
		else if (documentOrder === 3) setDocument3IsLoading(true)
		else if (documentOrder === 4) setDocument4IsLoading(true)
		else if (documentOrder === 5) setDocument5IsLoading(true)

		const s3SignedURL = await fetch('https://blockria.com/api/agreements2', {
			method: 'POST',
			body: JSON.stringify({ advisorId: advisor.idToken.payload.sub, documentOrder })
		})
			.then(response => response.text())
			.catch(alert)

		await fetch(s3SignedURL, {
			headers: { 'Content-Type': 'application/pdf' },
			method: 'PUT',
			body: event.target.files[0]
		})
			.then(() => GETAgreements())
			.catch(alert)

		if (documentOrder === 1) setDocument1IsLoading(false)
		else if (documentOrder === 2) setDocument2IsLoading(false)
		else if (documentOrder === 3) setDocument3IsLoading(false)
		else if (documentOrder === 4) setDocument4IsLoading(false)
		else if (documentOrder === 5) setDocument5IsLoading(false)
	}

	function renderAutomation() {
		if (hasAutomationIsLoading) return <div className='Loading'>Loading...</div>

		return (
			<>
				<span className='Bold'>{hasAutomation ? 'Enabled ' : 'Disabled '}</span>(
				<span className='Blue ChangeAutomation' onClick={() => handleAutomation(!hasAutomation)}>
					{hasAutomation ? 'disable' : 'enable'}
				</span>
				)
			</>
		)
	}

	function renderUploadPDF(documentOrder) {
		return documentOrder in agreements ? (
			<td>
				<div className='Blue Upload' onClick={() => document.getElementById(`uploadPDF${documentOrder}`).click()}>
					Replace PDF
				</div>
				<input
					accept='application/pdf'
					hidden
					id={`uploadPDF${documentOrder}`}
					onChange={e => handleUploadPDF(e, documentOrder)}
					type='file'
				/>
			</td>
		) : (
			<td>
				<div className='Bold Red Upload' onClick={() => document.getElementById(`uploadPDF${documentOrder}`).click()}>
					Upload PDF
				</div>
				<input
					accept='application/pdf'
					hidden
					id={`uploadPDF${documentOrder}`}
					onChange={e => handleUploadPDF(e, documentOrder)}
					type='file'
				/>
			</td>
		)
	}

	function renderViewPDF(documentOrder) {
		return (
			<td>
				{documentOrder in agreements ? (
					<a href={agreements[documentOrder].url} target='_blank' rel='noopener noreferrer'>
						View
					</a>
				) : null}
			</td>
		)
	}

	return (
		<div className='Agreements'>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Agreement Automation</div>
					</div>
				</caption>
				<thead>
					<tr>
						<th className='Break'>SERVICE</th>
						<th className='AlignRight'>MODIFY</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td style={{ textTransform: 'none' }}>
							When enabled, your firm's agreements will be sent to clients during onboarding
						</td>
						<td>{renderAutomation()}</td>
					</tr>
				</tbody>
			</table>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Agreements</div>
					</div>
				</caption>
				<thead>
					<tr>
						<th className='Break'>FORM</th>
						<th>UPDATED</th>
						<th>VIEW</th>
						<th>UPLOAD</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className='Bold'>Investment Advisory Agreement (Client Agreement)</td>
						<td>{1 in agreements ? agreements[1].updatedAt : null}</td>
						{renderViewPDF(1)}
						{document1IsLoading ? <td className='Loading'>Loading...</td> : renderUploadPDF(1)}
					</tr>
					<tr>
						<td className='Bold'>Privacy Policy</td>
						<td>{2 in agreements ? agreements[2].updatedAt : null}</td>
						{renderViewPDF(2)}
						{document2IsLoading ? <td className='Loading'>Loading...</td> : renderUploadPDF(2)}
					</tr>
					<tr>
						<td className='Bold'>Form CRS</td>
						<td>{3 in agreements ? agreements[3].updatedAt : null}</td>
						{renderViewPDF(3)}
						{document3IsLoading ? <td className='Loading'>Loading...</td> : renderUploadPDF(3)}
					</tr>
					<tr>
						<td className='Bold'>Form ADV Part 2A</td>
						<td>{4 in agreements ? agreements[4].updatedAt : null}</td>
						{renderViewPDF(4)}
						{document4IsLoading ? <td className='Loading'>Loading...</td> : renderUploadPDF(4)}
					</tr>
					<tr>
						<td className='Bold'>Form ADV Part 2B</td>
						<td>{5 in agreements ? agreements[5].updatedAt : null}</td>
						{renderViewPDF(5)}
						{document5IsLoading ? <td className='Loading'>Loading...</td> : renderUploadPDF(5)}
					</tr>
				</tbody>
			</table>
			{/* <table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Agreements Signed by Clients</div>
					</div>
				</caption>
				<thead>
					<tr>
						<th className='Break'>NAME</th>
						<th>VIEW</th>
						<th>DATE</th>
						<th>TIME</th>
					</tr>
				</thead>
				<tbody>
					<tr></tr>
				</tbody>
			</table> */}
		</div>
	)
}

export default Agreements
