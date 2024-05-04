import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function getData(choices: string, page: number): Promise<any[]> {
  console.log('getData', choices, page)
  const choice = choices || 'topstories';
  const start = (page - 1) * 50;
  const end = start + 50;

  return fetch(`https://hacker-news.firebaseio.com/v0/${choice}.json`)
    .then((res) => res.json())
    .then((data) => {
      console.log('Data from API:', data);
      const slicedData: number[] = Array.from(new Set(data.slice(start, end))); // Add type annotation here
      console.log('Sliced data:', slicedData);
      const uniqueIds = new Set<number>(); // Set to store unique IDs
      const storyPromises = slicedData
        .filter(id => !uniqueIds.has(id)) // Filter out duplicate IDs
        .map((id: number) => {
          uniqueIds.add(id); // Add ID to the set
          return fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
        });
      return Promise.all(storyPromises);
    })
    .catch((error) => {
      console.error('Error:', error);
      throw error;
    });
}

export async function storeData(value: any){
  console.log('storeData', value)
  try {
    const existingArticleIds = await AsyncStorage.getItem('hn-article');
    let existingArticleIdsArray = existingArticleIds ? existingArticleIds.split(',') : [];
    const newId = value.data.toString();
    if (!existingArticleIdsArray.includes(newId)) {
      existingArticleIdsArray.push(newId); // convert id to string
      const stringValue = existingArticleIdsArray.join(',');
      await AsyncStorage.setItem('hn-article', stringValue);
      console.log(await AsyncStorage.getItem('hn-article'), 'saved')
    }
  } catch (e) {
    console.error(e, 'error')
  }
};

export async function getStorySaved(){
  try {
    const stringValue = await AsyncStorage.getItem('hn-article');
    const articleIds = stringValue != null ? stringValue.split(',') : [];
    const articles = await Promise.all(articleIds.map((id: string) => fetchArticle(Number(id)))); // fetch each article
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

export async function removeArticleId(id: number){
  try {
    const stringValue = await AsyncStorage.getItem('hn-article');
    let articleIds = stringValue != null ? stringValue.split(',') : [];
    articleIds = articleIds.filter(articleId => articleId !== id.toString());
    const updatedStringValue = articleIds.join(',');
    await AsyncStorage.setItem('hn-article', updatedStringValue);
    return articleIds; // Return the updated list of article IDs
  } catch (e) {
    console.error(e, 'error')
  }
};
export function getLocalTime(value:number){
  const options:any  = {
    year: "2-digit",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const date = new Date(value * 1000);
  return date.toLocaleDateString(undefined, options);
}

