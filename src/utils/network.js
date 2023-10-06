export function API_URL(url){
  // return process.env.REACT_APP_API_URL + 'api/' + url
  // return 'http://localhost:4000/apiv1/' + url
  // return "https://api.apployme.com/apiv1/" + url
      // return "https://stagapi.apployme.com/apiv1/" + url
      // return "https://devapi.heyhire.com/api/v1" + url  // Production server
      return "https://devapi.heyhire.net/api/v1" + url  // Staging server
      // return "http://devapi.apployme.net/api/v1" + url
} 

export function getBaseURL(url){
  return "https://app.apployme.com/" + url
    //  return "https://stagingapp.apployme.com/" + url
} 

export async function getRequest(url,token){
  console.log(' tokeennnnnn ', token)
  let headers = {
    "Content-Type": "application/json", 
    "Access-Control-Allow-Origin": "*",
    // "Authorization": localStorage.token
  }
  if(token){
    headers['Authorization'] = `Bearer ${token}`
  }
  let response = await fetch(API_URL(url), {
    method: "GET", 
    mode: "cors", 
    cache: "no-cache",
    credentials: "same-origin",
    headers,
    redirect: "follow",
    referrer: "no-referrer",  
  })
  console.log(' response in network ', response);
  return response
}

export async function getWithParamRequest(url,form,token){
  let headers = {
    // "Content-Type": "application/json", 
    "Access-Control-Allow-Origin": "*",
    // "Authorization": localStorage.token
  }
  if(token){
    headers['Authorization'] = `Bearer ${token}`
  }

  let response = await fetch(API_URL(url), {
    method: "GET", 
    mode: "cors", 
    cache: "no-cache",
    credentials: "same-origin",
    headers,
    redirect: "follow",
    referrer: "no-referrer",  
    body:form
  });
  return response;
}

export async function postFormData(url, form){
  let response = await fetch(API_URL(url), {
    method: "POST", 
    mode: "cors", 
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      // "Content-Type": "application/json", 
      "Access-Control-Allow-Origin": "*",
      // "Authorization": localStorage.token
    },
    redirect: "follow",
    referrer: "no-referrer",  
    body: form,
    
  });
  return response
}

export async function putFormData(url, form){
  let response = await fetch(API_URL(url), {
    method: "PUT", 
    mode: "cors", 
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      // "Content-Type": "application/json", 
      "Access-Control-Allow-Origin": "*",
      // "Authorization": localStorage.token
    },
    redirect: "follow",
    referrer: "no-referrer",  
    body: form
  })

  return response
}

export async function postJSON(url, json, token){
  let headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Accept": "application/json"
    // "Authorization": localStorage.token
  }
  if(token){
    headers['Authorization'] = `Bearer ${token}`
  }
  let response = await fetch(API_URL(url), {
    method: "POST", 
    mode: "cors", 
    cache: "no-cache",
    credentials: "same-origin",
    headers,
    redirect: "follow",
    referrer: "no-referrer",
    body: JSON.stringify(json)
  })

  return response
}

export async function putJSON(url, json, token){
  let headers = {
    "Content-Type": "application/json", 
    "Access-Control-Allow-Origin": "*",
    // "Authorization": localStorage.token
  }
  if(token){
    headers['Authorization'] = `Bearer ${token}`
  }
  
  let response = await fetch(API_URL(url), {
    method: "PUT", 
    mode: "cors", 
    cache: "no-cache",
    credentials: "same-origin",
    headers,
    redirect: "follow",
    referrer: "no-referrer",
    body: JSON.stringify(json)
  })
  return response
}

export async function deleteJSON(url, token){

  let headers = {
    "Content-Type": "application/json", 
    "Access-Control-Allow-Origin": "*",
    // "Authorization": localStorage.token
  }
  if(token){
    headers['Authorization'] = `Bearer ${token}`
  }

  let response = await fetch(API_URL(url), {
    method: "DELETE", 
    mode: "cors", 
    cache: "no-cache",
    credentials: "same-origin",
    headers,
    redirect: "follow",
    referrer: "no-referrer",
  })

  return response
}



export async function setInstagram(url){
  let response = await fetch(getBaseURL(url), {
    method: "GET", 
    mode: "cors", 
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
    
      "Access-Control-Allow-Origin": "*",
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    redirect: "follow",
    referrer: "no-referrer",  
  })

  return response
}
