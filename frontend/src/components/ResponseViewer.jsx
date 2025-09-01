import React from 'react';


export default function ResponseViewer({ response }) {
	if (!response) return (
		<div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 h-full">
			<h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
				<svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
				</svg>
				Response
			</h2>
			<div className="flex items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
				<div className="text-center">
					<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p className="mt-2 text-sm">Send a request to see the response here</p>
				</div>
			</div>
		</div>
	);

	const { status, data, headers, error } = response;
	const statusColor = status >= 500 ? 'bg-red-100 text-red-800 border-red-200' : 
						status >= 400 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
						status >= 200 ? 'bg-green-100 text-green-800 border-green-200' : 
						'bg-gray-100 text-gray-800 border-gray-200';

	return (
		<div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 h-full">
			<h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
				<svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
				</svg>
				Response
			</h2>
			
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
					<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div>
						<p className="font-semibold">Request Error</p>
						<p className="text-sm">{error}</p>
					</div>
				</div>
			)}

			<div className="space-y-4">
				<div className="flex items-center gap-3 pb-3 border-b border-gray-200">
					<span className="font-semibold text-gray-700">Status:</span>
					<span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
						{status ?? 'N/A'}
					</span>
				</div>

				{headers && (
					<div>
						<h3 className="font-semibold text-gray-700 mb-3 flex items-center">
							<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.023.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
							</svg>
							Response Headers
						</h3>
						<div className="bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-auto">
							<pre className="p-4 text-sm font-mono text-gray-700 whitespace-pre-wrap">
								{JSON.stringify(headers, null, 2)}
							</pre>
						</div>
					</div>
				)}

				<div>
					<h3 className="font-semibold text-gray-700 mb-3 flex items-center">
						<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Response Body
					</h3>
					<div className="bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-auto">
						<pre className="p-4 text-sm font-mono text-gray-700 whitespace-pre-wrap">
							{data ? JSON.stringify(data, null, 2) : JSON.stringify(response, null, 2)}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}