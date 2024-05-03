import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';


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

export async function storeData(value: any){
  console.log('storeData', value)
  try {
    const existingArticleIds = await AsyncStorage.getItem('hn-article');
    let existingArticleIdsArray = existingArticleIds ? existingArticleIds.split(',') : [];
    existingArticleIdsArray.push(value.data.toString()); // convert id to string
    const stringValue = existingArticleIdsArray.join(',');
    await AsyncStorage.setItem('hn-article', stringValue);
    console.log(await AsyncStorage.getItem('hn-article'), 'saved')
  } catch (e) {
    console.error(e, 'error')
  }
};

export async function getStorySaved(){
  try {
    const stringValue = await AsyncStorage.getItem('hn-article');
    const articleIds = stringValue != null ? stringValue.split(',') : [];
    const articles = await Promise.all(articleIds.map(fetchArticle)); // fetch each article
    console.log(articles, 'articles')
    return articles;
  } catch (e) {
    console.error(e, 'error')
  }
}

export async function fetchArticle(id: number) {
  // replace with your actual API call
  const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
  const article = await response.json();
  return article;
}

export async function clearAll() {
  try {
    await AsyncStorage.clear()
  } catch(e) {
    // clear error
  }

  console.log('Done.')
}

