import React, { useEffect } from 'react';


export default function KeyValueEditor({ pairs, setPairs }) {
	// Ensure all pairs have unique IDs
	useEffect(() => {
		const needsUpdate = pairs.some(pair => !pair.id);
		if (needsUpdate) {
			const updatedPairs = pairs.map((pair, index) => ({
				...pair,
				id: pair.id || `pair-${Date.now()}-${index}-${Math.random()}`
			}));
			setPairs(updatedPairs);
		}
	}, [pairs, setPairs]);

	const updatePair = (index, key, value) => {
		const newPairs = [...pairs];
		newPairs[index] = { ...newPairs[index], [key]: value };
		setPairs(newPairs);
	};

	const addPair = () => setPairs([...pairs, { key: '', value: '', id: `pair-${Date.now()}-${Math.random()}` }]);
	
	const removePair = (index) => {
		const newPairs = pairs.filter((_, i) => i !== index);
		setPairs(newPairs);
	};

	return (
		<div className="space-y-2">
			{pairs.map((pair, i) => (
				<div key={pair.id} className="flex gap-2 items-center">
					<input
						className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
						placeholder="Header name"
						value={pair.key}
						onChange={(e) => updatePair(i, 'key', e.target.value)}
					/>
					<input
						className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
						placeholder="Header value"
						value={pair.value}
						onChange={(e) => updatePair(i, 'value', e.target.value)}
					/>
					<button 
						onClick={() => removePair(i)}
						className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
						title="Remove header"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
					</button>
				</div>
			))}
			<button 
				onClick={addPair}
				className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mt-2 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
			>
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
				Add Header
			</button>
		</div>
	);
}