import React from 'react';
import './Search.scss';

export const Search = ({}) => {
  return (
    <form method='get' className='c-search flex' action=''>
      <label className='c-search__label'>
        <span className='sr-only'></span>
        <input
          type='search'
          className='c-search__field'
          placeholder='Enter a keyword to search...'
          title='Search keyword'
          defaultValue=''
          name='s'
        />
      </label>
      <input
        type='submit'
        className='c-search__submit search-submit'
        style={{
          backgroundImage: `url(https://katsumascore.blog/images/magnifying-glass.png)`,
        }}
        value=''
      />
    </form>
  );
};
