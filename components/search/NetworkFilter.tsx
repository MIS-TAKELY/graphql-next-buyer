interface NetworkFilterProps {
  networks: string[];
  selectedNetworks: string[];
  toggleNetwork: (network: string) => void;
}

export default function NetworkFilter({
  networks,
  selectedNetworks,
  toggleNetwork,
}: NetworkFilterProps) {
  return (
    <div>
      <h3 className="font-medium text-sm mb-3 text-white">Network Type</h3>
      <div className="flex flex-wrap gap-2">
        {networks.map((network) => (
          <button
            key={network}
            onClick={() => toggleNetwork(network)}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              selectedNetworks.includes(network)
                ? "bg-blue-600 text-white"
                : "bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-700"
            }`}
          >
            {network}
          </button>
        ))}
      </div>
    </div>
  );
}
