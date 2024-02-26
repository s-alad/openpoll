import { useState } from "react"

// Check if user is authenticated
const isAuthenticated = true

// Format of Class Data necessary for screen
interface ClassData {
    classID: string,
    className: string,
    owners: string[]
}

// Mock Data. To be Deleted later
const mockData: ClassData[] = [
    { classID: "biology1", className: "Biology", owners: ["Profess1", "Professor2"]},
    { classID: "Algebra1", className: "Algebra", owners: ["Professor1", "TA1"] }
]

export default function Dashboard() {
    const [classes, setClasses] = useState<ClassData[]>(mockData)

    // First check if user is authenticated
    if (!isAuthenticated) {
        return (
            <div>You are not authenticated</div>
        )
    }
    
    return (
        <>
            <div>Dashboard</div>
            {classes.length > 0 && (
                <div className="classDashboard">
                    <div>All Classes</div>
                    <ul>
                        {/* TODO: Create a classItem Component to store all the necessary information */}
                        {classes.map((classItem, index) => (
                            <li key={classItem.classID}>{classItem.className}</li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}