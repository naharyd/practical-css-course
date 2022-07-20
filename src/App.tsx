import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      {CheckboxExample()}
    </div>
  );
}

function CheckboxExample() {
  const defaultBehavior = (
    <form>
      <input type="checkbox" id="vehicle1" name="vehicle1" value="Bike" />
      <label htmlFor="vehicle1"> I have a bike</label>
      <br/>
      <input type="checkbox" id="vehicle2" name="vehicle2" value="Car" />
      <label htmlFor="vehicle2"> I have a car</label>
      <br/>
      <input type="checkbox" id="vehicle3" name="vehicle3" value="Boat" />
      <label htmlFor="vehicle3"> I have a boat</label>
      <br/>
    </form>
  );
  const withoutHtmlForAndInputIDBehavior = (
    <form>
      <label><input type="checkbox" name="vehicle1" value="Bike" /> I have a bike</label>
      <br/>
      <label><input type="checkbox" name="vehicle2" value="Car" /> I have a car</label>
      <br/>
      <label><input type="checkbox" name="vehicle3" value="Boat" /> I have a boat</label>
      <br/>
    </form>
  );
  const warppingInputWithLabelButCheckboxNotWorking = (
    <form>
      <label htmlFor="vehicle1"><input id="vehicle1" type="checkbox" name="vehicle1" value="Bike" /> I have a bike</label>
      <br/>
      <label htmlFor="vehicle2"><input id="vehicle2" type="checkbox" name="vehicle2" value="Car" /> I have a car</label>
      <br/>
      <label htmlFor="vehicle3"><input id="vehicle3" type="checkbox" name="vehicle3" value="Boat" /> I have a boat</label>
      <br/>
    </form>
  );
  return (
    <>
      <h5>Checkbox - Label with "for" attribute</h5>
      {defaultBehavior}
      <h5>Checkbox - Label without "for" attribute</h5>
      {withoutHtmlForAndInputIDBehavior}
      <h5>Checkbox - Label wrapping input with "for" attribute</h5>
      {warppingInputWithLabelButCheckboxNotWorking}
    </>
  );
}

export default App;
