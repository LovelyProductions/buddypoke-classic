
  var retryCnt = 0;
  var loadingInfo = "none"

  function debugLoading(str)
  {
  }

  function loadBuddyPoke()
  {
    loadingInfo = "1"
    if (retryCnt>4){
document.getElementById('addappdiv').style.display = "block"
      return;
	}
    //document.getElementById('message').innerHTML = "loadBuddyPoke";

    var params = { };
    params[opensocial.DataRequest.PeopleRequestFields.PROFILE_DETAILS] = [
    opensocial.Person.Field.THUMBNAIL_URL,
    opensocial.Person.Field.GENDER ];

    try {
        var req = opensocial.newDataRequest();
        req.add(req.newFetchPersonRequest('OWNER', params), 'owner');
        req.add(req.newFetchPersonRequest('VIEWER', params), 'viewer');
        req.send(onLoadedData);
        loadingInfo = "4"

        try {
            setSkin();
        }catch (e){}
    }
    catch(e){
      loadingInfo = loadingInfo+"_exception_"+e.name+"_"+e.message;
    }
  }


  var udata = "err";
  var udataObj = "err";

  function simplePerson(person) 
  {
    var r = {}
    try {
      r["id"] = person.getId();
      r["name"] = person.getDisplayName();
      r["profile"] = person.getField(opensocial.Person.Field.PROFILE_URL);
      try {
        r["gender"] = person.getField(opensocial.Person.Field.GENDER).getDisplayValue();
      }catch (e){}
      r["icon"] = person.getField(opensocial.Person.Field.THUMBNAIL_URL);
    }
    catch (e){}
    return r;
  }



  function onLoadedData(data) 
  {
    var ownerData = data.get('owner');
    var viewerData = data.get('viewer');

    try
    {
        if (ownerData==null || ownerData.getData()==null)
        {
            retryCnt++;
            loadBuddyPoke();
            return;
        }

        try {
            if (ownerData.getData().getDisplayName()==null && retryCnt<4)
            {
                retryCnt++;
                loadBuddyPoke();
                return;
            }
        }catch (e_){}

      if (viewerData==null || viewerData.getData()==null)
      {
        udataObj = {
          "view" : { "viewName" : viewName, "onlyVisible" : onlyViz }, 
          "owner" : simplePerson(ownerData.getData())
        };
      }
      else
      {
        viewer = data.get('viewer').getData();       
        udataObj = {
          "view" : { "viewName" : viewName, "onlyVisible" : onlyViz }, 
          "owner" : simplePerson(ownerData.getData()), 
          "viewer" : simplePerson(viewerData.getData())
        };
      } 
    try{
    coinsID = udataObj["owner"]["id"];
    }catch(e){}

    }
    catch (e){
      retryCnt++;
      loadBuddyPoke();
      return;
    }
    
    gadgetReady = true;        
	try{    
    if (viewName=="canvas"){
		showOfferPalBanner();
    }
    }catch(e){}
  }
  
  function initFlashUserObj() {
    try {
        gadgets.window.adjustHeight();
    }
    catch (e){}
    return udataObj;
  }  
  function hideLoadingImage() {
    document.getElementById("flashcontainer").style.backgroundImage = 'none';
    try {
    gadgets.window.adjustHeight();
    }
    catch (e){}
  }
  
  var gadgetReady = false;
  function getGadgetReady() {
    return gadgetReady;
  }
  
  function getFlashProxyUrl(url, interval)
  {
    return url;
  }
    
    function getMainUrl(url)
    {
        return flashGadget;
    }
    
    function getCanvasUrl(url)
    {
        return flashUI;
    }
    function getCommentsUrl()
    {
        return flashComments;
    }


  function makeFlashRequest(url, callbackName, params)
  {
    //document.getElementById('message').innerHTML = "makeFlashRequest 1";
      
    var onLoaded = function(obj)
    {
      try {
        getFlash("flashbuddypoke")[callbackName](obj.text);
      } catch (e){
        getFlash("flashbuddypoke")[callbackName](null);
      }
    };
    
    gadgets.io.makeRequest(url, onLoaded, params);
  }
  
  function newUpdateBuddyAppData2(callbackName, key, value, key2, value2)
  {
    var onSetBuddyData = function(obj)
    {
      getFlash("flashbuddypoke")[callbackName](obj.hadError());
    }; 
    
    var req = opensocial.newDataRequest();
    req.add(req.newUpdatePersonAppDataRequest(opensocial.DataRequest.PersonId.VIEWER, key, value));
    req.add(req.newUpdatePersonAppDataRequest(opensocial.DataRequest.PersonId.VIEWER, key2, value2));
    req.send(onSetBuddyData);       
  }
  
  function fetchBuddyAppData2(callbackName, userId, key, key2) {
    var onFetchedData = function(dataResponse)
    {
      var value = null;
      var value2 = null;
      try {
        value = gadgets.util.unescapeString(dataResponse.get('appData').getData()[userId][key]);
      } catch (e){}
      try {
        value2 = gadgets.util.unescapeString(dataResponse.get('appData2').getData()[userId][key2]);
      } catch (e){}
      getFlash("flashbuddypoke")[callbackName](value, value2);
    };
    
    var req = opensocial.newDataRequest();
    req.add(req.newFetchPersonAppDataRequest(userId, key), 'appData');
    req.add(req.newFetchPersonAppDataRequest(userId, key2), 'appData2');
    req.send(onFetchedData);
  }; 


  function requestFriendsArrayID(callbackName, userArr) { 
    var loadFirstAppData = userArr.length>0;
    var firstId = loadFirstAppData ? userArr[0] : "";
    var onLoaded = function(data)
    {
      try { 
        var result = new Array();
        var friends = data.get('reqUserArr').getData();
        friends.each(function(person) {
          if (person!=null){
            var sp = simplePerson2(person);
            try { 
              if (sp["id"]==firstId){
                sp["bdpkbd"] = gadgets.util.unescapeString(data.get(sp["id"]+'_bdpkbd').getData()[sp['id']]['bdpkbd']);
                sp["bdpkmod"] = gadgets.util.unescapeString(data.get(sp["id"]+'_bdpkmod').getData()[sp['id']]['bdpkmod']);
              }
            }catch (e){}              
            result.push(sp);
		      }
        });

        getFlash("flashbuddypoke")[callbackName](result);
      }
      catch (e){
        getFlash("flashbuddypoke")[callbackName](null);
      }              
    };

    var params = { };
    params[opensocial.DataRequest.PeopleRequestFields.PROFILE_DETAILS] = [
      opensocial.Person.Field.THUMBNAIL_URL,
      opensocial.Person.Field.GENDER ];

    params[opensocial.DataRequest.PeopleRequestFields.MAX] = 100;
    params[opensocial.DataRequest.PeopleRequestFields.FILTER] = opensocial.DataRequest.FilterType.HAS_APP;
    var req = opensocial.newDataRequest();
    req.add(req.newFetchPeopleRequest(userArr, params), "reqUserArr");

    if (loadFirstAppData){
      req.add(req.newFetchPersonAppDataRequest(firstId, "bdpkbd"), firstId+'_bdpkbd');
      req.add(req.newFetchPersonAppDataRequest(firstId, "bdpkmod"), firstId+'_bdpkmod');
    }
    
    req.send(onLoaded);
  };


  function requestOwnerFriends(callbackName, first, number, filterHasApp) {    
    document.getElementById('message').innerHTML = "requestOwnerFriends "+first+" "+number;        
    var onLoaded = function(data)
    {
      if (data.hadError())
      {
        getFlash("flashbuddypoke")[callbackName](true, [], 0);
      }
      else
      {
        var result = new Array();
        var friends = data.get('reqUserArr').getData();        
        var friendTotalCount = friends.getTotalSize();
        document.getElementById('message').innerHTML = "friendTotalCount "+friendTotalCount;        
  
        friends.each(function(person) {
          if (person!=null){
            result.push(simplePerson(person));
		      }
        });
        getFlash("flashbuddypoke")[callbackName](false, result, friendTotalCount);
      }
    };

    var params = { };
    params[opensocial.DataRequest.PeopleRequestFields.PROFILE_DETAILS] = [
      opensocial.Person.Field.THUMBNAIL_URL,
      opensocial.Person.Field.GENDER ];

    params[opensocial.DataRequest.PeopleRequestFields.FIRST] = first;
    params[opensocial.DataRequest.PeopleRequestFields.MAX] = number;
    
    if (filterHasApp){
        params[opensocial.DataRequest.PeopleRequestFields.FILTER] = opensocial.DataRequest.FilterType.HAS_APP;
    }
    
    var req = opensocial.newDataRequest();
    req.add(req.newFetchPeopleRequest(opensocial.DataRequest.Group.VIEWER_FRIENDS, params), "reqUserArr");
    req.send(onLoaded);
  };


function getFlash(movieName) {
  // IE and Netscape refer to the movie object differently.
  // This function returns the appropriate syntax depending on the browser.
  if (navigator.appName.indexOf ("Microsoft") !=-1) {
    return window[movieName]
  } else {
    return document[movieName]
  }
}
  
  function shareWithFriends(recipientUserId){
    message = opensocial.newMessage("[sender] wants you to check out [app]. Create a super cool avatar and BuddyPoke all your friends!");
opensocial.requestShareApp(recipientUserId, message, function(){
    }
   );    
  }
  
  
  function notifyFriend(targetId, title, text) {}
  
  function notifyPoke(fromUserId, toUserId, fromUserName, toUserName, rawNotifStr, iconUrl) {}

  function createActivity(text, iconUrl) {}
  
  function createMoodActivity(userId, userName, hist, iconUrl, moodId) {}

  function createPokeActivity(fromUserId, toUserId, fromUserName, toUserName, notif, iconUrl, activityIcon){}

function navigateToCanvas(){
  gadgets.views.requestNavigateTo(gadgets.views.getSupportedViews()["canvas"], {});
}

  function customizeOnCanvas(){
    var params = {};
    params['action'] = "customize";              
    gadgets.views.requestNavigateTo(gadgets.views.getSupportedViews()["canvas"], params);
  }

  function changeMoodOnCanvas(){
    var params = {};
    params['action'] = "mood";              
    gadgets.views.requestNavigateTo(gadgets.views.getSupportedViews()["canvas"], params);
  }

  function pokeOnCanvas(friend_id){
    var params = {};
    params['action'] = "poke";              
    gadgets.views.requestNavigateTo(gadgets.views.getSupportedViews()["canvas"], params);
  }
  
  function pokeBackOnCanvas(friend_id){
    var params = {};
    params['action'] = "poke";              
    param…