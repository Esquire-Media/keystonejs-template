import { WidgetProps } from '@react-awesome-query-builder/ui';
import React, { useState } from 'react';

const ListInputWidget: React.FC<WidgetProps> = (props) => {
  const [inputValue, setInputValue] = useState('');

  // Handle changes in the input field
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    // Assuming the value is a comma-separated list, we'll split it to an array
    // and then call onChange from props to update the query builder state
    const listValues = value.split(',').map(item => item.trim());
    props.setValue(listValues);
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      placeholder="Enter values separated by commas"
    />
  );
};

export default ListInputWidget;
