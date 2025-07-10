import Link from "next/link";

export default function Navigation() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between">
                <div>
                    <Link href="/">BlockchainGG</Link>
                </div>
            </div>
        </div>
    )
}