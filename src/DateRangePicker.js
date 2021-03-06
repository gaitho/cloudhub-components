import React from 'react';
import Box from '@material-ui/core/Box';
import Loadable from '@react-loadable/revised';
import colors from './theme/Colors';
import sizes from './theme/Sizes';

const BaseWebDatePicker = Loadable({
  loader: () =>
    import(/* webpackChunkName: "BaseTheme" */ './baseweb/BaseWebDatePicker'),
  loading: () => (
    <Box
      borderColor={colors.gray}
      height={sizes.inputHeight}
      boder="0.5px solid"
      borderRadius={sizes.borderRadius}
    >
      <div>loading...</div>
    </Box>
  ),
});

const DateRangePicker = (props) => (
  <BaseWebDatePicker
    range
    quickSelect
    placeholder="DD/MM/YYYY – DD/MM/YYYY"
    {...props}
  />
);

export default DateRangePicker;
