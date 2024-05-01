import { useState, useEffect } from "react";

export default function getData(choices: string) {
  const [data, setData] = useState<any[]>([]);
  const choice = choices || 'topstories';

  useEffect(() => {
    fetch(`https://hacker-news.firebaseio.com/v0/${choice}.json`)
      .then((res) => res.json())
      .then((data) => {
        const storyPromises = data.slice(0, 50).map((id: number) => 
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
        );
        Promise.all(storyPromises).then(stories => setData(stories));
      })
      .catch((error) => console.error('Error:', error));
  }, []);

  return data;
}

