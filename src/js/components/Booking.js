import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element){
    const thisBooking = this;   

    thisBooking.render(element);
    thisBooking.initWidgets();
  }  

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.element = utils.createDOMFromHTML(generatedHTML);

    const bookingContainer = document.querySelector(select.containerOf.booking);

    thisBooking.dom = {
      wrapper: element,
      peopleAmount: document.querySelector(select.booking.peopleAmount),
      hoursAmount: document.querySelector(select.booking.hoursAmount)
    };

    bookingContainer.appendChild(thisBooking.element).innerHTML;
  }

  initWidgets(){
    const thisBooking = this;
    
    thisBooking.peopleAmountElem = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountElem = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}

export default Booking;