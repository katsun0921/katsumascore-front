import React from 'react';

export const Search = ({}) => {
  return (
    <form method='get' action=''>
      <label>
        <span></span>
        <input
          type='search'
          placeholder='Enter a keyword to search...'
          title='Search keyword'
          defaultValue=''
          name='s'
        />
      </label>
      <input
        type='submit'
        style={{
          backgroundImage: `url(https://katsumascore.blog/images/magnifying-glass.png)`,
        }}
        value=''
      />
    </form>
  );
};
