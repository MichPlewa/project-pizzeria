import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

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
    bookingContainer.appendChild(thisBooking.element).innerHTML;
    thisBooking.dom = {
      wrapper: element,
      peopleAmount: document.querySelector(select.booking.peopleAmount),
      hoursAmount: document.querySelector(select.booking.hoursAmount),
      datePicker: document.querySelector(select.widgets.datePicker.wrapper),
      hourPicker: document.querySelector(select.widgets.hourPicker.wrapper)
    };

  }

  initWidgets(){
    const thisBooking = this;
    
    thisBooking.peopleAmountElem = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountElem = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerElem = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerElem = new HourPicker(thisBooking.dom.hourPicker);
  }
}

export default Booking;