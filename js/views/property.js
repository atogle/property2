/*global $,app,google*/

app.views.property = function (p) {
  var alreadyGettingOpaData, opaRendered, opaDetailsRendered;

  // Search area prep
  app.hooks.propertyTitle.find('h1').html('&nbsp;');
  app.hooks.propertyTitle.find('.small-text').empty();
  app.hooks.search.val('');
  app.hooks.search.attr('placeholder', 'Search for another property');
  app.hooks.searchLeft.removeClass('medium-4').addClass('medium-14')
    .empty().append(app.hooks.propertyTitle);
  app.hooks.searchBox.removeClass('medium-16').addClass('medium-10');

  // Empty content area
  app.hooks.content.children().detach();

  if (!history.state) history.replaceState({}, '');

  if (history.state.error) return renderError();

  if (history.state.opa) {
    renderOpa();
  } else {
    app.hooks.content.text('Loading...');
    getOpaData();
  }

  // The less-detailed search result contains address_match
  if (history.state.opa && !history.state.opa.address_match) {
    renderOpaDetails();
  } else {
    if (!alreadyGettingOpaData) getOpaData();
  }

  if (history.state.sa) {
    renderSa();
  } else if (history.state.address) {
    getSaData();
  }

  function getOpaData () {
    alreadyGettingOpaData = true;
    $.ajax('http://api.phila.gov/opa/v1.1/property/' + p + '?format=json')
      .done(function (data) {
        var state = $.extend({}, history.state);
        var property = data.data.property;
        state.opa = property;
        state.address = app.util.addressWithUnit(property);
        history.replaceState(state, ''); // Second param not optional in IE10
        if (!opaRendered) renderOpa();
        if (!opaDetailsRendered) renderOpaDetails();
        if (!state.sa) getSaData();
      })
      .fail(function () {
        history.replaceState({error: true}, '');
        renderError();
      });
  }

  function getSaData () {
    $.ajax('https://api.phila.gov/ulrs/v3/addresses/' + encodeURIComponent(history.state.address) + '/service-areas?format=json')
      .done(function (data) {
        var state = $.extend({}, history.state);
        state.sa = data.serviceAreaValues;
        history.replaceState(state, '');
        renderSa();
      })
      .fail(function () {
        var state = $.extend({}, history.state);
        state.sa = {error: true};
        history.replaceState(state, '');
      });
  }

  function renderOpa () {
    var state = history.state;

    // Breadcrumbs
    app.hooks.propertyCrumb.text(state.address);
    app.hooks.crumbs.update(app.hooks.propertyCrumb);

    // Search area
    app.hooks.propertyTitle.find('h1').text(state.address);
    app.hooks.propertyTitle.find('.small-text').text('#' + state.opa.account_number);

    // Clear loading...
    app.hooks.content.empty();

    // Render owners
    app.hooks.propertyOwners.empty();
    state.opa.ownership.owners.forEach(function (owner) {
      app.hooks.propertyOwners.append($('<div>').text(owner));
    });

    // Render improvement stuff
    app.hooks.improvementDescription.text(state.opa.characteristics.description);
    app.hooks.landArea.text(accounting.formatNumber(state.opa.characteristics.land_area));
    app.hooks.improvementArea.text(accounting.formatNumber(state.opa.characteristics.improvement_area));
    app.hooks.zoning.text(state.opa.characteristics.zoning_description);

    // Empty mailing address in prep for details
    app.hooks.propertyMailingHeader.detach();
    app.hooks.propertyMailing.empty();

    // Empty valuation history
    app.hooks.valuation.empty();

    app.hooks.content.append(app.hooks.propertySide);
    app.hooks.content.append(app.hooks.propertyMain);

    // Render Street View
    renderStreetView();

    opaRendered = true;
  }

  function renderStreetView() {
    var state = history.state,
        $map = app.hooks.streetView.find('.street-view'),
        mapEl = $map.get(0),
        addressLatLng = new google.maps.LatLng(
          state.opa.geometry.y, state.opa.geometry.x),
        map, marker, sv;

    // Init the map
    map = new google.maps.Map(mapEl, {
      center: addressLatLng,
      zoom: 14,
      scrollwheel: false,
      mapTypeControl: false,
      minZoom: 10,
      maxZoom: 19,
      panControl: false,
      streetViewControl: false,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL
      }
    });

    // Add the address marker
    marker = new google.maps.Marker({
      position: addressLatLng,
      map: map,
      title: state.address
    });

    // Fetch StreetView data
    sv = new google.maps.StreetViewService();
    sv.getPanoramaByLocation(addressLatLng, 50, function(panoData, status) {
      var markerIconClass = 'fa-map-marker',
          svIconClass = 'fa-street-view',
          $icon = app.hooks.streetViewToggle.find('i'),
          svPano, heading;

      if (status === google.maps.StreetViewStatus.OK) {
        // Init street view
        svPano = map.getStreetView();
        heading = google.maps.geometry.spherical.computeHeading(
                    panoData.location.latLng, addressLatLng);

        svPano.setOptions({
          position: panoData.location.latLng,
          panControl: false,
          addressControl: false,
          enableCloseButton: false,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
          },
          pov: {
            heading: heading,
            pitch: 0,
            zoom: 1
          }
        });

        $icon.addClass(svIconClass);
        app.hooks.streetViewToggle
          .removeClass('hide')
          .on('click', function(evt) {
            evt.preventDefault();

            if (svPano.getVisible()) {
              $icon.removeClass(markerIconClass).addClass(svIconClass);
              svPano.setVisible(false);
            } else {
              $icon.removeClass(svIconClass).addClass(markerIconClass);
              svPano.setVisible(true);
            }
          });
      }
    });
  }

  function renderOpaDetails () {
    var state = history.state;

    // Render mailing address
    var pm = app.hooks.propertyMailing;
    var ma = state.opa.ownership.mailing_address;
    app.hooks.propertyMailingHeader.insertBefore(pm);
    pm.append($('<div>').text(ma.street));
    pm.append($('<div>').text(ma.city + ', ' + ma.state));
    pm.append($('<div>').text(ma.zip));

    // Render valuation history
    state.opa.valuation_history.forEach(function (vh) {
      var numberFormat = { precision : 0 };
      var row = $('<tr>');
      row.append($('<td>').text(vh.certification_year));
      row.append($('<td>').text(accounting.formatMoney(vh.market_value, numberFormat)));
      row.append($('<td>').text(accounting.formatMoney(vh.improvement_taxable, numberFormat)));
      row.append($('<td>').text(accounting.formatMoney(vh.land_taxable, numberFormat)));
      row.append($('<td>').text(accounting.formatMoney(vh.total_exempt, numberFormat)));
      row.append($('<td>').text(accounting.formatMoney(vh.taxes, numberFormat)));
      app.hooks.valuation.append(row);
    });

    opaDetailsRendered = true;
  }

  function renderSa () {
    var state = history.state;

    // No use rendering if there's been a data error
    if (state.error || state.sa.error) return;

    // Wait for both OPA render and SA data
    if (!opaRendered || !state.sa) return;

    // TODO Render service areas
    state.sa.forEach(function (sa) {
      switch (sa.serviceAreaId) {
        // Sidebox
        case 'SA_STREETS_Rubbish_Recyc':
          return app.hooks.rubbishDay.text(sa.value);

        // School catchment
        case 'SA_SCHOOLS_Elementary_School_Catchment':
          return app.hooks.elementarySchool.text(sa.value);
        case 'SA_SCHOOLS_Middle_School_Catchment':
          return app.hooks.middleSchool.text(sa.value);
        case 'SA_SCHOOLS_High_School_Catchment':
          return app.hooks.highSchool.text(sa.value);

        // Political
        case 'SA_PLANNING_2016Councilmanic':
          return app.hooks.councilDistrict.text(sa.value);
        case 'SA_PLANNING_Ward':
          return app.hooks.ward.text(sa.value);
        case 'SA_PLANNING_Ward_Divisions':
          return app.hooks.wardDivisions.text(sa.value);

        // Public safety
        case 'SA_POLICE_PSA':
          return app.hooks.policePsa.text(sa.value);
        case 'SA_POLICE_District':
          return app.hooks.policeDistrict.text(sa.value);
        case 'SA_POLICE_Sector':
          return app.hooks.policeSector.text(sa.value);
        case 'SA_POLICE_Division':
          return app.hooks.policeDivision.text(sa.value);
        case 'SA_POLICE_FireDistricts':
          return app.hooks.fireDistrict.text(sa.value);

        // Streets
        case 'SA_STREETS_Highway_District':
          return app.hooks.highwayDistrict.text(sa.value);
        case 'SA_STREETS_Highway_Section':
          return app.hooks.highwaySection.text(sa.value);
        case 'SA_STREETS_Highway_Subsection':
          return app.hooks.highwaySubsection.text(sa.value);
        case 'SA_STREETS_Street_Lights_Routes':
          return app.hooks.streetLightRoutes.text(sa.value);
        case 'SA_Streets_Traffic_District':
          return app.hooks.trafficDistrict.text(sa.value);
        case 'SA_STREETS_Recycling_Diversion_Rate':
          return app.hooks.recyclingDiversion.text(sa.value);
        case 'SA_STREETS_Sanitation_Area':
          return app.hooks.sanitationArea.text(sa.value);
        case 'SA_STREETS_Sanitation_Districts':
          return app.hooks.sanitationDistrict.text(sa.value);
        case 'SA_STREETS_Leaf':
          return app.hooks.leafCollection.text(sa.value);
        case 'SA_Streets_Traffic_PM_District':
          return app.hooks.trafficPmDistrict.text(sa.value);

        // Districts
        case 'SA_PLANNING_Planning_Districts':
          return app.hooks.planning.text(sa.value);
        case 'SA_PWD_CenterCityDistrict':
          return app.hooks.pwdCenterCity.text(sa.value);
        case 'SA_CENTER_CITY_DISTRICT':
          return app.hooks.centerCity.text(sa.value);
        case 'SA_STREETS_HISTORIC':
          return app.hooks.historic.text(sa.value);
        case 'SA_RECREATION_Recreation_District':
          return app.hooks.recreation.text(sa.value);
        case 'SA_PHILLYRISING':
          return app.hooks.phillyRising.text(sa.value);

        // Water
        case 'PWD_MAINT_DIST':
          return app.hooks.pwdMaintenance.text(sa.value);
        case 'PWD_PRES_DIST':
          return app.hooks.pwdPressure.text(sa.value);
        case 'PWD_WTPSA':
          return app.hooks.waterTreatment.text(sa.value);
        case 'SA_WATER_Water_Plate_Index':
          return app.hooks.waterPlate.text(sa.value);
      }
    });
  }

  function renderError () {
    // TODO Display an error message that looks nice
  }

  // // TODO Get L&I data
  // // Tim also pointed at http://api.phila.gov/ULRS311/Data/LIAddressKey/340%20n%2012th%20st
  // var topicsUrl = 'https://api.phila.gov/ulrs/v3/addresses/' + encodeURIComponent(params.p) + '/topics?format=json';
  // $.ajax(topicsUrl)
  //   .done(function (data) {
  //     var addressKey;
  //     data.topics.some(function (topic) {
  //       if (topic.topicName === 'AddressKeys') {
  //         return topic.keys.some(function (key) {
  //           if (key.topicId) {
  //             addressKey = key.topicId;
  //             return true;
  //           }
  //         });
  //       }
  //     });
  //     if (!addressKey) {
  //       propertyData.li = {error: 'No L&I key found at ' + topicsUrl + '.'};
  //       return --pending || app.views.address(propertyData);
  //     }
  //     $.ajax('https://services.phila.gov/PhillyApi/Data/v1.0/locations(' + addressKey + ')?$format=json')
  //       .done(function (data) {
  //         propertyData.li = data.d;
  //         --pending || app.views.property(propertyData);
  //       })
  //       .fail(function () {
  //         propertyData.li = {error: 'Failed to retrieve L&I address data.'};
  //         --pending || app.views.property(propertyData);
  //       });
  //   })
  //   .fail(function () {
  //     propertyData.li = {error: 'Failed to retrieve address topics.'};
  //     --pending || app.views.property(propertyData);
  //   });
  //
  // function renderLi () {
  // }
};
