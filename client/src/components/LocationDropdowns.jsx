import { useMemo } from 'react';
import { City, Country, State } from 'country-state-city';

export default function LocationDropdowns({ value, onChange }) {
  const countries = useMemo(() => Country.getAllCountries().sort((a, b) => a.name.localeCompare(b.name)), []);

  const states = useMemo(
    () => (value.countryCode ? State.getStatesOfCountry(value.countryCode).sort((a, b) => a.name.localeCompare(b.name)) : []),
    [value.countryCode]
  );

  const noStates = Boolean(value.countryCode && states.length === 0);

  const cities = useMemo(() => {
    if (!value.countryCode) return [];
    if (value.stateCode && value.stateCode !== 'NA') {
      return City.getCitiesOfState(value.countryCode, value.stateCode).sort((a, b) => a.name.localeCompare(b.name));
    }
    if (noStates) {
      return City.getCitiesOfCountry(value.countryCode).sort((a, b) => a.name.localeCompare(b.name));
    }
    return [];
  }, [value.countryCode, value.stateCode, noStates]);

  const setCountry = (event) => {
    const countryCode = event.target.value;
    const country = countries.find((item) => item.isoCode === countryCode);
    const countryStates = countryCode ? State.getStatesOfCountry(countryCode) : [];

    if (countryCode && countryStates.length === 0) {
      onChange({
        countryCode,
        country: country?.name || '',
        stateCode: 'NA',
        state: country?.name || '',
        district: '',
        city: ''
      });
      return;
    }

    onChange({
      countryCode,
      country: country?.name || '',
      stateCode: '',
      state: '',
      district: '',
      city: ''
    });
  };

  const setState = (event) => {
    const stateCode = event.target.value;
    const state = states.find((item) => item.isoCode === stateCode);
    onChange({
      ...value,
      stateCode,
      state: state?.name || '',
      district: '',
      city: ''
    });
  };

  const setDistrict = (event) => {
    const district = event.target.value;
    onChange({ ...value, district, city: district });
  };

  const setCity = (event) => {
    onChange({ ...value, city: event.target.value });
  };

  const canPickCities = Boolean(value.stateCode || noStates);
  const noCities = canPickCities && cities.length === 0;

  return (
    <div className="location-dropdowns">
      <label className="location-field">
        <span>Country</span>
        <select required value={value.countryCode} onChange={setCountry}>
          <option value="">Select country</option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.name}
            </option>
          ))}
        </select>
      </label>

      {!noStates && (
        <label className="location-field">
          <span>State / province</span>
          <select required value={value.stateCode} onChange={setState} disabled={!value.countryCode}>
            <option value="">Select state / province</option>
            {states.map((state) => (
              <option key={state.isoCode} value={state.isoCode}>
                {state.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {noStates && value.countryCode && (
        <label className="location-field">
          <span>State / region</span>
          <input readOnly value={value.state} placeholder="State / region" />
        </label>
      )}

      {noCities ? (
        canPickCities && (
          <>
            <label className="location-field">
              <span>District / county / area</span>
              <input
                required
                placeholder="District / County / Area"
                value={value.district}
                onChange={(event) => onChange({ ...value, district: event.target.value })}
              />
            </label>
            <label className="location-field">
              <span>City / town</span>
              <input
                required
                placeholder="City / Town"
                value={value.city}
                onChange={(event) => onChange({ ...value, city: event.target.value })}
              />
            </label>
          </>
        )
      ) : (
        canPickCities && (
          <>
            <label className="location-field">
              <span>District / area</span>
              <select required value={value.district} onChange={setDistrict}>
                <option value="">Select district / area</option>
                {cities.map((city) => (
                  <option key={`district-${city.name}-${city.latitude}`} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="location-field">
              <span>City / town</span>
              <select required value={value.city} onChange={setCity} disabled={!value.district}>
                <option value="">Select city / town</option>
                {(value.district ? cities.filter((city) => city.name === value.district) : cities).map((city) => (
                  <option key={`city-${city.name}-${city.latitude}`} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        )
      )}
    </div>
  );
}
