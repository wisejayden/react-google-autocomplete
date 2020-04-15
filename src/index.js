import React from 'react';
import PropTypes from 'prop-types';

export default class ReactGoogleAutocomplete extends React.Component {
  static propTypes = {
    onPlaceSelected: PropTypes.func,
    types: PropTypes.array,
    componentRestrictions: PropTypes.object,
    bounds: PropTypes.object,
    fields: PropTypes.array,
    inputAutocompleteValue: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.autocomplete = null;
    this.event = null;
  }

  componentDidMount() {
    const {
      types = ['(cities)'],
      componentRestrictions,
      bounds,
      fields = [
        'address_components',
        'geometry.location',
        'place_id',
        'formatted_address'
      ]
    } = this.props;
    const config = {
      types,
      bounds,
      fields
    };

    if (componentRestrictions) {
      config.componentRestrictions = componentRestrictions;
    }
    this.disableAutofill();
    const userInput = 'berlin, ' + this.refs.input;
    console.log("UserInput", userInput);
    console.log("this.refs.input", this.refs.input);


    this.autocomplete = new google.maps.places.Autocomplete(
      this.refs.input,
      config
    );

    this.event = this.autocomplete.addListener(
      'place_changed',
      this.onSelected.bind(this)
    );
  }

  disableAutofill() {
    // Autofill workaround adapted from https://stackoverflow.com/questions/29931712/chrome-autofill-covers-autocomplete-for-google-maps-api-v3/49161445#49161445
    if (window.MutationObserver) {
      const observerHack = new MutationObserver(() => {
        observerHack.disconnect();
        if (this.refs && this.refs.input) {
          console.log("disableAutofill");
          this.refs.input.autocomplete = this.props.inputAutocompleteValue || 'new-password';
        }
      });
      observerHack.observe(this.refs.input, {
        attributes: true,
        attributeFilter: ['autocomplete']
      });
    }
  }

  componentWillUnmount() {
    if (this.event) this.event.remove();
  }

  onSelected() {
    console.log("onSelected");
    if (this.props.onPlaceSelected && this.autocomplete) {
      this.props.onPlaceSelected(this.autocomplete.getPlace(), 'berlin, ' + this.refs.input);
    }
  }

  render() {

    const {
      onPlaceSelected,
      types,
      componentRestrictions,
      bounds,
      ...rest
    } = this.props;
    console.log("first ReactGoogleAutocomplete -  props", this.props);

    return <input ref="input" {...rest} />;
  }
}

export class ReactCustomGoogleAutocomplete extends React.Component {
  static propTypes = {
    input: PropTypes.node.isRequired,
    onOpen: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.service = new google.maps.places.AutocompleteService();
  }

  onChange(e) {
    const { types = ['(cities)'] } = this.props;
    console.log("onCHANGW, this!");
    if (e.target.value) {
      this.service.getPlacePredictions(
        { input: 'berlin, ' + e.target.value, types },
        (predictions, status) => {
          if (status === 'OK' && predictions && predictions.length > 0) {
            this.props.onOpen(predictions);
          } else {
            this.props.onClose();
          }
        }
      );
    } else {
      this.props.onClose();
    }
  }

  componentDidMount() {
    if (this.props.input.value) {
      this.placeService = new google.maps.places.PlacesService(this.refs.div);
      this.placeService.getDetails(
        { placeId: this.props.input.value },
        (e, status) => {
          if (status === 'OK') {
            this.refs.input.value = e.formatted_address;
          }
        }
      );
    }
  }

  render() {
    console.log("second ReactCustomGoogleAutocomplete");

    return (
      <div>
        {React.cloneElement(this.props.input, {
          ...this.props,
          ref: 'input',
          onChange: e => {
            this.onChange(e);
          }
        })}
        <div ref="div" />
      </div>
    );
  }
}
