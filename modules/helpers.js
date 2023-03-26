import moment from 'moment';

export default function(Handlebars) {
  Handlebars.registerHelper('formatDate', function(date, format) {
    return moment(date).format(format);
  });
};
