import React, { useState } from 'react';
import axios from 'axios';
import KeyValueEditor from './KeyValueEditor';


export default function RequestBuilder({ onResponse }) {
	const [method, setMethod] = useState('GET');
	const [url, setUrl] = useState('');
	const [headers, setHeaders] = useState([]);
	const [body, setBody] = useState('');
	const [urlError, setUrlError] = useState(null);
	const [bodyError, setBodyError] = useState(null);
		const [lastDuration, setLastDuration] = useState(null);


	const sendRequest = async () => {
		const headersObj = headers.reduce((acc, { key, value }) => {
			if (key) acc[key] = value;
			return acc;
		}, {});

		// validate URL
		try {
			new URL(url);
			setUrlError(null);
		} catch (e) {
			setUrlError('Invalid URL');
			return;
		}

		// validate JSON body for methods that allow a body
		let parsedBody = null;
		if (body && method !== 'GET') {
			try {
				parsedBody = JSON.parse(body);
				setBodyError(null);
			} catch (e) {
				setBodyError('Body must be valid JSON');
				return;
			}
		}

			try {
				const t0 = Date.now();
				const res = await axios.post('http://localhost:4000/api/relay', {
					method,
					url,
					headers: headersObj,
					body: parsedBody,
				});
				setLastDuration(Date.now() - t0);
				onResponse(res.data);
			} catch (err) {
				setLastDuration(null);
				onResponse({ error: err.message, details: err.response ? err.response.data : null });
			}
	};


	return (
		<div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
			<h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
				<svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
				</svg>
				Request Builder
			</h2>
			
			<div className="flex gap-3 mb-4">
				<select 
					value={method} 
					onChange={(e) => setMethod(e.target.value)} 
					className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
				>
					<option>GET</option>
					<option>POST</option>
					<option>PUT</option>
					<option>DELETE</option>
				</select>
				<input
					className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="Enter request URL (e.g., https://jsonplaceholder.typicode.com/todos/1)"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
				/>
				<button 
					onClick={sendRequest} 
					disabled={!url || urlError || bodyError}
					className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
					</svg>
					Send
				</button>
			</div>

			{urlError && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm flex items-center">
					<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					{urlError}
				</div>
			)}

			{lastDuration !== null && (
				<div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md mb-4 text-sm flex items-center">
					<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Request completed in {lastDuration} ms
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div>
					<h3 className="font-semibold text-gray-700 mb-3 flex items-center">
						<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.023.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
						</svg>
						Headers
					</h3>
					<KeyValueEditor pairs={headers} setPairs={setHeaders} />
				</div>

				<div>
					<h3 className="font-semibold text-gray-700 mb-3 flex items-center">
						<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Request Body
					</h3>
					<textarea
						className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
						rows="6"
						placeholder="JSON request body (optional)"
						value={body}
						onChange={(e) => setBody(e.target.value)}
					/>
					{bodyError && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mt-2 text-sm flex items-center">
							<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{bodyError}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}