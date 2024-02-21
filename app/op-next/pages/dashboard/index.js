const isAuthenticated = false

export default function Page() {
    if (!isAuthenticated) {
        return (
            <div>You are not authenticated</div>
        )
    }
    
    return (
        <div>Dashboard</div>
    )
}