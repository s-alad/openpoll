import Navbar from "@/layout/navbar/navbar"

import styles from "./create.class.module.scss"

import { User, getAdditionalUserInfo } from "firebase/auth";
import { auth, db } from "../../../firebase/firebaseconfig";

import { useRouter } from "next/router";

// index.tsx
import React, { useState, FormEvent } from 'react';

interface ClassFormData {
  className: string;
  description: string;
}

const CreateClassForm: React.FC = () => {

    const router = useRouter();


    async function createclass() {
        // in the document classes in firebase, create a new class
        const user = auth.currentUser;
        const uid = user!.uid;

    }

  const [formData, setFormData] = useState<ClassFormData>({ className: '', description: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the submission to your backend or state management solution
    console.log('Form data submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="className">Class Name:</label>
        <input
          type="text"
          id="className"
          name="className"
          value={formData.className}
          onChange={handleChange}
          required
        />
      </div>
      <div>
            <Navbar path={"Create class /"}/>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Create Class</button>
    </form>
  );
};

export default CreateClassForm;
