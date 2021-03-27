import React from 'react';
import { DatePicker } from 'baseui/datepicker';
import { LayersManager } from 'baseui/layer';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import Block from '../Block';
import ThemeContext from '../theme/ThemeContext';

const useStyles = ({ sizes }) =>
  makeStyles({
    pickerContainer: {
      // zIndex: 1,
      marginBottom: sizes.baseMargin,
    },
  });

const BaseWebDatePicker = ({
  input,
  value,
  onChange,
  overrides,
  dateFormat = 'DD/MM/YYYY',
  meta,
  showError,
  ...rest
}) => {
  const val = value || input.value || new Date().getTime();
  const [initialValue, setinitialValue] = React.useState(val);
  const { sizes, colors } = React.useContext(ThemeContext);
  const classes = useStyles({ sizes, colors, active: meta.active })();
  const containerRef = React.useRef();

  React.useEffect(() => {
    if (typeof onChange === 'function') {
      onChange(initialValue);
    }
    if (input && typeof input.onChange === 'function') {
      input.onChange(initialValue);
    }
  }, [initialValue]);

  return (
    <Block ref={containerRef} className={classes.pickerContainer}>
      <LayersManager zIndex={1301}>
        <DatePicker
          value={initialValue ? initialValue.map((d) => new Date(d)) : []}
          onChange={({ date }) => {
            const msTstamp = (date || []).map((d) => d.getTime());
            setinitialValue(msTstamp);
          }}
          formatString={dateFormat}
          overrides={{
            Input: {
              props: {
                overrides: {
                  Input: {
                    style: ({ $disabled }) => ({
                      height: sizes.inputHeight,
                      borderRadius: `${sizes.borderRadius}px`,
                      borderWidth: '0.5px',
                      borderTopWidth: '0.5px',
                      borderRightWidth: '0.5px',
                      borderBottomWidth: '0.5px',
                      borderLeftWidth: '0.5px',

                      ...($disabled
                        ? {
                            borderStyle: 'solid',
                            borderColor: '#CCC',
                          }
                        : {}),
                    }),
                  },

                  InputContainer: {
                    style: {
                      height: sizes.inputHeight,
                      borderTopWidth: '0.5px',
                      borderRightWidth: '0.5px',
                      borderBottomWidth: '0.5px',
                      borderLeftWidth: '0.5px',
                    },
                  },
                },
              },
            },
            ...overrides,
          }}
          range
          clearable
          {...rest}
        />
      </LayersManager>
    </Block>
  );
};

export default BaseWebDatePicker;
