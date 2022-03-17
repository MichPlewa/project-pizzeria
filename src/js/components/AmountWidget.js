import {select, settings} from '../settings.js';

class AmountWidget {
  constructor(element){
    const thisWidget = this;

    thisWidget.getElement (element);
    thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);


    this.initActions();

    //console.log('AmountWidget: ', thisWidget);
    //console.log('constructor argument: ', element);
  }

  getElement(element){
    const thisWidget = this;  
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);

    if(newValue !== thisWidget.value && !isNaN(newValue) && newValue <= settings.amountWidget.defaultMax && newValue >= settings.amountWidget.defaultMin){
      thisWidget.value = newValue;
    }
    
    thisWidget.input.value = thisWidget.value;

    thisWidget.announce();
    //console.log(newValue);
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated',{
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }

  initActions(){
    const thisWidget = this;
    
    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function(element){
      element.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function(element){
      element.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;