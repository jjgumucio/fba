Meteor.methods({
  query: function(doc) {
    check(doc, QuerySchema);
    console.log(doc);
    return doc.pages.map(function(page) {
      var points = [];
      var sinceCursor = moment(doc.since);

      while (sinceCursor.isBefore(moment(doc.until))) {

        var since = sinceCursor.clone();
        var until = sinceCursor.clone().add(80, 'days');

        try {
          console.log(`GET ${page}/insights/page_fans_country`, since.unix(), until.unix());

          var response = Meteor.call('fb_call', 'get', `${page}/insights/page_fans_country`, {
            since: since.unix(),
            until: until.unix()
          });

          _.each(response.data[0].values, function(data) {
            points.push([moment(data.end_time).valueOf(), data.value[doc.countryCode] || 0]);
          });
        } catch (e) {
          console.log('error', e);
        }

        sinceCursor.add(80, 'days');
      }

      return {
        data: points,
        name: page
      };
    });
  }
});
