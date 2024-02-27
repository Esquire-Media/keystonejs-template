import React, { useState } from "react";
import { WidgetProps } from "@react-awesome-query-builder/ui";
import Config from "./config"

const RelativePeriodSelector: React.FC<WidgetProps> = (props) => {
  console.log(props.value)
  const [amount, setAmount] = useState<number>(props.value?.amount);
  const [unit, setUnit] = useState<string>(props.value?.unit);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseInt(e.target.value, 10) || 0;
    setAmount(newAmount);
    props.setValue( [newAmount, props.value[1] ]);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    setUnit(newUnit);
    props.setValue({ ...props.value, unit: newUnit });
  };

  console.log(props.value)

  // Render options based on the mode
  const renderUnitOptions = () => {
    switch (props.fieldDefinition.type) {
      case "date":
        return (
          <>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </>
        );
      case "datetime":
        return (
          <>
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </>
        );
      case "time":
        return (
          <>
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <input
        title="Amount"
        type="number"
        value={amount}
        onChange={handleAmountChange}
        min="1"
        step="1"
      />
      <select title="Unit" value={unit} onChange={handleUnitChange}>
        {renderUnitOptions()}
      </select>
    </div>
  );
};

export default Config;
export { RelativePeriodSelector }