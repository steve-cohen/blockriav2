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
	return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ')
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

	useEffect(async () => {
		await fetch(`https://blockria.com/api/agreements?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(newAgreements => {
				console.log(newAgreements)

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
			})
			.catch(alert)
	}, [])

	async function handleUploadPDF(event, documentOrder) {
		const body = JSON.stringify({
			advisorId: advisor.idToken.payload.sub,
			document: await toBase64(event.target.files[0]),
			documentOrder
		})

		await fetch('https://blockria.com/api/agreements', { method: 'POST', body })
			.then(() => window.location.reload())
			.catch(alert)
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
						<th className='AlignRight'>CHANGE</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td style={{ textTransform: 'none' }}>
							When enabled, your firm's agreements will be sent to clients during onboarding
						</td>
						<td>Enable | Disable</td>
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
						<th>VIEW</th>
						<th>UPLOAD</th>
						<th>UPDATED</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className='Bold'>Investment Advisory Agreement (Client Agreement)</td>
						<td></td>
						{renderUploadPDF(1)}
						<td>{docuSignHasDocument1UpdatedAt ? renderDate(docuSignHasDocument1UpdatedAt) : null}</td>
					</tr>
					<tr>
						<td className='Bold'>Privacy Policy</td>
						<td></td>
						{renderUploadPDF(2)}
						<td>{docuSignHasDocument2UpdatedAt ? renderDate(docuSignHasDocument2UpdatedAt) : null}</td>
					</tr>
					<tr>
						<td className='Bold'>Form CRS</td>
						<td></td>
						{renderUploadPDF(3)}
						<td>{docuSignHasDocument3UpdatedAt ? renderDate(docuSignHasDocument3UpdatedAt) : null}</td>
					</tr>
					<tr>
						<td className='Bold'>Form ADV Part 2A</td>
						<td></td>
						{renderUploadPDF(4)}
						<td>{docuSignHasDocument4UpdatedAt ? renderDate(docuSignHasDocument4UpdatedAt) : null}</td>
					</tr>
					<tr>
						<td className='Bold'>Form ADV Part 2B</td>
						<td></td>
						{renderUploadPDF(5)}
						<td>{docuSignHasDocument5UpdatedAt ? renderDate(docuSignHasDocument5UpdatedAt) : null}</td>
					</tr>
				</tbody>
			</table>
			<table>
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
			</table>
		</div>
	)
}

export default Agreements
