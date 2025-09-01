import React, { useState } from 'react';
import RequestBuilder from './components/RequestBuilder';
import ResponseViewer from './components/ResponseViewer';
import HistoryPanel from './components/HistoryPanel';


export default function App() {
	const [response, setResponse] = useState(null);

	return (
		<div className="min-h-screen bg-gray-100 p-8">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">REST Client</h1>
				<div className="grid grid-cols-2 gap-8">
					<div className="space-y-6">
						<RequestBuilder onResponse={setResponse} />
						<HistoryPanel onLoadHistory={setResponse} />
					</div>
					<ResponseViewer response={response} />
				</div>
			</div>
		</div>
	);
}