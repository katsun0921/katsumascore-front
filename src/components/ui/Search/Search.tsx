import React from 'react';
import './Search.scss';

export const Search = ({}) => {
  return (
    <form method='get' className='search flex' action=''>
      <label className='search__label'>
        <span className='sr-only'></span>
        <input
          type='search'
          className='search__field'
          placeholder='Enter a keyword to search...'
          title='Search keyword'
          defaultValue=''
          name='s'
        />
      </label>
      <input
        type='submit'
        className='search__submit search-submit'
        style={{
          backgroundImage: `url(https://katsumascore.blog/images/magnifying-glass.png)`,
        }}
        value=''
      />
    </form>
  );
};
