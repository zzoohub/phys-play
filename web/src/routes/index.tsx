import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
	return (
		<div className="flex min-h-svh items-center justify-center p-4">
			<h1 className="text-4xl font-bold">Welcome</h1>
		</div>
	)
}
