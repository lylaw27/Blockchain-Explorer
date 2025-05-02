export default function Navigation() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between">
                <div>
                    <a href="/">ExchangeGG</a>
                </div>
                <div className="flex space-x-6 align-middle">
                    <a href={`/portfolio`}>portfolio</a>
                    <a>help</a>
                    <button className="p-3 bg-blue-500 font-bold rounded-lg text-white">Connect</button>
                </div>
            </div>
        </div>
    )
}