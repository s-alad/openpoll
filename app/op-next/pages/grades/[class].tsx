import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function ClassGrades() {
  const [loading, setLoading] = useState(false);

  // get the class id from the url
  const router = useRouter();
  const classid = router.query.class;
  console.log(classid);

  return <div>ClassGrades</div>;
}
