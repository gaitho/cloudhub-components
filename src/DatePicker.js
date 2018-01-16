import React, { Component } from 'react';
import { withStyles } from 'material-ui';
import { DatePicker } from 'antd';
import moment from 'moment';
import 'antd/lib/date-picker/style/index.css';

const dateFormat = 'DD/MM/YYYY';

const styles = () => ({
  datePicker: {
    '& .ant-calendar-picker-container': {
      position: 'absolute',
      zIndex: 10050,
    },
    '& .ant-input': {
      height: 33,
    },
  },
});

class AntDatePicker extends Component {
  static defaultProps = {
    defaultValue: '',
  };
  componentDidMount() {}
  onDateChanged = date => {
    if (date) {
      this.props.input.onChange(date.format());
    } else {
      this.props.input.onChange('');
    }
  };

  render() {
    const { value } = this.props.input;
    const { meta, classes } = this.props;

    return (
      <div className={classes.datePicker}>
        <DatePicker
          style={{ width: '100%' }}
          defaultValue={value ? moment(value) : null}
          format={dateFormat}
          onChange={this.onDateChanged}
        />
        {meta.touched &&
          meta.error && <div className="error">{meta.error}</div>}
      </div>
    );
  }
}

export default withStyles(styles)(AntDatePicker);