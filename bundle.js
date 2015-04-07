$(document).ready(function(){function e(e){e.wrap("<div class='table-wrapper' />");var t=e.clone();t.find("td:not(:first-child), th:not(:first-child)").css("display","none"),t.removeClass("responsive"),e.closest(".table-wrapper").append(t),t.wrap("<div class='pinned' />"),e.wrap("<div class='scrollable' />"),o(e,t)}function t(e){e.closest(".table-wrapper").find(".pinned").remove(),e.unwrap(),e.unwrap()}function o(e,t){var o=e.find("tr"),a=t.find("tr"),p=[];o.each(function(e){var t=$(this),o=t.find("th, td");o.each(function(){var t=$(this).outerHeight(!0);p[e]=p[e]||0,t>p[e]&&(p[e]=t)})}),a.each(function(e){$(this).height(p[e])})}var a=!1,p=function(){return $(window).width()<767&&!a?(a=!0,$("table.responsive").each(function(t,o){e($(o))}),!0):void(a&&$(window).width()>767&&(a=!1,$("table.responsive").each(function(e,o){t($(o))})))};$(window).load(p),$(window).on("redraw",function(){a=!1,p()}),$(window).on("resize",p)}),function(e){e.deparam=function(t,o){var a={},p={"true":!0,"false":!1,"null":null};return e.each(t.replace(/\+/g," ").split("&"),function(t,r){var s,n=r.split("="),i=decodeURIComponent(n[0]),c=a,h=0,l=i.split("]["),d=l.length-1;if(/\[/.test(l[0])&&/\]$/.test(l[d])?(l[d]=l[d].replace(/\]$/,""),l=l.shift().split("[").concat(l),d=l.length-1):d=0,2===n.length)if(s=decodeURIComponent(n[1]),o&&(s=s&&!isNaN(s)?+s:"undefined"===s?void 0:void 0!==p[s]?p[s]:s),d)for(;d>=h;h++)i=""===l[h]?c.length:l[h],c=c[i]=d>h?c[i]||(l[h+1]&&isNaN(l[h+1])?{}:[]):s;else e.isArray(a[i])?a[i].push(s):a[i]=void 0!==a[i]?[a[i],s]:s;else i&&(a[i]=o?void 0:"")}),a}}(jQuery);var app={};window.app=app,app.hooks={},$("[data-hook]").each(function(e,t){var o=$(t),a=o.data("hook").replace(/-([a-z])/g,function(e){return e[1].toUpperCase()});app.hooks[a]=o}),$("#templates").detach(),app.hooks.frontLink=$("<a>").attr("href",window.location.pathname).on("click",function(e){if(!(e.ctrlKey||e.altKey||e.shiftKey)){var t=$(e.target),o=t.attr("href");e.preventDefault(),window.scroll(0,0),window.location.search&&(history.pushState(null,t.text(),o),app.views.front())}}),app.hooks.crumbs.update=function(e){var t=this;t.hooks=t.hooks||{},t.hooks.app=t.hooks.app||t.find("li").last(),t.hooks.appText=t.hooks.appText||t.hooks.app.contents(),t.hooks.appLink=t.hooks.appLink||app.hooks.frontLink.clone(!0).text(t.hooks.app.text()),t.hooks.crumb&&t.hooks.crumb.detach(),e?(t.hooks.appText.detach(),t.hooks.app.append(t.hooks.appLink),t.hooks.crumb=e,t.append(t.hooks.crumb)):(t.hooks.appLink.detach(),t.hooks.app.append(t.hooks.appText))},app.hooks.appTitle.contents().wrap(app.hooks.frontLink),app.hooks.search.parent().on("submit",function(e){if(!(e.ctrlKey||e.altKey||e.shiftKey)){e.preventDefault();var t=e.target.elements.q;t.blur(),history.pushState(null,t.value,"?"+$.param({q:t.value})),window.scroll(0,0),app.views.results(t.value)}}),app.views={},app.route=function(){var e=$.deparam(window.location.search.substr(1));e.q?app.views.results(e.q):e.p?app.views.property(e.p):app.views.front()},$(app.route),window.onpopstate=app.route,history.pushState||(history.pushState=function(e,t,o){window.location=o},history.replaceState=function(e,t,o){o?window.location=o:history.state=e}),app.util={},app.util.addressWithUnit=function(e){var t=e.unit||"";return t&&(t=" #"+t.replace(/^0+/,"")),e.full_address+t},app.util.formatSalesDate=function(e){var t,o;return(o=/(\d+)-/.exec(e))?(t=new Date(+o[1]),t.getMonth()+1+"/"+t.getDate()+"/"+t.getFullYear()):""},accounting.settings.currency.precision=0,app.views.front=function(){app.hooks.crumbs.update(),app.hooks.search.val("").attr("placeholder","Enter address, account number, intersection, or city block"),app.hooks.searchForm.addClass("hint"),app.hooks.searchForm.find("p").removeClass("hide"),app.hooks.searchRight.html("&nbsp;"),app.hooks.searchLeft.removeClass("medium-14").addClass("medium-4").html("&nbsp;"),app.hooks.searchBox.removeClass("medium-10 float-right").addClass("medium-16"),app.hooks.content.children().detach(),app.hooks.content.empty(),app.hooks.belowContent.children().detach(),app.hooks.belowContent.empty(),app.hooks.content.append(app.hooks.front)},app.views.results=function(e){function t(){var e=history.state;return e.error?app.hooks.content.text(e.error):(app.hooks.content.empty(),0===e.total?app.hooks.content.append(app.hooks.noResults):(app.hooks.resultRows.empty(),e.data.properties.forEach(function(e){var t=app.hooks.resultRow.clone(),o=e.property_id,a=app.util.addressWithUnit(e),p="?"+$.param({p:o});t.append($("<td>").text(a)),t.append($("<td>").text(e.ownership.owners.join(", "))),t.append($("<td>").text(app.util.formatSalesDate(e.sales_information.sales_date)+", "+accounting.formatMoney(e.sales_information.sales_price))),t.append($("<td>").text(accounting.formatMoney(e.valuation_history[0].market_value))),t.on("click",function(t){t.ctrlKey||t.altKey||t.shiftKey||(t.preventDefault(),history.pushState({opa:e,address:a},a,p),window.scroll(0,0),app.views.property(o))}),app.hooks.resultRows.append(t)}),void app.hooks.content.append(app.hooks.results)))}function o(e){return-1!==e.indexOf(" #")?e=e.replace(" #","/"):e+="/",e}if(app.hooks.resultsCrumb.find("b").text(e),app.hooks.crumbs.update(app.hooks.resultsCrumb),app.hooks.search.val(e),app.hooks.searchForm.addClass("hint"),app.hooks.searchForm.find("p").removeClass("hide"),app.hooks.searchRight.html("&nbsp;"),app.hooks.searchLeft.removeClass("medium-14").addClass("medium-4").html("&nbsp;"),app.hooks.searchBox.removeClass("medium-10 float-right").addClass("medium-16"),app.hooks.content.children().detach(),app.hooks.belowContent.children().detach(),history.state)t();else{app.hooks.content.text("Loading...");var a,p,e=e.trim();p=(a=/#?(\d{9})/.exec(e))?"account/"+a[1]:(a=/(.+) +(&|and) +(.+)/.exec(e))?"intersection/"+encodeURI(a[1]+"/"+a[3]):"address/"+encodeURIComponent(o(e)),$.ajax("http://api.phila.gov/opa/v1.1/"+p+"?format=json").done(function(e){var o,a,p,r;e.data.property||1==e.data.properties.length?(o=e.data.property||e.data.properties[0],a=o.property_id,p="?"+$.param({p:a}),r=app.util.addressWithUnit(o),history.replaceState({opa:o,address:r},r,p),app.views.property(a)):(history.replaceState(e,""),t())}).fail(function(){history.replaceState({error:"Failed to retrieve results. Please try another search."},""),t()})}},app.views.property=function(e){function t(){i=!0,$.ajax("http://api.phila.gov/opa/v1.1/property/"+e+"?format=json").done(function(e){var t=$.extend({},history.state),p=e.data.property;t.opa=p,t.address=app.util.addressWithUnit(p),history.replaceState(t,""),c||a(),h||r(),t.sa||o()}).fail(function(){history.replaceState({error:!0},""),n()})}function o(){$.ajax("https://api.phila.gov/ulrs/v3/addresses/"+encodeURIComponent(history.state.address)+"/service-areas?format=json").done(function(e){var t=$.extend({},history.state);t.sa=e.serviceAreaValues,history.replaceState(t,""),s()}).fail(function(){var e=$.extend({},history.state);e.sa={error:!0},history.replaceState(e,"")})}function a(){var e=history.state;app.hooks.propertyCrumb.text(e.address),app.hooks.crumbs.update(app.hooks.propertyCrumb),app.hooks.propertyTitle.find("h1").text(e.address),app.hooks.propertyTitle.find(".small-text").text("#"+e.opa.account_number),app.hooks.content.empty(),app.hooks.propertyOwners.empty(),e.opa.ownership.owners.forEach(function(e){app.hooks.propertyOwners.append($("<div>").text(e))}),app.hooks.improvementDescription.text(e.opa.characteristics.description),app.hooks.landArea.text(accounting.formatNumber(e.opa.characteristics.land_area)),app.hooks.improvementArea.text(accounting.formatNumber(e.opa.characteristics.improvement_area)),app.hooks.zoning.text(e.opa.characteristics.zoning_description),app.hooks.propertyMailingHeader.detach(),app.hooks.propertyMailing.empty(),app.hooks.valuation.empty(),app.hooks.content.append(app.hooks.propertyMain),app.hooks.content.append(app.hooks.propertySide),app.hooks.belowContent.append(app.hooks.propertySecondary),p(),c=!0}function p(){var e=history.state,t=new google.maps.LatLng(e.opa.geometry.y,e.opa.geometry.x),o=new google.maps.Map(app.hooks.streetViewMap[0],{center:t,zoom:14,scrollwheel:!1,mapTypeControl:!1,minZoom:10,maxZoom:19,panControl:!1,streetViewControl:!1,zoomControlOptions:{style:google.maps.ZoomControlStyle.SMALL}}),a=(new google.maps.Marker({position:t,map:o,title:e.address}),new google.maps.StreetViewService);a.getPanoramaByLocation(t,50,function(e,a){var p,r,s="fa-map-marker",n="fa-street-view",i=app.hooks.streetViewToggle.find("i").next();a===google.maps.StreetViewStatus.OK&&(p=o.getStreetView(),r=google.maps.geometry.spherical.computeHeading(e.location.latLng,t),p.setOptions({position:e.location.latLng,panControl:!1,addressControl:!1,enableCloseButton:!1,zoomControlOptions:{style:google.maps.ZoomControlStyle.SMALL},pov:{heading:r,pitch:0,zoom:1}}),i.addClass(n),app.hooks.streetViewToggle.removeClass("hide").on("click",function(e){e.preventDefault(),p.getVisible()?(i.removeClass(s).addClass(n),p.setVisible(!1)):(i.removeClass(n).addClass(s),p.setVisible(!0))}))})}function r(){var e=history.state,t=app.hooks.propertyMailing,o=e.opa.ownership.mailing_address;app.hooks.propertyMailingHeader.insertBefore(t),t.append($("<div>").text(o.street)),t.append($("<div>").text(o.city+", "+o.state)),t.append($("<div>").text(o.zip)),e.opa.valuation_history.forEach(function(e){var t=$("<tr>");t.append($("<td>").text(e.certification_year)),t.append($("<td>").text(accounting.formatMoney(e.market_value))),t.append($("<td>").text(accounting.formatMoney(e.improvement_taxable))),t.append($("<td>").text(accounting.formatMoney(e.land_taxable))),t.append($("<td>").text(accounting.formatMoney(e.total_exempt))),t.append($("<td>").text(accounting.formatMoney(e.taxes))),app.hooks.valuation.append(t)}),h=!0}function s(){var e=history.state;e.error||e.sa.error||c&&e.sa&&e.sa.forEach(function(e){switch(e.serviceAreaId){case"SA_STREETS_Rubbish_Recyc":return app.hooks.rubbishDay.text(e.value);case"SA_SCHOOLS_Elementary_School_Catchment":return app.hooks.elementarySchool.text(e.value);case"SA_SCHOOLS_Middle_School_Catchment":return app.hooks.middleSchool.text(e.value);case"SA_SCHOOLS_High_School_Catchment":return app.hooks.highSchool.text(e.value);case"SA_PLANNING_2016Councilmanic":return app.hooks.councilDistrict.text(e.value);case"SA_PLANNING_Ward":return app.hooks.ward.text(e.value);case"SA_PLANNING_Ward_Divisions":return app.hooks.wardDivisions.text(e.value);case"SA_POLICE_PSA":return app.hooks.policePsa.text(e.value);case"SA_POLICE_District":return app.hooks.policeDistrict.text(e.value);case"SA_POLICE_Sector":return app.hooks.policeSector.text(e.value);case"SA_POLICE_Division":return app.hooks.policeDivision.text(e.value);case"SA_POLICE_FireDistricts":return app.hooks.fireDistrict.text(e.value);case"SA_STREETS_Highway_District":return app.hooks.highwayDistrict.text(e.value);case"SA_STREETS_Highway_Section":return app.hooks.highwaySection.text(e.value);case"SA_STREETS_Highway_Subsection":return app.hooks.highwaySubsection.text(e.value);case"SA_STREETS_Street_Lights_Routes":return app.hooks.streetLightRoutes.text(e.value);case"SA_Streets_Traffic_District":return app.hooks.trafficDistrict.text(e.value);case"SA_STREETS_Recycling_Diversion_Rate":return app.hooks.recyclingDiversion.text(e.value);case"SA_STREETS_Sanitation_Area":return app.hooks.sanitationArea.text(e.value);case"SA_STREETS_Sanitation_Districts":return app.hooks.sanitationDistrict.text(e.value);case"SA_STREETS_Leaf":return app.hooks.leafCollection.text(e.value);case"SA_Streets_Traffic_PM_District":return app.hooks.trafficPmDistrict.text(e.value);case"SA_PLANNING_Planning_Districts":return app.hooks.planning.text(e.value);case"SA_PWD_CenterCityDistrict":return app.hooks.pwdCenterCity.text(e.value);case"SA_CENTER_CITY_DISTRICT":return app.hooks.centerCity.text(e.value);case"SA_STREETS_HISTORIC":return app.hooks.historic.text(e.value);case"SA_RECREATION_Recreation_District":return app.hooks.recreation.text(e.value);case"SA_PHILLYRISING":return app.hooks.phillyRising.text(e.value);case"PWD_MAINT_DIST":return app.hooks.pwdMaintenance.text(e.value);case"PWD_PRES_DIST":return app.hooks.pwdPressure.text(e.value);case"PWD_WTPSA":return app.hooks.waterTreatment.text(e.value);case"SA_WATER_Water_Plate_Index":return app.hooks.waterPlate.text(e.value)}})}function n(){}var i,c,h;return app.hooks.propertyTitle.find("h1").html("&nbsp;"),app.hooks.propertyTitle.find(".small-text").empty(),app.hooks.search.val(""),app.hooks.search.attr("placeholder","Search for another property"),app.hooks.searchForm.removeClass("hint"),app.hooks.searchForm.find("p").addClass("hide"),app.hooks.searchLeft.removeClass("medium-4").addClass("medium-14").empty().append(app.hooks.propertyTitle),app.hooks.searchRight.html(""),app.hooks.searchBox.removeClass("medium-16").addClass("medium-10 float-right"),app.hooks.content.children().detach(),history.state||history.replaceState({},""),history.state.error?n():(history.state.opa?a():(app.hooks.content.text("Loading..."),t()),history.state.opa&&!history.state.opa.address_match?r():i||t(),void(history.state.sa?s():history.state.address&&o()))};