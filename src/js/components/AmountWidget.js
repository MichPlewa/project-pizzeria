import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element){
    super(element);
    const thisWidget = this;

    thisWidget.getElement();

    thisWidget.initActions();
    thisWidget.setValue( settings.amountWidget.defaultValue);

    //console.log('AmountWidget: ', thisWidget);
    //console.log('constructor argument: ', element);
  }

  getElement(){
    const thisWidget = this;  

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    
  }

  isValid(value){
    return  !isNaN(value) 
    && value <= settings.amountWidget.defaultMax 
    && value >= settings.amountWidget.defaultMin;
  }

  initActions(){
    const thisWidget = this;
    
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.dom.input.value);
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(element){
      element.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(element){
      element.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;