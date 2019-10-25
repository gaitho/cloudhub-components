import React, { useState, useEffect } from 'react';
import Dropdown from 'react-select';
import CreatableSelect from 'react-select/creatable';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';

const Select = ({
  input,
  options,
  value,
  onChange,
  axiosinstance,
  returnkeys,
  valueField,
  menuPlacement,
  disabled,
  placeholder,
  url,
  params,
  displayField,
  isMulti,
  creatable,
  ...props
}) => {
  const [opts, setOpts] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);

  useEffect(() => {
    if (Array.isArray(options)) {
      setOpts(
        [...options].map(item => {
          if (isObject(item)) {
            return {
              label: item[displayField],
              value: item[valueField] || item[displayField],
              item,
            };
          }
          return {
            label: item,
            value: item,
            item,
          };
        })
      );
    }
  }, [options, displayField, valueField]);

  useEffect(() => {
    if (!value) {
      setSelectedValue(null);
      return;
    }
    if (isMulti) {
      if (Array.isArray(value)) {
        setSelectedValue(
          [...value].map(item => {
            if (isObject(item)) {
              return {
                label: item[displayField],
                value: item[valueField] || item[displayField],
                item,
              };
            }
            return {
              label: item,
              value: item,
              item,
            };
          })
        );
      } else {
        setSelectedValue(
          [value].map(item => {
            if (isObject(item)) {
              return {
                label: item[displayField],
                value: item[valueField] || item[displayField],
                item,
              };
            }
            return {
              label: item,
              value: item,
              item,
            };
          })
        );
      }
    } else if (value) {
      if (isObject(value)) {
        setSelectedValue({
          label: value[displayField],
          value: value[valueField],
          item: value,
        });
      } else {
        setSelectedValue({
          label: value,
          value,
          item: value,
        });
      }
    }
  }, [value, valueField, displayField, isMulti]);

  const logChange = val => {
    const keys = isString(returnkeys) ? [returnkeys] : returnkeys;

    setSelectedValue(val);
    if (!val || isEmpty(val)) {
      return onChange(val);
    }
    if (isMulti) {
      if (val && Array.isArray(val)) {
        const options = val.map(item => {
          if (!isObject(item.item)) {
            return item.item;
          }
          const objValue = { ...item.item };

          if (keys.length > 1) {
            const obj = {};
            keys.forEach(key => {
              obj[key] = objValue[key];
            });
            return { ...obj };
          }
          return { objValue };
        });
        return onChange(options);
      }
      return onChange(val || []);
    }
    if (val && val.value) {
      if (!isObject(val.item)) {
        return onChange(val.item);
      }
      const objValue = { ...val.item };

      if (!isEmpty(keys)) {
        const obj = {};
        keys.forEach(key => {
          obj[key] = objValue[key];
        });
        return onChange({
          simple: isString(returnkeys) ? obj[returnkeys] : obj,
          full: objValue,
        });
      }
      return onChange(objValue);
    }
  };

  return (
    <>
      {creatable ? (
        <CreatableSelect
          openOnFocus
          isClearable
          options={opts}
          value={selectedValue}
          defaultOptions={options}
          onChange={logChange}
          placeholder={placeholder}
          disabled={disabled}
          menuPlacement={menuPlacement || 'auto'}
          isMulti={isMulti}
          {...props}
        />
      ) : (
        <Dropdown
          openOnFocus
          isClearable
          options={opts}
          value={selectedValue}
          defaultOptions={options}
          onChange={logChange}
          placeholder={placeholder}
          disabled={disabled}
          menuPlacement={menuPlacement || 'auto'}
          isMulti={isMulti}
          {...props}
        />
      )}
    </>
  );
};

Select.defaultProps = {
  isMulti: false,
  params: {},
  value: null,
  options: [],
  onChange: () => {},
  displayField: '',
  returnkeys: [],
  url: '',
  placeholder: 'Select...',
  selectUp: false,
  disabled: false,
  menuPlacement: 'auto',
  valueField: 'id',
};

export default Select;