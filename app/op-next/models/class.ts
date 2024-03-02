interface Classroom {
    classname: string;
    description: string;
    owner: {
        uid: string;
        email: string;
        name: string;
    }
    admin: string[];
    students: string[];
    questions: string[];
    classid: string;
}

export default Classroom;