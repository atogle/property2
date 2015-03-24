function opaAddress(e){return-1!==e.indexOf(" #")?e=e.replace(" #","/"):e+="/",e}!function(e){e.deparam=function(a,p){var t={},s={"true":!0,"false":!1,"null":null};return e.each(a.replace(/\+/g," ").split("&"),function(a,r){var n,o=r.split("="),i=decodeURIComponent(o[0]),d=t,l=0,c=i.split("]["),u=c.length-1;if(/\[/.test(c[0])&&/\]$/.test(c[u])?(c[u]=c[u].replace(/\]$/,""),c=c.shift().split("[").concat(c),u=c.length-1):u=0,2===o.length)if(n=decodeURIComponent(o[1]),p&&(n=n&&!isNaN(n)?+n:"undefined"===n?void 0:void 0!==s[n]?s[n]:n),u)for(;u>=l;l++)i=""===c[l]?d.length:c[l],d=d[i]=u>l?d[i]||(c[l+1]&&isNaN(c[l+1])?{}:[]):n;else e.isArray(t[i])?t[i].push(n):t[i]=void 0!==t[i]?[t[i],n]:n;else i&&(t[i]=p?void 0:"")}),t}}(jQuery);var app={};window.app=app,app.els={appLink:$("<a>").attr("href",window.location.pathname)},$("[data-hook]").each(function(e,a){var p=$(a),t=p.data("hook").replace(/-([a-z])/g,function(e){return e[1].toUpperCase()});app.els[t]=p}),app.els.appCrumbText=app.els.appCrumb.contents(),app.els.appCrumbLink=app.els.appLink.clone().text(app.els.appCrumb.text()),$("#templates").detach(),app.views={titleLink:function(){app.els.appTitle.contents().wrap(app.els.appLink)},breadcrumbs:function(e){e?(app.els.appCrumbText.detach(),app.els.appCrumbLink.appendTo(app.els.appCrumb),app.els.crumb.text(e).appendTo(app.els.appCrumb.parent())):(app.els.appCrumbLink.detach(),app.els.appCrumbText.appendTo(app.els.appCrumb),app.els.crumb.detach())},search:function(e,a){e?app.els.search.val(e):(app.els.search.val(""),app.els.search.attr("placeholder",a))},count:function(e){app.els.count.find("#total").text(e),app.els.count.appendTo(app.els.content)},loading:function(){app.els.content.children().detach(),app.els.content.text("Loading...")},front:function(){app.els.searchLeft.off("transitionend").removeClass("medium-14").addClass("medium-4").html("&nbsp;"),app.els.searchBox.removeClass("medium-10").addClass("medium-16"),app.els.content.children().detach(),app.els.content.append(app.els.front)},result:function(e){var a=app.els.result.clone(),p=e.property_id,t=e.unit||"";t=t.replace(/^0+/,""),t&&(t=" #"+t),a.find("a").attr("href","?"+$.param({p:p})).text(e.full_address+t),a.appendTo(app.els.results)},resultsPreFetch:function(e){app.views.breadcrumbs("Search Results"),app.views.search(e),app.els.searchLeft.off("transitionend").removeClass("medium-14").addClass("medium-4").html("&nbsp;"),app.els.searchBox.removeClass("medium-10").addClass("medium-16")},results:function(e){return history.replaceState&&!history.state&&history.replaceState(e),e.error?app.els.content.text(e.error):(app.els.content.empty(),app.views.count(e.total),app.els.results.empty(),e.data.properties.forEach(app.views.result),void app.els.results.appendTo(app.els.content))},addressPreFetch:function(e){app.views.breadcrumbs("Address"),app.els.addressTitle.find("h1").html(e),app.els.addressTitle.find(".small-text").empty(),app.els.search.val(""),app.els.search.attr("placeholder","Search for another property"),app.els.searchLeft.removeClass("medium-4").addClass("medium-14").on("transitionend",function(e){$(e.target).empty().append(app.els.addressTitle)}),app.els.searchBox.removeClass("medium-16").addClass("medium-10")},address:function(e){history.replaceState&&!history.state&&history.replaceState(e),app.els.addressTitle.find("h1").text(e.opa.full_address),app.els.addressTitle.find(".small-text").text("#"+e.opa.account_number),app.els.content.empty(),app.els.content.append(app.els.address)}},app.views.titleLink(),app.render=function(e){var a=$.deparam(window.location.search.substr(1));if(a.q)app.views.resultsPreFetch(a.q),history.state?app.views.results(history.state):(app.views.loading(),$.ajax("http://api.phila.gov/opa/v1.1/address/"+encodeURIComponent(opaAddress(a.q))+"?format=json").done(function(e){app.views.results(e)}).fail(function(){var e={error:"Failed to retrieve results. Please try another search."};app.views.results(e)}));else if(a.p)if(app.views.addressPreFetch(a.p),history.state)app.views.address(history.state);else{app.views.loading();var p={},t=3;$.ajax("https://api.phila.gov/ulrs/v3/addresses/"+encodeURIComponent(a.p)+"/service-areas?format=json").done(function(e){p.sa=e.serviceAreaValues,--t||app.views.address(p)}).fail(function(){p.sa={error:"Failed to retrieve data for service areas."},--t||app.views.address(p)}),$.ajax("http://api.phila.gov/opa/v1.1/address/"+encodeURIComponent(opaAddress(a.p))+"?format=json").done(function(e){p.opa=e.data&&e.data.properties&&e.data.properties.length?e.data.properties[0]:{error:"No properties returned in OPA data."},--t||app.views.address(p)}).fail(function(){p.opa={error:"Failed to retrieve OPA address data."},--t||app.views.address(p)});var s="https://api.phila.gov/ulrs/v3/addresses/"+encodeURIComponent(a.p)+"/topics?format=json";$.ajax(s).done(function(e){var a;return e.topics.some(function(e){return"AddressKeys"===e.topicName?e.keys.some(function(e){return e.topicId?(a=e.topicId,!0):void 0}):void 0}),a?void $.ajax("https://services.phila.gov/PhillyApi/Data/v1.0/locations("+a+")?$format=json").done(function(e){p.li=e.d,--t||app.views.address(p)}).fail(function(){p.li={error:"Failed to retrieve L&I address data."},--t||app.views.address(p)}):(p.li={error:"No L&I key found at "+s+"."},--t||app.views.address(p))}).fail(function(){p.li={error:"Failed to retrieve address topics."},--t||app.views.address(p)})}else app.views.breadcrumbs(),app.views.search(null,"Enter address, account number, intersection, or city block"),app.views.front()},app.render(),window.onpopstate=app.render,app.els.search.parent().on("submit",function(e){if(history.pushState){e.preventDefault();var a=e.target.elements.q;a.blur(),history.pushState(null,a.value,"?"+$.param({q:a.value})),app.render(e)}}),$(document).on("click","a",function(e){if(history.pushState&&!e.defaultPrevented){var a=$(e.target),p=a.attr("href");p.indexOf("?")&&p!==window.location.pathname||(e.preventDefault(),history.pushState(null,a.text(),p),app.render(e))}});