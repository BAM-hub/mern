import React, { Fragment, useState } from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addEducation } from '../actions/profile';

const AddEducation = ({ addEducation, history }) => {
  const [formData, setFormData] = useState({
    school: '',
    degree: '',
    fieldofstudy: '',
    from: '',
    to: '',
    current: false,
    description: ''
  });

  const [toDateDisabled, toggoleDisabled] = useState(false);

  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value});

  return (
    <Fragment>
        <h1 class="large text-primary">
       Add An Experience
      </h1>
      <p class="lead">
        <i class="fas fa-code-branch"></i> Add Your Education
        Add any school or bootcamp that you have attended.
      </p>
      <small>* = required field</small>
      <form class="form" onSubmit={ e=> {
        e.preventDefault();
        addEducation(formData, history);
      }}>
        <div class="form-group">
          <input type="text" placeholder="* School or Bootcamp" name="school" value={school} onChange={e => onChange(e)} required />
        </div>
        <div class="form-group">
          <input type="text" placeholder="* degree" name="degree" value={degree} onChange={e => onChange(e)} required />
        </div>
        <div class="form-group">
          <input type="text" placeholder="Field of study" name="fieldofstudy" value={fieldofstudy} onChange={e => onChange(e)} />
        </div>
        <div class="form-group">
          <h4>From Date</h4>
          <input type="date" name="from" value={from} onChange={e => onChange(e)} />
        </div>
         <div class="form-group">
          <p><input type="checkbox" name="current" checked={current} value={current} onChange={e => {
            setFormData({...formData, current: !current});
            toggoleDisabled(!toDateDisabled);
          }} />{' '} Current Job</p>
        </div>
        <div class="form-group">
          <h4>To Date</h4>
          <input type="date" name="to" value={to} onChange={e => onChange(e)}
          disabled={toDateDisabled ? 'disabled': '' } />
        </div>
        <div class="form-group">
          <textarea
            name="description"
            cols="30"
            rows="5"
            placeholder="program Description"
            value={description} onChange={e => onChange(e)}
          ></textarea>
        </div>
        <input type="submit" class="btn btn-primary my-1" />
        <a class="btn btn-light my-1" href="dashboard.html">Go Back</a>
      </form>
    </Fragment>
  );
};

AddEducation.propTypes = {
  addEducation:PropTypes.func.isRequired,
}

export default connect(
    null,
    { addEducation })(AddEducation);