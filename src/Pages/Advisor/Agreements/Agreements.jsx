import React, { useEffect, useState } from 'react'
import './Agreements.css'

function toBase64(file) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader()
		fileReader.readAsDataURL(file)
		fileReader.onload = () => {
			resolve(fileReader.result.split('base64,')[1])
		}
		fileReader.onerror = error => {
			reject(error)
		}
	})
}

function renderDate(timestamp) {
	// return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ')
	return new Date(timestamp).toISOString().slice(0, 10)
}

const Agreements = ({ advisor }) => {
	const [docuSignHasDocument1, setDocuSignHasDocument1] = useState(false)
	const [docuSignHasDocument2, setDocuSignHasDocument2] = useState(false)
	const [docuSignHasDocument3, setDocuSignHasDocument3] = useState(false)
	const [docuSignHasDocument4, setDocuSignHasDocument4] = useState(false)
	const [docuSignHasDocument5, setDocuSignHasDocument5] = useState(false)

	const [docuSignHasDocument1UpdatedAt, setDocuSignHasDocument1UpdatedAt] = useState(0)
	const [docuSignHasDocument2UpdatedAt, setDocuSignHasDocument2UpdatedAt] = useState(0)
	const [docuSignHasDocument3UpdatedAt, setDocuSignHasDocument3UpdatedAt] = useState(0)
	const [docuSignHasDocument4UpdatedAt, setDocuSignHasDocument4UpdatedAt] = useState(0)
	const [docuSignHasDocument5UpdatedAt, setDocuSignHasDocument5UpdatedAt] = useState(0)

	const [docuSignDocument1IsLoading, setDocuSignDocument1IsLoading] = useState(false)
	const [docuSignDocument2IsLoading, setDocuSignDocument2IsLoading] = useState(false)
	const [docuSignDocument3IsLoading, setDocuSignDocument3IsLoading] = useState(false)
	const [docuSignDocument4IsLoading, setDocuSignDocument4IsLoading] = useState(false)
	const [docuSignDocument5IsLoading, setDocuSignDocument5IsLoading] = useState(false)

	const [hasAutomation, setHasAutomation] = useState(true)
	const [hasAutomationIsLoading, setHasAutomationIsLoading] = useState(true)

	useEffect(() => {
		GETAgreements()
	}, [])

	async function GETAgreements() {
		setDocuSignDocument1IsLoading(true)
		setDocuSignDocument2IsLoading(true)
		setDocuSignDocument3IsLoading(true)
		setDocuSignDocument4IsLoading(true)
		setDocuSignDocument5IsLoading(true)
		setHasAutomationIsLoading(true)

		await fetch(`https://blockria.com/api/agreements?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(newAgreements => {
				console.log(newAgreements)

				if (newAgreements.Item) {
					if (newAgreements.Item.docuSignHasDocument1) setDocuSignHasDocument1(true)
					if (newAgreements.Item.docuSignHasDocument2) setDocuSignHasDocument2(true)
					if (newAgreements.Item.docuSignHasDocument3) setDocuSignHasDocument3(true)
					if (newAgreements.Item.docuSignHasDocument4) setDocuSignHasDocument4(true)
					if (newAgreements.Item.docuSignHasDocument5) setDocuSignHasDocument5(true)

					if (newAgreements.Item.docuSignHasDocument1UpdatedAt)
						setDocuSignHasDocument1UpdatedAt(Number(newAgreements.Item.docuSignHasDocument1UpdatedAt.N))
					if (newAgreements.Item.docuSignHasDocument2UpdatedAt)
						setDocuSignHasDocument2UpdatedAt(Number(newAgreements.Item.docuSignHasDocument2UpdatedAt.N))
					if (newAgreements.Item.docuSignHasDocument3UpdatedAt)
						setDocuSignHasDocument3UpdatedAt(Number(newAgreements.Item.docuSignHasDocument3UpdatedAt.N))
					if (newAgreements.Item.docuSignHasDocument4UpdatedAt)
						setDocuSignHasDocument4UpdatedAt(Number(newAgreements.Item.docuSignHasDocument4UpdatedAt.N))
					if (newAgreements.Item.docuSignHasDocument5UpdatedAt)
						setDocuSignHasDocument5UpdatedAt(Number(newAgreements.Item.docuSignHasDocument5UpdatedAt.N))

					if (newAgreements.Item.hasAutomation) setHasAutomation(newAgreements.Item.hasAutomation.BOOL)
				}
			})
			.catch(alert)

		setDocuSignDocument1IsLoading(false)
		setDocuSignDocument2IsLoading(false)
		setDocuSignDocument3IsLoading(false)
		setDocuSignDocument4IsLoading(false)
		setDocuSignDocument5IsLoading(false)
		setHasAutomationIsLoading(false)
	}

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
		if (documentOrder === 1) setDocuSignDocument1IsLoading(true)
		else if (documentOrder === 2) setDocuSignDocument2IsLoading(true)
		else if (documentOrder === 3) setDocuSignDocument3IsLoading(true)
		else if (documentOrder === 4) setDocuSignDocument4IsLoading(true)
		else if (documentOrder === 5) setDocuSignDocument5IsLoading(true)

		const body = JSON.stringify({
			advisorId: advisor.idToken.payload.sub,
			advisorName: `${advisor.idToken.payload.given_name} ${advisor.idToken.payload.family_name}`,
			document: await toBase64(event.target.files[0]),
			documentOrder,
			firmName: advisor.idToken.payload['custom:firm_name']
		})

		await fetch('https://blockria.com/api/agreements', { method: 'POST', body })
			.then(() => GETAgreements())
			.catch(alert)

		if (documentOrder === 1) setDocuSignDocument1IsLoading(false)
		else if (documentOrder === 2) setDocuSignDocument2IsLoading(false)
		else if (documentOrder === 3) setDocuSignDocument3IsLoading(false)
		else if (documentOrder === 4) setDocuSignDocument4IsLoading(false)
		else if (documentOrder === 5) setDocuSignDocument5IsLoading(false)
	}

	function renderUploadPDF(documentOrder) {
		let hasDocument = false
		switch (documentOrder) {
			case 1:
				hasDocument = docuSignHasDocument1
				break
			case 2:
				hasDocument = docuSignHasDocument2
				break
			case 3:
				hasDocument = docuSignHasDocument3
				break
			case 4:
				hasDocument = docuSignHasDocument4
				break
			case 5:
				hasDocument = docuSignHasDocument5
				break
			default:
				break
		}

		return hasDocument ? (
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
						{/* <th>VIEW</th> */}
						<th>UPLOAD</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className='Bold'>Investment Advisory Agreement (Client Agreement)</td>
						<td>{docuSignHasDocument1UpdatedAt ? renderDate(docuSignHasDocument1UpdatedAt) : null}</td>
						{/* <td></td> */}
						{docuSignDocument1IsLoading ? <td className='Loading'>Loading...</td> : renderUploadPDF(1)}
					</tr>
					<tr>
						<td className='Bold'>Privacy Policy</td>
						<td>{docuSignHasDocument2UpdatedAt ? renderDate(docuSignHasDocument2UpdatedAt) : null}</td>
						{/* <td></td> */}
						{docuSignDocument2IsLoading ? <td className='Loading'>Loading...</td> : renderUploadPDF(2)}
					</tr>
					<tr>
						<td className='Bold'>Form CRS</td>
						<td>{docuSignHasDocument3UpdatedAt ? renderDate(docuSignHasDocument3UpdatedAt) : null}</td>
						{/* <td></td> */}
						{docuSignDocument3IsLoading ? <td className='Loading'>Loading...</td> : renderUploadPDF(3)}
					</tr>
					<tr>
						<td className='Bold'>Form ADV Part 2A</td>
						<td>{docuSignHasDocument4UpdatedAt ? renderDate(docuSignHasDocument4UpdatedAt) : null}</td>
						{/* <td></td> */}
						{docuSignDocument4IsLoading ? <td className='Loading'>Loading...</td> : renderUploadPDF(4)}
					</tr>
					<tr>
						<td className='Bold'>Form ADV Part 2B</td>
						<td>{docuSignHasDocument5UpdatedAt ? renderDate(docuSignHasDocument5UpdatedAt) : null}</td>
						{/* <td></td> */}
						{docuSignDocument5IsLoading ? <td className='Loading'>Loading...</td> : renderUploadPDF(5)}
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
