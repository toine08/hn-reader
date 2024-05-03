import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function getData(choices: string): Promise<any[]> {
  const choice = choices || 'topstories';

  return fetch(`https://hacker-news.firebaseio.com/v0/${choice}.json`)
    .then((res) => res.json())
    .then((data) => {
      const storyPromises = data.slice(0, 50).map((id: number) => 
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
      );
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
  } catch (e) {
    console.error(e, 'error')
  }
};

